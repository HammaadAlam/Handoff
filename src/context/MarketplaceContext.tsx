/**
 * In-memory favorites + cart (demo). Replace with API + persisted store later.
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

export type CartLine = {
  item: ListingItem;
  qty: number;
};

function parsePriceUsd(price: string): number {
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

type MarketplaceContextValue = {
  favorites: ListingItem[];
  toggleFavorite: (item: ListingItem) => void;
  isFavorite: (id: string) => boolean;
  cart: CartLine[];
  addToCart: (item: ListingItem) => void;
  removeFromCart: (listingId: string) => void;
  setCartQty: (listingId: string, qty: number) => void;
  cartSubtotal: number;
  clearCart: () => void;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ListingItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

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

  const addToCart = useCallback((item: ListingItem) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.item.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((listingId: string) => {
    setCart((prev) => prev.filter((l) => l.item.id !== listingId));
  }, []);

  const setCartQty = useCallback((listingId: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(listingId);
      return;
    }
    setCart((prev) =>
      prev.map((l) =>
        l.item.id === listingId ? { ...l, qty } : l,
      ),
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + parsePriceUsd(line.item.price) * line.qty,
        0,
      ),
    [cart],
  );

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      cart,
      addToCart,
      removeFromCart,
      setCartQty,
      cartSubtotal,
      clearCart,
    }),
    [
      favorites,
      toggleFavorite,
      isFavorite,
      cart,
      addToCart,
      removeFromCart,
      setCartQty,
      cartSubtotal,
      clearCart,
    ],
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
