import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageType, Resolution } from "../types";

const MODEL_FLASH = 'gemini-2.5-flash-image';
const MODEL_PRO = 'gemini-3-pro-image-preview';

/**
 * Helper to strip the data URI prefix from base64 string
 */
const stripBase64Prefix = (dataUrl: string): string => {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
};

/**
 * Helper to extract mime type from data URL
 */
const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

/**
 * Extracts the image data URL from the Gemini response parts
 */
const extractImageFromResponse = (response: GenerateContentResponse): string | null => {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Generates a professional headshot or full body shot based on an input selfie and a style.
 */
export const generateHeadshot = async (
  originalImageBase64: string,
  style: string,
  type: ImageType = 'headshot',
  resolution: Resolution = '1K'
): Promise<string> => {
  const base64Data = stripBase64Prefix(originalImageBase64);
  const mimeType = getMimeType(originalImageBase64);

  // Initialize Gemini Client inside the function to pick up the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const isPro = resolution !== '1K';
  const model = isPro ? MODEL_PRO : MODEL_FLASH;

  const shotInstruction = type === 'headshot'
    ? "Framing: Head and shoulders (classic professional headshot). Face must be the focal point."
    : "Framing: Full-body or three-quarter portrait. Generatively extend the body and attire naturally if the source is cropped.";

  // Detailed style prompts for better quality
  const stylePrompts: Record<string, string> = {
    'Corporate Grey Backdrop': 'Lighting: Soft, even, flattering studio lighting with a subtle hair light. Background: A professional, smooth gradient grey backdrop. Attire: Formal business suit or professional executive wear.',
    'Modern Tech Office': 'Lighting: Bright, airy, and diffuse natural light from windows. Background: A blurred, modern open-plan office with glass walls and steel elements (bokeh). Attire: Smart casual or business casual (e.g., blazer with t-shirt, crisp shirt).',
    'Outdoor Natural Light': 'Lighting: Warm, golden-hour sunlight with soft backlighting (halo effect). Background: Out-of-focus city park or urban nature scene with beautiful bokeh. Attire: Relaxed but polished outdoor wear or business casual.',
    'Dark Studio Lighting': 'Lighting: Dramatic, high-contrast chiaroscuro lighting. Side-lit or Rembrandt style. Background: Solid deep charcoal or black. Attire: Dark, sleek, formal or creative black attire.',
    'Casual Startup Vibe': 'Lighting: Soft, natural daylight. Background: A hip, creative workspace with brick walls, plants, and warm wood textures (blurred). Attire: Casual, stylish, creative industry appropriate.',
    'Minimalist White Studio': 'Lighting: High-key, shadowless commercial fashion lighting. Background: Pure white or very light grey infinite background. Attire: Clean lines, solid colors, modern minimalist fashion.',
    'Cozy Coffee Shop': 'Lighting: Warm, ambient tungsten lighting with a cozy feel. Background: Blurred interior of a trendy coffee shop with warm tones. Attire: Comfortable, stylish casual wear (knits, layers).',
    'Library & Bookshelves': 'Lighting: Soft, focused reading light, slightly warm. Background: Depth-of-field blur of wooden bookshelves filled with books. Attire: Academic, tweed, blazers, glasses (if present).',
    'Cyberpunk Neon City': 'Lighting: Cinematic dual-tone lighting (e.g., teal and orange, or pink and blue) reflecting on the skin. Background: Nighttime city street with out-of-focus neon signs. Attire: Edgy, modern, leather or tech-wear.',
    'Classic Black & White': 'Lighting: Contrast-heavy Hollywood studio lighting. Output: Black and White photography. Background: Simple studio texture. Attire: Timeless, classic formal wear.'
  };

  const specificDetails = stylePrompts[style] || 'Lighting: Professional studio quality. Background: Matching the requested style.';

  const prompt = `Act as a world-class professional photographer and photo editor.
  
  TASK: Transform the provided user selfie into a premium, high-resolution professional ${type === 'headshot' ? 'headshot' : 'portrait'}.
  
  TARGET STYLE: ${style}
  
  SPECIFIC INSTRUCTIONS:
  1. ${specificDetails}
  2. ${shotInstruction}
  3. IDENTITY: Preserve the subject's facial features, identity, and expression exactly. Do not create a new person. Skin texture should look natural (not waxy).
  4. TRANSFORMATION: Replace the original background completely with the target background described above. Ensure the lighting on the subject matches the new environment perfectly.
  5. QUALITY: The result must be indistinguishable from a photo taken with a high-end DSLR (85mm lens, f/1.8 aperture). Sharp focus on eyes, pleasing bokeh in background.
  6. CLOTHING: If original clothing is cut off or low quality, generatively fix it or replace it to match the style description above.
  7. Center the subject in the frame.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          ...(isPro ? { imageSize: resolution } : {})
        }
      }
    });

    const candidate = response.candidates?.[0];
    
    // Check for safety filters or other finish reasons that aren't success
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Image generation failed: ${candidate.finishReason}. The image may have triggered safety filters.`);
    }

    const generatedImage = extractImageFromResponse(response);
    if (!generatedImage) {
      // If no image, check if the model returned a text explanation (e.g. safety refusal or conversation)
      const textPart = candidate?.content?.parts?.find(p => p.text)?.text;
      if (textPart) {
         throw new Error(`The model returned a message instead of an image: "${textPart}"`);
      }
      throw new Error("No image generated by the model. Please try a different photo or style.");
    }
    return generatedImage;

  } catch (error) {
    console.error("Error generating headshot:", error);
    throw error;
  }
};

/**
 * Edits an existing headshot based on a text prompt.
 */
export const editHeadshot = async (
  currentImageBase64: string,
  editPrompt: string
): Promise<string> => {
  const base64Data = stripBase64Prefix(currentImageBase64);
  const mimeType = getMimeType(currentImageBase64);
  
  // Initialize Gemini Client inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use Flash for quick edits by default.
  const model = MODEL_FLASH; 

  const fullPrompt = `Edit this image. Instruction: ${editPrompt}. 
  Maintain photorealism and high quality. Do not alter facial identity unless explicitly asked.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4"
        }
      }
    });

    const candidate = response.candidates?.[0];

    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Edit failed: ${candidate.finishReason}`);
    }

    const generatedImage = extractImageFromResponse(response);
    if (!generatedImage) {
      const textPart = candidate?.content?.parts?.find(p => p.text)?.text;
      if (textPart) {
         throw new Error(`Edit failed: "${textPart}"`);
      }
      throw new Error("No image returned after editing.");
    }
    return generatedImage;

  } catch (error) {
    console.error("Error editing headshot:", error);
    throw error;
  }
};