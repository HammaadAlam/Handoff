/**
 * Favorites persistence against public.favorites. Demo RLS allows anon toggles;
 * signed-in users can only write rows keyed to their linked profile.
 */
import type { ListingItem } from '@/data/mockData';
import {
  LISTING_WITH_PROFILE_SELECT,
  mapListingRow,
  type ListingRow,
} from '@/services/listings';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

type FavoriteRow = {
  listing_id: string;
  created_at: string;
  listings: ListingRow | ListingRow[] | null;
};

function firstListing(
  embed: ListingRow | ListingRow[] | null | undefined,
): ListingRow | undefined {
  if (embed == null) return undefined;
  return Array.isArray(embed) ? embed[0] : embed;
}

export async function fetchFavoriteListings(args: {
  sessionUserId: string | null;
}): Promise<ListingItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select(`listing_id, created_at, listings ( ${LISTING_WITH_PROFILE_SELECT} )`)
    .eq('user_id', viewerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  const rows = (data ?? []) as FavoriteRow[];
  return rows
    .map((r) => firstListing(r.listings))
    .filter((l): l is ListingRow => !!l)
    .map(mapListingRow);
}

export async function addFavorite(args: {
  sessionUserId: string | null;
  listingId: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return false;
  const { error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: viewerId, listing_id: args.listingId },
      { onConflict: 'user_id,listing_id', ignoreDuplicates: true },
    );
  return !error;
}

export async function removeFavorite(args: {
  sessionUserId: string | null;
  listingId: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return false;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', viewerId)
    .eq('listing_id', args.listingId);
  return !error;
}
