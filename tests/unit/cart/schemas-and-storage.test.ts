/**
 * ==============================================================================
 * SHOPPING CART TEST SUITE — SCHEMAS & STORAGE RECOVERY
 * ==============================================================================
 * Tests Zod runtime validation, corrupt storage recovery, and schema boundaries.
 */

import { describe, expect, it } from 'vitest';
import {
  AddToCartInputSchema,
  CartItemSchema,
  CartStorageStateSchema,
} from '@/domains/cart/schemas/cart.schema';
import { createCartItem } from '@/domains/cart/utils/calculations';
import { createMoney } from '@/domains/catalog/utils/money';

describe('Shopping Cart Schemas & Storage Recovery', () => {
  const validItemInput = {
    productId: 'prod-macbook',
    slug: 'apple-macbook-pro-16',
    title: { en: 'MacBook Pro 16"' },
    offerId: 'ofr-mbp-official',
    sellerId: 'seller-official',
    sellerName: 'Apple Flagship Store',
    unitPrice: createMoney(249900, 'USD'),
    quantity: 1,
    maxAvailableQuantity: 10,
  };

  describe('CartItemSchema', () => {
    it('validates a well-formed cart item', () => {
      const item = createCartItem(validItemInput);
      const parsed = CartItemSchema.safeParse(item);

      expect(parsed.success).toBe(true);
    });

    it('rejects an item with non-integer or negative quantity', () => {
      const item = createCartItem(validItemInput);
      const invalidQuantity = { ...item, quantity: -1 };

      const parsed = CartItemSchema.safeParse(invalidQuantity);
      expect(parsed.success).toBe(false);
    });

    it('rejects an item with missing seller attribution', () => {
      const item = createCartItem(validItemInput);
      const invalidSeller = { ...item, sellerId: '' };

      const parsed = CartItemSchema.safeParse(invalidSeller);
      expect(parsed.success).toBe(false);
    });

    it('rejects floating-point minor units in price', () => {
      const item = createCartItem(validItemInput);
      const invalidMoney = {
        ...item,
        unitPrice: { amountMinor: 2499.5, currency: 'USD' },
      };

      const parsed = CartItemSchema.safeParse(invalidMoney);
      expect(parsed.success).toBe(false);
    });
  });

  describe('AddToCartInputSchema', () => {
    it('validates a valid add-to-cart payload', () => {
      const parsed = AddToCartInputSchema.safeParse(validItemInput);
      expect(parsed.success).toBe(true);
    });

    it('rejects input with unsupported currency', () => {
      const invalid = {
        ...validItemInput,
        unitPrice: { amountMinor: 1000, currency: 'XYZ' },
      };

      const parsed = AddToCartInputSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('CartStorageStateSchema', () => {
    it('validates a complete persisted cart storage state', () => {
      const item = createCartItem(validItemInput);
      const state = {
        version: 1,
        currency: 'USD',
        items: [item],
        updatedAt: new Date().toISOString(),
      };

      const parsed = CartStorageStateSchema.safeParse(state);
      expect(parsed.success).toBe(true);
    });

    it('gracefully fails validation on corrupted storage payloads without crashing', () => {
      const corruptedPayloads = [
        null,
        undefined,
        {},
        { version: 'wrong' },
        { version: 1, currency: 'INVALID', items: [] },
        { version: 1, currency: 'USD', items: [{ broken: 'data' }] },
      ];

      for (const payload of corruptedPayloads) {
        const parsed = CartStorageStateSchema.safeParse(payload);
        expect(parsed.success).toBe(false);
      }
    });
  });
});

