'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import type { WishlistItem } from '@/domains/customer/types/wishlist';
import { useAuth } from '@/features/auth/context/auth-context';
import { buildApiHeaders } from '@/lib/http/csrf';

export const WISHLIST_STORAGE_KEY = 'marketplace_guest_wishlist_v1';

export interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  isHydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export interface WishlistProviderProps {
  children: React.ReactNode;
  initialItems?: WishlistItem[];
}

export function WishlistProvider({
  children,
  initialItems = [],
}: WishlistProviderProps): React.JSX.Element {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = React.useState<WishlistItem[]>(initialItems);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);
  const [serverBacked, setServerBacked] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (authLoading) return;
    let active = true;

    async function hydrate() {
      if (isAuthenticated) {
        try {
          const res = await fetch('/api/wishlist', { credentials: 'include' });
          if (res.ok) {
            const json = await res.json().catch(() => null);
            if (active && json?.success && Array.isArray(json.data?.items)) {
              setItems(json.data.items);
              setServerBacked(true);
              setIsHydrated(true);
              return;
            }
          }
        } catch {
          // Fallback to guest localStorage when offline
        }
      }

      try {
        if (active && typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (raw && raw.trim().startsWith('[') && initialItems.length === 0) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setItems(parsed as WishlistItem[]);
            }
          }
        }
      } catch {
        // Graceful fallback
      } finally {
        if (active) setIsHydrated(true);
      }
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, initialItems.length]);

  React.useEffect(() => {
    if (!isHydrated || serverBacked) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Graceful fallback
    }
  }, [items, isHydrated, serverBacked]);

  const isInWishlist = React.useCallback(
    (productId: string): boolean => items.some((item) => item.productId === productId),
    [items]
  );

  const syncWishlistApi = React.useCallback(
    async (action: 'add' | 'remove' | 'toggle', productId: string) => {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          credentials: 'include',
          headers: buildApiHeaders(),
          body: JSON.stringify({ action, productId }),
        });
        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json?.success && Array.isArray(json.data?.items)) {
            setServerBacked(true);
            setItems(json.data.items);
          }
        }
      } catch {
        // Keep optimistic UI state for unauthenticated browsing
      }
    },
    []
  );

  const addToWishlist = React.useCallback(
    (product: Product): void => {
      setItems((prev) => {
        if (prev.some((item) => item.productId === product.id)) return prev;
        return [{ productId: product.id, addedAt: new Date().toISOString(), productSnapshot: product }, ...prev];
      });
      void syncWishlistApi('add', product.id);
    },
    [syncWishlistApi]
  );

  const removeFromWishlist = React.useCallback(
    (productId: string): void => {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      void syncWishlistApi('remove', productId);
    },
    [syncWishlistApi]
  );

  const toggleWishlist = React.useCallback(
    (product: Product): boolean => {
      const exists = items.some((item) => item.productId === product.id);
      if (exists) {
        removeFromWishlist(product.id);
        return false;
      }
      addToWishlist(product);
      return true;
    },
    [items, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = React.useCallback((): void => {
    setItems([]);
  }, []);

  const value = React.useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isHydrated,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
    }),
    [items, isHydrated, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    return {
      items: [],
      itemCount: 0,
      isHydrated: true,
      isInWishlist: () => false,
      addToWishlist: () => {},
      removeFromWishlist: () => {},
      toggleWishlist: () => false,
      clearWishlist: () => {},
    };
  }
  return context;
}
