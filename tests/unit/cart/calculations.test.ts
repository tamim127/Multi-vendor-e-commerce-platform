/**
 * ==============================================================================
 * SHOPPING CART TEST SUITE — DOMAIN CALCULATIONS & MULTI-VENDOR LOGIC
 * ==============================================================================
 * Tests integer money arithmetic, duplicate merging, seller grouping,
 * quantity boundaries, and currency consistency.
 */

import { describe, expect, it } from 'vitest';
import {
  buildCartState,
  createCartItem,
  groupCartBySeller,
  mergeOrAddItem,
  removeItemFromCart,
  updateItemQuantity,
} from '@/domains/cart/utils/calculations';
import type { AddToCartInput } from '@/domains/cart/types/cart';
import { createMoney } from '@/domains/catalog/utils/money';

const mockItem1: AddToCartInput = {
  productId: 'prod-macbook',
  slug: 'apple-macbook-pro-16',
  title: {
    en: 'MacBook Pro 16"',
    bn: 'ম্যাকবুক প্রো ১৬"',
    ar: 'ماك بوك برو ١٦',
    hi: 'मैकबुक प्रो 16',
  },
  offerId: 'ofr-mbp-official',
  sellerId: 'seller-official',
  sellerName: 'Apple Flagship Store',
  isSellerVerified: true,
  unitPrice: createMoney(249900, 'USD'), // $2,499.00
  quantity: 1,
  maxAvailableQuantity: 10,
  shippingEstimate: {
    minDays: 1,
    maxDays: 2,
    isFreeShipping: true,
  },
};

const mockItem2SameSeller: AddToCartInput = {
  productId: 'prod-iphone',
  slug: 'apple-iphone-15-pro',
  title: { en: 'iPhone 15 Pro' },
  offerId: 'ofr-iphone-official',
  sellerId: 'seller-official',
  sellerName: 'Apple Flagship Store',
  isSellerVerified: true,
  unitPrice: createMoney(99900, 'USD'), // $999.00
  quantity: 2,
  maxAvailableQuantity: 20,
  shippingEstimate: {
    minDays: 1,
    maxDays: 2,
    isFreeShipping: true,
  },
};

const mockItemDiffSeller: AddToCartInput = {
  productId: 'prod-headphones',
  slug: 'sony-wh-1000xm5',
  title: { en: 'Sony WH-1000XM5' },
  offerId: 'ofr-sony-techdirect',
  sellerId: 'seller-techdirect',
  sellerName: 'TechDirect Official',
  isSellerVerified: true,
  unitPrice: createMoney(39900, 'USD'), // $399.00
  quantity: 1,
  maxAvailableQuantity: 5,
  shippingEstimate: {
    minDays: 3,
    maxDays: 5,
    isFreeShipping: false,
    shippingCost: createMoney(1500, 'USD'), // $15.00 shipping
  },
};

describe('Shopping Cart Domain Calculations', () => {
  describe('createCartItem', () => {
    it('creates a canonical CartItem with strict integer line total', () => {
      const item = createCartItem(mockItem1);

      expect(item.id).toBe('prod-macbook::default::ofr-mbp-official');
      expect(item.quantity).toBe(1);
      expect(item.unitPrice.amountMinor).toBe(249900);
      expect(item.lineTotal.amountMinor).toBe(249900);
      expect(item.lineTotal.currency).toBe('USD');
    });

    it('clamps quantity to maxAvailableQuantity on creation', () => {
      const item = createCartItem({
        ...mockItem1,
        quantity: 50,
        maxAvailableQuantity: 8,
      });

      expect(item.quantity).toBe(8);
      expect(item.lineTotal.amountMinor).toBe(249900 * 8);
    });
  });

  describe('mergeOrAddItem', () => {
    it('merges quantities when product, variant, and seller offer are identical', () => {
      const initial = [createCartItem(mockItem1)];
      const { items } = mergeOrAddItem(initial, { ...mockItem1, quantity: 2 }, 'USD');

      expect(items.length).toBe(1);
      expect(items[0]!.quantity).toBe(3);
      expect(items[0]!.lineTotal.amountMinor).toBe(249900 * 3);
    });

    it('respects maxAvailableQuantity when merging identical items', () => {
      const initial = [createCartItem({ ...mockItem1, maxAvailableQuantity: 5 })];
      const { items } = mergeOrAddItem(initial, { ...mockItem1, quantity: 10 }, 'USD');

      expect(items[0]!.quantity).toBe(5);
    });

    it('preserves separate line items when seller offers differ for the same product', () => {
      const initial = [createCartItem(mockItem1)];
      const competingOffer: AddToCartInput = {
        ...mockItem1,
        offerId: 'ofr-mbp-reseller',
        sellerId: 'seller-reseller',
        sellerName: 'Apex Reseller',
        unitPrice: createMoney(245000, 'USD'),
      };

      const { items } = mergeOrAddItem(initial, competingOffer, 'USD');

      expect(items.length).toBe(2);
      expect(items[0]!.offerId).toBe('ofr-mbp-official');
      expect(items[1]!.offerId).toBe('ofr-mbp-reseller');
    });

    it('rejects currency mismatch when adding item in different currency', () => {
      const initial = [createCartItem(mockItem1)];
      const mismatchItem: AddToCartInput = {
        ...mockItemDiffSeller,
        unitPrice: createMoney(3000000, 'BDT'),
      };

      const result = mergeOrAddItem(initial, mismatchItem, 'USD');

      expect(result.error).toContain('Currency mismatch');
      expect(result.items.length).toBe(1);
    });
  });

  describe('updateItemQuantity & removeItemFromCart', () => {
    it('updates quantity and recalculates line total accurately', () => {
      const items = [createCartItem(mockItem1)];
      const updated = updateItemQuantity(items, items[0]!.id, 4);

      expect(updated[0]!.quantity).toBe(4);
      expect(updated[0]!.lineTotal.amountMinor).toBe(249900 * 4);
    });

    it('removes item when quantity is updated to 0 or negative', () => {
      const items = [createCartItem(mockItem1)];
      const updated = updateItemQuantity(items, items[0]!.id, 0);

      expect(updated.length).toBe(0);
    });

    it('removes item cleanly by ID', () => {
      const items = [createCartItem(mockItem1), createCartItem(mockItemDiffSeller)];
      const remaining = removeItemFromCart(items, items[0]!.id);

      expect(remaining.length).toBe(1);
      expect(remaining[0]!.id).toBe(items[1]!.id);
    });
  });

  describe('groupCartBySeller & buildCartState', () => {
    it('groups multi-vendor items by merchant with accurate subtotal and shipping', () => {
      const items = [
        createCartItem(mockItem1),
        createCartItem(mockItem2SameSeller),
        createCartItem(mockItemDiffSeller),
      ];

      const groups = groupCartBySeller(items);

      expect(groups.length).toBe(2);

      // Seller 1: Official Apple (2 items, 3 total units)
      const officialGroup = groups.find((g) => g.sellerId === 'seller-official')!;
      expect(officialGroup).toBeDefined();
      expect(officialGroup.items.length).toBe(2);
      expect(officialGroup.itemCount).toBe(3);
      expect(officialGroup.subtotal.amountMinor).toBe(249900 * 1 + 99900 * 2);
      expect(officialGroup.shippingCost?.amountMinor).toBe(0);

      // Seller 2: TechDirect (1 item, $15.00 shipping)
      const techDirectGroup = groups.find((g) => g.sellerId === 'seller-techdirect')!;
      expect(techDirectGroup).toBeDefined();
      expect(techDirectGroup.items.length).toBe(1);
      expect(techDirectGroup.subtotal.amountMinor).toBe(39900);
      expect(techDirectGroup.shippingCost?.amountMinor).toBe(1500);
    });

    it('computes complete Cart projections with zero floating-point accumulation', () => {
      const items = [
        createCartItem(mockItem1),
        createCartItem(mockItem2SameSeller),
        createCartItem(mockItemDiffSeller),
      ];

      const cart = buildCartState(items, 'USD');

      expect(cart.currency).toBe('USD');
      expect(cart.itemCount).toBe(4); // 1 + 2 + 1
      expect(cart.distinctItemCount).toBe(3);

      const expectedSubtotalMinor = 249900 * 1 + 99900 * 2 + 39900 * 1;
      const expectedShippingMinor = 1500;
      const expectedGrandTotalMinor = expectedSubtotalMinor + expectedShippingMinor;

      expect(cart.subtotal.amountMinor).toBe(expectedSubtotalMinor);
      expect(cart.shippingTotal.amountMinor).toBe(expectedShippingMinor);
      expect(cart.grandTotal.amountMinor).toBe(expectedGrandTotalMinor);
    });

    it('returns clean zero state for empty cart', () => {
      const cart = buildCartState([], 'USD');

      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.subtotal.amountMinor).toBe(0);
      expect(cart.shippingTotal.amountMinor).toBe(0);
      expect(cart.grandTotal.amountMinor).toBe(0);
      expect(cart.sellerGroups.length).toBe(0);
    });
  });
});
