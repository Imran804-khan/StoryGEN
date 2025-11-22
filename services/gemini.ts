import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, StoryboardScene } from "../types";

// Helper to get a fresh instance with the latest key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScript = async (scriptText: string): Promise<Partial<StoryboardScene>[]> => {
  const ai = getAI();
  
  // Using gemini-3-pro-preview for complex reasoning to break down the script
  const modelId = 'gemini-3-pro-preview';

  const prompt = `
    Analyze the following movie script and break it down into key visual scenes for a storyboard.
    For each scene, provide a 'sceneNumber', a brief 'description' of the action, and a detailed 'visualPrompt' optimized for an AI image generator.
    The 'visualPrompt' should describe the composition, lighting, camera angle, and subject details vividly.
    
    Script:
    ${scriptText}
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["sceneNumber", "description", "visualPrompt"],
        },
      },
    },
  });

  if (response.text) {
    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse script analysis JSON", e);
      throw new Error("Failed to parse script analysis");
    }
  }
  throw new Error("No response from script analysis");
};

export const generateStoryboardImage = async (
  visualPrompt: string,
  size: ImageSize
): Promise<string> => {
  const ai = getAI();
  const modelId = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: visualPrompt }]
      },
      config: {
        imageConfig: {
          imageSize: size, // 1K, 2K, or 4K
          aspectRatio: "16:9",
        },
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const createChatSession = () => {
  const ai = getAI();
  // Using gemini-3-pro-preview for the chatbot as requested
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are an expert film production assistant and cinematographer. Help the user refine their ideas, discuss shot composition, and answer questions about filmmaking and the script provided.",
    }
  });
};