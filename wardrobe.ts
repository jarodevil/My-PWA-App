
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WardrobeItem } from './types';

export const defaultWardrobe: WardrobeItem[] = [
  {
    id: 'gemini-sweat',
    name: 'Gemini Tech Studio',
    brand: 'Google Cloud',
    category: 'Tops & Outerwear',
    subCategory: 'Jackets',
    url: 'https://raw.githubusercontent.com/ammaarreshi/app-images/refs/heads/main/gemini-sweat-2.png',
  }
];

export const CATEGORY_STRUCTURE = {
  'Underwear': ['Bottoms', 'Tops', 'Bodysuits', 'Sensual'],
  'Bottoms': ['Pants', 'Shorts', 'Yoga Pants'],
  'Suits & Dresses': ['Skirts', 'Dresses', 'Suits'],
  'Tops & Outerwear': ['Coats', 'Jackets', 'Blouses'],
  'Shoes': ['Heels', 'Sneakers', 'Boots'],
  'Accessories': ['Handbags', 'Jewelry', 'Umbrellas', 'Ties'],
  'Thematic': ['Sport', 'Business', 'Industry']
} as const;

export const THEMATIC_SUB_CATEGORIES = {
  'Sport': ['Swimsuits', 'Gym Wear', 'Yoga'],
  'Business': ['Executive Suits', 'Formal Shirts', 'Silk Ties'],
  'Industry': ['Aprons', 'Lab Coats', 'Uniforms', 'Theatrical']
} as const;
