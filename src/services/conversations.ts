/**
 * Inbox data loader: Supabase-backed when configured, falls back to mock rows.
 *
 * Viewer resolution:
 *  - Signed-in user with linked profile (profiles.auth_user_id = session.user.id) → that profile
 *  - Otherwise (anon / authBypass) → PROFILE_DEMO_HANDLE (seed catalog demo seller)
 */
import {
  DEFAULT_PEER_AVATAR_URI,
  MOCK_CONVERSATIONS,
  type ConversationRow,
} from '@/data/mockData';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

type ProfileLite = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
};

type ListingLite = {
  id: string;
  title: string;
  price: string;
  image_url: string;
};

type ConversationLite = {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  archived_by: string[] | null;
  created_at: string;
  listings: ListingLite | ListingLite[] | null;
};

type MessageLite = {
  conversation_id: string;
  body: string;
  created_at: string;
};

type OfferLite = {
  conversation_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  amount_cents: number;
  created_at: string;
};

type MeetupLite = {
  conversation_id: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  scheduled_at: string | null;
};

function firstOrSelf<T>(v: T | T[] | null | undefined): T | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function deriveStatus(
  meetups: MeetupLite[],
  offers: OfferLite[],
): ConversationRow['status'] {
  if (meetups.some((m) => m.status === 'completed')) return 'Completed';
  if (meetups.some((m) => m.status === 'confirmed')) return 'Meetup Confirmed';
  if (offers.some((o) => o.status === 'accepted')) return 'Meetup Confirmed';
  return 'Pending';
}

export async function fetchInboxRows(args: {
  sessionUserId: string | null;
}): Promise<ConversationRow[]> {
  if (!isSupabaseConfigured()) return MOCK_CONVERSATIONS;

  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return MOCK_CONVERSATIONS;

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(
      `id, listing_id, buyer_id, seller_id, last_message_at, archived_by, created_at,
       listings ( id, title, price, image_url )`,
    )
    .or(`buyer_id.eq.${viewerId},seller_id.eq.${viewerId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    return MOCK_CONVERSATIONS;
  }
  const rows = (convs ?? []) as ConversationLite[];
  if (rows.length === 0) return [];

  const convIds = rows.map((r) => r.id);
  const partnerIds = Array.from(
    new Set(rows.flatMap((r) => [r.buyer_id, r.seller_id])),
  );

  const [profilesRes, messagesRes, offersRes, meetupsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, handle, display_name, avatar_url')
      .in('id', partnerIds),
    supabase
      .from('messages')
      .select('conversation_id, body, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('offers')
      .select('conversation_id, status, amount_cents, created_at')
      .in('conversation_id', convIds),
    supabase
      .from('meetups')
      .select('conversation_id, status, scheduled_at')
      .in('conversation_id', convIds),
  ]);

  const profileById = new Map<string, ProfileLite>(
    (profilesRes.data ?? []).map((p) => [p.id as string, p as ProfileLite]),
  );

  const lastMessageByConv = new Map<string, MessageLite>();
  for (const m of (messagesRes.data ?? []) as MessageLite[]) {
    if (!lastMessageByConv.has(m.conversation_id)) {
      lastMessageByConv.set(m.conversation_id, m);
    }
  }

  const offersByConv = new Map<string, OfferLite[]>();
  for (const o of (offersRes.data ?? []) as OfferLite[]) {
    const list = offersByConv.get(o.conversation_id) ?? [];
    list.push(o);
    offersByConv.set(o.conversation_id, list);
  }

  const meetupsByConv = new Map<string, MeetupLite[]>();
  for (const mk of (meetupsRes.data ?? []) as MeetupLite[]) {
    const list = meetupsByConv.get(mk.conversation_id) ?? [];
    list.push(mk);
    meetupsByConv.set(mk.conversation_id, list);
  }

  return rows.map((r): ConversationRow => {
    const isSeller = r.seller_id === viewerId;
    const peer = profileById.get(isSeller ? r.buyer_id : r.seller_id);
    const listing = firstOrSelf(r.listings);
    const lastMsg = lastMessageByConv.get(r.id);
    const peerHandle = peer?.handle ?? 'user';
    const listingTitle = listing?.title ?? 'Item';

    return {
      id: r.id,
      userItem: `${peerHandle} - ${listingTitle}`,
      preview: lastMsg?.body ?? 'No messages yet.',
      time: formatTimeAgo(lastMsg?.created_at ?? r.last_message_at ?? r.created_at),
      status: deriveStatus(
        meetupsByConv.get(r.id) ?? [],
        offersByConv.get(r.id) ?? [],
      ),
      role: isSeller ? 'selling' : 'buying',
      archived: (r.archived_by ?? []).includes(viewerId),
      listingId: listing?.id ?? r.listing_id ?? '',
      title: listing?.title ?? '',
      price: listing?.price ?? '',
      imageUrl: listing?.image_url ?? '',
      seller: peerHandle,
      peerUserId: peer?.id ?? '',
      peerAvatarUrl: peer?.avatar_url ?? DEFAULT_PEER_AVATAR_URI,
    };
  });
}

/** Messages for a thread, oldest → newest. */
export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: 'me' | 'them';
};

export async function fetchMessages(args: {
  conversationId: string;
  sessionUserId: string | null;
}): Promise<ThreadMessage[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', args.conversationId)
    .order('created_at', { ascending: true });
  if (error) return [];

  return (data ?? []).map((m) => ({
    id: m.id as string,
    body: m.body as string,
    createdAt: m.created_at as string,
    sender: (m.sender_id as string) === viewerId ? 'me' : 'them',
  }));
}

export async function sendMessage(args: {
  conversationId: string;
  body: string;
  sessionUserId: string | null;
}): Promise<ThreadMessage | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: args.conversationId,
      sender_id: viewerId,
      body: args.body,
    })
    .select('id, sender_id, body, created_at')
    .single();
  if (error || !data) return null;

  await supabase
    .from('conversations')
    .update({ last_message_at: data.created_at as string })
    .eq('id', args.conversationId);

  return {
    id: data.id as string,
    body: data.body as string,
    createdAt: data.created_at as string,
    sender: (data.sender_id as string) === viewerId ? 'me' : 'them',
  };
}

/** Peer profile info needed to render a thread header from Inbox or deep links. */
export type PeerInfo = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
};

export async function fetchConversationPeer(args: {
  conversationId: string;
  sessionUserId: string | null;
}): Promise<PeerInfo | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', args.conversationId)
    .maybeSingle();
  if (!conv) return null;
  const peerId =
    (conv.seller_id as string) === viewerId
      ? (conv.buyer_id as string)
      : (conv.seller_id as string);

  const { data: peer } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url')
    .eq('id', peerId)
    .maybeSingle();
  if (!peer) return null;
  return {
    id: peer.id as string,
    handle: peer.handle as string,
    displayName: peer.display_name as string,
    avatarUrl: peer.avatar_url as string,
  };
}
