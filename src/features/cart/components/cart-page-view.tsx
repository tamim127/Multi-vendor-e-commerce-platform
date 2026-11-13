/**
 * ==============================================================================
 * SHOPPING CART FEATURE — CART PAGE MAIN VIEW
 * ==============================================================================
 * Multi-vendor shopping cart page with merchant-level grouping,
 * responsive quantity controls, order summary, and checkout transition.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  AlertCircle,
  X,
  Store,
} from 'lucide-react';
import { useCart } from '../context/cart-context';
import { useI18n } from '@/lib/i18n';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { QuantityControl } from '@/components/ui/quantity-control/quantity-control';
import { Button } from '@/components/ui/button/button';

export function CartPageView(): React.JSX.Element {
  const {
    items,
    sellerGroups,
    itemCount,
    subtotal,
    shippingTotal,
    grandTotal,
    updateQuantity,
    removeItem,
    clearCart,
    currencyMismatchError,
    clearCurrencyMismatch,
  } = useCart();

  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto text-center px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-surface-muted mx-auto mb-6 text-fg-muted shadow-xs">
          <ShoppingBag className="size-10 stroke-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
          {t('cart.emptyTitle')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-fg-muted max-w-md mx-auto leading-relaxed">
          {t('cart.emptyDesc')}
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/products">
            <Button variant="primary" size="lg" className="font-bold cursor-pointer">
              <span>{t('cart.continueShopping')}</span>
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-border-subtle pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
            {t('cart.title')}
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            {itemCount} {t('cart.itemsCount')} ({sellerGroups.length} {t('cart.seller')}{' '}
            {sellerGroups.length > 1 ? 'packages' : 'package'})
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-fg-subtle hover:text-destructive transition-colors self-start sm:self-auto cursor-pointer"
        >
          {t('cart.clearCart')}
        </button>
      </div>

      {/* Currency Mismatch Warning Banner */}
      {currencyMismatchError && (
        <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/30 p-4 text-xs text-warning">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-sm">{t('cart.currencyMismatch')}</span>
            <span className="text-fg-muted">{t('cart.currencyMismatchDesc')}</span>
          </div>
          <button
            type="button"
            onClick={clearCurrencyMismatch}
            className="text-fg-subtle hover:text-fg-primary cursor-pointer p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 2-Column Responsive Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Vendor Seller Packages */}
        <div className="lg:col-span-8 space-y-6">
          {sellerGroups.map((group) => (
            <div
              key={group.sellerId}
              className="rounded-2xl border border-border-default bg-surface shadow-xs overflow-hidden"
            >
              {/* Seller Package Header */}
              <div className="border-b border-border-subtle bg-surface-subtle/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Store className="size-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-fg-primary">
                      <span>{group.sellerName}</span>
                      {group.isVerified && (
                        <ShieldCheck
                          className="size-3.5 text-primary"
                          aria-label="Verified Seller"
                        />
                      )}
                    </div>
                    <span className="text-2xs text-fg-muted">
                      {t('pdp.fulfilledBy')} {group.sellerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-fg-muted text-2xs">
                  <Truck className="size-3.5 text-fg-subtle" />
                  <span>
                    {group.shippingCost && group.shippingCost.amountMinor > 0
                      ? formatMoneyMinor(group.shippingCost, { locale: formatLocale })
                      : t('cart.freeShipping')}
                  </span>
                </div>
              </div>

              {/* Items in Seller Package */}
              <div className="divide-y divide-border-subtle p-5">
                {group.items.map((item) => {
                  const itemTitle = (locale && item.title[locale]) || item.title.en;

                  return (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      {/* Product Thumbnail & Metadata */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={itemTitle}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-surface-muted text-fg-subtle text-xs">
                              IMG
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-bold text-sm text-fg-primary hover:text-primary transition-colors line-clamp-2"
                          >
                            {itemTitle}
                          </Link>

                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs text-fg-muted">
                              {Object.entries(item.selectedOptions).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-2xs font-medium"
                                >
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-fg-subtle font-mono pt-0.5">
                            {t('cart.unitPrice')}:{' '}
                            <span className="font-semibold text-fg-primary">
                              {formatMoneyMinor(item.unitPrice, { locale: formatLocale })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-border-subtle">
                        <div className="flex items-center gap-2">
                          <QuantityControl
                            value={item.quantity}
                            min={1}
                            max={item.maxAvailableQuantity}
                            onChange={(qty) => updateQuantity(item.id, qty)}
                          />

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`${t('cart.remove')} ${itemTitle}`}
                            className="rounded-md p-1.5 text-fg-subtle hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="text-end min-w-24">
                          <span className="text-base font-bold text-fg-primary tabular-nums">
                            {formatMoneyMinor(item.lineTotal, { locale: formatLocale })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seller Package Footer Subtotal */}
              <div className="border-t border-border-subtle/80 bg-surface-subtle/30 px-5 py-3 flex items-center justify-between text-xs">
                <span className="text-fg-muted font-medium">
                  {t('cart.sellerSubtotal')} ({group.sellerName}):
                </span>
                <span className="font-bold text-fg-primary tabular-nums">
                  {formatMoneyMinor(group.subtotal, { locale: formatLocale })}
                </span>
              </div>
            </div>
          ))}

          {/* Continue Shopping Navigation */}
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>← {t('cart.continueShopping')}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-fg-primary">{t('cart.orderSummary')}</h2>

            <div className="space-y-3 text-sm divide-y divide-border-subtle">
              <div className="flex justify-between text-fg-muted pt-1">
                <span>
                  {t('cart.subtotal')} ({itemCount} {t('cart.itemsCount')}):
                </span>
                <span className="font-semibold text-fg-primary tabular-nums">
                  {formatMoneyMinor(subtotal, { locale: formatLocale })}
                </span>
              </div>

              <div className="flex justify-between text-fg-muted pt-3">
                <div className="flex items-center gap-1.5">
                  <span>{t('cart.shippingEstimate')}</span>
                </div>
                <span className="font-semibold text-fg-primary tabular-nums">
                  {shippingTotal.amountMinor > 0
                    ? formatMoneyMinor(shippingTotal, { locale: formatLocale })
                    : t('cart.freeShipping')}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 text-base font-extrabold text-fg-primary">
                <span>{t('cart.grandTotal')}</span>
                <span className="text-xl tabular-nums text-primary">
                  {formatMoneyMinor(grandTotal, { locale: formatLocale })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/checkout" className="w-full block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-black rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer py-3.5 transition-all"
                >
                  <Lock className="size-4" />
                  <span>{t('cart.proceedToCheckout')}</span>
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="border-t border-border-subtle pt-4 space-y-2.5 text-xs text-fg-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success shrink-0" />
                <span>Marketplace Buyer Protection guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-primary shrink-0" />
                <span>30-day effortless returns on eligible items</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-fg-subtle shrink-0" />
                <span>All transactions encrypted and verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
