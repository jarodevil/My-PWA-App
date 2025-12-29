
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SceneSettings, WardrobeItem, LAYER_ORDER, Gender, BodyType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image';

const dataUrlToParts = (url: string) => {
    const arr = url.split(',');
    if (arr.length < 2) return null;
    return { mimeType: arr[0].match(/:(.*?);/)?.[1] || 'image/png', data: arr[1] };
}

const handleResponse = (res: GenerateContentResponse): string => {
    const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error(res.text || "AI Pipeline Error");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
}

// Added gender and bodyType parameters to match application calls
export const generateModelImage = async (file: File, gender: Gender, bodyType: BodyType, settings: SceneSettings): Promise<string> => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>(r => { reader.onload = () => r(reader.result as string); reader.readAsDataURL(file); });
    const imagePart = dataUrlToParts(dataUrl);

    const prompt = `PHOTOROOM CORE V15:
- Lens: 85mm f/1.8, ISO 100.
- Lighting: ${settings.lighting}, softbox key light, high micro-contrast.
- Set: ${settings.environment}, clean industrial floor.
- Identity: Model features must match source image 1:1.
- Composition: Professional ${settings.visualMode} framing.
- Gender: ${gender}, Body: ${bodyType}.
Return image data ONLY. Production 8K quality.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ inlineData: imagePart! }, { text: prompt }] },
    });
    return handleResponse(response);
};

export const applyGarment = async (base: string, garment: string, item: WardrobeItem, stack: WardrobeItem[], settings: SceneSettings): Promise<string> => {
    const basePart = dataUrlToParts(base);
    const garmentPart = dataUrlToParts(garment);
    const outfit = stack.map(g => g.name).join(", ");

    const prompt = `PHOTOROOM INTEGRATION:
- Frame: Match current ${settings.visualMode} viewport.
- Physics: Cloth simulation for ${item.name} over ${outfit}.
- Light Wrapping: Global illumination from ${settings.lighting}.
- Identity: Do not change model face or background.
Return image data ONLY.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ inlineData: basePart! }, { inlineData: garmentPart! }, { text: prompt }] },
    });
    return handleResponse(response);
}

export const reconstructScene = async (base: string, stack: WardrobeItem[], directive: string, settings: SceneSettings): Promise<string> => {
    const basePart = dataUrlToParts(base);
    const outfit = stack.map(g => g.name).join(", ");

    const prompt = `DIRECTOR PRODUCTION:
- Instruction: ${directive}.
- Outfit Consistency: Model is wearing ${outfit}.
- Light mapping: Adjust shadows and reflections to match the new ${directive} environment.
- Face Lock: 1:1 identity preservation from source.
Return image data ONLY. 8K High-Fidelity.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ inlineData: basePart! }, { text: prompt }] },
    });
    return handleResponse(response);
}
