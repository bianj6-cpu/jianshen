import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We will use a lightweight model for this fast reasoning task
const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

export const deduceActionFromCourse = async (courseName: string): Promise<string> => {
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
    if (!jsonText) return "自信摆姿势";
    
    const parsed = JSON.parse(jsonText);
    return parsed.action || "自信摆姿势";

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return "进行健身训练";
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    // Clean up prompt for the model: remove Markdown bolding and Midjourney parameters
    // The prompt is now likely in Chinese, which Gemini handles fine.
    const cleanPrompt = prompt.replace(/--ar \d+:\d+/g, '').replace(/\*\*/g, '').trim();

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: cleanPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("No image generated");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};