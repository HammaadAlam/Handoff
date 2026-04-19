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
