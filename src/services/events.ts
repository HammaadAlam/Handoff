/**
 * Events — Supabase / API service layer.
 */
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { SAMPLE_LISTING_PHOTOS } from '@/data/createListingDraft';

export type EventItem = {
  id: string;
  ownerId: string;
  ownerHandle?: string;
  title: string;
  description: string;
  locationLabel: string;
  locationLat?: number | null;
  locationLng?: number | null;
  startsAt: string;
  endsAt?: string | null;
  imageUrl: string;
};

type EventRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location_label: string;
  location_lat?: number | null;
  location_lng?: number | null;
  starts_at: string;
  ends_at?: string | null;
  image_url?: string | null;
  profiles?:
    | { handle?: string | null }
    | Array<{ handle?: string | null }>
    | null;
};

function mapEventRow(row: EventRow): EventItem {
  const embedded = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerHandle: embedded?.handle ?? undefined,
    title: row.title,
    description: row.description ?? '',
    locationLabel: row.location_label ?? '',
    locationLat:
      typeof row.location_lat === 'number' ? row.location_lat : null,
    locationLng:
      typeof row.location_lng === 'number' ? row.location_lng : null,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? null,
    imageUrl: row.image_url || SAMPLE_LISTING_PHOTOS[0],
  };
}

const EVENTS_WITH_OWNER_SELECT = `
  id,
  owner_id,
  title,
  description,
  location_label,
  location_lat,
  location_lng,
  starts_at,
  ends_at,
  image_url,
  profiles!events_owner_id_fkey ( handle )
` as const;

export async function fetchCampusEvents(limit = 24): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select(EVENTS_WITH_OWNER_SELECT)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(limit);

    if (error) return [];
    return ((data ?? []) as EventRow[]).map(mapEventRow);
  } catch {
    return [];
  }
}

export async function fetchMyEvents(ownerId: string, limit = 24): Promise<EventItem[]> {
  if (!isSupabaseConfigured() || !ownerId) return [];

  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select(EVENTS_WITH_OWNER_SELECT)
      .eq('owner_id', ownerId)
      .order('starts_at', { ascending: true })
      .limit(limit);

    if (error) return [];
    return ((data ?? []) as EventRow[]).map(mapEventRow);
  } catch {
    return [];
  }
}

type NewEventInput = {
  ownerId: string;
  title: string;
  description?: string;
  locationLabel: string;
  locationLat?: number | null;
  locationLng?: number | null;
  startsAt: string;
  endsAt?: string;
  imageUrl?: string;
};

type CreateEventResult =
  | { ok: true; event: EventItem }
  | { ok: false; reason: string };

export async function createEvent(input: NewEventInput): Promise<CreateEventResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'Supabase is not configured.' };
  }
  if (!input.ownerId) {
    return { ok: false, reason: 'Missing owner profile id.' };
  }
  if (!input.title.trim()) {
    return { ok: false, reason: 'Event title is required.' };
  }
  if (!input.locationLabel.trim()) {
    return { ok: false, reason: 'Event location is required.' };
  }
  if (!input.startsAt) {
    return { ok: false, reason: 'Event start time is required.' };
  }

  try {
    const { data, error } = await getSupabase()
      .from('events')
      .insert({
        owner_id: input.ownerId,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        location_label: input.locationLabel.trim(),
        location_lat:
          typeof input.locationLat === 'number' ? input.locationLat : null,
        location_lng:
          typeof input.locationLng === 'number' ? input.locationLng : null,
        starts_at: input.startsAt,
        ends_at: input.endsAt ?? null,
        image_url: input.imageUrl ?? null,
      })
      .select(EVENTS_WITH_OWNER_SELECT)
      .single();
    if (error) {
      return { ok: false, reason: error.message || 'Supabase rejected the event insert.' };
    }
    if (!data) {
      return { ok: false, reason: 'Event was inserted but could not be read back.' };
    }
    return { ok: true, event: mapEventRow(data as EventRow) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error while posting event.';
    return { ok: false, reason: message };
  }
}
