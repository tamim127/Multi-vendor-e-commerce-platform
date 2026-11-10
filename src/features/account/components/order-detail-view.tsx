/**
 * ==============================================================================
 * ACCOUNT FEATURE — ORDER DETAIL PAGE VIEW
 * ==============================================================================
 * Deep order breakdown with multi-vendor split packages and simulated tracking timeline.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { getCustomerOrderById } from '@/domains/customer/utils/orders';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { Package, CheckCircle2, Truck, ArrowLeft, MapPin, Store, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import type { CustomerOrder } from '@/domains/customer/types/order';

export interface OrderDetailViewProps {
  orderId: string;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  const [order, setOrder] = React.useState<CustomerOrder | null>(() =>
    getCustomerOrderById(orderId)
  );

  React.useEffect(() => {
    setOrder(getCustomerOrderById(orderId));
  }, [orderId]);

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center space-y-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted mx-auto">
          <Package className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-fg-primary">Order Not Found</h2>
        <p className="text-xs text-fg-muted max-w-sm mx-auto">
          We could not locate an order matching reference{' '}
          <span className="font-mono font-bold text-fg-primary">{orderId}</span>.
        </p>
        <Link href="/account/orders" className="inline-block mt-2">
          <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <span>{t('orders.backToOrders')}</span>
          </Button>
        </Link>
      </div>
    );
  }

  const trackingSteps = [
    { label: 'Order Confirmed', completed: true },
    {
      label: 'Processing',
      completed:
        order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered',
    },
    {
      label: 'Shipped',
      completed: order.status === 'shipped' || order.status === 'delivered',
    },
    {
      label: 'Delivered',
      completed: order.status === 'delivered',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          <span>{t('orders.backToOrders')}</span>
        </Link>

        {order.isDemo && (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-fg-subtle bg-surface-muted px-2.5 py-1 rounded-full border border-border-subtle">
            <ShieldAlert className="size-3" />
            <span>Demo Record</span>
          </span>
        )}
      </div>

      {/* Main Order Header Card */}
      <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-fg-primary font-mono">{order.orderId}</h2>
            <p className="text-xs text-fg-muted mt-0.5">
              {t('orders.placedOn')}: {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="text-right sm:text-end">
            <span className="text-2xs text-fg-muted uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-xl font-extrabold text-primary tabular-nums">
              {formatMoneyMinor(order.grandTotal, { locale: formatLocale })}
            </span>
          </div>
        </div>

        {/* Shipment Tracking Progress Stepper */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg-muted">
            {t('orders.trackingHistory')}
          </h3>

          <div className="relative flex items-center justify-between pt-2">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-muted -z-0" />
            {trackingSteps.map((step, idx) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step.completed
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-surface-muted border border-border-default text-fg-muted'
                  }`}
                >
                  {step.completed ? <CheckCircle2 className="size-4" /> : idx + 1}
                </div>
                <span
                  className={`text-2xs whitespace-nowrap font-medium ${
                    step.completed ? 'text-fg-primary font-bold' : 'text-fg-subtle'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 rounded-xl border border-border-subtle bg-surface-subtle/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                <span className="font-semibold text-fg-primary">{order.carrier}</span>
                <span className="text-fg-muted font-mono">{order.trackingNumber}</span>
              </div>
              {order.estimatedDelivery && (
                <span className="text-fg-muted">
                  Estimated Delivery:{' '}
                  <strong className="text-fg-primary">{order.estimatedDelivery}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tracking Events Timeline */}
        {order.trackingEvents && order.trackingEvents.length > 0 && (
          <div className="border-t border-border-subtle pt-4 space-y-3">
            <h4 className="text-xs font-bold text-fg-primary">Shipment Activity</h4>
            <div className="space-y-3 pl-2">
              {order.trackingEvents.map((evt, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-primary/40 space-y-0.5">
                  <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-fg-primary">{evt.status}</span>
                    <span className="text-2xs text-fg-subtle">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-2xs text-fg-muted">{evt.description}</p>
                  <p className="text-2xs text-fg-subtle">{evt.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multi-Vendor Packages Breakdown */}
      <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-fg-primary flex items-center gap-2">
          <Store className="size-5 text-primary" />
          <span>Vendor Packages ({order.vendorPackages.length})</span>
        </h3>

        <div className="space-y-4">
          {order.vendorPackages.map((pkg, idx) => (
            <div
              key={pkg.sellerId || idx}
              className="rounded-xl border border-border-subtle bg-surface-subtle/30 p-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-fg-primary text-sm">{pkg.sellerName}</span>
                  <span className="text-fg-muted">({pkg.items.length} item(s))</span>
                </div>
                <div className="flex items-center gap-2 text-fg-muted">
                  <span className="capitalize">{pkg.deliveryMethod} delivery</span>
                  <span>•</span>
                  <span>{pkg.estimatedDays}</span>
                </div>
              </div>

              {/* Items in package */}
              <div className="divide-y divide-border-subtle">
                {pkg.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-14 shrink-0 rounded-lg bg-surface-muted overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.imageUrl}
                            alt={item.title.en}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-6 text-fg-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-fg-primary truncate">
                          {item.title.en}
                        </p>
                        <p className="text-2xs text-fg-muted font-mono">{item.sku}</p>
                        <p className="text-xs text-fg-muted mt-0.5">
                          Qty: <strong className="text-fg-primary">{item.quantity}</strong> ×{' '}
                          {formatMoneyMinor(item.unitPrice, { locale: formatLocale })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:text-end shrink-0">
                      <span className="text-sm font-bold text-fg-primary tabular-nums">
                        {formatMoneyMinor(item.lineTotal, { locale: formatLocale })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-fg-muted pt-2 border-t border-border-subtle">
                <span>Package Subtotal</span>
                <span className="font-bold text-fg-primary tabular-nums">
                  {formatMoneyMinor(pkg.subtotal, { locale: formatLocale })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Breakdown & Shipping Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-fg-primary flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <span>Shipping Destination</span>
          </h3>

          <div className="text-xs text-fg-muted space-y-1">
            <p className="font-bold text-fg-primary text-sm">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.streetAddress}</p>
            {order.shippingAddress.streetAddress2 && <p>{order.shippingAddress.streetAddress2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.stateOrProvince}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.countryCode}</p>
            <p className="pt-1 text-2xs text-fg-subtle">{order.shippingAddress.phoneNumber}</p>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-fg-primary">Financial Summary</h3>

          <div className="space-y-2 text-xs text-fg-muted">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span className="font-semibold text-fg-primary tabular-nums">
                {formatMoneyMinor(order.itemsSubtotal, { locale: formatLocale })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>{t('cart.shippingEstimate')}</span>
              <span className="font-semibold text-fg-primary tabular-nums">
                {formatMoneyMinor(order.shippingTotal, { locale: formatLocale })}
              </span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-fg-primary pt-2 border-t border-border-subtle">
              <span>{t('cart.grandTotal')}</span>
              <span className="tabular-nums text-primary">
                {formatMoneyMinor(order.grandTotal, { locale: formatLocale })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
