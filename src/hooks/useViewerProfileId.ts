import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PROFILE_DEMO_HANDLE, getSeedProfileByHandle } from '@/data/seedCatalog';
import { isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

const DEMO_PROFILE_ID = getSeedProfileByHandle(PROFILE_DEMO_HANDLE)?.id ?? null;

/**
 * Resolve current viewer as `profiles.id` for self-vs-other profile routing.
 */
export function useViewerProfileId() {
  const { user } = useAuth();
  const [viewerProfileId, setViewerProfileId] = useState<string | null>(
    isSupabaseConfigured() ? null : DEMO_PROFILE_ID
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setViewerProfileId(DEMO_PROFILE_ID);
        return;
      }
      const id = await resolveViewerProfileId(user?.id ?? null);
      if (!cancelled) setViewerProfileId(id);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return viewerProfileId;
}
