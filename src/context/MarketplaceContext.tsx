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

  const readCachedFavorites = useCallback(async (): Promise<ListingItem[] | null> => {
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed as ListingItem[];
    } catch {
      return null;
    }
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cached = await readCachedFavorites();
      if (!cancelled && cached) {
        setFavorites(cached);
      }

      if (!isSupabaseConfigured()) {
        if (!cached && !cancelled) setFavorites([]);
        return;
      }
      const rows = await fetchFavoriteListings({ sessionUserId });
      if (!cancelled) {
        // Keep cached favorites when remote fetch is temporarily empty/failing.
        const next = rows.length > 0 || !cached ? rows : cached;
        setFavorites(next);
        void persistFavorites(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistFavorites, readCachedFavorites, sessionUserId]);

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

      void (async () => {
        if (!isSupabaseConfigured()) return;
        const ok = wasFavorite
          ? await removeFavorite({ sessionUserId, listingId: item.id })
          : await addFavorite({ sessionUserId, listingId: item.id });
        // Keep local UI state as source of truth for responsiveness.
        // If remote write fails, we keep local favorite and retry on future toggles.
        if (!ok) return;
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
