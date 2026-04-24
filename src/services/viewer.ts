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
  }

  return null;
}

export async function resolveViewerProfileId(
  sessionUserId: string | null,
  supabase: SupabaseClient = getSupabase(),
): Promise<string | null> {
  if (!sessionUserId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', sessionUserId)
    .maybeSingle();
  if (data?.id) return data.id as string;

  // Fallback for older accounts that don't yet have linked profiles rows.
  const { data: authRes } = await supabase.auth.getUser();
  const authUser = authRes.user;
  if (!authUser || authUser.id !== sessionUserId) return null;

  const createdId = await createViewerProfileFromAuthUser(authUser, supabase);
  if (createdId) return createdId;

  const { data: retryData } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', sessionUserId)
    .maybeSingle();
  return (retryData?.id as string | undefined) ?? null;
}
