'use client';

/**
 * ==============================================================================
 * ADMIN CUSTOMER DETAIL VIEW
 * ==============================================================================
 * Deep customer profile inspection, lifetime order history, administrative notes,
 * and account status management (suspension/reactivation).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { CustomerAccountStatus } from '@/domains/admin';
import type { CustomerOrder } from '@/domains/customer/types/order';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';
import { Button } from '@/components/ui/button/button';
import {
  ArrowLeft,
  User,
  ShieldAlert,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface AdminCustomerDetailViewProps {
  customerId: string;
}

export function AdminCustomerDetailView({
  customerId,
}: AdminCustomerDetailViewProps): React.JSX.Element {
  const { customers, moderateCustomer, hasPermission } = useAdmin();

  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canModerate = hasPermission('customers:moderate');

  const customer = customers.find((c) => c.id === customerId) || {
    id: customerId,
    email: 'customer@example.demo',
    firstName: 'Demo',
    lastName: 'Customer',
    phoneNumber: '+1 512-555-0100',
    status: 'active' as CustomerAccountStatus,
    totalOrders: 2,
    totalSpentMinor: 25800,
    joinedAt: '2026-01-10T10:00:00Z',
    notes: ['Initial demo profile created.'],
  };

  const customerOrders: CustomerOrder[] = DEMO_ORDERS.filter(
    (o: CustomerOrder) => !o.customerId || o.customerId === customerId
  );

  const handleStatusChange = async (newStatus: CustomerAccountStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await moderateCustomer(
        customerId,
        newStatus,
        noteInput.trim() ? noteInput : `Administrative status transition to ${newStatus}`
      );
      setNoteInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Customer Directory
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {customer.firstName} {customer.lastName}
            </h1>
            <span className="font-mono text-xs rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground">
              {customer.id}
            </span>
          </div>

          <div>
            {customer.status === 'active' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Suspended Account
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Information & Order History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identity & Contact Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Customer Profile Information</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground">Full Name</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Registered Email</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">{customer.email}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Phone Number</span>
                <p className="font-mono text-foreground mt-0.5">{customer.phoneNumber || 'N/A'}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Account Created</span>
                <p className="text-foreground mt-0.5">
                  {new Date(customer.joinedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Lifetime Completed Orders</span>
                <p className="font-bold text-foreground mt-0.5">{customer.totalOrders}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Gross Spend Volume</span>
                <p className="font-mono font-bold text-primary mt-0.5">
                  {formatMinorToCurrency(customer.totalSpentMinor, 'USD')}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Associated with Customer */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Recent Order History</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {customerOrders.length} records found
              </span>
            </div>

            <div className="mt-4 divide-y divide-border">
              {customerOrders.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No orders placed yet.
                </p>
              ) : (
                customerOrders.map((ord) => (
                  <div key={ord.orderId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <Link
                        href={`/admin/orders/${ord.orderId}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {ord.orderId}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString()} · {ord.itemCount} items
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-foreground">
                        {formatMinorToCurrency(ord.grandTotal.amountMinor, ord.currency)}
                      </div>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Account Moderation */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Account Status Moderation</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Restrict buyer capabilities or manage compliance holds.
            </p>

            {canModerate ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="customer-note" className="text-xs font-medium text-foreground">
                    Administrative Rationale / Internal Note
                  </label>
                  <textarea
                    id="customer-note"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Enter reason for account hold or status update..."
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  {customer.status === 'active' ? (
                    <Button
                      variant="destructive"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleStatusChange('suspended')}
                    >
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Suspend Customer Account
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleStatusChange('active')}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Reactivate Customer Account
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic">
                You do not have permission to moderate customer accounts.
              </p>
            )}
          </div>

          {/* Internal Notes History */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Compliance & Account Notes</h3>
            <div className="mt-3 space-y-2">
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note, idx) => (
                  <div key={idx} className="rounded-lg bg-muted/40 p-2.5 text-xs text-foreground">
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No administrative notes recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
