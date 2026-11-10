/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER ANALYTICS FIXTURES
 * ==============================================================================
 */

import type { SellerDashboardMetrics } from '../types/analytics';
import { createMoney } from '@/domains/catalog/utils/money';

export const DEMO_SELLER_METRICS: SellerDashboardMetrics = {
  totalRevenue: createMoney(4892000, 'USD'), // $48,920.00
  totalOrdersCount: 142,
  pendingOrdersCount: 2,
  activeListingsCount: 14,
  lowStockItemsCount: 3,
  averageOrderValue: createMoney(34450, 'USD'), // $344.50
  dailyTrends: [
    { date: '2026-02-17', revenue: createMoney(540000, 'USD'), orderCount: 16 },
    { date: '2026-02-18', revenue: createMoney(720000, 'USD'), orderCount: 22 },
    { date: '2026-02-19', revenue: createMoney(610000, 'USD'), orderCount: 18 },
    { date: '2026-02-20', revenue: createMoney(890000, 'USD'), orderCount: 27 },
    { date: '2026-02-21', revenue: createMoney(680000, 'USD'), orderCount: 20 },
    { date: '2026-02-22', revenue: createMoney(920000, 'USD'), orderCount: 29 },
    { date: '2026-02-23', revenue: createMoney(532000, 'USD'), orderCount: 15 },
  ],
  topProducts: [
    {
      productId: 'prod-macbook-pro-16',
      title: 'Apple MacBook Pro 16" with M3 Max Chip',
      unitsSold: 38,
      totalRevenue: createMoney(9496200, 'USD'),
    },
    {
      productId: 'prod-sony-wh1000xm5',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      unitsSold: 74,
      totalRevenue: createMoney(2589926, 'USD'),
    },
    {
      productId: 'prod-samsung-odyssey-neo-g9',
      title: 'Samsung Odyssey Neo G9 57" Dual 4K Curved Gaming Monitor',
      unitsSold: 12,
      totalRevenue: createMoney(2159988, 'USD'),
    },
    {
      productId: 'prod-anker-737-powerbank',
      title: 'Anker 737 Power Bank (PowerCore 24K, 140W)',
      unitsSold: 95,
      totalRevenue: createMoney(1044905, 'USD'),
    },
  ],
};

