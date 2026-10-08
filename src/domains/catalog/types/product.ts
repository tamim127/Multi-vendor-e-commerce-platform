/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT TYPES
 * ==============================================================================
 * Canonical marketplace product identity.
 * Decoupled from seller-specific commercial offers. Holds catalog specifications,
 * brand references, media gallery, option variants, and derived offer summaries.
 */

import type { ProductAttribute } from './attribute';
import type { ProductBadge } from './badge';
import type { Brand } from './brand';
import type { CategoryBreadcrumb } from './category';
import type { LocalizedText } from './localization';
import type { ProductMedia } from './media';
import type { Money } from './pricing';
import type { ProductVariant } from './variant';

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived' | 'discontinued';

export interface ProductRatingSummary {
  /** Average star rating (1.00 - 5.00) */
  average: number;
  /** Total count of ratings */
  count: number;
  /** Rating distribution count by star level (1 to 5) */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Derived read-model summary of commercial offers for this canonical product.
 * Non-authoritative projection calculated from active SellerOffer entities.
 */
export interface ProductOfferSummary {
  /** Total active offers across all sellers */
  offerCount: number;
  /** Lowest active offer price in integer minor units */
  lowestPrice: Money;
  /** Highest active offer price in integer minor units */
  highestPrice: Money;
  /** Reference ID of current algorithmic Buy Box winning offer */
  buyBoxOfferId?: string;
  /** True when multiple vendors are competing for this product */
  hasMultipleOffers: boolean;
}

export interface Product {
  id: string;
  /** SEO-friendly unique canonical slug */
  slug: string;
  /** Canonical product title */
  title: LocalizedText;
  /** Short summary / subtitle */
  shortDescription?: LocalizedText;
  /** Comprehensive product overview / description */
  description: LocalizedText;
  /** Associated brand */
  brand: Brand;
  /** Canonical assigned leaf category ID */
  categoryId: string;
  /** Full hierarchical category path (e.g. "/electronics/computers/laptops/ultrabooks") */
  categoryPath: string;
  /** Full breadcrumb trail to leaf category */
  categoryBreadcrumbs: CategoryBreadcrumb[];
  /** Category ID collection including ancestors for faceted indexing */
  categoryIds: string[];
  /** Canonical imagery, video, and 3D assets */
  media: ProductMedia[];
  /** Extensible product specifications and attributes */
  attributes: ProductAttribute[];
  /** Customer-facing option variants (e.g. Color x Storage) */
  variants: ProductVariant[];
  /** Default variant pre-selected on product pages */
  defaultVariantId?: string;
  /** Aggregate customer rating statistics */
  ratingSummary: ProductRatingSummary;
  /** Total approved user reviews */
  reviewCount: number;
  /** Curated and algorithmic badges */
  badges: ProductBadge[];
  /** Search and indexing keyword tags */
  tags: string[];
  /** Lifecycle status of canonical catalog entity */
  status: ProductStatus;
  /**
   * DERIVED read-model summary of offers.
   * Computed from SellerOffer entities for fast PLP/PDP display.
   */
  offerSummary: ProductOfferSummary;
  /** Digital vs Physical fulfillment flag */
  isDigital: boolean;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}
