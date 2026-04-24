/**
 * Inbox data loader: Supabase-backed when configured, falls back to mock rows.
 *
 * Viewer resolution:
 *  - Signed-in user with linked profile (profiles.auth_user_id = session.user.id) → that profile
 *  - Otherwise (anon / authBypass) → PROFILE_DEMO_HANDLE (seed catalog demo seller)
 */
import {
  DEFAULT_PEER_AVATAR_URI,
  type ConversationRow,
} from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const localOfferAmountByConversationId = new Map<string, string>();
const OFFER_CACHE_KEY = '@handoff/local_offer_amounts_v1';
const INBOX_CACHE_KEY_PREFIX = '@handoff/inbox_rows_v1';
const THREAD_CACHE_KEY_PREFIX = '@handoff/thread_messages_v1';
let offersHydrated = false;
let offersHydrating: Promise<void> | null = null;

function inboxCacheKey(viewerId: string | null) {
  return `${INBOX_CACHE_KEY_PREFIX}:${viewerId ?? 'guest'}`;
}

function threadCacheKey(viewerId: string | null, conversationId: string) {
  return `${THREAD_CACHE_KEY_PREFIX}:${viewerId ?? 'guest'}:${conversationId}`;
}

async function readCachedInboxRows(
  viewerId: string | null,
): Promise<ConversationRow[] | null> {
  try {
    const raw = await AsyncStorage.getItem(inboxCacheKey(viewerId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as ConversationRow[];
  } catch {
    return null;
  }
}

async function persistInboxRows(
  viewerId: string | null,
  rows: ConversationRow[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(inboxCacheKey(viewerId), JSON.stringify(rows));
  } catch {
    // Non-blocking cache persistence.
  }
}

async function readCachedThreadMessages(args: {
  sessionUserId: string | null;
  conversationId: string;
}): Promise<ThreadMessage[] | null> {
  try {
    const raw = await AsyncStorage.getItem(
      threadCacheKey(args.sessionUserId, args.conversationId),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as ThreadMessage[];
  } catch {
    return null;
  }
}

async function persistThreadMessages(args: {
  sessionUserId: string | null;
  conversationId: string;
  messages: ThreadMessage[];
}): Promise<void> {
  try {
    await AsyncStorage.setItem(
      threadCacheKey(args.sessionUserId, args.conversationId),
      JSON.stringify(args.messages),
    );
  } catch {
    // Non-blocking cache persistence.
  }
}

function mergeInboxRows(
  remoteRows: ConversationRow[],
  cachedRows: ConversationRow[],
): ConversationRow[] {
  const byId = new Map<string, ConversationRow>();
  // Seed with cached so local-only conversations remain visible.
  for (const row of cachedRows) byId.set(row.id, row);
  // Remote rows overwrite matching ids with fresher server data.
  for (const row of remoteRows) byId.set(row.id, row);
  return Array.from(byId.values());
}

async function hydrateOfferCache(): Promise<void> {
  if (offersHydrated) return;
  if (offersHydrating) return offersHydrating;
  offersHydrating = (async () => {
    try {
      const raw = await AsyncStorage.getItem(OFFER_CACHE_KEY);
      if (!raw) {
        offersHydrated = true;
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, string>;
      Object.entries(parsed).forEach(([conversationId, amount]) => {
        if (conversationId && typeof amount === 'string' && amount.trim()) {
          localOfferAmountByConversationId.set(conversationId, amount);
        }
      });
    } catch {
      // Ignore malformed cache and continue with in-memory map.
    } finally {
      offersHydrated = true;
      offersHydrating = null;
    }
  })();
  return offersHydrating;
}

async function persistOfferCache(): Promise<void> {
  try {
    const payload = JSON.stringify(
      Object.fromEntries(localOfferAmountByConversationId.entries()),
    );
    await AsyncStorage.setItem(OFFER_CACHE_KEY, payload);
  } catch {
    // Non-blocking cache persistence.
  }
}

async function setLocalOfferAmount(
  conversationId: string,
  amount: string,
): Promise<void> {
  await hydrateOfferCache();
  localOfferAmountByConversationId.set(conversationId, amount);
  await persistOfferCache();
}

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
  const cached = await readCachedInboxRows(args.sessionUserId);
  if (!isSupabaseConfigured()) return cached ?? [];

  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return cached ?? [];

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(
      `id, listing_id, buyer_id, seller_id, last_message_at, archived_by, created_at,
       listings ( id, title, price, image_url )`,
    )
    .or(`buyer_id.eq.${viewerId},seller_id.eq.${viewerId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) return cached ?? [];
  const rows = (convs ?? []) as ConversationLite[];
  if (rows.length === 0) return cached ?? [];

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

  const remoteRows = rows.map((r): ConversationRow => {
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

  const merged = mergeInboxRows(remoteRows, cached ?? []);
  await persistInboxRows(args.sessionUserId, merged);
  return merged;
}

export async function upsertLocalInboxConversation(args: {
  sessionUserId: string | null;
  conversationId: string;
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller: string;
  peerUserId?: string;
  peerAvatarUrl?: string;
  preview?: string;
}): Promise<void> {
  const existing = (await readCachedInboxRows(args.sessionUserId)) ?? [];
  const nextRow: ConversationRow = {
    id: args.conversationId,
    userItem: `${args.seller} - ${args.title}`,
    preview: args.preview ?? 'Conversation started',
    time: 'just now',
    status: 'Pending',
    role: 'buying',
    archived: false,
    listingId: args.listingId,
    title: args.title,
    price: args.price,
    imageUrl: args.imageUrl,
    seller: args.seller,
    peerUserId: args.peerUserId,
    peerAvatarUrl: args.peerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
  };

  const withoutSame = existing.filter((row) => row.id !== nextRow.id);
  await persistInboxRows(args.sessionUserId, [nextRow, ...withoutSame]);
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
  const cached = await readCachedThreadMessages(args);
  if (!isSupabaseConfigured()) return cached ?? [];
  if (!args.conversationId || args.conversationId.startsWith('local:')) {
    return cached ?? [];
  }
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return cached ?? [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', args.conversationId)
    .order('created_at', { ascending: true });
  if (error) return cached ?? [];

  const remote: ThreadMessage[] = (data ?? []).map((m) => ({
    id: m.id as string,
    body: m.body as string,
    createdAt: m.created_at as string,
    sender: (m.sender_id as string) === viewerId ? 'me' : 'them',
  }));
  const next = remote.length > 0 || !cached ? remote : cached;
  await persistThreadMessages({
    sessionUserId: args.sessionUserId,
    conversationId: args.conversationId,
    messages: next,
  });
  return next;
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

export async function appendLocalThreadMessage(args: {
  conversationId: string;
  sessionUserId: string | null;
  message: ThreadMessage;
}): Promise<void> {
  const existing = (await readCachedThreadMessages({
    sessionUserId: args.sessionUserId,
    conversationId: args.conversationId,
  })) ?? [];
  const next = [...existing.filter((m) => m.id !== args.message.id), args.message];
  await persistThreadMessages({
    sessionUserId: args.sessionUserId,
    conversationId: args.conversationId,
    messages: next,
  });
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

function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '').trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

function formatCentsToDollar(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Ensure a listing conversation exists for the current viewer and seller.
 * Returns the conversation id when Supabase is configured and the write succeeds.
 */
export async function ensureConversationForListing(args: {
  listingId: string;
  sellerProfileId: string;
  sessionUserId: string | null;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId || viewerId === args.sellerProfileId) return null;

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('conversations')
    .upsert(
      {
        listing_id: args.listingId,
        buyer_id: viewerId,
        seller_id: args.sellerProfileId,
        last_message_at: nowIso,
      },
      { onConflict: 'listing_id,buyer_id,seller_id', ignoreDuplicates: false },
    )
    .select('id')
    .single();

  if (error || !data?.id) return null;
  return data.id as string;
}

/**
 * Persist a pending offer row for the active conversation.
 */
export async function createPendingOffer(args: {
  conversationId: string;
  amount: string;
  sessionUserId: string | null;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  const amountCents = parseAmountToCents(args.amount);
  if (!viewerId || !amountCents) return false;
  await setLocalOfferAmount(
    args.conversationId,
    formatCentsToDollar(amountCents),
  );

  const { error } = await supabase.from('offers').insert({
    conversation_id: args.conversationId,
    buyer_id: viewerId,
    amount_cents: amountCents,
    status: 'pending',
  });
  if (error) return false;

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', args.conversationId);
  return true;
}

export async function fetchLatestOfferAmount(args: {
  conversationId: string;
  sessionUserId: string | null;
}): Promise<string | null> {
  await hydrateOfferCache();
  const seeded = localOfferAmountByConversationId.get(args.conversationId);
  if (seeded) return seeded;
  if (!isSupabaseConfigured()) return null;
  if (!args.conversationId || args.conversationId.startsWith('local:')) return null;
  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const { data, error } = await supabase
    .from('offers')
    .select('amount_cents')
    .eq('conversation_id', args.conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;

  const cents = Number(data.amount_cents);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  const amount = formatCentsToDollar(cents);
  await setLocalOfferAmount(args.conversationId, amount);
  return amount;
}

export async function seedLocalOfferAmount(args: {
  conversationId: string;
  amount: string;
}): Promise<void> {
  const cents = parseAmountToCents(args.amount);
  if (!cents) return;
  await setLocalOfferAmount(args.conversationId, formatCentsToDollar(cents));
}
