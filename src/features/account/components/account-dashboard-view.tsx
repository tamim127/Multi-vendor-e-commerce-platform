/**
 * ==============================================================================
 * ACCOUNT FEATURE — CUSTOMER DASHBOARD VIEW
 * ==============================================================================
 * Central overview with stats, recent order highlights, and quick shortcuts.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useWishlist } from '@/features/wishlist';
import { useI18n } from '@/lib/i18n';
import { getAllCustomerOrders } from '@/domains/customer/utils/orders';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { RecentlyViewedSection } from '@/features/recently-viewed';
import type { CustomerOrderStatus } from '@/domains/customer/types/order';

function getOrderStatusBadge(status: CustomerOrderStatus, t: (key: string) => string) {
  switch (status) {
    case 'delivered':
      return {
        label: t('orders.statusDelivered'),
        className: 'bg-success/15 text-success border-success/30',
        icon: CheckCircle2,
      };
    case 'shipped':
      return {
        label: t('orders.statusShipped'),
        className: 'bg-primary/15 text-primary border-primary/30',
        icon: Truck,
      };
    case 'processing':
    case 'pending':
      return {
        label: t('orders.statusProcessing'),
        className: 'bg-warning/15 text-warning border-warning/30',
        icon: Clock,
      };
    default:
      return {
        label: status,
        className: 'bg-surface-muted text-fg-muted border-border-default',
        icon: Clock,
      };
  }
}

export function AccountDashboardView(): React.JSX.Element {
  const { customer, addresses } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  const [orders, setOrders] = React.useState(() => getAllCustomerOrders());

  React.useEffect(() => {
    setOrders(getAllCustomerOrders());
  }, []);

  const recentOrders = orders.slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Header Banner */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl shadow-xs">
            {customer?.firstName.charAt(0)}
            {customer?.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {t('account.welcome')}, {customer?.firstName}!
              </h2>
              {customer?.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="size-3" />
                  <span>{t('account.verified')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-2xs font-semibold text-amber-700 border border-amber-200/60">
                  {t('account.unverified')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{customer?.email}</p>
          </div>
        </div>

        <Link href="/account/profile">
          <Button variant="secondary" size="sm" className="font-bold rounded-full px-4 text-xs cursor-pointer">
            {t('account.editProfile')}
          </Button>
        </Link>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('account.totalOrders')}
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Package className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {orders.length}
            </span>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('account.savedAddresses')}
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <MapPin className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-fg-primary tabular-nums">
              {addresses.length}
            </span>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('account.wishlistItems')}
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Heart className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {wishlistCount}
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Recent Orders Summary */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-fg-primary flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <span>{t('account.orders')}</span>
          </h3>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('account.viewAllOrders')}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-fg-muted text-sm">
            <p>{t('orders.noOrdersDesc')}</p>
            <Link href="/products" className="mt-4 inline-block">
              <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
                {t('wishlist.exploreProducts')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentOrders.map((order) => {
              const badge = getOrderStatusBadge(order.status, t);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={order.orderId}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-fg-primary font-mono">
                        {order.orderId}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold border ${badge.className}`}
                      >
                        <BadgeIcon className="size-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <div className="text-xs text-fg-muted flex items-center gap-3">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{order.itemCount} item(s)</span>
                      <span>•</span>
                      <span className="font-semibold text-fg-primary tabular-nums">
                        {formatMoneyMinor(order.grandTotal, { locale: formatLocale })}
                      </span>
                    </div>
                  </div>

                  <Link href={`/account/orders/${order.orderId}`}>
                    <Button variant="tertiary" size="sm" className="font-semibold cursor-pointer">
                      <span>{t('orders.viewDetails')}</span>
                      <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Recently Viewed Section */}
      <RecentlyViewedSection />
    </div>
  );
}
