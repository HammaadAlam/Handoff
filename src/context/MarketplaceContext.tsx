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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const FAVORITES_CACHE_KEY_PREFIX = '@handoff/favorites_v1';

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<ListingItem[]>([]);
  const sessionUserId = user?.id ?? null;
  const cacheKey = `${FAVORITES_CACHE_KEY_PREFIX}:${sessionUserId ?? 'guest'}`;

  const persistFavorites = useCallback(
    async (next: ListingItem[]) => {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {
        // Non-blocking cache persistence.
      }
    },
    [cacheKey],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let cached: ListingItem[] = [];
      // Hydrate quickly from local cache so favorites survive app restarts.
      try {
        const raw = await AsyncStorage.getItem(cacheKey);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as ListingItem[];
          if (Array.isArray(parsed)) {
            cached = parsed;
            setFavorites(parsed);
          }
        }
      } catch {
        // Ignore malformed cache and continue.
      }

      if (!isSupabaseConfigured()) return;
      const rows = await fetchFavoriteListings({ sessionUserId });
      if (!cancelled) {
        // Preserve locally cached favorites when remote is empty/unavailable,
        // so app restarts do not clear the Favorites tab.
        const next = rows.length > 0 ? rows : cached;
        setFavorites(next);
        void persistFavorites(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, persistFavorites, sessionUserId]);

  const favIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (item: ListingItem) => {
      const wasFavorite = favIds.has(item.id);
      const next = wasFavorite
        ? favorites.filter((p) => p.id !== item.id)
        : [item, ...favorites.filter((p) => p.id !== item.id)];
      setFavorites(next);
      void persistFavorites(next);
      if (!isSupabaseConfigured()) return;

      void (async () => {
        const ok = wasFavorite
          ? await removeFavorite({ sessionUserId, listingId: item.id })
          : await addFavorite({ sessionUserId, listingId: item.id });
        if (!ok) {
          const reverted = wasFavorite
            ? [item, ...next.filter((p) => p.id !== item.id)]
            : next.filter((p) => p.id !== item.id);
          setFavorites(reverted);
          void persistFavorites(reverted);
        }
      })();
    },
    [favIds, favorites, persistFavorites, sessionUserId],
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
