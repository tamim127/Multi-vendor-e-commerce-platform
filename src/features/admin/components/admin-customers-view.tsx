'use client';

/**
 * ==============================================================================
 * ADMIN CUSTOMERS MANAGEMENT VIEW
 * ==============================================================================
 * Registered buyer directory, search, filter, status moderation (active/suspended),
 * total spending summary, and customer detail navigation.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { CustomerAccountStatus } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Search, Filter, ShieldAlert, CheckCircle2, Eye, UserX, UserCheck } from 'lucide-react';

export function AdminCustomersView(): React.JSX.Element {
  const { customers, moderateCustomer, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerAccountStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canModerate = hasPermission('customers:moderate');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const handleToggleStatus = async (
    customerId: string,
    currentStatus: CustomerAccountStatus
  ): Promise<void> => {
    setUpdatingId(customerId);
    const newStatus: CustomerAccountStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await moderateCustomer(
        customerId,
        newStatus,
        `Admin action: set account status to ${newStatus}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or email..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | CustomerAccountStatus)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="all">All Accounts ({customers.length})</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer Identity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Lifetime Orders</th>
                <th className="px-4 py-3">Total Spend</th>
                <th className="px-4 py-3">Member Since</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        <Link
                          href={`/admin/customers/${cust.id}`}
                          className="hover:underline text-primary"
                        >
                          {cust.firstName} {cust.lastName}
                        </Link>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{cust.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {cust.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                          <ShieldAlert className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {cust.totalOrders} order{cust.totalOrders === 1 ? '' : 's'}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {formatMinorToCurrency(cust.totalSpentMinor, 'USD')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(cust.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/customers/${cust.id}`}>
                          <Button variant="tertiary" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Profile
                          </Button>
                        </Link>

                        {canModerate && (
                          <Button
                            variant={cust.status === 'active' ? 'tertiary' : 'secondary'}
                            size="sm"
                            disabled={updatingId === cust.id}
                            onClick={() => handleToggleStatus(cust.id, cust.status)}
                            className={
                              cust.status === 'active'
                                ? 'text-destructive hover:bg-destructive/10'
                                : ''
                            }
                          >
                            {cust.status === 'active' ? (
                              <>
                                <UserX className="mr-1 h-3.5 w-3.5" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                Reactivate
                              </>
                            )}
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
