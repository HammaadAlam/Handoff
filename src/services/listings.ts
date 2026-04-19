import {
  RECOMMENDED_LISTINGS,
  type ListingItem,
} from '@/data/mockData';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

type ListingRow = {
  id: string;
  title: string;
  price: string;
  image_url: string;
};

function mapRow(row: ListingRow): ListingItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    imageUrl: row.image_url,
  };
}

/**
 * Loads the home grid: Supabase `listings` when configured and rows exist,
 * otherwise static mock data.
 */
export async function fetchRecommendedListings(): Promise<ListingItem[]> {
  if (!isSupabaseConfigured()) {
    return RECOMMENDED_LISTINGS;
  }

  try {
    const { data, error } = await getSupabase()
      .from('listings')
      .select('id, title, price, image_url')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return RECOMMENDED_LISTINGS;
    }

    const rows = (data ?? []) as ListingRow[];
    if (rows.length === 0) {
      return RECOMMENDED_LISTINGS;
    }

    return rows.map(mapRow);
  } catch {
    return RECOMMENDED_LISTINGS;
  }
}
