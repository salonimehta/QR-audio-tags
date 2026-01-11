
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

export const analyzeAudioContent = async (audioBase64: string, mimeType: string): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType,
              },
            },
            {
              text: "Listen to this audio clip and provide a catchy title, a very brief description (max 10 words), and one relevant emoji. Output in JSON format.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ["title", "description", "emoji"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      title: result.title || "Voice Message",
      description: result.description || "A custom audio recording.",
      emoji: result.emoji || "🎙️",
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: "New Audio Message",
      description: "Recorded on " + new Date().toLocaleDateString(),
      emoji: "🎵",
    };
  }
};
