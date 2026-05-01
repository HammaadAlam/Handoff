/**
 * Resolve the current viewer's profile id from `profiles.auth_user_id`.
 */
import { getSupabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

function handleFromUser(user: User): string {
  const fromEmail = (user.email ?? '').split('@')[0] ?? 'user';
  const normalized = fromEmail.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  return (normalized || 'user').slice(0, 24);
}

/**
 * Demo catalog profiles in seed.sql use this UUID prefix. They must not be treated as
 * the signed-in user's profile when linked via auth_user_id (data mistake or old seed run).
 */
function isSeedCatalogProfileId(profileId: string): boolean {
  return profileId.toLowerCase().startsWith('a0000000-0000-4000-8000-');
}

async function createViewerProfileFromAuthUser(
  user: User,
  supabase: SupabaseClient,
): Promise<string | null> {
  const baseHandle = handleFromUser(user);
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    baseHandle;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${baseHandle}`;

  // Retry handle collisions with lightweight suffixes.
  for (let i = 0; i < 5; i += 1) {
    const suffix = i === 0 ? '' : `${Math.floor(Math.random() * 9000) + 1000}`;
    const handle = `${baseHandle}${suffix}`.slice(0, 30);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        handle,
        display_name: displayName,
        avatar_url: avatarUrl,
        auth_user_id: user.id,
        is_verified_edu: (user.email ?? '').toLowerCase().endsWith('.edu'),
      })
      .select('id')
      .single();

    if (!error && data?.id) {
      return data.id as string;
    }

    if (error) {
      console.warn('createViewerProfileFromAuthUser insert failed', {
        attempt: i + 1,
        handle,
        error,
      });
    }
  }

  return null;
}

export async function resolveViewerProfileId(
  sessionUserId: string | null,
  supabase: SupabaseClient = getSupabase(),
): Promise<string | null> {
  if (!sessionUserId) return null;

  const { data: authRes } = await supabase.auth.getUser();
  const authUser = authRes.user;
  if (!authUser || authUser.id !== sessionUserId) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', sessionUserId)
    .maybeSingle();

  if (data?.id) {
    const id = data.id as string;
    if (!isSeedCatalogProfileId(id)) {
      return id;
    }
    console.warn(
      'resolveViewerProfileId: seed-catalog profile is linked to this auth user; ignoring so a real profile can be used. Run migration 0019_clear_seed_profile_auth_links.sql if inserts fail.',
      { profileId: id },
    );
  }

  // No usable linked row — create one for older accounts or after clearing bad links.
  const createdId = await createViewerProfileFromAuthUser(authUser, supabase);
  if (createdId) return createdId;

  const { data: retryData } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', sessionUserId)
    .maybeSingle();
  const retryId = retryData?.id as string | undefined;
  if (retryId && !isSeedCatalogProfileId(retryId)) {
    return retryId;
  }
  return null;
}
