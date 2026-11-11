'use client';

/**
 * ==============================================================================
 * ADMIN RETURNS MANAGEMENT VIEW
 * ==============================================================================
 * Physical return package requests, SKU tracking, warehouse inspection statuses,
 * and completion workflows.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { ReturnStatus } from '@/domains/admin';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, Clock, Package } from 'lucide-react';

export function AdminReturnsView(): React.JSX.Element {
  const { returns, reviewReturn, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReturnStatus>('all');
  const [submitting, setSubmitting] = useState(false);

  const canProcess = hasPermission('refunds:process');

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.sellerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [returns, search, statusFilter]);

  const handleStatusChange = async (returnId: string, status: ReturnStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await reviewReturn(returnId, status, `Admin updated return status to ${status}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReturnStatus): React.JSX.Element => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Package className="h-3 w-3" /> Received at Hub
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            <CheckCircle2 className="h-3 w-3" /> Approved (In Transit)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pending Authorization
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <XCircle className="h-3 w-3" /> Rejected
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
            placeholder="Search return requests by ID, order, customer, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReturnStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Returns ({returns.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Return ID / Order</th>
                <th className="px-4 py-3">Customer & Seller</th>
                <th className="px-4 py-3">Returned Line Items</th>
                <th className="px-4 py-3">Reason Code</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No physical return requests found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-foreground">{ret.id}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <Link
                          href={`/admin/orders/${ret.orderId}`}
                          className="text-primary hover:underline"
                        >
                          {ret.orderId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{ret.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">{ret.sellerName}</div>
                    </td>
                    <td className="px-4 py-3">
                      {ret.items.map((it, idx) => (
                        <div key={idx} className="font-medium text-foreground">
                          {it.productName}{' '}
                          <span className="font-mono text-muted-foreground">
                            (Qty: {it.quantity})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                        {ret.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {ret.trackingNumber || 'Awaiting Shipment'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ret.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canProcess && ret.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'approved')}
                          >
                            Authorize Return
                          </Button>
                        )}

                        {canProcess && ret.status === 'approved' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'received')}
                          >
                            Mark Received
                          </Button>
                        )}

                        {canProcess && ret.status === 'received' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleStatusChange(ret.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
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
