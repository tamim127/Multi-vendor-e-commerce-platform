'use client';

/**
 * ==============================================================================
 * ADMIN DASHBOARD VIEW
 * ==============================================================================
 * Top-level marketplace overview: GMV, order volume, active merchants, pending
 * reviews, revenue trend charts, recent platform activities, and quick actions.
 */

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import { DEMO_ADMIN_KPIS, DEMO_ADMIN_REVENUE_CHART } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Clock,
  Package,
  RotateCcw,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';

export function AdminDashboardView(): React.JSX.Element {
  const { sellerStatuses, customers, refunds, reviews, auditLogs, settings } = useAdmin();
  const { t } = useTranslation();

  const pendingSellersCount = Object.values(sellerStatuses).filter((s) => s === 'pending').length;
  const reportedReviewsCount = reviews.filter((r) => r.status === 'reported').length;
  const pendingRefundsCount = refunds.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* GMV Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('admin.totalGmv') || 'Platform Gross Merchandise'}
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatMinorToCurrency(DEMO_ADMIN_KPIS.totalGmv.amountMinor, 'USD')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +14.2%
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Platform Take: {formatMinorToCurrency(DEMO_ADMIN_KPIS.netRevenue.amountMinor, 'USD')} (
            {settings.commission.defaultCommissionPercent}%)
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('admin.totalOrders') || 'Total Orders'}
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {DEMO_ADMIN_KPIS.totalOrders.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              AOV: {formatMinorToCurrency(DEMO_ADMIN_KPIS.averageOrderValue.amountMinor, 'USD')}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across multi-vendor split fulfillment
          </div>
        </div>

        {/* Active Sellers & Pending */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('admin.sellers') || 'Marketplace Sellers'}
            </span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {DEMO_ADMIN_KPIS.activeSellersCount}
            </span>
            {pendingSellersCount > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                {pendingSellersCount} pending
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Verified enterprise and retail merchants
          </div>
        </div>

        {/* Customer Accounts */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('admin.customers') || 'Active Customers'}
            </span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {DEMO_ADMIN_KPIS.activeCustomersCount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">({customers.length} seeded)</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Global registered buyer identities
          </div>
        </div>
      </div>

      {/* Actionable Moderation Alert Banners */}
      {(pendingSellersCount > 0 || reportedReviewsCount > 0 || pendingRefundsCount > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pendingSellersCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {pendingSellersCount} Seller Application{pendingSellersCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">Requires merchant KYC review</div>
                </div>
              </div>
              <Link href="/admin/sellers">
                <Button variant="tertiary" size="sm">
                  Review
                </Button>
              </Link>
            </div>
          )}

          {reportedReviewsCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {reportedReviewsCount} Flagged Review{reportedReviewsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reported for spam or policy abuse
                  </div>
                </div>
              </div>
              <Link href="/admin/reviews">
                <Button variant="tertiary" size="sm">
                  Moderate
                </Button>
              </Link>
            </div>
          )}

          {pendingRefundsCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {pendingRefundsCount} Refund Request{pendingRefundsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending customer claims</div>
                </div>
              </div>
              <Link href="/admin/refunds">
                <Button variant="tertiary" size="sm">
                  Examine
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Revenue Performance Chart & Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Weekly Revenue Graph */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">7-Day Platform Sales Velocity</h2>
              <p className="text-xs text-muted-foreground">
                Gross Merchandise Value vs Net Platform Commission Take
              </p>
            </div>
            <div className="text-xs font-mono text-muted-foreground">Demo Telemetry</div>
          </div>

          <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 pt-4">
            {DEMO_ADMIN_REVENUE_CHART.map((dp) => {
              const maxGmv = 5000000;
              const heightPct = Math.min(100, Math.round((dp.gmvMinor / maxGmv) * 100));
              const dayLabel = dp.date.split('-').slice(1).join('/');

              return (
                <div key={dp.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                    ${(dp.gmvMinor / 100000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full rounded-t-lg bg-primary/20 relative flex items-end overflow-hidden"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{
                        height: `${Math.round((dp.netRevenueMinor / dp.gmvMinor) * 100 * 3)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{dayLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary/20" />
              <span>Gross Merchandise Value</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary" />
              <span>Net Platform Take ({settings.commission.defaultCommissionPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Quick Administrative Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Administrative Shortcuts</h2>
          <p className="mt-1 text-xs text-muted-foreground">Execute common management workflows</p>

          <div className="mt-5 space-y-3">
            <Link href="/admin/sellers" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Seller Verification</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/products" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Catalog Moderation</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/coupons" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Create Promotion Coupon
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/settings" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Platform Configuration
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Platform Compliance & Activity Log */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Audit Log Events</h2>
            <p className="text-xs text-muted-foreground">
              Append-only security records of administrative interventions
            </p>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="tertiary" size="sm">
              View Full Audit Trail →
            </Button>
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border overflow-hidden">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[11px] font-semibold text-secondary-foreground">
                  {log.action}
                </span>
                <div>
                  <span className="font-semibold text-foreground">{log.actor.name}</span>
                  <span className="text-muted-foreground"> modified </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {log.targetType}:{log.targetId}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                  {log.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
