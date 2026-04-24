import * as ImageManipulator from 'expo-image-manipulator';

import {
  LISTING_BRANDS,
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from '@/data/listingOptions';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

/** Edge function `suggest-listing-from-image` uses Gemini; set secret `GEMINI_API_KEY` on Supabase. */

export type ListingVisionHints = {
  title?: string;
  description?: string;
};

export type ListingVisionSuggestion = {
  title: string;
  description: string;
  category: string;
  condition: string;
  brand: string;
};

function normalizeCategory(raw: string): string {
  const t = raw.trim();
  return (LISTING_CATEGORIES as readonly string[]).includes(t) ? t : 'Other';
}

function normalizeCondition(raw: string): string {
  const t = raw.trim();
  return (LISTING_CONDITIONS as readonly string[]).includes(t) ? t : 'Good';
}

function normalizeBrand(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return (LISTING_BRANDS as readonly string[]).includes(t) ? t : 'Other';
}

async function imageToJpegBase64(imageUri: string): Promise<{ base64: string; mimeType: string }> {
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  if (!manipulated.base64) {
    throw new Error('Could not read image for AI suggestion');
  }
  return { base64: manipulated.base64, mimeType: 'image/jpeg' };
}

/**
 * Calls Supabase Edge Function `suggest-listing-from-image` (Gemini vision).
 * Requires project secret GEMINI_API_KEY. Works with local file:// or https:// URIs.
 */
export async function suggestListingFromImage(
  imageUri: string,
  hints?: ListingVisionHints,
): Promise<ListingVisionSuggestion | null> {
  if (!isSupabaseConfigured() || !imageUri.trim()) return null;

  let body: Record<string, unknown>;
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    body = { imageUrl: imageUri, hints };
  } else {
    const { base64, mimeType } = await imageToJpegBase64(imageUri);
    body = { imageBase64: base64, mimeType, hints };
  }

  try {
    const { data, error } = await getSupabase().functions.invoke('suggest-listing-from-image', {
      body,
    });

    if (error) {
      console.warn('suggest-listing-from-image', error.message);
      return null;
    }

    const row = data as Record<string, unknown> | null;
    if (!row || typeof row.title !== 'string') {
      if (row && typeof row.error === 'string') {
        console.warn('suggest-listing-from-image', row.error);
      }
      return null;
    }

    return {
      title: row.title.slice(0, 60),
      description: typeof row.description === 'string' ? row.description.slice(0, 300) : '',
      category: normalizeCategory(typeof row.category === 'string' ? row.category : ''),
      condition: normalizeCondition(typeof row.condition === 'string' ? row.condition : ''),
      brand: normalizeBrand(typeof row.brand === 'string' ? row.brand : ''),
    };
  } catch (e) {
    console.warn('suggestListingFromImage', e);
    return null;
  }
}
