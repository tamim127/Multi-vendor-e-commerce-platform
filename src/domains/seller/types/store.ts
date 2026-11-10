/**
 * ==============================================================================
 * SELLER DOMAIN — STORE PROFILE & STOREFRONT TYPES
 * ==============================================================================
 */

import type { SellerBadge, SellerRating } from '@/domains/catalog/types/seller';
import type { SellerFulfillmentSettings } from './seller';

export interface StoreProfileUpdateInput {
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  supportEmail: string;
  supportPhone?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  warrantyPolicy?: string;
  fulfillmentSettings: SellerFulfillmentSettings;
}

export interface PublicStorefront {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating: SellerRating;
  badges: SellerBadge[];
  isVerified: boolean;
  memberSinceYear: number;
  totalProductsCount: number;
  policies: {
    shipping?: string;
    returns?: string;
    warranty?: string;
  };
}

