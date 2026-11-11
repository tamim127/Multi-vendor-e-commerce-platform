/**
 * ==============================================================================
 * ADMIN DOMAIN — PROMOTIONS & COUPONS TYPES
 * ==============================================================================
 */

import type { CurrencyCode } from '@/domains/catalog/types/pricing';

export type CouponDiscountType = 'percentage' | 'fixed_amount';

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number; // percentage (e.g. 15 for 15%) or minor units (e.g. 1000 for $10.00)
  currency?: CurrencyCode;
  minPurchaseMinor: number;
  maxUsageCount: number;
  currentUsageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  badgeText: string;
  discountPercent: number;
  bannerUrl?: string;
  categoryIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}
