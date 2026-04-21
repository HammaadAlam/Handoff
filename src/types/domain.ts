/**
 * Domain shapes for listings / profiles (e.g. Supabase or API responses).
 * Timestamps as ISO strings for portability.
 */
export type UserProfile = {
  displayName: string;
  email: string;
  createdAt: string;
  /** Optional public handle for profile URL */
  handle?: string;
};

/** Public seller storefront row (matches `public.profiles` in Supabase). */
export type PublicProfile = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  campus: string;
  primaryMeetupSpot: string;
  ratingAvg: number;
  reviewCount: number;
  itemsSold: number;
  followersCount: number;
  isVerifiedEdu: boolean;
  createdAt: string;
};

export type ListingStatus = 'active' | 'sold' | 'removed';

export type ListingDoc = {
  sellerId: string;
  title: string;
  price: string;
  description?: string;
  category?: string;
  condition?: string;
  imageUrls: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
};

export type ChatDoc = {
  listingId: string;
  participants: string[];
  updatedAt: string;
};

export type MessageDoc = {
  senderId: string;
  text: string;
  createdAt: string;
};
