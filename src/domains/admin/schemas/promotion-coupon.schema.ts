/**
 * ==============================================================================
 * ADMIN DOMAIN — PROMOTION & COUPON SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { CouponDiscountType, Coupon, Promotion } from '../types/promotion-coupon';
import type { CurrencyCode } from '@/domains/catalog/types/pricing';

export const CouponDiscountTypeSchema: z.ZodType<CouponDiscountType> = z.enum([
  'percentage',
  'fixed_amount',
]);

const CurrencyCodeSchema: z.ZodType<CurrencyCode> = z.enum(['USD', 'EUR', 'GBP', 'BDT']);

export const CouponSchema: z.ZodType<Coupon> = z.object({
  id: z.string().min(1),
  code: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, 'Coupon codes must be alphanumeric uppercase'),
  discountType: CouponDiscountTypeSchema,
  discountValue: z.number().positive(),
  currency: CurrencyCodeSchema.optional(),
  minPurchaseMinor: z.number().int().nonnegative(),
  maxUsageCount: z.number().int().positive(),
  currentUsageCount: z.number().int().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  description: z.string().min(1),
});

export const PromotionSchema: z.ZodType<Promotion> = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(2),
  badgeText: z.string().min(1),
  discountPercent: z.number().int().min(1).max(99),
  bannerUrl: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
});
