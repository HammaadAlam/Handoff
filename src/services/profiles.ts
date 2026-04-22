/**
 * Public profile reads + follow/unfollow writes (demo RLS allows anon writes).
 * Resolves a profile by handle or id, then fetches that seller's active listings
 * and their latest reviews.
 */
import type { ListingItem } from '@/data/mockData';
import { RECOMMENDED_LISTINGS } from '@/data/mockData';
import {
  PROFILE_DEMO_HANDLE,
  getSeedProfileByHandle,
  getSeedProfileById,
} from '@/data/seedCatalog';
import {
  fetchListingsByUserId,
} from '@/services/listings';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

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

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    handle: string;
    displayName: string;
    avatarUrl: string;
  } | null;
};

export type PublicProfileBundle = {
  profile: PublicProfile;
  listings: ListingItem[];
  reviews: PublicReview[];
  isFollowing: boolean;
  isSelf: boolean;
};

type ProfileRow = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  campus: string;
  primary_meetup_spot: string;
  rating_avg: number | string;
  review_count: number;
  items_sold: number;
  followers_count: number;
  is_verified_edu: boolean;
  created_at: string;
};

const PROFILE_COLUMNS =
  'id, handle, display_name, avatar_url, bio, campus, primary_meetup_spot, rating_avg, review_count, items_sold, followers_count, is_verified_edu, created_at';

function fallbackBundleByUser(args: {
  userId?: string;
  handle?: string;
  sessionUserId: string | null;
}): PublicProfileBundle | null {
  const p = args.userId
    ? getSeedProfileById(args.userId)
    : args.handle
      ? getSeedProfileByHandle(args.handle)
      : undefined;
  if (!p) return null;
  const listings = RECOMMENDED_LISTINGS.filter((l) => l.sellerId === p.id);
  return {
    profile: {
      id: p.id,
      handle: p.handle,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      campus: p.campus,
      primaryMeetupSpot: p.primaryMeetupSpot,
      ratingAvg: p.ratingAvg,
      reviewCount: p.reviewCount,
      itemsSold: p.itemsSold,
      followersCount: p.followersCount,
      isVerifiedEdu: p.isVerifiedEdu,
      createdAt: new Date().toISOString(),
    },
    listings,
    reviews: [],
    isFollowing: false,
    isSelf: p.handle === PROFILE_DEMO_HANDLE,
  };
}

function mapProfileRow(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    campus: row.campus,
    primaryMeetupSpot: row.primary_meetup_spot,
    ratingAvg: Number(row.rating_avg) || 0,
    reviewCount: row.review_count,
    itemsSold: row.items_sold,
    followersCount: row.followers_count,
    isVerifiedEdu: row.is_verified_edu,
    createdAt: row.created_at,
  };
}

export async function fetchPublicProfile(args: {
  userId?: string;
  handle?: string;
  sessionUserId: string | null;
}): Promise<PublicProfileBundle | null> {
  if (!isSupabaseConfigured()) return fallbackBundleByUser(args);
  if (!args.userId && !args.handle) return null;

  const supabase = getSupabase();
  const query = supabase.from('profiles').select(PROFILE_COLUMNS).limit(1);
  const { data: profData, error: profErr } = args.userId
    ? await query.eq('id', args.userId).maybeSingle()
    : await query.eq('handle', args.handle!).maybeSingle();

  if (profErr || !profData) return null;
  const profile = mapProfileRow(profData as ProfileRow);

  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  const isSelf = !!viewerId && viewerId === profile.id;

  const [listings, reviewsRes, followRes] = await Promise.all([
    fetchListingsByUserId(profile.id, 60),
    supabase
      .from('reviews')
      .select(
        `id, rating, body, created_at,
         reviewer:profiles!reviews_author_id_fkey ( handle, display_name, avatar_url )`,
      )
      .eq('subject_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),
    viewerId && !isSelf
      ? supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', viewerId)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  type ReviewerEmbed = {
    handle: string;
    display_name: string;
    avatar_url: string;
  };
  type ReviewRow = {
    id: string;
    rating: number;
    body: string | null;
    created_at: string;
    reviewer: ReviewerEmbed | ReviewerEmbed[] | null;
  };
  const reviews = ((reviewsRes.data ?? []) as ReviewRow[]).map<PublicReview>(
    (r) => {
      const rv = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
      return {
        id: r.id,
        rating: r.rating,
        comment: r.body,
        createdAt: r.created_at,
        reviewer: rv
          ? {
              handle: rv.handle,
              displayName: rv.display_name,
              avatarUrl: rv.avatar_url,
            }
          : null,
      };
    },
  );

  return {
    profile,
    listings,
    reviews,
    isFollowing: !!followRes.data,
    isSelf,
  };
}

/**
 * Resolve canonical profile id from a known id or public handle.
 */
export async function resolveProfileId(args: {
  userId?: string;
  handle?: string;
}): Promise<string | null> {
  if (args.userId) return args.userId;

  const handle = args.handle?.trim();
  if (!handle) return null;

  const seed = getSeedProfileByHandle(handle);
  if (seed) return seed.id;

  if (!isSupabaseConfigured()) return null;
  const { data } = await getSupabase()
    .from('profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

async function ensureViewerForFollow(
  sessionUserId: string | null,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  return resolveViewerProfileId(sessionUserId);
}

export async function followProfile(args: {
  targetProfileId: string;
  sessionUserId: string | null;
}): Promise<boolean> {
  const viewerId = await ensureViewerForFollow(args.sessionUserId);
  if (!viewerId || viewerId === args.targetProfileId) return false;
  const supabase = getSupabase();
  const { error } = await supabase
    .from('follows')
    .upsert(
      { follower_id: viewerId, following_id: args.targetProfileId },
      { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
    );
  return !error;
}

export async function unfollowProfile(args: {
  targetProfileId: string;
  sessionUserId: string | null;
}): Promise<boolean> {
  const viewerId = await ensureViewerForFollow(args.sessionUserId);
  if (!viewerId) return false;
  const supabase = getSupabase();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', viewerId)
    .eq('following_id', args.targetProfileId);
  return !error;
}
