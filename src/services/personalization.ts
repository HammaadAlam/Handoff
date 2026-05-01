/**
 * Onboarding & personalization — profile fields, interests, skip/complete persistence.
 */
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

export const PERSONALIZATION_INTEREST_OPTIONS = [
  'Textbooks',
  'School Supplies',
  'Electronics',
  'Sports',
  'Clothes',
  'Beauty & Style',
  'Music',
  'Art',
  'Food',
  'Gaming',
  'Baking',
] as const;

type PersonalizationInterest = (typeof PERSONALIZATION_INTEREST_OPTIONS)[number];

type ViewerPersonalization = {
  profileId: string;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  displayName: string;
  university: string;
  year: string;
  gender: string;
  clothingSize: string;
  height: string;
  weight: string;
  interests: string[];
};

type AboutYouInput = {
  name: string;
  university: string;
  year: string;
  gender?: string;
  clothingSize?: string;
  height?: string;
  weight?: string;
};

function normalizeInterests(values: string[]): string[] {
  const valid = new Set(PERSONALIZATION_INTEREST_OPTIONS);
  const out: string[] = [];
  for (const value of values) {
    if (valid.has(value as PersonalizationInterest) && !out.includes(value)) {
      out.push(value);
    }
  }
  return out;
}

type ProfileSaveOutcome = { ok: true } | { ok: false; message: string };

const RLS_NO_ROW_HINT =
  'Your profile could not be updated. Sign out and sign back in, or ask an admin to link your account (profiles.auth_user_id).';

function outcomeFromPostgrest(
  data: { id?: string } | null,
  error: { message?: string } | null,
): ProfileSaveOutcome {
  if (error?.message) {
    return { ok: false, message: error.message };
  }
  if (!data?.id) {
    return { ok: false, message: RLS_NO_ROW_HINT };
  }
  return { ok: true };
}

export async function fetchViewerPersonalization(
  sessionUserId: string | null,
): Promise<ViewerPersonalization | null> {
  if (!isSupabaseConfigured() || !sessionUserId) return null;
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) return null;

  const fullSelect =
    'id, display_name, campus, class_year, gender, clothing_size, height_text, weight_text, preference_tags, onboarding_completed, onboarding_skipped';
  let { data, error } = await supabase
    .from('profiles')
    .select(fullSelect)
    .eq('id', profileId)
    .maybeSingle();
  if (error) {
    ({ data, error } = await supabase
      .from('profiles')
      .select(
        'id, display_name, campus, class_year, gender, clothing_size, height_text, weight_text, preference_tags, onboarding_completed',
      )
      .eq('id', profileId)
      .maybeSingle());
  }
  if (error || !data) return null;

  const row = data as Record<string, unknown>;

  return {
    profileId: row.id as string,
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingSkipped: Boolean(row.onboarding_skipped),
    displayName: (row.display_name as string | null) ?? '',
    university: (row.campus as string | null) ?? '',
    year: (row.class_year as string | null) ?? '',
    gender: (row.gender as string | null) ?? '',
    clothingSize: (row.clothing_size as string | null) ?? '',
    height: (row.height_text as string | null) ?? '',
    weight: (row.weight_text as string | null) ?? '',
    interests: normalizeInterests((row.preference_tags as string[] | null) ?? []),
  };
}

export async function saveAboutYou(
  sessionUserId: string | null,
  input: AboutYouInput,
): Promise<ProfileSaveOutcome> {
  if (!isSupabaseConfigured() || !sessionUserId) {
    return { ok: false, message: 'Not signed in or Supabase is not configured.' };
  }
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) {
    return { ok: false, message: 'Could not find your profile. Try signing out and back in.' };
  }

  const updatePayload = {
    display_name: input.name.trim(),
    campus: input.university.trim(),
    class_year: input.year.trim(),
    gender: input.gender?.trim() ?? '',
    clothing_size: input.clothingSize?.trim() ?? '',
    height_text: input.height?.trim() ?? '',
    weight_text: input.weight?.trim() ?? '',
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profileId)
    .select('id')
    .maybeSingle();
  return outcomeFromPostgrest(data, error);
}

export async function saveViewerInterests(
  sessionUserId: string | null,
  interests: string[],
): Promise<ProfileSaveOutcome> {
  if (!isSupabaseConfigured() || !sessionUserId) {
    return { ok: false, message: 'Not signed in or Supabase is not configured.' };
  }
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) {
    return { ok: false, message: 'Could not find your profile. Try signing out and back in.' };
  }

  const normalized = normalizeInterests(interests);
  const fullPayload = {
    preference_tags: normalized,
    onboarding_completed: true,
    onboarding_skipped: false,
  };

  let { data, error } = await supabase
    .from('profiles')
    .update(fullPayload)
    .eq('id', profileId)
    .select('id')
    .maybeSingle();

  if (error || !data?.id) {
    ({ data, error } = await supabase
      .from('profiles')
      .update({
        preference_tags: normalized,
        onboarding_completed: true,
      })
      .eq('id', profileId)
      .select('id')
      .maybeSingle());
  }

  return outcomeFromPostgrest(data, error);
}

/** User skips or dismisses first-run flow — main app unlocks without marking personalization "complete". */
export async function skipViewerOnboarding(sessionUserId: string | null): Promise<ProfileSaveOutcome> {
  if (!isSupabaseConfigured() || !sessionUserId) {
    return { ok: false, message: 'Not signed in or Supabase is not configured.' };
  }
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) {
    return { ok: false, message: 'Could not find your profile. Try signing out and back in.' };
  }
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_skipped: true })
    .eq('id', profileId)
    .select('id')
    .maybeSingle();
  return outcomeFromPostgrest(data, error);
}
