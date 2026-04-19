/**
 * In-memory favorites (demo). Replace with API + persisted store later.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ListingItem } from '@/data/mockData';

type MarketplaceContextValue = {
  favorites: ListingItem[];
  toggleFavorite: (item: ListingItem) => void;
  isFavorite: (id: string) => boolean;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ListingItem[]>([]);

  const favIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites],
  );

  const toggleFavorite = useCallback((item: ListingItem) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        return prev.filter((p) => p.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

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
