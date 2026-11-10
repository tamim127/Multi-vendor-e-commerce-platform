'use client';

/**
 * ==============================================================================
 * SELLER DASHBOARD VIEW
 * ==============================================================================
 * Comprehensive overview of marketplace performance.
 * Real-time revenue metrics, orders, active catalog offers, inventory alerts,
 * 7-day sales trends, and recent fulfillment requests.
 */

import React from 'react';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import { useI18n } from '@/lib/i18n';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { Button } from '@/components/ui/button/button';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Boxes,
  Truck,
  ExternalLink,
} from 'lucide-react';

export function SellerDashboardView(): React.JSX.Element {
  const { sellerProfile, metrics, packages, inventory } = useSeller();
  const { t } = useI18n();

  const lowStockCount = inventory.filter((item) => item.alertLevel !== 'normal').length;
  const pendingPackages = packages.filter(
    (p) => p.status === 'unfulfilled' || p.status === 'processing'
  );
  const recentPackages = packages.slice(0, 5);

  const storeSlug = sellerProfile?.slug || 'tech-direct-express';

  // Find max revenue for relative bar heights
  const maxDayRevenue = Math.max(...metrics.dailyTrends.map((d) => d.revenue.amountMinor), 1);

  return (
    <div className="space-y-8">
      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('seller.totalRevenue')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoneyMinor(metrics.totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% 30-day growth</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalOrdersCount.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{metrics.pendingOrdersCount}</span>{' '}
              pending fulfillment
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('seller.activeListings')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.activeListingsCount}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              In canonical marketplace catalog
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('seller.lowStockAlerts')}
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                lowStockCount > 0
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">{lowStockCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {lowStockCount > 0 ? 'Requires replenishment' : 'All SKUs healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="tertiary" className="text-xs">
              <Link href="/seller/products">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                {t('seller.addOffer')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="tertiary" className="text-xs">
              <Link href="/seller/inventory">
                <Boxes className="mr-1.5 h-3.5 w-3.5" />
                {t('seller.updateStock')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="tertiary" className="text-xs">
              <Link href="/seller/orders">
                <Truck className="mr-1.5 h-3.5 w-3.5" />
                {t('seller.dispatchOrder')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-xs">
              <Link href={`/store/${storeSlug}`} target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {t('seller.storefrontPreview')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 7-Day Revenue & Sales Trends */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('seller.salesTrends')}</h3>
            <p className="text-xs text-muted-foreground">
              Daily revenue distribution over the last 7 operating days
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Average Order Value: {formatMoneyMinor(metrics.averageOrderValue)}
          </span>
        </div>

        {/* Bar chart representation */}
        <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6">
          {metrics.dailyTrends.map((day) => {
            const heightPercent = Math.max(
              12,
              Math.round((day.revenue.amountMinor / maxDayRevenue) * 100)
            );
            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-medium">
                  {formatMoneyMinor(day.revenue)}
                </div>
                <div
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-200"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="mt-2 text-[11px] font-medium text-muted-foreground">
                  {day.date.slice(5)}
                </span>
                <span className="text-[10px] text-muted-foreground/80">{day.orderCount} ord</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Recent Packages</h3>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/seller/orders">
                  View all ({packages.length})
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 divide-y divide-border/60">
              {recentPackages.map((pkg) => (
                <div key={pkg.packageId} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-foreground">
                        {pkg.packageId}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          pkg.status === 'shipped'
                            ? 'bg-blue-500/10 text-blue-600'
                            : pkg.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      To {pkg.shippingAddress.fullName} • {pkg.items.length} item(s)
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatMoneyMinor(pkg.subtotal)}
                    </span>
                    <div className="text-[11px] text-muted-foreground">
                      {pkg.orderCreatedAt.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60">
            <Button asChild variant="tertiary" size="sm" className="w-full text-xs">
              <Link href="/seller/orders">
                Manage All Orders ({pendingPackages.length} Pending)
              </Link>
            </Button>
          </div>
        </div>

        {/* Inventory Watchlist */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Inventory Alerts</h3>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/seller/inventory">
                  Manage ({inventory.length} SKUs)
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 divide-y divide-border/60">
              {inventory.slice(0, 5).map((item) => (
                <div key={item.sku} className="py-3 flex items-center justify-between">
                  <div className="max-w-[70%]">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.sku} {item.variantName ? `• ${item.variantName}` : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.alertLevel === 'out_of_stock'
                          ? 'bg-rose-500/10 text-rose-600'
                          : item.alertLevel === 'low_stock'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {item.quantityAvailable} in stock
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Threshold: {item.lowStockThreshold}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60">
            <Button asChild variant="tertiary" size="sm" className="w-full text-xs">
              <Link href="/seller/inventory">View Full Inventory Matrix</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
