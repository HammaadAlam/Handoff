import type { ListingItem } from '@/data/mockData';
import {
  LISTING_WITH_PROFILE_SELECT,
  mapListingRow,
  type ListingRow,
} from '@/services/listings';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

export async function fetchEventListings(limit = 2): Promise<ListingItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .select(LISTING_WITH_PROFILE_SELECT)
      .eq('status', 'active')
      .eq('category', 'Events')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return ((data ?? []) as ListingRow[]).map(mapListingRow);
  } catch {
    return [];
  }
}
