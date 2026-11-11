import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminOrdersView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Order Supervision | Admin Platform',
  description:
    'Supervise platform-wide customer orders, split vendor shipments, and order statuses.',
};

export default function AdminOrdersPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="orders:read">
        <AdminLayout
          title="Marketplace Order Oversight"
          subtitle="Real-time monitoring of customer checkouts, vendor fulfillment split packages, and delivery SLAs."
        >
          <AdminOrdersView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
