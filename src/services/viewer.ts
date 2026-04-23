/**
 * Resolve the current viewer's profile id. Signed-in users are matched via
 * profiles.auth_user_id; otherwise falls back to the PROFILE_DEMO_HANDLE seed
 * profile so demo/bypass mode still has a viewer.
 */
import { PROFILE_DEMO_HANDLE } from '@/data/seedCatalog';
import { getSupabase } from '@/services/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedDemoProfileId: string | null | undefined;

export async function resolveViewerProfileId(
  sessionUserId: string | null,
  supabase: SupabaseClient = getSupabase(),
): Promise<string | null> {
  if (sessionUserId) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', sessionUserId)
      .maybeSingle();
    if (data?.id) return data.id as string;
    // Demo fallback: keep messaging/feed interactive even before an auth user
    // is linked to a dedicated `profiles` row.
    if (cachedDemoProfileId !== undefined) return cachedDemoProfileId;
    const { data: demo } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', PROFILE_DEMO_HANDLE)
      .maybeSingle();
    cachedDemoProfileId = (demo?.id as string | undefined) ?? null;
    return cachedDemoProfileId;
  }
  if (cachedDemoProfileId !== undefined) return cachedDemoProfileId;
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('handle', PROFILE_DEMO_HANDLE)
    .maybeSingle();
  cachedDemoProfileId = (data?.id as string | undefined) ?? null;
  return cachedDemoProfileId;
}
