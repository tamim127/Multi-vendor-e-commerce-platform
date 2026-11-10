'use client';

/**
 * ==============================================================================
 * SELLER ORDER PACKAGE DETAIL VIEW
 * ==============================================================================
 * Deep inspection of a single seller-specific fulfillment package.
 * Line items, customer shipping address, tracking info, and dispatch triggers.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { DispatchPackageSchema } from '@/domains/seller/schemas/inventory.schema';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import {
  Truck,
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
  Send,
  X,
} from 'lucide-react';

export interface SellerOrderDetailViewProps {
  orderId: string;
}

export function SellerOrderDetailView({ orderId }: SellerOrderDetailViewProps): React.JSX.Element {
  const { packages, dispatchPackage } = useSeller();
  const { t } = useI18n();

  // Find package by packageId or parent orderId
  const targetPackage = packages.find((p) => p.packageId === orderId || p.orderId === orderId);

  // Dispatch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('FedEx Ground');
  const [trackingNumber, setTrackingNumber] = useState(`TRK-${Date.now().toString().slice(-8)}`);
  const [notes, setNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  if (!targetPackage) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Package Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No seller fulfillment package matching &quot;{orderId}&quot; exists.
        </p>
        <div className="mt-6">
          <Button asChild variant="tertiary">
            <Link href="/seller/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Seller Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDispatch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setModalError(null);

    const payload = {
      packageId: targetPackage.packageId,
      carrier,
      trackingNumber,
      notes: notes || undefined,
    };

    const validation = DispatchPackageSchema.safeParse(payload);
    if (!validation.success) {
      setModalError(validation.error.issues[0]?.message || 'Invalid dispatch info');
      return;
    }

    setDispatching(true);
    try {
      await dispatchPackage(validation.data);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to dispatch package');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit text-xs">
          <Link href="/seller/orders">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Orders
          </Link>
        </Button>

        {targetPackage.status === 'unfulfilled' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {t('seller.dispatchOrder')}
          </Button>
        )}
      </div>

      {/* Package Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground font-mono">
                {targetPackage.packageId}
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  targetPackage.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : targetPackage.status === 'shipped'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {targetPackage.status === 'delivered' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : targetPackage.status === 'shipped' ? (
                  <Truck className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {targetPackage.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Marketplace Master Order ID:{' '}
              <span className="font-mono">{targetPackage.orderId}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Placed: {new Date(targetPackage.orderCreatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Items & Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-3.5 text-xs font-semibold uppercase text-muted-foreground">
              Package Line Items ({targetPackage.items.length})
            </div>
            <div className="divide-y divide-border/60">
              {targetPackage.items.map((item) => (
                <div
                  key={item.variantId || item.productId}
                  className="p-6 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{item.title.en}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">Product: {item.productId}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-foreground text-sm">
                      {formatMoneyMinor(item.lineTotal)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMoneyMinor(item.unitPrice)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Address & Fulfillment Summary */}
        <div className="space-y-6">
          {/* Destination */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Shipping Destination</h3>
            </div>
            <div className="mt-4 text-xs space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">
                {targetPackage.shippingAddress.fullName}
              </p>
              <p>{targetPackage.shippingAddress.street}</p>
              {targetPackage.shippingAddress.street2 && (
                <p>{targetPackage.shippingAddress.street2}</p>
              )}
              <p>
                {targetPackage.shippingAddress.city}, {targetPackage.shippingAddress.state}{' '}
                {targetPackage.shippingAddress.postalCode}
              </p>
              <p className="font-semibold">{targetPackage.shippingAddress.country}</p>
              {targetPackage.shippingAddress.phone && (
                <p className="pt-2 text-foreground">Phone: {targetPackage.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Fulfillment Tracking */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Fulfillment & Tracking</h3>
            </div>
            <div className="mt-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fulfillment Status:</span>
                <span className="font-semibold capitalize text-foreground">
                  {targetPackage.status}
                </span>
              </div>
              {targetPackage.carrier && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carrier:</span>
                  <span className="font-semibold text-foreground">{targetPackage.carrier}</span>
                </div>
              )}
              {targetPackage.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Number:</span>
                  <span className="font-mono font-semibold text-primary">
                    {targetPackage.trackingNumber}
                  </span>
                </div>
              )}
              {targetPackage.dispatchedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatched:</span>
                  <span className="text-foreground">
                    {new Date(targetPackage.dispatchedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex justify-between text-sm font-bold">
                <span>Package Total:</span>
                <span className="text-foreground">{formatMoneyMinor(targetPackage.subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Fulfill & Dispatch Package</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="mt-4 space-y-4">
              {modalError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {modalError}
                </div>
              )}

              <div>
                <label
                  htmlFor="modalCarrier"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Shipping Carrier *
                </label>
                <select
                  id="modalCarrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="FedEx Ground">FedEx Ground</option>
                  <option value="UPS Next Day Air">UPS Next Day Air</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="modalTracking"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Carrier Tracking Number *
                </label>
                <input
                  id="modalTracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="modalNotes"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Internal Notes
                </label>
                <textarea
                  id="modalNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={dispatching}>
                  {dispatching && <Spinner size="sm" className="mr-2" />}
                  Confirm Dispatch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
