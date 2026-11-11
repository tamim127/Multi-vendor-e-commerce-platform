/**
 * ==============================================================================
 * ADMIN DOMAIN — COUPONS & PROMOTIONS FIXTURES
 * ==============================================================================
 */

import type { Coupon, Promotion } from '../types/promotion-coupon';

export const DEMO_COUPONS: Coupon[] = [
  {
    id: 'coup-welcome-10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseMinor: 5000, // $50.00
    maxUsageCount: 1000,
    currentUsageCount: 342,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    description: '10% off on first purchase above $50.00',
  },
  {
    id: 'coup-spring-25',
    code: 'SPRING25',
    discountType: 'fixed_amount',
    discountValue: 2500, // $25.00
    currency: 'USD',
    minPurchaseMinor: 15000, // $150.00
    maxUsageCount: 500,
    currentUsageCount: 189,
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-04-30T23:59:59Z',
    isActive: true,
    description: 'Instant $25.00 discount on orders over $150.00',
  },
  {
    id: 'coup-tech-flash',
    code: 'TECH50',
    discountType: 'fixed_amount',
    discountValue: 5000, // $50.00
    currency: 'USD',
    minPurchaseMinor: 30000, // $300.00
    maxUsageCount: 200,
    currentUsageCount: 200,
    startDate: '2026-02-10T00:00:00Z',
    endDate: '2026-02-15T23:59:59Z',
    isActive: false,
    description: 'Limited high-tier electronics promotion ($50 off $300)',
  },
  {
    id: 'coup-vip-15',
    code: 'VIP15OFF',
    discountType: 'percentage',
    discountValue: 15,
    minPurchaseMinor: 10000, // $100.00
    maxUsageCount: 2000,
    currentUsageCount: 840,
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    isActive: true,
    description: '15% off for loyal customers and newsletter subscribers',
  },
];

export const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-tech-fest',
    name: 'Cyber Spring Hardware Festival',
    description:
      'Up to 20% off high performance laptops, audio monitors, and computing accessories.',
    badgeText: 'Spring Deal',
    discountPercent: 20,
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    categoryIds: ['cat-electronics', 'cat-laptops', 'cat-audio'],
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-03-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'promo-audio-fair',
    name: 'Acoustic Audiophile Showcase',
    description: 'Curated discounts on studio-grade headphones, wireless earbuds, and amplifiers.',
    badgeText: 'Audiophile Choice',
    discountPercent: 15,
    bannerUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200',
    categoryIds: ['cat-audio'],
    startDate: '2026-02-10T00:00:00Z',
    endDate: '2026-04-15T23:59:59Z',
    isActive: true,
  },
];
