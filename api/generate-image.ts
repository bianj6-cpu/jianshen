import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export const config = {
  runtime: 'edge',
};

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

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: cleanPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
        // Relax safety settings for fitness content
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
      throw new Error("Blocked by safety filters. Try modifying the prompt (avoid specific body parts).");
    }

    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("No image generated from Gemini");
    }

    let imageUrl = null;
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Image data not found in response");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    
    // Handle 429 Rate Limit specifically
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
      return new Response(JSON.stringify({ error: 'API Rate Limit Exceeded. Please wait 20-30 seconds and try again.' }), { status: 429 });
    }

    return new Response(JSON.stringify({ error: error.message || 'Image Generation Failed' }), { status: 500 });
  }
}