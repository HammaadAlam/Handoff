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

export type PersonalizationInterest = (typeof PERSONALIZATION_INTEREST_OPTIONS)[number];

export type ViewerPersonalization = {
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

export type AboutYouInput = {
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

export async function fetchViewerPersonalization(
  sessionUserId: string | null,
): Promise<ViewerPersonalization | null> {
  if (!isSupabaseConfigured() || !sessionUserId) return null;
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, display_name, campus, class_year, gender, clothing_size, height_text, weight_text, preference_tags, onboarding_completed, onboarding_skipped',
    )
    .eq('id', profileId)
    .maybeSingle();
  if (error || !data) return null;

  return {
    profileId: data.id as string,
    onboardingCompleted: Boolean(data.onboarding_completed),
    onboardingSkipped: Boolean(data.onboarding_skipped),
    displayName: (data.display_name as string | null) ?? '',
    university: (data.campus as string | null) ?? '',
    year: (data.class_year as string | null) ?? '',
    gender: (data.gender as string | null) ?? '',
    clothingSize: (data.clothing_size as string | null) ?? '',
    height: (data.height_text as string | null) ?? '',
    weight: (data.weight_text as string | null) ?? '',
    interests: normalizeInterests((data.preference_tags as string[] | null) ?? []),
  };
}

export async function saveAboutYou(
  sessionUserId: string | null,
  input: AboutYouInput,
): Promise<boolean> {
  if (!isSupabaseConfigured() || !sessionUserId) return false;
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) return false;

  const updatePayload = {
    display_name: input.name.trim(),
    campus: input.university.trim(),
    class_year: input.year.trim(),
    gender: input.gender?.trim() ?? '',
    clothing_size: input.clothingSize?.trim() ?? '',
    height_text: input.height?.trim() ?? '',
    weight_text: input.weight?.trim() ?? '',
  };

  const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profileId);
  return !error;
}

export async function saveViewerInterests(
  sessionUserId: string | null,
  interests: string[],
): Promise<boolean> {
  if (!isSupabaseConfigured() || !sessionUserId) return false;
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) return false;

  const normalized = normalizeInterests(interests);
  const { error } = await supabase
    .from('profiles')
    .update({
      preference_tags: normalized,
      onboarding_completed: true,
      onboarding_skipped: false,
    })
    .eq('id', profileId);
  return !error;
}

/** User skips or dismisses first-run flow — main app unlocks without marking personalization "complete". */
export async function skipViewerOnboarding(sessionUserId: string | null): Promise<boolean> {
  if (!isSupabaseConfigured() || !sessionUserId) return false;
  const supabase = getSupabase();
  const profileId = await resolveViewerProfileId(sessionUserId, supabase);
  if (!profileId) return false;
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_skipped: true })
    .eq('id', profileId);
  return !error;
}
