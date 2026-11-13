import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminRefundsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Refund Claims | Admin Platform',
  description: 'Process customer refund requests, dispute claims, and settlement workflows.',
};

export default function AdminRefundsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="refunds:read">
      <AdminLayout
        title="Refund Claims & Dispute Center"
        subtitle="Review customer return requests, inspect refund claims, and execute settlement authorizations."
      >
        <AdminRefundsView />
      </AdminLayout>
    </AdminGuard>
  );
}
