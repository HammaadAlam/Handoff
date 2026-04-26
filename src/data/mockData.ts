/**
 * Shared marketplace domain types and lightweight UI constants.
 * Database-backed services are the source of truth for listing/profile/inbox data.
 */

export const DEFAULT_PEER_AVATAR_URI =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013f?w=200&q=80';

export const PLACEHOLDER_IMAGE_URI =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80';

export const HOME_CATEGORIES = ['For You', 'Clothes', 'Furniture', 'Events'] as const;
export type HomeCategory = (typeof HOME_CATEGORIES)[number];

const HOME_CATEGORY_SET = new Set<string>(HOME_CATEGORIES);

export type ListingItem = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  category?: HomeCategory;
  condition?: 'New' | 'Like New' | 'Good' | 'Fair';
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  size?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  postedAgo?: string;
  imageBadge?: 'boost' | 'urgent';
  trust?: 'verified' | 'premium';
  sellerId?: string;
  sellerHandle?: string;
  sellerAvatarUrl?: string;
  description?: string;
  /** Number of users who have favorited this listing (or fallback estimate). */
  favoriteCount?: number;
  /** Lowest acceptable offer (in dollars), set by the seller; undefined = no floor set */
  lowestOffer?: number;
};

export type TicketListing = ListingItem & {
  subtitle: string;
  venue: string;
};

export type SuggestedCategory = {
  id: string;
  label: string;
  imageUrl: string;
};

export type InboxFilter = 'All' | 'Selling' | 'Buying' | 'Archived';

export type ConversationRow = {
  id: string;
  userItem: string;
  preview: string;
  time: string;
  status: 'Meetup Confirmed' | 'Pending' | 'Completed';
  role: 'selling' | 'buying';
  archived: boolean;
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller: string;
  peerUserId?: string;
  peerAvatarUrl?: string;
};

/** Normalized home chip category from a listing (for filtering). */
export function listingHomeCategory(listing: ListingItem): HomeCategory | undefined {
  const raw = listing.category?.trim();
  if (raw && HOME_CATEGORY_SET.has(raw)) {
    return raw as HomeCategory;
  }
  return undefined;
}

export function filterListingsForHomeCategory(
  listings: ListingItem[],
  category: HomeCategory,
): ListingItem[] {
  if (category === 'For You') return listings;
  return listings.filter((listing) => listingHomeCategory(listing) === category);
}

export function filterEventsForHomeCategory(
  events: TicketListing[],
  category: HomeCategory,
): TicketListing[] {
  if (category === 'For You') return events;
  if (category !== 'Events') return [];
  return events;
}
