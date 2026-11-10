/**
 * ==============================================================================
 * RECENTLY VIEWED FEATURE — CONTEXT & TRACKING
 * ==============================================================================
 * Deduplicates, tracks timestamp, caps items to maximum limit (10 items),
 * and persists to localStorage across page visits with SSR safety.
 */

'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import type { RecentlyViewedItem } from '@/domains/customer/types/recently-viewed';

export const RECENTLY_VIEWED_STORAGE_KEY = 'marketplace_recently_viewed_v1';
export const MAX_RECENTLY_VIEWED_ITEMS = 10;

export interface RecentlyViewedContextValue {
  items: RecentlyViewedItem[];
  recordView: (product: Product) => void;
  clearHistory: () => void;
}

const RecentlyViewedContext = React.createContext<RecentlyViewedContextValue | null>(null);

export interface RecentlyViewedProviderProps {
  children: React.ReactNode;
  initialItems?: RecentlyViewedItem[];
}

export function RecentlyViewedProvider({
  children,
  initialItems = [],
}: RecentlyViewedProviderProps): React.JSX.Element {
  const [items, setItems] = React.useState<RecentlyViewedItem[]>(initialItems);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

  // 1. Initial hydration read from localStorage
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
        if (raw && raw.trim().startsWith('[') && initialItems.length === 0) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setItems(parsed as RecentlyViewedItem[]);
          }
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to localStorage
  React.useEffect(() => {
    if (!isHydrated) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Graceful fallback
    }
  }, [items, isHydrated]);

  const recordView = React.useCallback((product: Product): void => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.productId !== product.id);
      const updated: RecentlyViewedItem = {
        productId: product.id,
        viewedAt: new Date().toISOString(),
        productSnapshot: product,
      };
      return [updated, ...filtered].slice(0, MAX_RECENTLY_VIEWED_ITEMS);
    });
  }, []);

  const clearHistory = React.useCallback((): void => {
    setItems([]);
  }, []);

  const value = React.useMemo<RecentlyViewedContextValue>(() => {
    return {
      items,
      recordView,
      clearHistory,
    };
  }, [items, recordView, clearHistory]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = React.useContext(RecentlyViewedContext);
  if (!context) {
    return {
      items: [],
      recordView: () => {},
      clearHistory: () => {},
    };
  }
  return context;
}
