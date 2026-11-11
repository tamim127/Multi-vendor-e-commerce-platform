/**
 * ==============================================================================
 * ADMIN DOMAIN — REVIEWS MODERATION FIXTURES
 * ==============================================================================
 */

import type { AdminProductReview } from '../types/review-moderation';

export const DEMO_ADMIN_REVIEWS: AdminProductReview[] = [
  {
    id: 'rev-mod-101',
    productId: 'prod-laptop-zenith-14',
    productTitle: 'Zenith Pro 14" OLED Laptop',
    customerId: 'cust-demo-sarah',
    customerName: 'Sarah Jenkins',
    rating: 5,
    title: 'Flawless engineering and display',
    comment:
      'The OLED panel is breathtaking with accurate colors. Battery life consistently hits 11 hours of intensive dev work.',
    status: 'published',
    reportedCount: 0,
    createdAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'rev-mod-102',
    productId: 'prod-wireless-earbuds-pro',
    productTitle: 'AeroSound Pro Wireless Earbuds',
    customerId: 'cust-demo-bot-22',
    customerName: 'Anonymous_User882',
    rating: 1,
    title: 'BUY CHEAP CRYPTO AT THIS LINK',
    comment:
      'Visit http://spam-crypto-scam.xyz to earn $500 daily! Free sign up bonus for all users!',
    status: 'reported',
    flagReason: 'Spam, external malicious URL link and advertising',
    reportedCount: 4,
    createdAt: '2026-02-17T22:15:00Z',
  },
  {
    id: 'rev-mod-103',
    productId: 'prod-wireless-earbuds-pro',
    productTitle: 'AeroSound Pro Wireless Earbuds',
    customerId: 'cust-demo-marcus',
    customerName: 'Marcus Wright',
    rating: 4,
    title: 'Solid soundstage, average ANC',
    comment:
      'Sound profile is balanced with crisp highs. Active noise cancellation is good enough for commuting but struggles in windy conditions.',
    status: 'published',
    reportedCount: 0,
    createdAt: '2026-02-14T09:30:00Z',
  },
  {
    id: 'rev-mod-104',
    productId: 'prod-mechanical-keyboard-rgb',
    productTitle: 'KeyCraft Apex Mechanical Keyboard',
    customerId: 'cust-demo-angry-99',
    customerName: 'TrollAccount99',
    rating: 1,
    title: 'Hate this store hate this seller terrible terrible',
    comment: 'Offensive hate speech content flagged by automated profanity filter.',
    status: 'hidden',
    flagReason: 'Violation of Community Guidelines (Abusive Language)',
    reportedCount: 7,
    createdAt: '2026-02-08T18:45:00Z',
    moderatedAt: '2026-02-09T08:15:00Z',
    moderatedBy: 'Jordan Chen (Customer Support)',
  },
];
