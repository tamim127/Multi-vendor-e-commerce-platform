import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminCustomersView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Customer Directory | Admin Platform',
  description: 'Manage buyer identities, lifetime orders, and compliance moderation.',
};

export default function AdminCustomersPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="customers:read">
      <AdminLayout
        title="Customer Directory & Accounts"
        subtitle="Manage customer profiles, lifetime purchases, and account access statuses."
      >
        <AdminCustomersView />
      </AdminLayout>
    </AdminGuard>
  );
}
