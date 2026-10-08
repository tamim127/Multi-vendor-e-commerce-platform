/**
 * ==============================================================================
 * CATALOG DOMAIN — BADGE SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { ProductBadge, ProductBadgeTone, ProductBadgeType } from '../types/badge';
import { LocalizedTextSchema } from './common.schema';

export const ProductBadgeTypeSchema: z.ZodType<ProductBadgeType> = z.enum([
  'new',
  'best_seller',
  'trending',
  'sale',
  'limited_edition',
  'sponsored',
  'recommended',
  'editorial_pick',
  'deal_of_the_day',
]);

export const ProductBadgeToneSchema: z.ZodType<ProductBadgeTone> = z.enum([
  'default',
  'accent',
  'warning',
  'success',
  'destructive',
  'neutral',
]);

export const ProductBadgeSchema: z.ZodType<ProductBadge> = z.object({
  id: z.string().min(1),
  type: ProductBadgeTypeSchema,
  label: LocalizedTextSchema,
  tone: ProductBadgeToneSchema.optional(),
  priority: z.number().int().optional(),
});
