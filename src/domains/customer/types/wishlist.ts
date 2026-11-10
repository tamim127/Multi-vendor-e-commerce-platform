/**
 * ==============================================================================
 * CUSTOMER DOMAIN — WISHLIST TYPES
 * ==============================================================================
 */

import type { Product } from '@/domains/catalog/types/product';

export interface WishlistItem {
  productId: string;
  addedAt: string;
  productSnapshot?: Product;
}

export interface WishlistState {
  items: WishlistItem[];
  updatedAt: string;
}
