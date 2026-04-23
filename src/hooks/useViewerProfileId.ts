import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/services/supabase';
import { resolveViewerProfileId } from '@/services/viewer';

/**
 * Resolve current viewer as `profiles.id` for self-vs-other profile routing.
 */
export function useViewerProfileId() {
  const { user } = useAuth();
  const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setViewerProfileId(null);
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
