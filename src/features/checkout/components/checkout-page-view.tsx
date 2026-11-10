/**
 * ==============================================================================
 * CHECKOUT FEATURE — MAIN CHECKOUT PAGE VIEW
 * ==============================================================================
 * Comprehensive multi-vendor checkout interface supporting contact details,
 * shipping address, delivery options, split package preview, and idempotent order submission.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Store,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/features/cart';
import { useI18n } from '@/lib/i18n';
import { formatMoneyMinor, addMoney, createMoney } from '@/domains/catalog/utils/money';
import { Button } from '@/components/ui/button/button';
import { CheckoutFormSchema } from '@/domains/checkout/schemas/checkout.schema';
import type {
  CheckoutFormState,
  CheckoutOrderResult,
  CheckoutVendorPackage,
  DeliveryMethodType,
} from '@/domains/checkout/types/checkout';

export function CheckoutPageView(): React.JSX.Element {
  const { cart, items, sellerGroups, itemCount, subtotal, shippingTotal, clearCart } = useCart();
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  // Form state
  const [formData, setFormData] = React.useState<CheckoutFormState>({
    contact: {
      fullName: '',
      email: '',
      phone: '',
    },
    shipping: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    },
    deliveryMethod: 'standard',
  });

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState<CheckoutOrderResult | null>(null);

  // Delivery method fee calculation (Standard: base shipping; Express: +$15.00 per package)
  const isExpress = formData.deliveryMethod === 'express';
  const expressFeeMinor = isExpress ? sellerGroups.length * 1500 : 0;
  const effectiveShipping = addMoney(shippingTotal, createMoney(expressFeeMinor, cart.currency));
  const effectiveGrandTotal = addMoney(subtotal, effectiveShipping);

  const handleInputChange = (
    section: 'contact' | 'shipping',
    field: string,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear specific field error
    if (fieldErrors[`${section}.${field}`]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[`${section}.${field}`];
        return next;
      });
    }
  };

  const handleDeliveryChange = (method: DeliveryMethodType): void => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: method,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (items.length === 0 || isSubmitting) return;

    // Validate form schema with Zod
    const validation = CheckoutFormSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        errors[issue.path.join('.')] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    // Simulate reliable idempotent order submission
    const vendorPackages: CheckoutVendorPackage[] = sellerGroups.map((group) => {
      const pkgShippingFee = isExpress
        ? addMoney(
            group.shippingCost || createMoney(0, cart.currency),
            createMoney(1500, cart.currency)
          )
        : group.shippingCost || createMoney(0, cart.currency);

      return {
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        items: group.items,
        subtotal: group.subtotal,
        shippingFee: pkgShippingFee,
        deliveryMethod: formData.deliveryMethod,
        estimatedDays: isExpress ? '1-2 business days' : '3-5 business days',
      };
    });

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderResult: CheckoutOrderResult = {
      orderId: `ORD-2026-${randomSuffix}`,
      currency: cart.currency,
      itemsSubtotal: subtotal,
      shippingTotal: effectiveShipping,
      grandTotal: effectiveGrandTotal,
      itemCount,
      contact: formData.contact,
      shippingAddress: formData.shipping,
      vendorPackages,
      createdAt: new Date().toISOString(),
      isDemo: true,
      status: 'confirmed',
    };

    // Small delay to simulate network turn and prevent duplicate submission
    await new Promise((resolve) => setTimeout(resolve, 600));

    setConfirmedOrder(orderResult);
    clearCart();
    setIsSubmitting(false);
  };

  // 1. Order Confirmation View
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-in fade-in">
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 sm:p-8 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/20 text-success mx-auto">
            <CheckCircle2 className="size-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
            {t('checkout.orderSuccessTitle')}
          </h1>
          <p className="text-sm sm:text-base text-fg-muted max-w-lg mx-auto">
            {t('checkout.orderSuccessDesc')}
          </p>

          <div className="inline-flex items-center gap-3 rounded-xl border border-border-default bg-surface px-4 py-2 text-xs font-mono">
            <span className="text-fg-muted">{t('checkout.orderId')}:</span>
            <span className="font-bold text-fg-primary">{confirmedOrder.orderId}</span>
          </div>
        </div>

        {/* Multi-Vendor Packages Breakdown */}
        <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-fg-primary border-b border-border-subtle pb-3">
            {t('checkout.vendorPackages')} ({confirmedOrder.vendorPackages.length} packages)
          </h2>

          <div className="space-y-4">
            {confirmedOrder.vendorPackages.map((pkg) => (
              <div
                key={pkg.sellerId}
                className="rounded-xl border border-border-subtle bg-surface-subtle/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-fg-primary">
                    <Store className="size-4 text-primary" />
                    <span>{pkg.sellerName}</span>
                  </div>
                  <span className="text-fg-muted">
                    {pkg.deliveryMethod.toUpperCase()} ({pkg.estimatedDays})
                  </span>
                </div>

                <div className="divide-y divide-border-subtle/60 text-xs">
                  {pkg.items.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center">
                      <span className="text-fg-primary truncate max-w-xs">
                        {item.quantity}x {(locale && item.title[locale]) || item.title.en}
                      </span>
                      <span className="font-bold text-fg-primary tabular-nums">
                        {formatMoneyMinor(item.lineTotal, { locale: formatLocale })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border-subtle/80 pt-2 flex justify-between text-xs font-bold text-fg-primary">
                  <span>Package Subtotal:</span>
                  <span className="tabular-nums">
                    {formatMoneyMinor(pkg.subtotal, { locale: formatLocale })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-border-subtle pt-4 space-y-2 text-xs text-fg-muted">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}:</span>
              <span className="font-semibold text-fg-primary tabular-nums">
                {formatMoneyMinor(confirmedOrder.itemsSubtotal, { locale: formatLocale })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('cart.shippingEstimate')}:</span>
              <span className="font-semibold text-fg-primary tabular-nums">
                {formatMoneyMinor(confirmedOrder.shippingTotal, { locale: formatLocale })}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-fg-primary pt-2 border-t border-border-subtle">
              <span>{t('cart.grandTotal')}:</span>
              <span className="tabular-nums text-primary">
                {formatMoneyMinor(confirmedOrder.grandTotal, { locale: formatLocale })}
              </span>
            </div>
          </div>

          {/* Demo Disclaimer */}
          <div className="rounded-lg bg-surface-muted p-3 text-2xs text-fg-subtle leading-relaxed">
            {t('checkout.demoNotice')}
          </div>

          <div className="pt-2 text-center">
            <Link href="/products">
              <Button variant="primary" size="lg" className="font-bold cursor-pointer">
                <span>{t('checkout.backToHome')}</span>
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart Check
  if (items.length === 0) {
    return (
      <div className="py-16 max-w-xl mx-auto text-center px-4 space-y-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-surface-muted mx-auto text-fg-muted">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-fg-primary">{t('checkout.cartEmpty')}</h1>
        <div className="pt-4">
          <Link href="/products">
            <Button variant="primary" size="md" className="font-bold cursor-pointer">
              <span>{t('cart.continueShopping')}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Checkout Form View
  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
          {t('checkout.title')}
        </h1>
        <p className="text-xs sm:text-sm text-fg-muted mt-1">
          Complete your contact and delivery information to simulate order placement.
        </p>
      </div>

      {/* Multi-Vendor Packaging Notice */}
      {sellerGroups.length > 1 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-fg-primary flex items-start gap-3">
          <Store className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">{t('checkout.vendorPackages')}</span>
            <p className="text-fg-muted leading-relaxed">{t('checkout.splitOrderNotice')}</p>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0" />
          <span>{t('checkout.validationError')}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column: Checkout Stages Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stage 1: Customer Contact Information */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-fg-primary flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <span>{t('checkout.stepContact')}</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="contact-fullName"
                  className="block text-xs font-semibold text-fg-primary mb-1"
                >
                  {t('checkout.fullName')} *
                </label>
                <input
                  id="contact-fullName"
                  type="text"
                  required
                  value={formData.contact.fullName}
                  onChange={(e) => handleInputChange('contact', 'fullName', e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors['contact.fullName'] && (
                  <p className="text-2xs text-destructive mt-1">
                    {fieldErrors['contact.fullName']}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.email')} *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['contact.email'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['contact.email']}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.phone')} *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['contact.phone'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['contact.phone']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: Shipping Address */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-fg-primary flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </span>
              <span>{t('checkout.stepShipping')}</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="shipping-address"
                  className="block text-xs font-semibold text-fg-primary mb-1"
                >
                  {t('checkout.address')} *
                </label>
                <input
                  id="shipping-address"
                  type="text"
                  required
                  value={formData.shipping.address}
                  onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                  placeholder="123 Market Street, Apt 4B"
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors['shipping.address'] && (
                  <p className="text-2xs text-destructive mt-1">
                    {fieldErrors['shipping.address']}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="shipping-city"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.city')} *
                  </label>
                  <input
                    id="shipping-city"
                    type="text"
                    required
                    value={formData.shipping.city}
                    onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                    placeholder="New York"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['shipping.city'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['shipping.city']}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="shipping-state"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.state')} *
                  </label>
                  <input
                    id="shipping-state"
                    type="text"
                    required
                    value={formData.shipping.state}
                    onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                    placeholder="NY"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['shipping.state'] && (
                    <p className="text-2xs text-destructive mt-1">
                      {fieldErrors['shipping.state']}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="shipping-postalCode"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.postalCode')} *
                  </label>
                  <input
                    id="shipping-postalCode"
                    type="text"
                    required
                    value={formData.shipping.postalCode}
                    onChange={(e) => handleInputChange('shipping', 'postalCode', e.target.value)}
                    placeholder="10001"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['shipping.postalCode'] && (
                    <p className="text-2xs text-destructive mt-1">
                      {fieldErrors['shipping.postalCode']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="shipping-country"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    {t('checkout.country')} *
                  </label>
                  <input
                    id="shipping-country"
                    type="text"
                    required
                    value={formData.shipping.country}
                    onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                    placeholder="United States"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {fieldErrors['shipping.country'] && (
                    <p className="text-2xs text-destructive mt-1">
                      {fieldErrors['shipping.country']}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3: Delivery Method */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-fg-primary flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </span>
              <span>{t('checkout.stepDelivery')}</span>
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                  formData.deliveryMethod === 'standard'
                    ? 'border-primary bg-primary/5 text-fg-primary ring-1 ring-primary'
                    : 'border-border-default bg-surface hover:bg-surface-subtle text-fg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="standard"
                    checked={formData.deliveryMethod === 'standard'}
                    onChange={() => handleDeliveryChange('standard')}
                    className="size-4 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-semibold text-sm block text-fg-primary">
                      {t('checkout.standardDelivery')}
                    </span>
                    <span className="text-2xs text-fg-muted">
                      Included / Standard Merchant Turnaround
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-fg-primary">
                  {shippingTotal.amountMinor === 0
                    ? t('cart.freeShipping')
                    : formatMoneyMinor(shippingTotal, { locale: formatLocale })}
                </span>
              </label>

              <label
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                  formData.deliveryMethod === 'express'
                    ? 'border-primary bg-primary/5 text-fg-primary ring-1 ring-primary'
                    : 'border-border-default bg-surface hover:bg-surface-subtle text-fg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="express"
                    checked={formData.deliveryMethod === 'express'}
                    onChange={() => handleDeliveryChange('express')}
                    className="size-4 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-semibold text-sm block text-fg-primary">
                      {t('checkout.expressDelivery')}
                    </span>
                    <span className="text-2xs text-fg-muted">Expedited Priority Air Courier</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">
                  +{' '}
                  {formatMoneyMinor(createMoney(expressFeeMinor, cart.currency), {
                    locale: formatLocale,
                  })}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submission */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-fg-primary">{t('checkout.orderSummary')}</h2>

            {/* Cart Items Quick List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border-subtle pr-1 text-xs">
              {items.map((item) => {
                const itemTitle = (locale && item.title[locale]) || item.title.en;
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative size-10 shrink-0 rounded-md border border-border-subtle overflow-hidden bg-surface-subtle">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={itemTitle}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-fg-primary block truncate">
                          {itemTitle}
                        </span>
                        <span className="text-2xs text-fg-muted">
                          Qty: {item.quantity} · {item.sellerName}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-fg-primary shrink-0 tabular-nums">
                      {formatMoneyMinor(item.lineTotal, { locale: formatLocale })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-border-subtle pt-3 space-y-2.5 text-sm divide-y divide-border-subtle">
              <div className="flex justify-between text-fg-muted pt-1">
                <span>
                  {t('cart.subtotal')} ({itemCount} {t('cart.itemsCount')}):
                </span>
                <span className="font-semibold text-fg-primary tabular-nums">
                  {formatMoneyMinor(subtotal, { locale: formatLocale })}
                </span>
              </div>

              <div className="flex justify-between text-fg-muted pt-2.5">
                <span>{t('cart.shippingEstimate')}:</span>
                <span className="font-semibold text-fg-primary tabular-nums">
                  {effectiveShipping.amountMinor === 0
                    ? t('cart.freeShipping')
                    : formatMoneyMinor(effectiveShipping, { locale: formatLocale })}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2.5 text-base font-extrabold text-fg-primary">
                <span>{t('cart.grandTotal')}:</span>
                <span className="text-xl tabular-nums text-primary">
                  {formatMoneyMinor(effectiveGrandTotal, { locale: formatLocale })}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || items.length === 0}
                className="w-full font-bold cursor-pointer"
              >
                <Lock className="size-4" />
                <span>{isSubmitting ? t('checkout.submitting') : t('checkout.placeOrder')}</span>
              </Button>
            </div>

            <div className="rounded-lg bg-surface-subtle border border-border-subtle p-3 text-2xs text-fg-muted leading-relaxed flex items-start gap-2">
              <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
              <span>{t('checkout.demoNotice')}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
