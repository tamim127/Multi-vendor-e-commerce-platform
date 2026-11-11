/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN ANALYTICS FIXTURES
 * ==============================================================================
 * Platform-wide marketplace analytics and financial KPI seed data.
 */

import type { AdminAnalyticsKPIs, AdminRevenueDataPoint, AdminTopEntity } from '../types/analytics';

export const DEMO_ADMIN_KPIS: AdminAnalyticsKPIs = {
  totalGmv: { amountMinor: 28450000, currency: 'USD' }, // $284,500.00
  netRevenue: { amountMinor: 3556250, currency: 'USD' }, // $35,562.50 (12.5% take rate)
  platformCommission: { amountMinor: 3556250, currency: 'USD' },
  totalOrders: 1420,
  averageOrderValue: { amountMinor: 20035, currency: 'USD' }, // $200.35
  activeCustomersCount: 2840,
  activeSellersCount: 18,
  pendingApplicationsCount: 3,
  refundRatePercent: 1.8,
};

export const DEMO_ADMIN_REVENUE_CHART: AdminRevenueDataPoint[] = [
  { date: '2026-02-14', gmvMinor: 3200000, netRevenueMinor: 400000, ordersCount: 160 },
  { date: '2026-02-15', gmvMinor: 4100000, netRevenueMinor: 512500, ordersCount: 205 },
  { date: '2026-02-16', gmvMinor: 3800000, netRevenueMinor: 475000, ordersCount: 190 },
  { date: '2026-02-17', gmvMinor: 4500000, netRevenueMinor: 562500, ordersCount: 225 },
  { date: '2026-02-18', gmvMinor: 3900000, netRevenueMinor: 487500, ordersCount: 195 },
  { date: '2026-02-19', gmvMinor: 4300000, netRevenueMinor: 537500, ordersCount: 215 },
  { date: '2026-02-20', gmvMinor: 4650000, netRevenueMinor: 581250, ordersCount: 230 },
];

export const DEMO_ADMIN_TOP_SELLERS: AdminTopEntity[] = [
  {
    id: 'seller-tech-direct',
    name: 'TechDirect Express',
    metricLabel: 'GMV',
    metricValue: '$124,500',
  },
  {
    id: 'seller-official-flagship',
    name: 'Official Flagship Store',
    metricLabel: 'GMV',
    metricValue: '$98,200',
  },
  {
    id: 'seller-global-ware',
    name: 'GlobalWare Imports',
    metricLabel: 'GMV',
    metricValue: '$61,800',
  },
];

export const DEMO_ADMIN_TOP_PRODUCTS: AdminTopEntity[] = [
  {
    id: 'prod-laptop-zenith-14',
    name: 'Zenith Pro 14" OLED Laptop',
    metricLabel: 'Units Sold',
    metricValue: 84,
  },
  {
    id: 'prod-wireless-earbuds-pro',
    name: 'AeroSound Pro Wireless Earbuds',
    metricLabel: 'Units Sold',
    metricValue: 312,
  },
  {
    id: 'prod-mechanical-keyboard-rgb',
    name: 'KeyCraft Apex Keyboard',
    metricLabel: 'Units Sold',
    metricValue: 145,
  },
];
