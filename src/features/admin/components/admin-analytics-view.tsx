'use client';

/**
 * ==============================================================================
 * ADMIN ANALYTICS & FINANCIAL PERFORMANCE VIEW
 * ==============================================================================
 * Marketplace-level financial metrics: GMV, net revenue, average order value,
 * seller growth, top categories, and return rates with date filtering.
 */

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/admin-context';
import {
  DEMO_ADMIN_KPIS,
  DEMO_ADMIN_REVENUE_CHART,
  DEMO_ADMIN_TOP_SELLERS,
  DEMO_ADMIN_TOP_PRODUCTS,
} from '@/domains/admin';
import { formatMinorToCurrency, filterRevenuePointsByDays } from '@/domains/admin/utils/analytics';
import { TrendingUp, Store, Calendar, ShoppingBag } from 'lucide-react';

export function AdminAnalyticsView(): React.JSX.Element {
  const { settings } = useAdmin();

  const [dateRangeDays, setDateRangeDays] = useState<number>(7);

  const displayedChartPoints = useMemo(() => {
    return filterRevenuePointsByDays(DEMO_ADMIN_REVENUE_CHART, dateRangeDays);
  }, [dateRangeDays]);

  return (
    <div className="space-y-8">
      {/* Top filter toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Marketplace Analytics Telemetry</h2>
          <p className="text-xs text-muted-foreground">
            Aggregated revenue performance, take-rate conversions, and order volume metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Time Horizon:</span>
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setDateRangeDays(7)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                dateRangeDays === 7
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRangeDays(14)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                dateRangeDays === 14
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRangeDays(30)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                dateRangeDays === 30
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Platform Gross Merchandise Value (GMV)
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {formatMinorToCurrency(DEMO_ADMIN_KPIS.totalGmv.amountMinor, 'USD')}
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> +14.2% annualized growth
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Net Commission Take Revenue
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-primary">
            {formatMinorToCurrency(DEMO_ADMIN_KPIS.netRevenue.amountMinor, 'USD')}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Current Take Rate: {settings.commission.defaultCommissionPercent}%
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Average Order Value (AOV)
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {formatMinorToCurrency(DEMO_ADMIN_KPIS.averageOrderValue.amountMinor, 'USD')}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {DEMO_ADMIN_KPIS.totalOrders} completed orders
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Platform Refund Rate
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {DEMO_ADMIN_KPIS.refundRatePercent}%
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Well within 3.0% SLA threshold
          </div>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Daily Revenue Distribution</h3>
            <p className="text-xs text-muted-foreground">
              Comparative visualization of daily transaction volume
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">Simulated Analytics</span>
        </div>

        <div className="mt-6 flex h-52 items-end gap-3 sm:gap-6 pt-4">
          {displayedChartPoints.map((point) => {
            const maxGmv = 5000000;
            const heightPct = Math.min(100, Math.round((point.gmvMinor / maxGmv) * 100));

            return (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                  ${(point.gmvMinor / 100000).toFixed(1)}k
                </div>
                <div
                  className="w-full rounded-t-lg bg-primary/20 relative flex items-end overflow-hidden"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all"
                    style={{
                      height: `${Math.round((point.netRevenueMinor / point.gmvMinor) * 100 * 3)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground font-mono">
                  {point.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers: Sellers & Products */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Merchants */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Top Performing Merchants</h3>
          </div>

          <div className="mt-4 divide-y divide-border">
            {DEMO_ADMIN_TOP_SELLERS.map((s, idx) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{s.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{s.id}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-primary">{s.metricValue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Highest Velocity Catalog Items</h3>
          </div>

          <div className="mt-4 divide-y divide-border">
            {DEMO_ADMIN_TOP_PRODUCTS.map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-foreground">{p.metricValue} units</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
