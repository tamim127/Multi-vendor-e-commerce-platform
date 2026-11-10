/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER OFFER SCHEMAS
 * ==============================================================================
 * Enforces integer minor unit pricing, currency match, and valid turnaround times.
 */

import { z } from 'zod';
import type { SellerOfferUpsertInput } from '../types/offer';

const MoneySchema = z.object({
  amountMinor: z
    .number()
    .int('Amount must be an integer in minor units')
    .min(1, 'Price must be at least 1 cent'),
  currency: z.string().length(3, '3-letter currency code required'),
});

export const SellerOfferUpsertSchema: z.ZodType<SellerOfferUpsertInput> = z
  .object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    price: MoneySchema,
    compareAtPrice: MoneySchema.optional(),
    condition: z.enum([
      'new',
      'refurbished_excellent',
      'refurbished_good',
      'used_like_new',
      'used_good',
    ]),
    fulfillmentType: z.enum(['marketplace_fulfilled', 'seller_fulfilled', 'dropship']),
    quantityAvailable: z.number().int().min(0, 'Quantity cannot be negative'),
    leadTimeDays: z.number().int().min(0).max(30),
    shippingEstimate: z.object({
      minDays: z.number().int().min(1).max(30),
      maxDays: z.number().int().min(1).max(60),
      isFreeShipping: z.boolean(),
      shippingCost: MoneySchema.optional(),
    }),
    warranty: z
      .object({
        durationMonths: z.number().int().min(0).max(120),
        provider: z.enum(['manufacturer', 'seller', 'third_party']),
      })
      .optional(),
    returnPolicyDays: z.number().int().min(0).max(90),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice) {
        return data.compareAtPrice.currency === data.price.currency;
      }
      return true;
    },
    {
      message: 'Compare-at currency must match offer price currency',
      path: ['compareAtPrice'],
    }
  );
