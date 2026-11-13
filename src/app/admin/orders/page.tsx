import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminOrdersView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Order Supervision | Admin Platform',
  description: 'Oversee multi-vendor orders, fulfillment status, and split shipment packages.',
};

export default function AdminOrdersPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="orders:read">
      <AdminLayout
        title="Order Supervision & Fulfillment"
        subtitle="Monitor multi-vendor customer orders, shipping addresses, and package dispatch statuses."
      >
        <AdminOrdersView />
      </AdminLayout>
    </AdminGuard>
  );
}
