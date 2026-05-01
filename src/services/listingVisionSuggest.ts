/**
 * Listing Vision Suggest — Supabase / API service layer.
 */
import * as ImageManipulator from 'expo-image-manipulator';

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  getListingAttributesForCategory,
} from '@/data/listingOptions';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

/** Edge function `suggest-listing-from-image` uses Gemini; set secret `GEMINI_API_KEY` on Supabase. */

type ListingVisionHints = {
  title?: string;
  description?: string;
};

type ListingVisionSuggestion = {
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

/**
 * Tokens whose only purpose is "I don't know" -- never auto-picked from a list.
 * If Gemini returns one of these, we still try to fall back to a real option
 * before accepting it.
 */
const FALLBACK_TOKENS = new Set(['other', 'n a', 'na', 'unknown', 'unsure', 'none']);

function tokenize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Pick the option that most plausibly matches `raw`. Tries:
 *   1) case/punctuation-insensitive exact match
 *   2) substring containment (longer overlap wins)
 *   3) word-overlap scoring
 * Skips "Other" / "N/A" sentinels during steps 2 & 3 so they're never auto-selected
 * via fuzzy match. Returns null when nothing plausibly matches.
 */
function bestFitMatch(raw: string, options: readonly string[]): string | null {
  const target = tokenize(raw);
  if (!target) return null;

  for (const opt of options) {
    if (tokenize(opt) === target) return opt;
  }

  let bestSubstring: string | null = null;
  let bestSubstringScore = 0;
  for (const opt of options) {
    const optNorm = tokenize(opt);
    if (FALLBACK_TOKENS.has(optNorm)) continue;
    if (optNorm.includes(target) || target.includes(optNorm)) {
      const score = Math.min(optNorm.length, target.length);
      if (score > bestSubstringScore) {
        bestSubstringScore = score;
        bestSubstring = opt;
      }
    }
  }
  if (bestSubstring) return bestSubstring;

  const targetTokens = target.split(' ').filter((t) => t.length > 1);
  let bestTokenMatch: string | null = null;
  let bestTokenScore = 0;
  for (const opt of options) {
    const optNorm = tokenize(opt);
    if (FALLBACK_TOKENS.has(optNorm)) continue;
    const optTokens = optNorm.split(' ').filter((t) => t.length > 1);
    let score = 0;
    for (const t of targetTokens) {
      if (optTokens.some((o) => o === t || o.startsWith(t) || t.startsWith(o))) {
        score += 1;
      }
    }
    if (score > bestTokenScore) {
      bestTokenScore = score;
      bestTokenMatch = opt;
    }
  }
  return bestTokenScore > 0 ? bestTokenMatch : null;
}

/**
 * Resolve a Gemini-supplied raw value to a concrete option from `options`.
 *
 * Behaviour matches the Quick List intent: prefer the highest-confidence real
 * option, only fall back to "Other"/"N/A" when no other option is a plausible
 * description.
 */
function selectFromOptions(raw: string, options: readonly string[]): string {
  if (options.length === 0) return '';
  const matched = bestFitMatch(raw, options);
  if (matched) return matched;
  const firstReal = options.find((o) => !FALLBACK_TOKENS.has(tokenize(o)));
  return firstReal ?? options[0];
}

function normalizeCategory(raw: string): string {
  return selectFromOptions(raw, LISTING_CATEGORIES);
}

function normalizeCondition(raw: string): string {
  return selectFromOptions(raw, LISTING_CONDITIONS);
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

type AttributeKey = 'brand' | 'model' | 'storage' | 'color';

type OptionsCatalog = {
  categories: string[];
  conditions: string[];
  attributes: Record<string, Partial<Record<AttributeKey, readonly string[]>>>;
};

function buildOptionsCatalog(): OptionsCatalog {
  const attributes: OptionsCatalog['attributes'] = {};
  for (const cat of LISTING_CATEGORIES) {
    const map: Partial<Record<AttributeKey, readonly string[]>> = {};
    for (const attr of getListingAttributesForCategory(cat)) {
      map[attr.key] = attr.options;
    }
    attributes[cat] = map;
  }
  return {
    categories: [...LISTING_CATEGORIES],
    conditions: [...LISTING_CONDITIONS],
    attributes,
  };
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
 *
 * Sends the catalog of valid dropdown options so the model picks the highest-
 * confidence real value and never lazy-defaults to "Other"/"N/A".
 */
export async function suggestListingFromImage(
  imageUri: string,
  hints?: ListingVisionHints,
): Promise<ListingVisionSuggestion | null> {
  if (!isSupabaseConfigured() || !imageUri.trim()) return null;

  const optionsCatalog = buildOptionsCatalog();

  let body: Record<string, unknown>;
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    body = { imageUrl: imageUri, hints, options: optionsCatalog };
  } else {
    const { base64, mimeType } = await imageToJpegBase64(imageUri);
    body = { imageBase64: base64, mimeType, hints, options: optionsCatalog };
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
    const attributeMap = optionsCatalog.attributes[category] ?? {};

    return {
      title: row.title.slice(0, 60),
      description: typeof row.description === 'string' ? row.description.slice(0, 300) : '',
      category,
      condition: normalizeCondition(typeof row.condition === 'string' ? row.condition : ''),
      brand: selectFromOptions(
        typeof row.brand === 'string' ? row.brand : '',
        attributeMap.brand ?? [],
      ),
      model: selectFromOptions(
        typeof row.model === 'string' ? row.model : '',
        attributeMap.model ?? [],
      ),
      storage: selectFromOptions(
        typeof row.storage === 'string' ? row.storage : '',
        attributeMap.storage ?? [],
      ),
      color: selectFromOptions(
        typeof row.color === 'string' ? row.color : '',
        attributeMap.color ?? [],
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
