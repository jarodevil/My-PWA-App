
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Gender = 'masculine' | 'feminine' | 'neutral';
export type BodyType = 'slim' | 'athletic' | 'curvy' | 'regular';
export type VisualMode = 'portrait' | 'full-body';
export type QualityTier = 'standard' | 'uhq';
export type PhotographyStyle = 'cinematic-uhq' | 'editorial' | 'minimalist' | string;

export type MainCategory = 
  | 'Underwear' 
  | 'Bottoms' 
  | 'Suits & Dresses' 
  | 'Tops & Outerwear' 
  | 'Shoes' 
  | 'Accessories' 
  | 'Thematic';

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category: MainCategory;
  subCategory?: string;
  brand?: string;
  isCustom?: boolean;
}

export interface SceneSettings {
  visualMode: VisualMode;
  quality: QualityTier;
  lighting: string; // Dynamiczne ustawienie oświetlenia Photoroom
  environment: string; // Kontekst sceny
  height: number;
  style: PhotographyStyle;
  showMirror?: boolean;
}

export interface OutfitLayer {
  garment: WardrobeItem | null;
}

export interface SavedCharacter {
  id: string;
  name: string;
  imageUrl: string;
  gender: Gender;
  settings: SceneSettings;
}

export interface SavedOutfit {
  id: string;
  name: string;
  previewUrl: string;
  garmentIds: string[];
}

export const LAYER_ORDER: Record<MainCategory, number> = {
  'Underwear': 0,
  'Tops & Outerwear': 1,
  'Suits & Dresses': 1,
  'Bottoms': 2,
  'Shoes': 3,
  'Accessories': 4,
  'Thematic': 5
};
