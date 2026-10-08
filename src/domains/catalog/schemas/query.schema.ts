/**
 * ==============================================================================
 * CATALOG DOMAIN — QUERY & FILTER SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { CatalogQueryParams, CatalogSortOption } from '../types/query';
import { ProductBadgeTypeSchema } from './badge.schema';
import { CatalogLocaleSchema, CurrencyCodeSchema } from './common.schema';
import { InventoryStateSchema } from './inventory.schema';
import { SellerOfferConditionSchema } from './seller-offer.schema';

export const CatalogSortOptionSchema: z.ZodType<CatalogSortOption> = z.enum([
  'relevance',
  'price_asc',
  'price_desc',
  'rating_desc',
  'newest',
  'bestselling',
  'discount_desc',
]);

export const CatalogQueryParamsSchema: z.ZodType<CatalogQueryParams> = z.object({
  categorySlug: z.string().optional(),
  categoryPath: z.string().optional(),
  categoryId: z.string().optional(),
  brandSlugs: z.array(z.string()).optional(),
  sellerIds: z.array(z.string()).optional(),
  minPriceMinor: z.number().int().nonnegative().optional(),
  maxPriceMinor: z.number().int().nonnegative().optional(),
  currency: CurrencyCodeSchema.optional(),
  minRating: z.number().min(0).max(5).optional(),
  inventoryStates: z.array(InventoryStateSchema).optional(),
  badgeTypes: z.array(ProductBadgeTypeSchema).optional(),
  conditions: z.array(SellerOfferConditionSchema).optional(),
  isFreeShipping: z.boolean().optional(),
  attributeFilters: z.record(z.array(z.string())).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  cursor: z.string().optional(),
  sort: CatalogSortOptionSchema.optional(),
  query: z.string().optional(),
  locale: CatalogLocaleSchema.optional(),
});
