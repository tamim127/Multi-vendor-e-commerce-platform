/**
 * ==============================================================================
 * CATALOG DOMAIN — COLLECTION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { CatalogCollection, CollectionStatus } from '../types/collection';
import { LocalizedTextSchema } from './common.schema';
import { ProductMediaSchema } from './media.schema';

export const CollectionStatusSchema: z.ZodType<CollectionStatus> = z.enum([
  'active',
  'inactive',
  'scheduled',
]);

export const CatalogCollectionSchema: z.ZodType<CatalogCollection> = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Collection slug must be URL-safe kebab-case'),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  bannerMedia: ProductMediaSchema.optional(),
  productIds: z.array(z.string().min(1)),
  productCount: z.number().int().nonnegative(),
  ordering: z.number().int(),
  status: CollectionStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
