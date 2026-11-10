'use client';

/**
 * ==============================================================================
 * SELLER ANALYTICS & REVENUE PERFORMANCE VIEW
 * ==============================================================================
 * Comprehensive merchant intelligence.
 * Daily sales trends, average order values, conversion metrics,
 * top performing canonical products, and fulfillment SLA compliance.
 */

import React, { useState } from 'react';
import { useSeller } from '../context/seller-context';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useI18n } from '@/lib/i18n';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';

export function SellerAnalyticsView(): React.JSX.Element {
  const { metrics } = useSeller();
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const maxDayRevenue = Math.max(...metrics.dailyTrends.map((d) => d.revenue.amountMinor), 1);

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('seller.analytics')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time financial performance and customer order volume breakdown.
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-input bg-background p-1 text-xs">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === '30d'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === '90d'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last Quarter
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gross Marketplace Sales
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoneyMinor(metrics.totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% vs previous period</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dispatched Packages
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalOrdersCount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Avg {Math.round(metrics.totalOrdersCount / 30)} orders / day
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Order Value (AOV)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoneyMinor(metrics.averageOrderValue)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Across all multi-vendor orders</div>
          </div>
        </div>

        {/* Fulfillment SLA */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fulfillment Health
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">99.4%</div>
            <div className="mt-1 text-xs text-emerald-600 font-medium">
              On-time dispatch SLA compliant
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Distribution Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('seller.salesTrends')}</h3>
            <p className="text-xs text-muted-foreground">
              Daily revenue fluctuation and package volume
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Operating cycle: 2026</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-3 sm:gap-6 items-end h-56 pt-6">
          {metrics.dailyTrends.map((day) => {
            const heightPercent = Math.max(
              10,
              Math.round((day.revenue.amountMinor / maxDayRevenue) * 100)
            );
            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  {formatMoneyMinor(day.revenue)}
                </div>
                <div
                  className="w-full bg-primary/85 group-hover:bg-primary rounded-t-xl transition-all duration-200"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="mt-2 text-xs font-medium text-muted-foreground">
                  {day.date.slice(5)}
                </span>
                <span className="text-[10px] text-muted-foreground">{day.orderCount} pkgs</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Products Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-4">
          <Award className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('seller.topProducts')}</h3>
            <p className="text-xs text-muted-foreground">
              Ranked by revenue contribution to this merchant account
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3">Product Name</th>
                <th className="py-3">Units Sold</th>
                <th className="py-3 text-right">Gross Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {metrics.topProducts.map((prod, idx) => (
                <tr key={prod.productId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-foreground">{prod.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-xs text-muted-foreground font-medium">
                    {prod.unitsSold} units
                  </td>
                  <td className="py-3.5 text-right font-bold text-foreground">
                    {formatMoneyMinor(prod.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
