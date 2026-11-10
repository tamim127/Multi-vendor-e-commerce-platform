/**
 * ==============================================================================
 * SHOPPING CART FEATURE — CART DRAWER / MINI-CART COMPONENT
 * ==============================================================================
 * Accessible slide-over mini-cart drawer with multi-vendor seller grouping,
 * reactive quantity controls, line totals, and direct checkout navigation.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/cart-context';
import { useI18n } from '@/lib/i18n';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { QuantityControl } from '@/components/ui/quantity-control/quantity-control';
import { Button } from '@/components/ui/button/button';

export function CartDrawer(): React.JSX.Element | null {
  const {
    isDrawerOpen,
    closeDrawer,
    cart,
    items,
    sellerGroups,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    currencyMismatchError,
    clearCurrencyMismatch,
    clearCart,
  } = useCart();

  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  // Trap escape key to close drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent background body scroll when drawer is open
  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 animate-in slide-in-from-right rtl:slide-in-from-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-5 text-primary" />
            <h2 id="cart-drawer-title" className="text-base font-bold text-fg-primary">
              {t('cart.cartDrawer')}
            </h2>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-fg-muted tabular-nums">
              {itemCount}
            </span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t('cart.closeDrawer')}
            className="rounded-full p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg-primary transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Currency Mismatch Warning Banner */}
        {currencyMismatchError && (
          <div className="flex items-start gap-2.5 bg-warning/10 border-b border-warning/20 px-5 py-3 text-xs text-warning">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{t('cart.currencyMismatch')}</span>
              <span className="text-fg-muted">{t('cart.currencyMismatchDesc')}</span>
            </div>
            <button
              type="button"
              onClick={clearCurrencyMismatch}
              className="text-fg-subtle hover:text-fg-primary cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-surface-muted text-fg-muted">
                <ShoppingBag className="size-8 stroke-1" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-fg-primary">{t('cart.emptyTitle')}</h3>
                <p className="text-xs text-fg-muted max-w-xs">{t('cart.emptyDesc')}</p>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={closeDrawer}
                className="mt-2 font-semibold cursor-pointer"
              >
                {t('cart.continueShopping')}
              </Button>
            </div>
          ) : (
            sellerGroups.map((group) => (
              <div
                key={group.sellerId}
                className="rounded-xl border border-border-subtle bg-surface-subtle/40 p-3.5 space-y-3"
              >
                {/* Seller Group Header */}
                <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-fg-primary">{group.sellerName}</span>
                    {group.isVerified && (
                      <ShieldCheck className="size-3.5 text-primary" aria-label="Verified Seller" />
                    )}
                  </div>
                  <span className="text-2xs text-fg-muted">
                    {group.itemCount} {t('cart.itemsCount')}
                  </span>
                </div>

                {/* Items in this Seller Group */}
                <div className="divide-y divide-border-subtle/60">
                  {group.items.map((item) => {
                    const itemTitle = (locale && item.title[locale]) || item.title.en;

                    return (
                      <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={itemTitle}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-surface-muted text-fg-subtle text-xs">
                              IMG
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeDrawer}
                              className="text-xs font-semibold text-fg-primary hover:text-primary transition-colors line-clamp-1 truncate"
                            >
                              {itemTitle}
                            </Link>

                            {/* Selected Options Snapshot */}
                            {item.selectedOptions &&
                              Object.keys(item.selectedOptions).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5 text-2xs text-fg-muted">
                                  {Object.entries(item.selectedOptions).map(([key, val]) => (
                                    <span key={key} className="capitalize">
                                      {key}: {val}
                                    </span>
                                  ))}
                                </div>
                              )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between mt-2 pt-1">
                            <span className="text-xs font-bold text-fg-primary tabular-nums">
                              {formatMoneyMinor(item.lineTotal, { locale: formatLocale })}
                            </span>

                            <div className="flex items-center gap-2">
                              <QuantityControl
                                className="scale-90 origin-right rtl:origin-left"
                                value={item.quantity}
                                min={1}
                                max={item.maxAvailableQuantity}
                                onChange={(newQty) => updateQuantity(item.id, newQty)}
                              />
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`${t('cart.remove')} ${itemTitle}`}
                                className="p-1 text-fg-subtle hover:text-destructive transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions & Summary */}
        {items.length > 0 && (
          <div className="border-t border-border-default bg-surface p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-fg-primary tabular-nums">
                  {formatMoneyMinor(subtotal, { locale: formatLocale })}
                </span>
              </div>
              <div className="flex items-center justify-between text-2xs text-fg-subtle">
                <span>{t('cart.shippingEstimate')}</span>
                <span>{t('cart.freeShipping')}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-fg-primary pt-1 border-t border-border-subtle">
                <span>{t('cart.grandTotal')}</span>
                <span className="tabular-nums">
                  {formatMoneyMinor(cart.grandTotal, { locale: formatLocale })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/checkout" onClick={closeDrawer} className="w-full">
                <Button variant="primary" size="lg" className="w-full font-bold cursor-pointer">
                  <span>{t('cart.proceedToCheckout')}</span>
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </Link>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  {t('cart.viewCart')}
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-2xs text-fg-subtle hover:text-destructive transition-colors cursor-pointer"
                >
                  {t('cart.clearCart')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
