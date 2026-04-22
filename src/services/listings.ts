import {
  RECOMMENDED_LISTINGS,
  type HomeCategory,
  type ListingItem,
} from '@/data/mockData';
import { getSeedProfileById, SEED_LISTINGS } from '@/data/seedCatalog';
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
  size?: string | null;
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
  size,
  location_label,
  posted_at,
  seller_id,
  profiles ( handle, avatar_url, display_name )
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
  const seed = SEED_LISTINGS.find((s) => s.id === row.id);
  return seed?.category;
}

export function mapListingRow(row: ListingRow): ListingItem {
  const prof = firstProfile(row.profiles);
  const fallback =
    row.seller_id != null ? getSeedProfileById(row.seller_id) : undefined;

  const sellerHandle = prof?.handle ?? fallback?.handle;
  const sellerAvatarUrl = prof?.avatar_url ?? fallback?.avatarUrl;

  const condition = row.condition as ListingItem['condition'] | undefined;
  const category = categoryFromRow(row);

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    imageUrl: row.image_url,
    description: row.description ?? undefined,
    category,
    condition,
    brand: row.brand ?? undefined,
    size: row.size ?? undefined,
    location: row.location_label ?? undefined,
    postedAgo: row.posted_at ? formatPostedAgo(row.posted_at) : undefined,
    sellerId: row.seller_id ?? undefined,
    sellerHandle,
    sellerAvatarUrl,
    trust: fallback?.isVerifiedEdu ? 'verified' : undefined,
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
  if (!isSupabaseConfigured()) {
    return RECOMMENDED_LISTINGS;
  }

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .select(LISTING_WITH_PROFILE_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(120);

    if (error) {
      return RECOMMENDED_LISTINGS;
    }

    const rows = (data ?? []) as ListingRow[];
    if (rows.length === 0) {
      return RECOMMENDED_LISTINGS;
    }

    return rows.map(mapListingRow);
  } catch {
    return RECOMMENDED_LISTINGS;
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

  if (!isSupabaseConfigured()) {
    return RECOMMENDED_LISTINGS.filter((item) => item.sellerId === userId).slice(0, limit);
  }

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
