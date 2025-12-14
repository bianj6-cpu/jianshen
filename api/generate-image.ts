import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key not configured in Vercel Settings' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

    // Clean prompt
    const cleanPrompt = prompt.replace(/--ar \d+:\d+/g, '').replace(/\*\*/g, '').trim();

    // Retry Logic for 429 Errors
    let lastError: any = null;
    const maxRetries = 2; // Try up to 3 times total (1 initial + 2 retries)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: IMAGE_MODEL_NAME,
          contents: {
            parts: [{ text: cleanPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            },
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
          }
        });

        const candidate = response.candidates?.[0];

        if (candidate?.finishReason === 'SAFETY') {
          throw new Error("Blocked by safety filters. Try modifying the prompt.");
        }

        let imageUrl = null;
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (!imageUrl) {
            // Sometimes image model returns success but no image if overloaded or filtered silently
            throw new Error("No image data returned.");
        }

        // Success!
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error: any) {
        lastError = error;
        // Check if it's a rate limit error
        const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');
        
        if (isRateLimit && attempt < maxRetries) {
          // Wait 3 seconds before retrying
          console.log(`Rate limit hit (Attempt ${attempt + 1}). Retrying in 3s...`);
          await wait(3000);
          continue;
        } else {
          // If not rate limit, or max retries reached, throw it
          throw error;
        }
      }
    }

  } catch (error: any) {
    console.error("API Error Final:", error);
    
    // Friendly error for frontend
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota')) {
        return new Response(JSON.stringify({ error: 'System is busy (Rate Limit). Please wait 30 seconds and try again.' }), { status: 429 });
    }

    return new Response(JSON.stringify({ error: error.message || 'Image Generation Failed' }), { status: 500 });
  }
}