/**
 * ==============================================================================
 * CATALOG DOMAIN — BRAND SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { Brand, BrandStatus } from '../types/brand';
import { LocalizedTextSchema } from './common.schema';
import { ProductMediaSchema } from './media.schema';

export const BrandStatusSchema: z.ZodType<BrandStatus> = z.enum(['active', 'inactive', 'featured']);

export const BrandSchema: z.ZodType<Brand> = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Brand slug must be URL-safe kebab-case'),
  name: z.string().min(1),
  logo: ProductMediaSchema.optional(),
  description: LocalizedTextSchema.optional(),
  websiteUrl: z.string().url().optional(),
  status: BrandStatusSchema,
  isFeatured: z.boolean(),
  productCount: z.number().int().nonnegative().optional(),
});
