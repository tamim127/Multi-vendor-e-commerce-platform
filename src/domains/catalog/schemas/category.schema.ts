/**
 * ==============================================================================
 * CATALOG DOMAIN — CATEGORY SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { Category, CategoryBreadcrumb } from '../types/category';
import { LocalizedTextSchema } from './common.schema';
import { ProductMediaSchema } from './media.schema';

export const CategoryBreadcrumbSchema: z.ZodType<CategoryBreadcrumb> = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: LocalizedTextSchema,
  level: z.number().int().nonnegative(),
  path: z.string().min(1),
});

export const CategorySchema: z.ZodType<Category> = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Category slug must be URL-safe kebab-case'),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  parentId: z.string().nullable(),
  level: z.number().int().nonnegative(),
  path: z.string().min(1),
  image: ProductMediaSchema.optional(),
  icon: z.string().optional(),
  childCount: z.number().int().nonnegative(),
  productCount: z.number().int().nonnegative(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});
