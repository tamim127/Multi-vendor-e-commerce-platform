/**
 * ==============================================================================
 * CATALOG DOMAIN — QUERY & FILTER TYPES
 * ==============================================================================
 * Strongly typed search, filter, sort, and pagination parameters.
 * Designed for bi-directional URL query string serialization and API consumption.
 */

import type { ProductBadgeType } from './badge';
import type { InventoryState } from './inventory';
import type { CatalogLocale } from './localization';
import type { CurrencyCode } from './pricing';
import type { SellerOfferCondition } from './seller-offer';

export type CatalogSortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'newest'
  | 'bestselling'
  | 'discount_desc';

export interface CatalogFilterParams {
  categorySlug?: string;
  categoryPath?: string;
  categoryId?: string;
  brandSlugs?: string[];
  sellerIds?: string[];
  /** Minimum price in integer minor units */
  minPriceMinor?: number;
  /** Maximum price in integer minor units */
  maxPriceMinor?: number;
  currency?: CurrencyCode;
  minRating?: number;
  inventoryStates?: InventoryState[];
  badgeTypes?: ProductBadgeType[];
  conditions?: SellerOfferCondition[];
  isFreeShipping?: boolean;
  /** Dynamic key-value attribute filters (e.g. { ram: ['16gb', '32gb'], material: ['aluminum'] }) */
  attributeFilters?: Record<string, string[]>;
}

export interface CatalogPaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface CatalogQueryParams extends CatalogFilterParams, CatalogPaginationParams {
  sort?: CatalogSortOption;
  query?: string;
  locale?: CatalogLocale;
}
