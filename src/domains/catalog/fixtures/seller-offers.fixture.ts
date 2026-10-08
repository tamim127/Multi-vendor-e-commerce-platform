/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLER OFFERS FIXTURES
 * ==============================================================================
 * Deterministic multi-seller commercial offers.
 * Demonstrates price competition, variant-specific pricing, and fulfillment variance.
 * NOTE: Non-authoritative development/demo seed data only.
 */

import type { SellerOffer } from '../types/seller-offer';
import { MOCK_SELLERS } from './sellers.fixture';

const officialSeller = MOCK_SELLERS[0]!;
const techDirectSeller = MOCK_SELLERS[1]!;
const globalWareSeller = MOCK_SELLERS[2]!;
const apexOutletSeller = MOCK_SELLERS[3]!;

export const MOCK_SELLER_OFFERS: SellerOffer[] = [
  // =========================================================
  // MACBOOK PRO 16" — SPACE BLACK 512GB (3 Competing Sellers)
  // =========================================================
  {
    offerId: 'ofr-mbp-sb512-flagship',
    productId: 'prod-macbook-pro-16',
    variantId: 'var-mbp-16-blk-512',
    sellerId: officialSeller.id,
    seller: officialSeller,
    price: { amountMinor: 249900, currency: 'USD' }, // $2,499.00
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 45,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 1,
      maxDays: 2,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 12,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 14,
  },
  {
    offerId: 'ofr-mbp-sb512-techdirect',
    productId: 'prod-macbook-pro-16',
    variantId: 'var-mbp-16-blk-512',
    sellerId: techDirectSeller.id,
    seller: techDirectSeller,
    price: { amountMinor: 239900, currency: 'USD' }, // $2,399.00 (discounted)
    compareAtPrice: { amountMinor: 249900, currency: 'USD' },
    discount: {
      type: 'fixed',
      value: 10000,
      savings: { amountMinor: 10000, currency: 'USD' },
    },
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 12,
      leadTimeDays: 2,
    },
    fulfillmentType: 'seller_fulfilled',
    shippingEstimate: {
      minDays: 2,
      maxDays: 4,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 12,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: false,
    returnPolicyDays: 30,
  },
  {
    offerId: 'ofr-mbp-sb512-apex-refurb',
    productId: 'prod-macbook-pro-16',
    variantId: 'var-mbp-16-blk-512',
    sellerId: apexOutletSeller.id,
    seller: apexOutletSeller,
    price: { amountMinor: 209900, currency: 'USD' }, // $2,099.00 (Refurbished)
    compareAtPrice: { amountMinor: 249900, currency: 'USD' },
    discount: {
      type: 'fixed',
      value: 40000,
      savings: { amountMinor: 40000, currency: 'USD' },
    },
    condition: 'refurbished_excellent',
    inventory: {
      state: 'low_stock',
      quantityAvailable: 3,
      leadTimeDays: 1,
    },
    fulfillmentType: 'seller_fulfilled',
    shippingEstimate: {
      minDays: 3,
      maxDays: 5,
      isFreeShipping: false,
      shippingCost: { amountMinor: 1500, currency: 'USD' }, // $15.00
    },
    warranty: {
      durationMonths: 3,
      provider: 'seller',
    },
    isBuyBoxWinner: false,
    returnPolicyDays: 30,
  },

  // =========================================================
  // MACBOOK PRO 16" — SPACE BLACK 1TB
  // =========================================================
  {
    offerId: 'ofr-mbp-sb1tb-flagship',
    productId: 'prod-macbook-pro-16',
    variantId: 'var-mbp-16-blk-1tb',
    sellerId: officialSeller.id,
    seller: officialSeller,
    price: { amountMinor: 289900, currency: 'USD' }, // $2,899.00
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 28,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 1,
      maxDays: 2,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 12,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 14,
  },

  // =========================================================
  // SONY WH-1000XM5 — BLACK
  // =========================================================
  {
    offerId: 'ofr-sony-xm5-techdirect',
    productId: 'prod-sony-wh1000xm5',
    variantId: 'var-sony-xm5-blk',
    sellerId: techDirectSeller.id,
    seller: techDirectSeller,
    price: { amountMinor: 34999, currency: 'USD' }, // $349.99 (deal)
    compareAtPrice: { amountMinor: 39999, currency: 'USD' },
    discount: {
      type: 'percentage',
      value: 13,
      savings: { amountMinor: 5000, currency: 'USD' },
    },
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 80,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 1,
      maxDays: 3,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 12,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 30,
  },
  {
    offerId: 'ofr-sony-xm5-flagship',
    productId: 'prod-sony-wh1000xm5',
    variantId: 'var-sony-xm5-blk',
    sellerId: officialSeller.id,
    seller: officialSeller,
    price: { amountMinor: 39999, currency: 'USD' }, // $399.99 (full MSRP)
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 150,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 1,
      maxDays: 2,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 24,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: false,
    returnPolicyDays: 30,
  },

  // =========================================================
  // NIKE ALPHAFLY 3 — US 9
  // =========================================================
  {
    offerId: 'ofr-nike-af3-flagship',
    productId: 'prod-nike-alphafly-3',
    variantId: 'var-nike-af3-us9',
    sellerId: officialSeller.id,
    seller: officialSeller,
    price: { amountMinor: 28500, currency: 'USD' }, // $285.00
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 15,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 2,
      maxDays: 4,
      isFreeShipping: true,
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 60,
  },

  // =========================================================
  // HERMAN MILLER AERON CHAIR (Product with no variants)
  // =========================================================
  {
    offerId: 'ofr-hm-aeron-flagship',
    productId: 'prod-herman-miller-aeron',
    sellerId: officialSeller.id,
    seller: officialSeller,
    price: { amountMinor: 149500, currency: 'USD' }, // $1,495.00
    condition: 'new',
    inventory: {
      state: 'in_stock',
      quantityAvailable: 25,
      leadTimeDays: 5,
    },
    fulfillmentType: 'seller_fulfilled',
    shippingEstimate: {
      minDays: 5,
      maxDays: 10,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 144, // 12-year official warranty
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 30,
  },

  // =========================================================
  // ANKER 737 POWER BANK (Low Stock state)
  // =========================================================
  {
    offerId: 'ofr-anker-737-techdirect',
    productId: 'prod-anker-737',
    sellerId: techDirectSeller.id,
    seller: techDirectSeller,
    price: { amountMinor: 10999, currency: 'USD' }, // $109.99
    compareAtPrice: { amountMinor: 14999, currency: 'USD' },
    discount: {
      type: 'fixed',
      value: 4000,
      savings: { amountMinor: 4000, currency: 'USD' },
    },
    condition: 'new',
    inventory: {
      state: 'low_stock',
      quantityAvailable: 4,
      lowStockThreshold: 10,
      leadTimeDays: 1,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 1,
      maxDays: 3,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 24,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 30,
  },

  // =========================================================
  // SAMSUNG ODYSSEY NEO G9 (Backorder / Preorder State)
  // =========================================================
  {
    offerId: 'ofr-samsung-g9-globalware',
    productId: 'prod-samsung-odyssey-g9',
    sellerId: globalWareSeller.id,
    seller: globalWareSeller,
    price: { amountMinor: 179999, currency: 'USD' }, // $1,799.99
    compareAtPrice: { amountMinor: 219999, currency: 'USD' },
    discount: {
      type: 'fixed',
      value: 40000,
      savings: { amountMinor: 40000, currency: 'USD' },
    },
    condition: 'new',
    inventory: {
      state: 'backorder',
      quantityAvailable: 0,
      leadTimeDays: 14,
      restockDate: '2026-11-01',
      allowsBackorder: true,
    },
    fulfillmentType: 'seller_fulfilled',
    shippingEstimate: {
      minDays: 14,
      maxDays: 21,
      isFreeShipping: true,
    },
    warranty: {
      durationMonths: 36,
      provider: 'manufacturer',
    },
    isBuyBoxWinner: true,
    returnPolicyDays: 30,
  },
  {
    offerId: 'ofr-samsung-g9-techdirect',
    productId: 'prod-samsung-odyssey-g9',
    sellerId: techDirectSeller.id,
    seller: techDirectSeller,
    price: { amountMinor: 199999, currency: 'USD' }, // $1,999.99
    condition: 'new',
    inventory: {
      state: 'out_of_stock',
      quantityAvailable: 0,
    },
    fulfillmentType: 'marketplace_fulfilled',
    shippingEstimate: {
      minDays: 7,
      maxDays: 14,
      isFreeShipping: true,
    },
    isBuyBoxWinner: false,
    returnPolicyDays: 30,
  },
];
