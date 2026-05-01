/**
 * Search Filter Utils — search UI.
 */
import type { ListingItem } from '@/data/mockData';
import { LISTING_CATEGORIES } from '@/data/listingOptions';
import type { SearchFilters } from '@/navigation/types';

export const DEFAULT_FILTERS: SearchFilters = {
  sort: 'best',
  priceMin: 0,
  priceMax: 2000,
  condition: null,
  sellerType: 'Any',
  mileage: 'Any',
  categories: [],
};

export const FILTER_CATEGORIES = [...LISTING_CATEGORIES, 'Events'] as const;

function listingPriceValue(item: ListingItem): number {
  const n = Number(item.price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeCondition(
  v?: ListingItem['condition'],
): SearchFilters['condition'] {
  if (!v) return null;
  if (v === 'New') return 'New';
  if (v === 'Like New') return 'Like New';
  return 'Used';
}

function matchesDistance(
  item: ListingItem,
  mileage: SearchFilters['mileage'],
): boolean {
  if (mileage === 'Any') return true;
  const loc = (item.location ?? '').toLowerCase();
  const onCampus = /campus|lsu|student union|hall|quad|dorm|union/.test(loc);
  if (mileage === 'On campus') return onCampus;
  if (mileage === 'Within 5 mi') {
    return onCampus || /highland|greek|north|west|south|east/.test(loc);
  }
  return true;
}

function matchesSellerType(
  item: ListingItem,
  sellerType: SearchFilters['sellerType'],
): boolean {
  if (sellerType === 'Any') return true;
  const isCampusShop = item.trust === 'premium';
  return sellerType === 'Campus shop' ? isCampusShop : !isCampusShop;
}

function matchesCategory(item: ListingItem, categories: string[]): boolean {
  if (categories.length === 0) return true;
  const category = item.category ?? '';
  if (categories.includes(category)) return true;
  if (category === 'Events' && categories.includes('Tickets & Events')) return true;
  return false;
}

export function applySearchFilters(
  source: ListingItem[],
  filters: SearchFilters,
): ListingItem[] {
  const min = Math.max(0, Math.min(filters.priceMin, filters.priceMax));
  const max = Math.max(min, filters.priceMax);
  const categories = filters.categories ?? [];

  const filtered = source
    .filter((item) => {
      const price = listingPriceValue(item);
      return price >= min && price <= max;
    })
    .filter((item) =>
      filters.condition ? normalizeCondition(item.condition) === filters.condition : true,
    )
    .filter((item) => matchesSellerType(item, filters.sellerType))
    .filter((item) => matchesDistance(item, filters.mileage))
    .filter((item) => matchesCategory(item, categories));

  if (filters.sort === 'low') {
    return [...filtered].sort((a, b) => listingPriceValue(a) - listingPriceValue(b));
  }
  if (filters.sort === 'high') {
    return [...filtered].sort((a, b) => listingPriceValue(b) - listingPriceValue(a));
  }
  return filtered;
}
