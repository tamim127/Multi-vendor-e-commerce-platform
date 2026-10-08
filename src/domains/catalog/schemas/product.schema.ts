/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  Product,
  ProductOfferSummary,
  ProductRatingSummary,
  ProductStatus,
} from '../types/product';
import { ProductAttributeSchema } from './attribute.schema';
import { ProductBadgeSchema } from './badge.schema';
import { BrandSchema } from './brand.schema';
import { CategoryBreadcrumbSchema } from './category.schema';
import { LocalizedTextSchema, MoneySchema } from './common.schema';
import { ProductMediaSchema } from './media.schema';
import { ProductVariantSchema } from './variant.schema';

export const ProductStatusSchema: z.ZodType<ProductStatus> = z.enum([
  'draft',
  'active',
  'inactive',
  'archived',
  'discontinued',
]);

export const ProductRatingSummarySchema: z.ZodType<ProductRatingSummary> = z.object({
  average: z.number().min(0).max(5),
  count: z.number().int().nonnegative(),
  distribution: z.object({
    1: z.number().int().nonnegative(),
    2: z.number().int().nonnegative(),
    3: z.number().int().nonnegative(),
    4: z.number().int().nonnegative(),
    5: z.number().int().nonnegative(),
  }),
});

export const ProductOfferSummarySchema: z.ZodType<ProductOfferSummary> = z.object({
  offerCount: z.number().int().nonnegative(),
  lowestPrice: MoneySchema,
  highestPrice: MoneySchema,
  buyBoxOfferId: z.string().optional(),
  hasMultipleOffers: z.boolean(),
});

export const ProductSchema: z.ZodType<Product> = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Product slug must be URL-safe kebab-case'),
  title: LocalizedTextSchema,
  shortDescription: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema,
  brand: BrandSchema,
  categoryId: z.string().min(1),
  categoryPath: z.string().min(1),
  categoryBreadcrumbs: z.array(CategoryBreadcrumbSchema),
  categoryIds: z.array(z.string().min(1)),
  media: z.array(ProductMediaSchema),
  attributes: z.array(ProductAttributeSchema),
  variants: z.array(ProductVariantSchema),
  defaultVariantId: z.string().optional(),
  ratingSummary: ProductRatingSummarySchema,
  reviewCount: z.number().int().nonnegative(),
  badges: z.array(ProductBadgeSchema),
  tags: z.array(z.string()),
  status: ProductStatusSchema,
  offerSummary: ProductOfferSummarySchema,
  isDigital: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
