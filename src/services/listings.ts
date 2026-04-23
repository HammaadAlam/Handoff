import { type HomeCategory, type ListingItem } from '@/data/mockData';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

export type ProfileEmbed = {
  handle: string;
  avatar_url: string;
  display_name: string;
};

export type ListingRow = {
  id: string;
  title: string;
  price: string;
  image_url: string;
  description?: string | null;
  category?: string | null;
  condition?: string | null;
  brand?: string | null;
  model?: string | null;
  storage?: string | null;
  color?: string | null;
  size?: string | null;
  lowest_offer_cents?: number | null;
  location_label?: string | null;
  posted_at?: string | null;
  seller_id?: string | null;
  profiles?: ProfileEmbed | ProfileEmbed[] | null;
};

/** PostgREST embed columns for listings + seller profile. Shared across services. */
export const LISTING_WITH_PROFILE_SELECT = `
  id,
  title,
  price,
  image_url,
  description,
  category,
  condition,
  brand,
  model,
  storage,
  color,
  size,
  lowest_offer_cents,
  location_label,
  posted_at,
  seller_id,
  profiles!listings_seller_id_fkey ( handle, avatar_url, display_name )
` as const;

function firstProfile(
  embed: ProfileEmbed | ProfileEmbed[] | null | undefined,
): ProfileEmbed | undefined {
  if (embed == null) return undefined;
  return Array.isArray(embed) ? embed[0] : embed;
}

function categoryFromRow(row: ListingRow): HomeCategory | undefined {
  const t = row.category?.trim();
  if (
    t === 'For You' ||
    t === 'Clothes' ||
    t === 'Furniture' ||
    t === 'Events'
  ) {
    return t;
  }
  return undefined;
}

export function mapListingRow(row: ListingRow): ListingItem {
  const prof = firstProfile(row.profiles);
  const sellerHandle = prof?.handle;
  const sellerAvatarUrl = prof?.avatar_url;

  const condition = row.condition as ListingItem['condition'] | undefined;
  const category = categoryFromRow(row);

  const lowestOffer =
    typeof row.lowest_offer_cents === 'number' && row.lowest_offer_cents >= 0
      ? row.lowest_offer_cents / 100
      : undefined;

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    imageUrl: row.image_url,
    description: row.description ?? undefined,
    category,
    condition,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    storage: row.storage ?? undefined,
    color: row.color ?? undefined,
    size: row.size ?? undefined,
    lowestOffer,
    location: row.location_label ?? undefined,
    postedAgo: row.posted_at ? formatPostedAgo(row.posted_at) : undefined,
    sellerId: row.seller_id ?? undefined,
    sellerHandle,
    sellerAvatarUrl,
  };
}

function formatPostedAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${Math.max(1, h)}h ago`;
  const d = Math.floor(diff / 86400000);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

/**
 * Loads the home grid: Supabase `listings` + `profiles` when configured and rows exist,
 * otherwise static mock data.
 */
export async function fetchRecommendedListings(): Promise<ListingItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .select(LISTING_WITH_PROFILE_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(120);

    if (error) return [];

    const rows = (data ?? []) as ListingRow[];
    if (rows.length === 0) return [];

    return rows.map(mapListingRow);
  } catch {
    return [];
  }
}

export type NewListingInput = {
  sellerId: string;
  title: string;
  price: string;
  imageUrl: string;
  description?: string;
  category?: string;
  condition?: string;
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  size?: string;
  locationLabel?: string;
  lowestOffer?: number;
};

/**
 * Insert a new listing owned by the caller's profile. RLS requires
 * `seller_id` to match the authenticated user's `profiles.id`.
 */
export async function createListing(
  input: NewListingInput,
): Promise<ListingItem | null> {
  if (!isSupabaseConfigured()) return null;
  if (!input.sellerId || !input.title.trim() || !input.imageUrl.trim()) {
    return null;
  }

  const normalizePrice = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return '$0';
    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  };

  const lowestOfferCents =
    typeof input.lowestOffer === 'number' && input.lowestOffer >= 0
      ? Math.round(input.lowestOffer * 100)
      : null;

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .insert({
        seller_id: input.sellerId,
        title: input.title.trim(),
        price: normalizePrice(input.price),
        image_url: input.imageUrl,
        description: input.description?.trim() ?? '',
        category: input.category ?? null,
        condition: input.condition ?? null,
        brand: input.brand ?? null,
        model: input.model ?? null,
        storage: input.storage ?? null,
        color: input.color ?? null,
        size: input.size ?? null,
        location_label: input.locationLabel ?? null,
        lowest_offer_cents: lowestOfferCents,
        status: 'active',
      })
      .select(LISTING_WITH_PROFILE_SELECT)
      .single();

    if (error || !data) return null;
    return mapListingRow(data as ListingRow);
  } catch {
    return null;
  }
}

/**
 * Public profile/shop listings for a specific seller (`profiles.id`).
 */
export async function fetchListingsByUserId(
  userId: string,
  limit = 60
): Promise<ListingItem[]> {
  if (!userId) return [];

  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .select(LISTING_WITH_PROFILE_SELECT)
      .eq('seller_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return ((data ?? []) as ListingRow[]).map(mapListingRow);
  } catch {
    return [];
  }
}
