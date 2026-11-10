'use client';

/**
 * ==============================================================================
 * SELLER ORDERS MANAGEMENT VIEW
 * ==============================================================================
 * Multi-vendor order fulfillment dashboard.
 * Displays seller-specific order packages, customer delivery addresses, line items,
 * and dispatch workflows with carrier tracking assignment.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import type { SellerOrderPackage } from '@/domains/seller/types/order';
import { DispatchPackageSchema } from '@/domains/seller/schemas/inventory.schema';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Truck, Search, Clock, CheckCircle2, X, Send } from 'lucide-react';

export function SellerOrdersView(): React.JSX.Element {
  const { packages, dispatchPackage } = useSeller();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unfulfilled' | 'shipped' | 'delivered'>(
    'all'
  );
  const [dispatchingPackage, setDispatchingPackage] = useState<SellerOrderPackage | null>(null);

  // Dispatch Modal State
  const [carrier, setCarrier] = useState('FedEx Ground');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.packageId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      return pkg.status === statusFilter;
    }

    return true;
  });

  const openDispatchModal = (pkg: SellerOrderPackage): void => {
    setDispatchingPackage(pkg);
    setCarrier('FedEx Ground');
    setTrackingNumber(`TRK-${Date.now().toString().slice(-8)}`);
    setNotes('');
    setDispatchError(null);
  };

  const handleDispatchSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!dispatchingPackage) return;
    setDispatchError(null);

    const payload = {
      packageId: dispatchingPackage.packageId,
      carrier,
      trackingNumber,
      notes: notes || undefined,
    };

    const validation = DispatchPackageSchema.safeParse(payload);
    if (!validation.success) {
      setDispatchError(validation.error.issues[0]?.message || 'Invalid dispatch info');
      return;
    }

    setDispatching(true);
    try {
      await dispatchPackage(validation.data);
      setDispatchingPackage(null);
    } catch (err: unknown) {
      setDispatchError(err instanceof Error ? err.message : 'Failed to dispatch package');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Package ID, Order ID, or Customer Name..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center rounded-xl border border-input bg-background p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unfulfilled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'unfulfilled'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'shipped'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Shipped
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'delivered'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Packages Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Package & Order</th>
                <th className="px-6 py-3.5">Customer & Destination</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Subtotal</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No order packages found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.packageId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-semibold text-foreground">
                          {pkg.packageId}
                        </span>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Order: <span className="font-mono">{pkg.orderId}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                          {new Date(pkg.orderCreatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">
                          {pkg.shippingAddress.fullName}
                        </p>
                        <p className="text-muted-foreground">
                          {pkg.shippingAddress.city}, {pkg.shippingAddress.state}{' '}
                          {pkg.shippingAddress.country}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-medium text-foreground">
                          {pkg.items.length} item(s)
                        </span>
                        <p className="text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                          {pkg.items.map((i) => i.title).join(', ')}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground">
                        {formatMoneyMinor(pkg.subtotal)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            pkg.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : pkg.status === 'shipped'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {pkg.status === 'delivered' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : pkg.status === 'shipped' ? (
                            <Truck className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {pkg.status}
                        </span>
                        {pkg.trackingNumber && (
                          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                            {pkg.carrier}: {pkg.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pkg.status === 'unfulfilled' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openDispatchModal(pkg)}
                            className="h-8 text-xs"
                          >
                            <Send className="mr-1 h-3 w-3" />
                            {t('seller.dispatchOrder')}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild className="h-8 text-xs">
                          <Link href={`/seller/orders/${pkg.packageId}`}>Details</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Order Modal */}
      {dispatchingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Fulfill & Dispatch Package</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  Package: {dispatchingPackage.packageId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchingPackage(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-4 space-y-4">
              {dispatchError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {dispatchError}
                </div>
              )}

              <div>
                <label
                  htmlFor="carrier"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Shipping Carrier *
                </label>
                <select
                  id="carrier"
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
                  htmlFor="trackingNumber"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Carrier Tracking Number *
                </label>
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 794829103810"
                  className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="dispatchNotes"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Internal Dispatch Notes
                </label>
                <textarea
                  id="dispatchNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dock pickup reference or seal number..."
                  className="mt-1 block w-full rounded-xl border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setDispatchingPackage(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={dispatching}>
                  {dispatching && <Spinner size="sm" className="mr-2" />}
                  Confirm Shipment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
