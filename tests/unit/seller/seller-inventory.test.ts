/**
 * ==============================================================================
 * SELLER DOMAIN — INVENTORY UTILITIES UNIT TESTS
 * ==============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  calculateStockAlertLevel,
  buildSellerInventoryFromOffers,
} from '@/domains/seller/utils/inventory';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';

describe('Seller Domain — Inventory Utilities', () => {
  describe('calculateStockAlertLevel', () => {
    it('returns "out_of_stock" when quantity is 0 or negative', () => {
      expect(calculateStockAlertLevel(0, 10)).toBe('out_of_stock');
      expect(calculateStockAlertLevel(-3, 10)).toBe('out_of_stock');
    });

    it('returns "low_stock" when quantity is at or below threshold', () => {
      expect(calculateStockAlertLevel(5, 10)).toBe('low_stock');
      expect(calculateStockAlertLevel(10, 10)).toBe('low_stock');
    });

    it('returns "normal" when quantity exceeds threshold', () => {
      expect(calculateStockAlertLevel(11, 10)).toBe('normal');
      expect(calculateStockAlertLevel(150, 10)).toBe('normal');
    });
  });

  describe('buildSellerInventoryFromOffers', () => {
    it('transforms seller commercial offers into SKU inventory matrix', () => {
      const sellerOffers = MOCK_SELLER_OFFERS.slice(0, 3);
      const inventory = buildSellerInventoryFromOffers(sellerOffers, MOCK_PRODUCTS);

      expect(inventory.length).toBe(3);
      const first = inventory[0]!;
      expect(first.sku).toBeDefined();
      expect(first.productTitle).toBeDefined();
      expect(first.alertLevel).toMatch(/normal|low_stock|out_of_stock/);
      expect(typeof first.quantityAvailable).toBe('number');
    });
  });
});
