/**
 * ==============================================================================
 * ACCOUNT FEATURE — ORDERS LIST PAGE VIEW
 * ==============================================================================
 * Displays customer order history with status filters and details navigation.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { getAllCustomerOrders } from '@/domains/customer/utils/orders';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { Package, CheckCircle2, Clock, Truck, ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import type { CustomerOrderStatus, CustomerOrder } from '@/domains/customer/types/order';

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

export function OrdersPageView(): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  const [orders, setOrders] = React.useState<CustomerOrder[]>(() => getAllCustomerOrders());
  const [filter, setFilter] = React.useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');

  React.useEffect(() => {
    setOrders(getAllCustomerOrders());
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'processing') return order.status === 'processing' || order.status === 'pending';
    return order.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-fg-primary flex items-center gap-2">
          <Package className="size-5 text-primary" />
          <span>{t('orders.title')}</span>
        </h2>
        <p className="text-xs text-fg-muted mt-0.5">
          Review, track shipments, and inspect multi-vendor packages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
        {(['all', 'processing', 'shipped', 'delivered'] as const).map((tab) => {
          const count =
            tab === 'all'
              ? orders.length
              : orders.filter((o) =>
                  tab === 'processing'
                    ? o.status === 'processing' || o.status === 'pending'
                    : o.status === tab
                ).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === tab
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-fg-muted hover:bg-surface-muted hover:text-fg-primary'
              }`}
            >
              <span>
                {tab === 'all'
                  ? 'All Orders'
                  : t(`orders.status${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-2xs font-bold ${
                  filter === tab
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-surface-muted text-fg-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-fg-muted mx-auto">
            <Package className="size-6" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">{t('orders.noOrders')}</h3>
          <p className="text-xs text-fg-muted max-w-sm mx-auto">{t('orders.noOrdersDesc')}</p>
          <Link href="/products" className="inline-block mt-2">
            <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
              {t('wishlist.exploreProducts')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getOrderStatusBadge(order.status, t);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={order.orderId}
                className="rounded-2xl border border-border-default bg-surface shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-surface-muted/60 px-5 py-3.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-fg-muted block text-2xs font-medium uppercase tracking-wider">
                        {t('orders.orderNumber')}
                      </span>
                      <span className="font-bold text-fg-primary font-mono">{order.orderId}</span>
                    </div>

                    <div>
                      <span className="text-fg-muted block text-2xs font-medium uppercase tracking-wider">
                        {t('orders.placedOn')}
                      </span>
                      <span className="font-medium text-fg-primary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-fg-muted block text-2xs font-medium uppercase tracking-wider">
                        Total
                      </span>
                      <span className="font-bold text-fg-primary tabular-nums">
                        {formatMoneyMinor(order.grandTotal, { locale: formatLocale })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badge.className}`}
                    >
                      <BadgeIcon className="size-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <a href={`/account/orders/${order.orderId}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-semibold cursor-pointer"
                      >
                        <span>{t('orders.viewDetails')}</span>
                        <ArrowRight className="size-3.5 rtl:rotate-180" />
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Vendor Packages Breakdown */}
                <div className="p-5 space-y-4">
                  {order.vendorPackages.map((pkg, idx) => (
                    <div
                      key={pkg.sellerId || idx}
                      className="rounded-xl border border-border-subtle bg-surface-subtle/30 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Store className="size-4 text-primary" />
                          <span className="font-bold text-fg-primary">{pkg.sellerName}</span>
                          <span className="text-fg-muted">({pkg.items.length} item(s))</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1.5 text-2xs text-fg-subtle">
                            <Truck className="size-3 text-fg-muted" />
                            <span>{order.carrier}</span>
                            <span className="font-mono text-fg-primary font-semibold">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items thumbnails list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {pkg.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 bg-surface rounded-lg p-2 border border-border-subtle"
                          >
                            <div className="size-12 shrink-0 rounded-md bg-surface-muted overflow-hidden flex items-center justify-center">
                              {item.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={item.imageUrl}
                                  alt={item.title.en}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-5 text-fg-muted" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-fg-primary truncate">
                                {item.title.en}
                              </p>
                              <p className="text-2xs text-fg-muted">
                                Qty: {item.quantity} •{' '}
                                {formatMoneyMinor(item.unitPrice, { locale: formatLocale })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
