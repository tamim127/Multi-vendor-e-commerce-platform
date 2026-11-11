/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN ANALYTICS UTILITIES
 * ==============================================================================
 */

import type { Money, CurrencyCode } from '@/domains/catalog/types/pricing';
import type { AdminAnalyticsKPIs, AdminRevenueDataPoint } from '../types/analytics';

export function calculateCommissionMinor(gmvMinor: number, commissionPercent: number): number {
  return Math.round((gmvMinor * commissionPercent) / 100);
}

export function formatMinorToCurrency(amountMinor: number, currency: CurrencyCode = 'USD'): string {
  const major = amountMinor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

export function filterRevenuePointsByDays(
  data: AdminRevenueDataPoint[],
  days: number
): AdminRevenueDataPoint[] {
  if (days <= 0 || data.length <= days) return data;
  return data.slice(-days);
}

export function computeSummaryKPIs(
  points: AdminRevenueDataPoint[],
  commissionPercent: number,
  currency: CurrencyCode = 'USD'
): Partial<AdminAnalyticsKPIs> {
  const totalGmvMinor = points.reduce((sum, p) => sum + p.gmvMinor, 0);
  const totalOrders = points.reduce((sum, p) => sum + p.ordersCount, 0);
  const commissionMinor = calculateCommissionMinor(totalGmvMinor, commissionPercent);
  const aovMinor = totalOrders > 0 ? Math.round(totalGmvMinor / totalOrders) : 0;

  const totalGmv: Money = { amountMinor: totalGmvMinor, currency };
  const platformCommission: Money = { amountMinor: commissionMinor, currency };
  const averageOrderValue: Money = { amountMinor: aovMinor, currency };

  return {
    totalGmv,
    platformCommission,
    totalOrders,
    averageOrderValue,
  };
}
