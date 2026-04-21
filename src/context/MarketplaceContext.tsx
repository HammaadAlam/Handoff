/**
 * Favorites store: hydrates from public.favorites when Supabase is configured
 * (anon demo viewer = PROFILE_DEMO_HANDLE seed profile) and persists toggles
 * optimistically. Falls back to in-memory state when Supabase is unavailable.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ListingItem } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import {
  addFavorite,
  fetchFavoriteListings,
  removeFavorite,
} from '@/services/favorites';
import { isSupabaseConfigured } from '@/services/supabase';

type MarketplaceContextValue = {
  favorites: ListingItem[];
  toggleFavorite: (item: ListingItem) => void;
  isFavorite: (id: string) => boolean;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<ListingItem[]>([]);
  const sessionUserId = user?.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    void (async () => {
      const rows = await fetchFavoriteListings({ sessionUserId });
      if (!cancelled) setFavorites(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUserId]);

  const favIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (item: ListingItem) => {
      const wasFavorite = favIds.has(item.id);
      setFavorites((prev) =>
        wasFavorite
          ? prev.filter((p) => p.id !== item.id)
          : [item, ...prev.filter((p) => p.id !== item.id)],
      );
      if (!isSupabaseConfigured()) return;

      void (async () => {
        const ok = wasFavorite
          ? await removeFavorite({ sessionUserId, listingId: item.id })
          : await addFavorite({ sessionUserId, listingId: item.id });
        if (!ok) {
          setFavorites((prev) =>
            wasFavorite
              ? [item, ...prev.filter((p) => p.id !== item.id)]
              : prev.filter((p) => p.id !== item.id),
          );
        }
      })();
    },
    [favIds, sessionUserId],
  );

  const isFavorite = useCallback((id: string) => favIds.has(id), [favIds]);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, toggleFavorite, isFavorite],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return ctx;
}
