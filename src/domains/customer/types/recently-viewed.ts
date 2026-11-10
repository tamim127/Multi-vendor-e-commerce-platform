/**
 * ==============================================================================
 * CUSTOMER DOMAIN — RECENTLY VIEWED PRODUCTS TYPES
 * ==============================================================================
 */

import type { Product } from '@/domains/catalog/types/product';

export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
  productSnapshot?: Product;
}

export interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  updatedAt: string;
}
