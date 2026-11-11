'use client';

/**
 * ==============================================================================
 * ADMIN REFUND MANAGEMENT VIEW
 * ==============================================================================
 * Buyer refund request queues, reason codes, monetary verification using Money contracts,
 * and simulated settlement decisions.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { RefundStatus } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function AdminRefundsView(): React.JSX.Element {
  const { refunds, reviewRefund, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RefundStatus>('all');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canProcess = hasPermission('refunds:process');

  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.sellerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, search, statusFilter]);

  const handleAction = async (refundId: string, status: RefundStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await reviewRefund(refundId, status, adminNote.trim() || undefined);
      setAdminNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: RefundStatus): React.JSX.Element => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Processed
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pending Review
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
            placeholder="Search refunds by claim ID, order ID, customer, or seller..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | RefundStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Claims ({refunds.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Claim ID / Order</th>
                <th className="px-4 py-3">Customer & Seller</th>
                <th className="px-4 py-3">Refund Amount</th>
                <th className="px-4 py-3">Reason Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No refund claims found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-foreground">{ref.id}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <Link
                          href={`/admin/orders/${ref.orderId}`}
                          className="text-primary hover:underline"
                        >
                          {ref.orderId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{ref.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Seller: {ref.sellerName}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {formatMinorToCurrency(ref.amount.amountMinor, ref.amount.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                        {ref.reason}
                      </span>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {ref.customerNote}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ref.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canProcess && ref.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAction(ref.id, 'approved')}
                              disabled={submitting}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(ref.id, 'rejected')}
                              disabled={submitting}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {canProcess && ref.status === 'approved' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAction(ref.id, 'processed')}
                            disabled={submitting}
                          >
                            Mark Processed
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
