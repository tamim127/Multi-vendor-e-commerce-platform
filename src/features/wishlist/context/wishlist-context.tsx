/**
 * ==============================================================================
 * WISHLIST FEATURE — CONTEXT & REACTIVE STATE
 * ==============================================================================
 * Supports guest wishlist stored in localStorage with SSR/hydration safety,
 * optimistic updates, and customer account synchronization readiness.
 */

'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import type { WishlistItem } from '@/domains/customer/types/wishlist';

export const WISHLIST_STORAGE_KEY = 'marketplace_guest_wishlist_v1';

export interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  isHydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => boolean; // returns true if now added, false if removed
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
  const [items, setItems] = React.useState<WishlistItem[]>(initialItems);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

  // 1. Initial hydration read from localStorage (client only, once on mount)
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
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
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to localStorage whenever items change
  React.useEffect(() => {
    if (!isHydrated) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Graceful fallback
    }
  }, [items, isHydrated]);

  const isInWishlist = React.useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const addToWishlist = React.useCallback((product: Product): void => {
    setItems((prev) => {
      if (prev.some((item) => item.productId === product.id)) {
        return prev;
      }
      const newItem: WishlistItem = {
        productId: product.id,
        addedAt: new Date().toISOString(),
        productSnapshot: product,
      };
      return [newItem, ...prev];
    });
  }, []);

  const removeFromWishlist = React.useCallback((productId: string): void => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const toggleWishlist = React.useCallback(
    (product: Product): boolean => {
      const exists = items.some((item) => item.productId === product.id);
      if (exists) {
        removeFromWishlist(product.id);
        return false;
      } else {
        addToWishlist(product);
        return true;
      }
    },
    [items, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = React.useCallback((): void => {
    setItems([]);
  }, []);

  const value = React.useMemo<WishlistContextValue>(() => {
    return {
      items,
      itemCount: items.length,
      isHydrated,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
    };
  }, [
    items,
    isHydrated,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  ]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    // Graceful fallback value for isolated tests
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
