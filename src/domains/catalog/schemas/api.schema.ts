/**
 * ==============================================================================
 * CATALOG DOMAIN — API CONTRACT SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  AttributeFacet,
  BrandFacet,
  CatalogFacets,
  CategoryFacet,
  FacetValue,
  GetBrandsResponse,
  GetCategoriesRequest,
  GetCategoryBySlugResponse,
  GetCollectionsResponse,
  GetProductBySlugRequest,
  GetProductBySlugResponse,
  GetProductSellerOffersRequest,
  GetProductSellerOffersResponse,
  GetProductsRequest,
  GetProductsResponse,
  PriceRangeFacet,
} from '../types/api';
import { BrandSchema } from './brand.schema';
import { CategoryBreadcrumbSchema, CategorySchema } from './category.schema';
import { CatalogCollectionSchema } from './collection.schema';
import { CatalogLocaleSchema, LocalizedTextSchema, PaginationMetaSchema } from './common.schema';
import { ProductSchema } from './product.schema';
import { CatalogQueryParamsSchema } from './query.schema';
import { SellerOfferSchema } from './seller-offer.schema';

export const FacetValueSchema: z.ZodType<FacetValue> = z.object({
  value: z.string(),
  label: LocalizedTextSchema,
  count: z.number().int().nonnegative(),
  isSelected: z.boolean().optional(),
});

export const CategoryFacetSchema: z.ZodType<CategoryFacet> = z.lazy(() =>
  z.object({
    id: z.string(),
    slug: z.string(),
    name: LocalizedTextSchema,
    count: z.number().int().nonnegative(),
    children: z.array(CategoryFacetSchema).optional(),
  })
);

export const BrandFacetSchema: z.ZodType<BrandFacet> = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  count: z.number().int().nonnegative(),
});

export const PriceRangeFacetSchema: z.ZodType<PriceRangeFacet> = z.object({
  minMinor: z.number().int().nonnegative(),
  maxMinor: z.number().int().nonnegative(),
  count: z.number().int().nonnegative(),
});

export const AttributeFacetSchema: z.ZodType<AttributeFacet> = z.object({
  key: z.string(),
  label: LocalizedTextSchema,
  values: z.array(FacetValueSchema),
});

export const CatalogFacetsSchema: z.ZodType<CatalogFacets> = z.object({
  categories: z.array(CategoryFacetSchema),
  brands: z.array(BrandFacetSchema),
  priceRanges: z.array(PriceRangeFacetSchema),
  attributes: z.array(AttributeFacetSchema),
});

export const GetProductsRequestSchema: z.ZodType<GetProductsRequest> = CatalogQueryParamsSchema;

export const GetProductsResponseSchema: z.ZodType<GetProductsResponse> = z.object({
  items: z.array(ProductSchema),
  pagination: PaginationMetaSchema,
  facets: CatalogFacetsSchema.optional(),
});

export const GetProductBySlugRequestSchema: z.ZodType<GetProductBySlugRequest> = z.object({
  slug: z.string().min(1),
  locale: CatalogLocaleSchema.optional(),
});

export const GetProductBySlugResponseSchema: z.ZodType<GetProductBySlugResponse> = z.object({
  product: ProductSchema,
});

export const GetCategoriesRequestSchema: z.ZodType<GetCategoriesRequest> = z.object({
  parentId: z.string().nullable().optional(),
  format: z.enum(['tree', 'flat']).optional(),
});

export const GetCategoryBySlugResponseSchema: z.ZodType<GetCategoryBySlugResponse> = z.object({
  category: CategorySchema,
  ancestors: z.array(CategoryBreadcrumbSchema),
});

export const GetBrandsResponseSchema: z.ZodType<GetBrandsResponse> = z.object({
  brands: z.array(BrandSchema),
});

export const GetCollectionsResponseSchema: z.ZodType<GetCollectionsResponse> = z.object({
  collections: z.array(CatalogCollectionSchema),
});

export const GetProductSellerOffersRequestSchema: z.ZodType<GetProductSellerOffersRequest> =
  z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
  });

export const GetProductSellerOffersResponseSchema: z.ZodType<GetProductSellerOffersResponse> =
  z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    offers: z.array(SellerOfferSchema),
  });
