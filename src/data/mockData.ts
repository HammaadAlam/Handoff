/**
 * Static demo data for marketplace UI — replace with API responses later.
 */

import {
  getSeedProfileByHandle,
  getSeedProfileById,
  PROFILE_DEMO_HANDLE,
  SEED_LISTINGS,
  type SeedListing,
} from './seedCatalog';

/** Fallback peer avatar for chats when none is passed (HTTPS, works offline after cache) */
export const DEFAULT_PEER_AVATAR_URI =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013f?w=200&q=80';

export const HOME_CATEGORIES = ['For You', 'Clothes', 'Furniture', 'Events'] as const;
export type HomeCategory = (typeof HOME_CATEGORIES)[number];

const HOME_CATEGORY_SET = new Set<string>(HOME_CATEGORIES);

/** Normalized home chip category from a listing (for filtering). */
export function listingHomeCategory(listing: ListingItem): HomeCategory | undefined {
  const raw = listing.category?.trim();
  if (raw && HOME_CATEGORY_SET.has(raw)) {
    return raw as HomeCategory;
  }
  return undefined;
}

export type ListingItem = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  /** Home category chips + richer listing details for filters/forms demos */
  category?: HomeCategory;
  condition?: 'New' | 'Like New' | 'Good' | 'Fair';
  brand?: string;
  size?: string;
  /** Rich search / popular card (optional) */
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
};

function seedListingToItem(s: SeedListing): ListingItem {
  const p = getSeedProfileById(s.sellerId);
  if (!p) {
    throw new Error(`seedCatalog: missing profile for seller ${s.sellerId}`);
  }
  return {
    id: s.id,
    title: s.title,
    price: s.price,
    imageUrl: s.imageUrl,
    category: s.category,
    condition: s.condition,
    brand: s.brand,
    size: s.size,
    location: s.locationLabel,
    postedAgo: s.postedAgo,
    description: s.description,
    sellerId: s.sellerId,
    sellerHandle: p.handle,
    sellerAvatarUrl: p.avatarUrl,
    trust: p.isVerifiedEdu ? 'verified' : undefined,
  };
}

const MOCK_FALLBACK_PROFILE =
  getSeedProfileByHandle(PROFILE_DEMO_HANDLE) ?? getSeedProfileById(SEED_LISTINGS[0].sellerId)!;

function withMockSeller(item: ListingItem): ListingItem {
  return {
    ...item,
    sellerId: item.sellerId ?? MOCK_FALLBACK_PROFILE.id,
    sellerHandle: item.sellerHandle ?? MOCK_FALLBACK_PROFILE.handle,
    sellerAvatarUrl: item.sellerAvatarUrl ?? MOCK_FALLBACK_PROFILE.avatarUrl,
    trust: item.trust ?? (MOCK_FALLBACK_PROFILE.isVerifiedEdu ? 'verified' : undefined),
  };
}

/** Active listings from seed catalog (Supabase parity — see supabase/seed.sql). */
export const RECOMMENDED_LISTINGS: ListingItem[] = SEED_LISTINGS.filter(
  (l) => l.status === 'active',
).map(seedListingToItem);

const _profileDemo = getSeedProfileByHandle(PROFILE_DEMO_HANDLE)!;
const _demoShopActive = SEED_LISTINGS.filter(
  (l) => l.sellerId === _profileDemo.id && l.status === 'active',
);

/** Profile tab — carousels + grid for demo seller (`PROFILE_DEMO_HANDLE` in seedCatalog). */
export const PROFILE_FEATURED_LISTINGS: ListingItem[] = _demoShopActive
  .slice(0, 4)
  .map(seedListingToItem);
export const PROFILE_BEST_SELLERS: ListingItem[] = _demoShopActive
  .slice(4, 9)
  .map(seedListingToItem);
export const PROFILE_MY_ITEMS: ListingItem[] = _demoShopActive.map(seedListingToItem);

/** Search home — horizontal suggestion chips */
export const SEARCH_CHIP_SUGGESTIONS = [
  'ford ranger',
  'macbook pro',
  'calculator',
  'desk chair',
  'bike',
] as const;

/** Search home — 5×2 category grid (icons are Ionicons names) */
export type SearchGridCategory = {
  id: string;
  label: string;
  icon: string;
};

export const SEARCH_GRID_CATEGORIES: SearchGridCategory[] = [
  { id: 'g1', label: 'Vehicle', icon: 'car-sport-outline' },
  { id: 'g2', label: 'Property', icon: 'home-outline' },
  { id: 'g3', label: 'Phones', icon: 'phone-portrait-outline' },
  { id: 'g4', label: 'Fashion', icon: 'shirt-outline' },
  { id: 'g5', label: 'Babies', icon: 'gift-outline' },
  { id: 'g6', label: 'Jobs', icon: 'briefcase-outline' },
  { id: 'g7', label: 'Sport', icon: 'football-outline' },
  { id: 'g8', label: 'Service', icon: 'construct-outline' },
  { id: 'g9', label: 'Furniture', icon: 'bed-outline' },
  { id: 'g10', label: 'Tech', icon: 'hardware-chip-outline' },
];

export type SuggestedCategory = {
  id: string;
  label: string;
  imageUrl: string;
};

export const SUGGESTED_CATEGORIES: SuggestedCategory[] = [
  {
    id: 'c1',
    label: 'Clothes',
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
  },
  {
    id: 'c2',
    label: 'Furniture',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
  {
    id: 'c3',
    label: 'Tech',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  },
  {
    id: 'c4',
    label: 'Bikes',
    imageUrl:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
  },
  {
    id: 'c5',
    label: 'Books',
    imageUrl:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80',
  },
  {
    id: 'c6',
    label: 'Shoes',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
];

/** Demo grid for category / text search (e.g. "Cabinets") */
export const CABINET_LISTINGS: ListingItem[] = ([
  {
    id: 'cab1',
    title: 'White Cabinet',
    price: '$50',
    imageUrl:
      'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=400&q=80',
  },
  {
    id: 'cab2',
    title: 'Double Cabinet',
    price: '$25',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
  {
    id: 'cab3',
    title: 'Wood Cabinet',
    price: '$50',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  },
  {
    id: 'cab4',
    title: 'Black Cabinet',
    price: '$50',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
] as ListingItem[]).map(withMockSeller);

export const DEFAULT_RECENT_SEARCHES = ['Calculator', 'Chairs', 'Textbook'] as const;

export const TRENDING_LISTINGS: ListingItem[] = ([
  {
    id: 't1',
    title: 'Swivel chair',
    price: '$120',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  },
  {
    id: 't2',
    title: 'Storage unit',
    price: '$85',
    imageUrl:
      'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=400&q=80',
  },
  {
    id: 't3',
    title: 'DSLR camera',
    price: '$320',
    imageUrl:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
  },
  {
    id: 't4',
    title: 'Windbreaker',
    price: '$40',
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
  },
  {
    id: 't5',
    title: 'Sneakers',
    price: '$90',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
  {
    id: 't6',
    title: 'Textbook',
    price: '$30',
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  },
] as ListingItem[]).map(withMockSeller);

/** Search landing “Popular items” grid — badges, ratings, location */
export const POPULAR_LISTINGS: ListingItem[] = ([
  {
    id: 'p1',
    title: 'Willow Creek desk',
    price: '$120',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    rating: 4.8,
    reviewCount: 60,
    location: 'LSU North Hall',
    postedAgo: '3d ago',
    imageBadge: 'boost' as const,
    trust: 'verified',
  },
  {
    id: 'p2',
    title: 'MacBook Pro M1 2020',
    price: '$650',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    rating: 4.9,
    reviewCount: 42,
    location: 'Highland Rd',
    postedAgo: '1d ago',
    imageBadge: 'urgent' as const,
    trust: 'premium',
  },
  {
    id: 'p3',
    title: 'Physics textbook bundle',
    price: '$45',
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    rating: 4.5,
    reviewCount: 18,
    location: 'Student Union',
    postedAgo: '5h ago',
    trust: 'verified',
  },
  {
    id: 'p4',
    title: 'Road bike — medium',
    price: '$280',
    imageUrl:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
    rating: 4.6,
    reviewCount: 31,
    location: 'Campus edge',
    postedAgo: '2d ago',
    imageBadge: 'boost' as const,
  },
  {
    id: 'p5',
    title: 'Desk lamp LED',
    price: '$22',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80',
    rating: 4.2,
    reviewCount: 9,
    location: 'West campus',
    postedAgo: '12h ago',
    trust: 'verified',
  },
  {
    id: 'p6',
    title: 'Winter jacket (M)',
    price: '$55',
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    rating: 4.7,
    reviewCount: 14,
    location: 'Greek row',
    postedAgo: '4d ago',
    imageBadge: 'urgent' as const,
    trust: 'premium',
  },
] as ListingItem[]).map(withMockSeller);

/** Pick a result set for the category / search results screen */
export function listingsForSearchQuery(query: string): ListingItem[] {
  const q = query.trim().toLowerCase();
  if (q.includes('cabinet')) return CABINET_LISTINGS;
  if (q.includes('popular')) return POPULAR_LISTINGS;
  if (!q) return TRENDING_LISTINGS;
  const pool = RECOMMENDED_LISTINGS;
  const hits = pool.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.brand?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q) ||
      l.sellerHandle?.toLowerCase().includes(q),
  );
  return hits.length > 0 ? hits.slice(0, 48) : TRENDING_LISTINGS;
}

export type InboxFilter = 'All' | 'Selling' | 'Buying' | 'Archived';

export type ConversationRow = {
  id: string;
  userItem: string;
  preview: string;
  time: string;
  status: 'Meetup Confirmed' | 'Pending' | 'Completed';
  /** Inbox filter tabs */
  role: 'selling' | 'buying';
  archived?: boolean;
  /** Opens Conversation screen */
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller: string;
  /** Canonical counterparty profile id (profiles.id) */
  peerUserId: string;
  /** Shown in inbox row + chat header */
  peerAvatarUrl: string;
};

export const MOCK_CONVERSATIONS: ConversationRow[] = [
  {
    id: '1',
    userItem: 'fahdhkhattak - Textbook',
    preview: 'See you then!',
    time: '3m ago',
    status: 'Meetup Confirmed',
    role: 'buying',
    listingId: 'list-tb',
    title: 'Textbook',
    price: '$25',
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80',
    seller: 'fahdhkhattak',
    peerUserId: getSeedProfileByHandle('fahdhkhattak')?.id ?? _profileDemo.id,
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    id: '2',
    userItem: 'hammaadalam - Basketball',
    preview: 'Saturday?',
    time: '3h ago',
    status: 'Pending',
    role: 'selling',
    listingId: 'list-bb',
    title: 'Basketball',
    price: '$15',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&q=80',
    seller: 'hammaadalam',
    peerUserId: getSeedProfileByHandle('hammaadalam')?.id ?? _profileDemo.id,
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  },
  {
    id: '3',
    userItem: 'tylermgates - Calculator',
    preview: 'Thanks again!',
    time: '8h ago',
    status: 'Completed',
    role: 'selling',
    listingId: 'list-calc',
    title: 'Calculator',
    price: '$20',
    imageUrl:
      'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=200&q=80',
    seller: 'tylermgates',
    peerUserId: getSeedProfileByHandle('tylermgates')?.id ?? _profileDemo.id,
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
  {
    id: '4',
    userItem: 'campususer - Desk lamp',
    preview: 'Sounds good!',
    time: '1d ago',
    status: 'Completed',
    role: 'buying',
    archived: true,
    listingId: 'list-lamp',
    title: 'Desk lamp',
    price: '$12',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&q=80',
    seller: 'campususer',
    peerUserId: getSeedProfileByHandle('campususer')?.id ?? _profileDemo.id,
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
];

/** Generic placeholder image for empty UI / demos */
export const PLACEHOLDER_IMAGE_URI =
  'https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=400&q=80';

/** Home “Tickets” strip — LSU football sample sales */
export type TicketListing = ListingItem & {
  subtitle: string;
  venue: string;
};

const LSU_FOOTBALL_TICKETS_RAW: TicketListing[] = [
  {
    id: 'lsu-tix-1',
    title: 'LSU vs Ole Miss',
    price: '$95',
    subtitle: 'Nov 15 · 6:00 PM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'Ticketmaster',
  },
  {
    id: 'lsu-tix-2',
    title: 'LSU vs Arkansas',
    price: '$72',
    subtitle: 'Oct 25 · 11:00 AM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'SeatGeek',
  },
  {
    id: 'lsu-tix-3',
    title: 'LSU vs Alabama',
    price: '$110',
    subtitle: 'Nov 8 · 7:00 PM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'Ticketmaster',
  },
  {
    id: 'lsu-tix-4',
    title: 'Student Section — Auburn',
    price: '$45',
    subtitle: 'Sep 20 · TBA',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'StubHub',
  },
  {
    id: 'lsu-tix-5',
    title: 'LSU vs Florida',
    price: '$88',
    subtitle: 'Oct 11 · 6:30 PM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'Ticketmaster',
  },
  {
    id: 'lsu-tix-6',
    title: 'Tailgate Bundle (2)',
    price: '$130',
    subtitle: 'Sep 13 · 2:00 PM',
    venue: 'South Stadium Lot',
    imageUrl:
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&q=80',
    category: 'Events',
    condition: 'New',
    brand: 'Local Seller',
  },
];

export const LSU_FOOTBALL_TICKETS: TicketListing[] = LSU_FOOTBALL_TICKETS_RAW.map(
  (ticket): TicketListing => ({
  ...ticket,
  sellerId: ticket.sellerId ?? MOCK_FALLBACK_PROFILE.id,
  sellerHandle: ticket.sellerHandle ?? 'tiger_tickets',
  sellerAvatarUrl: ticket.sellerAvatarUrl ?? MOCK_FALLBACK_PROFILE.avatarUrl,
})
);

export function filterListingsForHomeCategory(
  listings: ListingItem[],
  category: HomeCategory
): ListingItem[] {
  if (category === 'For You') return listings;
  return listings.filter((listing) => listingHomeCategory(listing) === category);
}

export function filterEventsForHomeCategory(
  events: TicketListing[],
  category: HomeCategory
): TicketListing[] {
  if (category === 'For You' || category === 'Events') return events;
  return [];
}
