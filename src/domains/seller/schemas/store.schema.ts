/**
 * ==============================================================================
 * SELLER DOMAIN — STORE PROFILE SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { StoreProfileUpdateInput } from '../types/store';
import type { SellerFulfillmentSettings } from '../types/seller';

export const SellerFulfillmentSettingsSchema: z.ZodType<SellerFulfillmentSettings> = z.object({
  defaultFulfillmentType: z.enum(['marketplace_fulfilled', 'seller_fulfilled']),
  standardHandlingDays: z.number().int().min(1).max(14),
  shipsInternationally: z.boolean(),
  freeShippingThresholdMinor: z.number().int().min(0).optional(),
  returnWindowDays: z.number().int().min(0).max(90),
  restockingFeePercent: z.number().min(0).max(50),
});

export const StoreProfileUpdateSchema: z.ZodType<StoreProfileUpdateInput> = z.object({
  name: z.string().trim().min(3, 'Store name must be at least 3 characters').max(60),
  tagline: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  logoUrl: z.string().trim().url('Valid logo image URL required').optional().or(z.literal('')),
  bannerUrl: z.string().trim().url('Valid banner image URL required').optional().or(z.literal('')),
  supportEmail: z.string().trim().email('Valid customer support email is required'),
  supportPhone: z.string().trim().max(25).optional(),
  shippingPolicy: z.string().trim().max(2000).optional(),
  returnPolicy: z.string().trim().max(2000).optional(),
  warrantyPolicy: z.string().trim().max(2000).optional(),
  fulfillmentSettings: SellerFulfillmentSettingsSchema,
});
