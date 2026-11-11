/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN ANALYTICS TYPES
 * ==============================================================================
 */

import type { Money } from '@/domains/catalog/types/pricing';

export interface AdminAnalyticsKPIs {
  totalGmv: Money;
  netRevenue: Money;
  platformCommission: Money;
  totalOrders: number;
  averageOrderValue: Money;
  activeCustomersCount: number;
  activeSellersCount: number;
  pendingApplicationsCount: number;
  refundRatePercent: number;
}

export interface AdminRevenueDataPoint {
  date: string;
  gmvMinor: number;
  netRevenueMinor: number;
  ordersCount: number;
}

export interface AdminTopEntity {
  id: string;
  name: string;
  metricLabel: string;
  metricValue: string | number;
}
