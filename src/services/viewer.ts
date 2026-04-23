/**
 * Resolve the current viewer's profile id from `profiles.auth_user_id`.
 */
import { getSupabase } from '@/services/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  return (data?.id as string | undefined) ?? null;
}
