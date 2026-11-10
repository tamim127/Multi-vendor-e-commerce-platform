/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER ANALYTICS & METRICS TYPES
 * ==============================================================================
 */

import type { Money } from '@/domains/catalog/types/pricing';

export interface DailySalesDataPoint {
  date: string;
  revenue: Money;
  orderCount: number;
}

export interface TopSellingProductMetric {
  productId: string;
  title: string;
  unitsSold: number;
  totalRevenue: Money;
}

export interface SellerDashboardMetrics {
  totalRevenue: Money;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  activeListingsCount: number;
  lowStockItemsCount: number;
  averageOrderValue: Money;
  dailyTrends: DailySalesDataPoint[];
  topProducts: TopSellingProductMetric[];
}

