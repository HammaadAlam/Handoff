/**
 * Meetup persistence — backs the buyer/seller meetup confirmation flow.
 *
 * One conversation can have a history of meetup rows (proposed → confirmed →
 * completed/cancelled). The screen always reflects the most recent row so
 * "suggest new details" simply inserts another `proposed` row that supersedes
 * the previous one.
 */
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

export type MeetupStatus = 'proposed' | 'confirmed' | 'completed' | 'cancelled';

export type MeetupRecord = {
  id: string;
  conversationId: string;
  locationLabel: string;
  scheduledAt: string | null;
  status: MeetupStatus;
  lat: number | null;
  lng: number | null;
};

type MeetupRow = {
  id: string;
  conversation_id: string;
  location_label: string | null;
  scheduled_at: string | null;
  status: MeetupStatus;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

function mapMeetupRow(row: MeetupRow): MeetupRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    locationLabel: (row.location_label ?? '').trim(),
    scheduledAt: row.scheduled_at,
    status: row.status,
    lat: typeof row.lat === 'number' ? row.lat : null,
    lng: typeof row.lng === 'number' ? row.lng : null,
  };
}

function isPersistedConversationId(conversationId: string | null | undefined): boolean {
  return Boolean(conversationId) && !conversationId!.startsWith('local:');
}

/**
 * Latest meetup row for a conversation (newest first). Returns `null` when
 * Supabase isn't configured, the conversation is local-only, or no rows exist.
 */
export async function fetchLatestMeetup(args: {
  conversationId: string;
  sessionUserId: string | null;
}): Promise<MeetupRecord | null> {
  if (!isSupabaseConfigured()) return null;
  if (!isPersistedConversationId(args.conversationId)) return null;

  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const { data, error } = await supabase
    .from('meetups')
    .select('id, conversation_id, location_label, scheduled_at, status, lat, lng, created_at')
    .eq('conversation_id', args.conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapMeetupRow(data as MeetupRow);
}

/**
 * Insert a new `proposed` meetup row capturing the suggested location/time.
 * Either participant can propose; the counterparty confirms via `confirmMeetup`.
 */
export async function proposeMeetup(args: {
  conversationId: string;
  locationLabel: string;
  scheduledAt?: string | null;
  lat?: number | null;
  lng?: number | null;
  sessionUserId: string | null;
}): Promise<MeetupRecord | null> {
  if (!isSupabaseConfigured()) return null;
  if (!isPersistedConversationId(args.conversationId)) return null;

  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const { data, error } = await supabase
    .from('meetups')
    .insert({
      conversation_id: args.conversationId,
      location_label: args.locationLabel.trim(),
      scheduled_at: args.scheduledAt ?? null,
      lat: typeof args.lat === 'number' ? args.lat : null,
      lng: typeof args.lng === 'number' ? args.lng : null,
      status: 'proposed' as MeetupStatus,
    })
    .select('id, conversation_id, location_label, scheduled_at, status, lat, lng, created_at')
    .single();

  if (error || !data) {
    if (error) console.warn('proposeMeetup error', error);
    return null;
  }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', args.conversationId);

  return mapMeetupRow(data as MeetupRow);
}

/**
 * Confirm meetup details. If a meetup row already exists for the conversation
 * we flip the latest one to `confirmed` (preserving the agreed location/time).
 * Otherwise we insert a fresh `confirmed` row using the supplied fallbacks
 * so the inbox/status pipeline picks the deal up immediately.
 */
export async function confirmMeetup(args: {
  conversationId: string;
  fallbackLocationLabel?: string;
  fallbackScheduledAt?: string | null;
  fallbackLat?: number | null;
  fallbackLng?: number | null;
  sessionUserId: string | null;
}): Promise<MeetupRecord | null> {
  if (!isSupabaseConfigured()) return null;
  if (!isPersistedConversationId(args.conversationId)) return null;

  const supabase = getSupabase();
  const viewerId = await resolveViewerProfileId(args.sessionUserId, supabase);
  if (!viewerId) return null;

  const latest = await fetchLatestMeetup({
    conversationId: args.conversationId,
    sessionUserId: args.sessionUserId,
  });

  let confirmed: MeetupRow | null = null;

  if (latest && (latest.status === 'proposed' || latest.status === 'confirmed')) {
    const { data, error } = await supabase
      .from('meetups')
      .update({ status: 'confirmed' as MeetupStatus })
      .eq('id', latest.id)
      .select('id, conversation_id, location_label, scheduled_at, status, lat, lng, created_at')
      .single();
    if (error) {
      console.warn('confirmMeetup update error', error);
      return null;
    }
    confirmed = data as MeetupRow;
  } else {
    const { data, error } = await supabase
      .from('meetups')
      .insert({
        conversation_id: args.conversationId,
        location_label: (args.fallbackLocationLabel ?? '').trim(),
        scheduled_at: args.fallbackScheduledAt ?? null,
        lat: typeof args.fallbackLat === 'number' ? args.fallbackLat : null,
        lng: typeof args.fallbackLng === 'number' ? args.fallbackLng : null,
        status: 'confirmed' as MeetupStatus,
      })
      .select('id, conversation_id, location_label, scheduled_at, status, lat, lng, created_at')
      .single();
    if (error || !data) {
      if (error) console.warn('confirmMeetup insert error', error);
      return null;
    }
    confirmed = data as MeetupRow;
  }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', args.conversationId);

  return confirmed ? mapMeetupRow(confirmed) : null;
}
