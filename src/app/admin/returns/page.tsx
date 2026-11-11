import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminReturnsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Physical Returns | Admin Platform',
  description:
    'Manage physical customer product returns, inbound tracking, and warehouse inspection.',
};

export default function AdminReturnsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="refunds:read">
        <AdminLayout
          title="Physical Return Requests"
          subtitle="Supervise physical package returns, inspection checkpoints, and restock authorization."
        >
          <AdminReturnsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
