/**
 * ==============================================================================
 * CATALOG DOMAIN — API CONTRACT TYPES
 * ==============================================================================
 * Frontend-facing API contracts designed for future OpenAPI 3.1 alignment.
 * Supports dual pagination modes (offset and cursor) and facet structures.
 */

import type { Brand } from './brand';
import type { Category, CategoryBreadcrumb, CategoryTreeNode } from './category';
import type { CatalogCollection } from './collection';
import type { CatalogLocale, LocalizedText } from './localization';
import type { Product } from './product';
import type { CatalogQueryParams } from './query';
import type { SellerOffer } from './seller-offer';

/**
 * Flexible pagination metadata supporting both offset-based and cursor-based access.
 */
export interface PaginationMeta {
  page?: number;
  totalPages?: number;
  totalCount?: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface FacetValue {
  value: string;
  label: LocalizedText;
  count: number;
  isSelected?: boolean;
}

export interface CategoryFacet {
  id: string;
  slug: string;
  name: LocalizedText;
  count: number;
  children?: CategoryFacet[];
}

export interface BrandFacet {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface PriceRangeFacet {
  minMinor: number;
  maxMinor: number;
  count: number;
}

export interface AttributeFacet {
  key: string;
  label: LocalizedText;
  values: FacetValue[];
}

export interface CatalogFacets {
  categories: CategoryFacet[];
  brands: BrandFacet[];
  priceRanges: PriceRangeFacet[];
  attributes: AttributeFacet[];
}

// Request & Response Contracts

export type GetProductsRequest = CatalogQueryParams;

export interface GetProductsResponse {
  items: Product[];
  pagination: PaginationMeta;
  facets?: CatalogFacets;
}

export interface GetProductBySlugRequest {
  slug: string;
  locale?: CatalogLocale;
}

export interface GetProductBySlugResponse {
  product: Product;
}

export interface GetCategoriesRequest {
  parentId?: string | null;
  format?: 'tree' | 'flat';
}

export interface GetCategoriesResponse {
  categories: Category[] | CategoryTreeNode[];
}

export interface GetCategoryBySlugRequest {
  slug: string;
}

export interface GetCategoryBySlugResponse {
  category: Category;
  ancestors: CategoryBreadcrumb[];
}

export interface GetBrandsRequest {
  featuredOnly?: boolean;
}

export interface GetBrandsResponse {
  brands: Brand[];
}

export interface GetCollectionsRequest {
  status?: 'active' | 'inactive' | 'scheduled';
}

export interface GetCollectionsResponse {
  collections: CatalogCollection[];
}

export interface GetProductSellerOffersRequest {
  productId: string;
  variantId?: string;
}

export interface GetProductSellerOffersResponse {
  productId: string;
  variantId?: string;
  offers: SellerOffer[];
}
