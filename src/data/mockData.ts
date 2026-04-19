/**
 * Static demo data for marketplace UI — replace with API responses later.
 */

/** Fallback peer avatar for chats when none is passed (HTTPS, works offline after cache) */
export const DEFAULT_PEER_AVATAR_URI =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013f?w=200&q=80';

export const HOME_CATEGORIES = ['For You', 'Clothes', 'Furniture', 'Event'] as const;

export type ListingItem = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  /** Rich search / popular card (optional) */
  rating?: number;
  reviewCount?: number;
  location?: string;
  postedAgo?: string;
  imageBadge?: 'boost' | 'urgent';
  trust?: 'verified' | 'premium';
};

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

export const RECOMMENDED_LISTINGS: ListingItem[] = [
  {
    id: '1',
    title: 'White Cabinet',
    price: '$50',
    imageUrl:
      'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=400&q=80',
  },
  {
    id: '2',
    title: 'Sociology Textbook',
    price: '$25',
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  },
  {
    id: '3',
    title: 'Cozy Chair',
    price: '$200',
    imageUrl:
      'https://images.unsplash.com/photo-1567538096639-e914c58b9e55?w=400&q=80',
  },
  {
    id: '4',
    title: 'Black Cabinet',
    price: '$50',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
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
export const CABINET_LISTINGS: ListingItem[] = [
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
];

export const DEFAULT_RECENT_SEARCHES = ['Calculator', 'Chairs', 'Textbook'] as const;

export const TRENDING_LISTINGS: ListingItem[] = [
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
];

/** Search landing “Popular items” grid — badges, ratings, location */
export const POPULAR_LISTINGS: ListingItem[] = [
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
    imageBadge: 'boost',
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
    imageBadge: 'urgent',
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
    imageBadge: 'boost',
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
    imageBadge: 'urgent',
    trust: 'premium',
  },
];

/** Pick a result set for the category / search results screen */
export function listingsForSearchQuery(query: string): ListingItem[] {
  const q = query.trim().toLowerCase();
  if (q.includes('cabinet')) return CABINET_LISTINGS;
  if (q.includes('popular')) return POPULAR_LISTINGS;
  return TRENDING_LISTINGS;
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
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
];

/** Profile tab — Featured / Best Sellers carousels (matches layout mockups) */
export const PROFILE_FEATURED_LISTINGS: ListingItem[] = [
  {
    id: 'pf1',
    title: 'Khaki shorts',
    price: '$22',
    imageUrl:
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80',
  },
  {
    id: 'pf2',
    title: 'Long sleeve',
    price: '$35',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  },
  {
    id: 'pf3',
    title: 'Pattern shirt',
    price: '$28',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b87?w=400&q=80',
  },
  {
    id: 'pf4',
    title: 'Sneakers',
    price: '$90',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
  },
];

export const PROFILE_BEST_SELLERS: ListingItem[] = [
  {
    id: 'pb1',
    title: 'Blazer',
    price: '$75',
    imageUrl:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
  },
  {
    id: 'pb2',
    title: 'Graphic tee',
    price: '$18',
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80',
  },
  {
    id: 'pb3',
    title: 'Socks (3-pack)',
    price: '$12',
    imageUrl:
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80',
  },
];

export const PROFILE_MY_ITEMS: ListingItem[] = [
  {
    id: 'pm1',
    title: 'Jacket',
    price: '$120',
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
  },
  {
    id: 'pm2',
    title: 'Jeans',
    price: '$45',
    imageUrl:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
  },
  {
    id: 'pm3',
    title: 'Sneakers',
    price: '$80',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
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

export const LSU_FOOTBALL_TICKETS: TicketListing[] = [
  {
    id: 'lsu-tix-1',
    title: 'LSU vs Ole Miss',
    price: '$95',
    subtitle: 'Nov 15 · 6:00 PM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
  },
  {
    id: 'lsu-tix-2',
    title: 'LSU vs Arkansas',
    price: '$72',
    subtitle: 'Oct 25 · 11:00 AM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  },
  {
    id: 'lsu-tix-3',
    title: 'LSU vs Alabama',
    price: '$110',
    subtitle: 'Nov 8 · 7:00 PM',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
  },
  {
    id: 'lsu-tix-4',
    title: 'Student Section — Auburn',
    price: '$45',
    subtitle: 'Sep 20 · TBA',
    venue: 'Tiger Stadium',
    imageUrl:
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
  },
];
