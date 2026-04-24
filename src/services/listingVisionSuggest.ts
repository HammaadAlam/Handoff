import * as ImageManipulator from 'expo-image-manipulator';

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  getListingAttributesForCategory,
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
  model: string;
  storage: string;
  color: string;
  estimatedPrice: string;
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
  return raw.trim();
}

function normalizeDropdownValue(raw: string, options: readonly string[]): string {
  const value = raw.trim();
  if (value && options.includes(value)) return value;
  if (options.includes('N/A')) return 'N/A';
  if (options.includes('Other')) return 'Other';
  return options[0] ?? '';
}

function normalizeEstimatedPrice(raw: unknown): string {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return String(Math.round(raw));
  }
  if (typeof raw !== 'string') return '';
  const cleaned = raw.replace(/[^0-9.]/g, '').trim();
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return '';
  return String(Math.round(amount));
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
    console.log('suggest-listing-from-image response', {
      ok: !error,
      data,
      error: error ? { message: error.message, name: error.name } : null,
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

    const category = normalizeCategory(typeof row.category === 'string' ? row.category : '');
    const attributeMap = Object.fromEntries(
      getListingAttributesForCategory(category).map((attr) => [attr.key, attr.options]),
    ) as Partial<Record<'brand' | 'model' | 'storage' | 'color', readonly string[]>>;

    return {
      title: row.title.slice(0, 60),
      description: typeof row.description === 'string' ? row.description.slice(0, 300) : '',
      category,
      condition: normalizeCondition(typeof row.condition === 'string' ? row.condition : ''),
      brand: normalizeDropdownValue(
        normalizeBrand(typeof row.brand === 'string' ? row.brand : ''),
        attributeMap.brand ?? ['Other'],
      ),
      model: normalizeDropdownValue(
        typeof row.model === 'string' ? row.model : '',
        attributeMap.model ?? ['Other'],
      ),
      storage: normalizeDropdownValue(
        typeof row.storage === 'string' ? row.storage : '',
        attributeMap.storage ?? ['N/A'],
      ),
      color: normalizeDropdownValue(
        typeof row.color === 'string' ? row.color : '',
        attributeMap.color ?? ['Other'],
      ),
      estimatedPrice: normalizeEstimatedPrice(row.estimatedPrice),
    };
  } catch (e) {
    console.warn('suggestListingFromImage', e);
    console.log('suggest-listing-from-image exception payload', {
      imageUri,
      hints,
      error: e,
    });
    return null;
  }
}
