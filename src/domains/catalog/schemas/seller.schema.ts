/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLER SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { SellerBadge, SellerRating, SellerSummary } from '../types/seller';

export const SellerBadgeSchema: z.ZodType<SellerBadge> = z.enum([
  'top_rated',
  'authorized_dealer',
  'official_store',
  'fast_shipper',
]);

export const SellerRatingSchema: z.ZodType<SellerRating> = z.object({
  average: z.number().min(0).max(5),
  count: z.number().int().nonnegative(),
  positiveFeedbackPercent: z.number().min(0).max(100),
});

export const SellerSummarySchema: z.ZodType<SellerSummary> = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  logoUrl: z.string().optional(),
  rating: SellerRatingSchema,
  badges: z.array(SellerBadgeSchema),
  isVerified: z.boolean(),
});
