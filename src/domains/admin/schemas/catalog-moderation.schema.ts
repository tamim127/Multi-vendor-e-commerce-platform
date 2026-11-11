/**
 * ==============================================================================
 * ADMIN DOMAIN — CATALOG & PRODUCT MODERATION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  ProductModerationStatus,
  ProductModerationRecord,
  CategoryAdminInput,
} from '../types/catalog-moderation';

export const ProductModerationStatusSchema: z.ZodType<ProductModerationStatus> = z.enum([
  'approved',
  'pending_review',
  'rejected',
  'hidden',
]);

export interface ProductModerationInput {
  productId: string;
  status: ProductModerationStatus;
  reason?: string;
  notes?: string;
}

export const ProductModerationInputSchema: z.ZodType<ProductModerationInput> = z.object({
  productId: z.string().min(1),
  status: ProductModerationStatusSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const ProductModerationRecordSchema: z.ZodType<ProductModerationRecord> = z.object({
  productId: z.string().min(1),
  status: ProductModerationStatusSchema,
  notes: z.string().optional(),
  reason: z.string().optional(),
  moderatedBy: z.string().min(1),
  moderatedAt: z.string(),
});

export const CategoryAdminInputSchema: z.ZodType<CategoryAdminInput> = z.object({
  slug: z.string().min(2),
  name: z.record(z.string()),
  description: z.record(z.string()).optional(),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean().optional(),
});
