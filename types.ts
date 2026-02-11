export enum HeadshotStyle {
  CORPORATE = 'Corporate Grey Backdrop',
  MODERN_OFFICE = 'Modern Tech Office',
  OUTDOOR = 'Outdoor Natural Light',
  STUDIO_DARK = 'Dark Studio Lighting',
  STARTUP = 'Casual Startup Vibe',
  MINIMALIST = 'Minimalist White Studio',
  CAFE = 'Cozy Coffee Shop',
  ACADEMIC = 'Library & Bookshelves',
  NEON = 'Cyberpunk Neon City',
  BW_CLASSIC = 'Classic Black & White'
}

export type ImageType = 'headshot' | 'fullbody';
export type Resolution = '1K' | '2K' | '4K';

export interface GeneratedImage {
  id: string;
  dataUrl: string; // The base64 string including the data URI prefix
  promptUsed: string;
  timestamp: number;
}

export interface StyleOption {
  id: HeadshotStyle;
  label: string;
  description: string;
  previewColor: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: HeadshotStyle.CORPORATE,
    label: 'Corporate',
    description: 'Professional grey backdrop, suit or formal attire, even lighting.',
    previewColor: 'bg-slate-400'
  },
  {
    id: HeadshotStyle.MODERN_OFFICE,
    label: 'Tech Office',
    description: 'Blurred modern office background, smart casual, bright and airy.',
    previewColor: 'bg-blue-100'
  },
  {
    id: HeadshotStyle.OUTDOOR,
    label: 'Outdoor',
    description: 'Natural sunlight, blurred park or city background, approachable.',
    previewColor: 'bg-amber-100'
  },
  {
    id: HeadshotStyle.STUDIO_DARK,
    label: 'Studio Dark',
    description: 'Dramatic lighting, dark background, high contrast, artistic.',
    previewColor: 'bg-slate-800'
  },
  {
    id: HeadshotStyle.STARTUP,
    label: 'Startup',
    description: 'Casual, creative workspace background, relaxed but professional.',
    previewColor: 'bg-indigo-100'
  },
  {
    id: HeadshotStyle.MINIMALIST,
    label: 'Minimalist',
    description: 'Clean white background, soft high-key lighting, modern and fresh.',
    previewColor: 'bg-slate-50'
  },
  {
    id: HeadshotStyle.CAFE,
    label: 'Coffee Shop',
    description: 'Warm ambient lighting, blurred cafe background, relaxed vibe.',
    previewColor: 'bg-orange-100'
  },
  {
    id: HeadshotStyle.ACADEMIC,
    label: 'Academic',
    description: 'Scholarly background with bookshelves, warm tones, intellectual look.',
    previewColor: 'bg-amber-200'
  },
  {
    id: HeadshotStyle.NEON,
    label: 'Neon City',
    description: 'Futuristic city lights, colorful edge lighting, bold and creative.',
    previewColor: 'bg-purple-300'
  },
  {
    id: HeadshotStyle.BW_CLASSIC,
    label: 'B&W Classic',
    description: 'Timeless black and white photography, high contrast, dramatic look.',
    previewColor: 'bg-gray-800'
  }
];