/**
 * ==============================================================================
 * SHOPPING CART DOMAIN — ZOD SCHEMAS
 * ==============================================================================
 * Strict validation schemas for cart items, operations, and persistence recovery.
 */

import { z } from 'zod';
import {
  CurrencyCodeSchema,
  LocalizedTextSchema,
  MoneySchema,
} from '@/domains/catalog/schemas/common.schema';
import type { ShippingEstimate } from '@/domains/catalog/types/seller-offer';
import type { CartItem, AddToCartInput, CartStorageState } from '../types/cart';

export const ShippingEstimateSchema: z.ZodType<ShippingEstimate> = z.object({
  minDays: z.number().int().nonnegative(),
  maxDays: z.number().int().nonnegative(),
  isFreeShipping: z.boolean(),
  shippingCost: MoneySchema.optional(),
});

export const CartItemSchema: z.ZodType<CartItem> = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  slug: z.string().min(1),
  title: LocalizedTextSchema,
  sku: z.string().optional(),
  imageUrl: z.string().url().or(z.string().startsWith('/')).optional(),
  variantId: z.string().optional(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
  offerId: z.string().min(1),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  sellerSlug: z.string().optional(),
  isSellerVerified: z.boolean().optional(),
  unitPrice: MoneySchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  lineTotal: MoneySchema,
  maxAvailableQuantity: z.number().int().nonnegative(),
  shippingEstimate: ShippingEstimateSchema.optional(),
  createdAt: z.string().datetime({ offset: true }).or(z.string()),
  updatedAt: z.string().datetime({ offset: true }).or(z.string()),
});

export const AddToCartInputSchema: z.ZodType<AddToCartInput> = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  title: LocalizedTextSchema,
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  variantId: z.string().optional(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
  offerId: z.string().min(1),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  sellerSlug: z.string().optional(),
  isSellerVerified: z.boolean().optional(),
  unitPrice: MoneySchema,
  quantity: z.number().int().min(1).optional(),
  maxAvailableQuantity: z.number().int().nonnegative().optional(),
  shippingEstimate: ShippingEstimateSchema.optional(),
});

export const CartStorageStateSchema: z.ZodType<CartStorageState> = z.object({
  version: z.number().int().positive(),
  currency: CurrencyCodeSchema,
  items: z.array(CartItemSchema),
  updatedAt: z.string(),
});
