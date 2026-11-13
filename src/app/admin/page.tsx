import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminDashboardView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Platform Administration | Aureon Marketplace',
  description: 'Enterprise operations, GMV velocity, catalog moderation, and merchant management.',
};

export default function AdminDashboardPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="analytics:read">
      <AdminLayout>
        <AdminDashboardView />
      </AdminLayout>
    </AdminGuard>
  );
}
