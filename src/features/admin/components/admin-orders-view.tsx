'use client';

/**
 * ==============================================================================
 * ADMIN ORDERS OVERSIGHT VIEW
 * ==============================================================================
 * Platform-wide marketplace order supervision, status filtering, buyer context,
 * and order inspection.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { CustomerOrderStatus } from '@/domains/customer/types/order';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, Eye, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export function AdminOrdersView(): React.JSX.Element {
  const { orders } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerOrderStatus>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: CustomerOrderStatus): React.JSX.Element => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Truck className="h-3 w-3" /> Dispatched
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by Order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Order Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | CustomerOrderStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer Recipient</th>
                <th className="px-4 py-3">Packages</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${ord.orderId}`}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {ord.orderId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        {ord.shippingAddress.fullName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {ord.shippingAddress.city}, {ord.shippingAddress.countryCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {ord.vendorPackages?.length || 1} vendor package(s)
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {formatMinorToCurrency(ord.grandTotal.amountMinor, ord.currency)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ord.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${ord.orderId}`}>
                        <Button variant="tertiary" size="sm">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Supervise
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
