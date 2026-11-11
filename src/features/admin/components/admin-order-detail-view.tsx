'use client';

/**
 * ==============================================================================
 * ADMIN ORDER DETAIL & FULFILLMENT OVERSIGHT VIEW
 * ==============================================================================
 * Multi-vendor split package inspection, recipient details, tracking information,
 * and internal administrative timeline logs.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { ArrowLeft, Truck, MapPin, Plus } from 'lucide-react';

export interface AdminOrderDetailViewProps {
  orderId: string;
}

export function AdminOrderDetailView({ orderId }: AdminOrderDetailViewProps): React.JSX.Element {
  const { orders, orderTimelineNotes, addOrderTimelineNote, hasPermission } = useAdmin();

  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canWrite = hasPermission('orders:write');

  const order = orders.find((o) => o.orderId === orderId) || DEMO_ORDERS[0]!;
  const customNotes = orderTimelineNotes[orderId] || [];

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    try {
      await addOrderTimelineNote(orderId, noteText.trim());
      setNoteText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Order Directory
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order #{order.orderId}
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary uppercase">
              {order.status}
            </span>
          </div>

          <div className="text-sm font-mono text-muted-foreground">
            Placed: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Vendor Packages & Products */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vendor Split Packages */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Multi-Vendor Packages ({order.vendorPackages?.length || 1})
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              {order.vendorPackages?.map((pkg, idx) => (
                <div
                  key={pkg.sellerId || idx}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                    <div>
                      <span className="font-bold text-foreground">
                        Package {idx + 1}: {pkg.sellerName}
                      </span>
                      <span className="ml-2 font-mono text-muted-foreground">({pkg.sellerId})</span>
                    </div>
                    <span className="rounded bg-secondary px-2 py-0.5 font-semibold text-[11px] uppercase">
                      {pkg.deliveryMethod} · {pkg.estimatedDays}
                    </span>
                  </div>

                  <div className="mt-3 divide-y divide-border">
                    {pkg.items.map((item, itemIdx) => {
                      const title =
                        typeof item.title === 'object' ? item.title.en : String(item.title);
                      return (
                        <div
                          key={itemIdx}
                          className="py-2.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-foreground">{title}</div>
                            {item.sku && (
                              <div className="text-[11px] text-muted-foreground font-mono">
                                SKU: {item.sku}
                              </div>
                            )}
                            <div className="text-[11px] text-muted-foreground font-mono">
                              Qty: {item.quantity} ×{' '}
                              {formatMinorToCurrency(
                                item.unitPrice.amountMinor,
                                item.unitPrice.currency
                              )}
                            </div>
                          </div>

                          <div className="font-mono font-bold text-foreground">
                            {formatMinorToCurrency(
                              item.lineTotal.amountMinor,
                              item.lineTotal.currency
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-t border-border pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Subtotal:{' '}
                      {formatMinorToCurrency(pkg.subtotal.amountMinor, pkg.subtotal.currency)}
                    </span>
                    <span>
                      Shipping:{' '}
                      {formatMinorToCurrency(pkg.shippingFee.amountMinor, pkg.shippingFee.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Destination */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Delivery Destination & Customer
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground">Recipient Name</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {order.shippingAddress.fullName}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Contact Phone</span>
                <p className="font-mono text-foreground mt-0.5">
                  {order.shippingAddress.phoneNumber || 'N/A'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Shipping Street Address</span>
                <p className="text-foreground mt-0.5">
                  {order.shippingAddress.streetAddress}
                  {order.shippingAddress.streetAddress2
                    ? `, ${order.shippingAddress.streetAddress2}`
                    : ''}
                  , {order.shippingAddress.city}, {order.shippingAddress.stateOrProvince}{' '}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.countryCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Summary & Timeline Notes */}
        <div className="space-y-6">
          {/* Financial Breakdown */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Financial Breakdown</h2>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  {formatMinorToCurrency(order.itemsSubtotal.amountMinor, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fees</span>
                <span className="font-mono font-medium text-foreground">
                  {formatMinorToCurrency(order.shippingTotal.amountMinor, order.currency)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                <span>Grand Total</span>
                <span className="font-mono text-primary">
                  {formatMinorToCurrency(order.grandTotal.amountMinor, order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Internal Compliance Notes */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Administrative Notes & Timeline</h2>

            <div className="mt-4 space-y-3">
              {order.trackingEvents?.map((evt, idx) => (
                <div key={idx} className="border-l-2 border-primary/40 pl-3 text-xs">
                  <div className="font-semibold text-foreground">{evt.status}</div>
                  <div className="text-[11px] text-muted-foreground">{evt.description}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {evt.timestamp}
                  </div>
                </div>
              ))}

              {customNotes.map((evt) => (
                <div key={evt.id} className="border-l-2 border-amber-500 pl-3 text-xs">
                  <div className="font-bold text-amber-600 dark:text-amber-400">
                    {evt.actor} (Admin Note)
                  </div>
                  <div className="text-foreground mt-0.5">{evt.note}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {new Date(evt.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {canWrite && (
              <form onSubmit={handleAddNote} className="mt-5 border-t border-border pt-4 text-xs">
                <label className="font-medium text-foreground">Add Internal Oversight Note</label>
                <textarea
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record carrier communication or customer resolution note..."
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-foreground"
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Record Note
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
