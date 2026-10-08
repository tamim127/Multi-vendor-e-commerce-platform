/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLER OFFER SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  FulfillmentType,
  SellerOffer,
  SellerOfferCondition,
  ShippingEstimate,
  WarrantySummary,
} from '../types/seller-offer';
import { MoneySchema } from './common.schema';
import { InventorySummarySchema } from './inventory.schema';
import { DiscountSchema } from './pricing.schema';
import { SellerSummarySchema } from './seller.schema';

export const SellerOfferConditionSchema: z.ZodType<SellerOfferCondition> = z.enum([
  'new',
  'refurbished_excellent',
  'refurbished_good',
  'used_like_new',
  'used_good',
]);

export const FulfillmentTypeSchema: z.ZodType<FulfillmentType> = z.enum([
  'marketplace_fulfilled',
  'seller_fulfilled',
  'dropship',
]);

export const ShippingEstimateSchema: z.ZodType<ShippingEstimate> = z.object({
  minDays: z.number().int().nonnegative(),
  maxDays: z.number().int().nonnegative(),
  isFreeShipping: z.boolean(),
  shippingCost: MoneySchema.optional(),
});

export const WarrantySummarySchema: z.ZodType<WarrantySummary> = z.object({
  durationMonths: z.number().int().nonnegative(),
  provider: z.enum(['manufacturer', 'seller', 'third_party']),
});

export const SellerOfferSchema: z.ZodType<SellerOffer> = z.object({
  offerId: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().optional(),
  sellerId: z.string().min(1),
  seller: SellerSummarySchema,
  price: MoneySchema,
  compareAtPrice: MoneySchema.optional(),
  discount: DiscountSchema.optional(),
  condition: SellerOfferConditionSchema,
  inventory: InventorySummarySchema,
  fulfillmentType: FulfillmentTypeSchema,
  shippingEstimate: ShippingEstimateSchema,
  warranty: WarrantySummarySchema.optional(),
  isBuyBoxWinner: z.boolean(),
  returnPolicyDays: z.number().int().nonnegative(),
});
