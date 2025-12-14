import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { courseName } = await request.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key not configured' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_NAME = "gemini-2.5-flash";

    let lastError = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Course Title: "${courseName}"`,
          config: {
            systemInstruction: `You are a visual director for fitness photography. 
            Your task is to convert a Fitness Course Name into a specific, single physical action description in SIMPLIFIED CHINESE (简体中文).
            
            Rules:
            1. Output ONLY the action phrase in Chinese (e.g., "做高位平板支撑", "原地冲刺跑", "双手举哑铃").
            2. Do not add introductory text.
            3. Keep it concise (under 15 chars).
            4. If the course is abstract (e.g., "Mindset"), invent a visual (e.g., "闭眼冥想").
            `,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                action: {
                  type: Type.STRING,
                  description: "The specific physical action description in Simplified Chinese"
                }
              }
            }
          }
        });

        const jsonText = response.text;
        const parsed = jsonText ? JSON.parse(jsonText) : { action: "自信摆姿势" };
        
        return new Response(JSON.stringify({ action: parsed.action }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        lastError = error;
        const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');
        
        if (isRateLimit && attempt < maxRetries) {
          await wait(2000); // Wait 2s
          continue;
        }
        throw error;
      }
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}