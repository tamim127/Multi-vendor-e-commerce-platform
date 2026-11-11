import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminRefundsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Refund Claims | Admin Platform',
  description: 'Manage customer refund claims, reason codes, and monetary approvals.',
};

export default function AdminRefundsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="refunds:read">
        <AdminLayout
          title="Refund Claims Management"
          subtitle="Triage customer refund claims, evaluate return evidence, and process simulated settlements."
        >
          <AdminRefundsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
