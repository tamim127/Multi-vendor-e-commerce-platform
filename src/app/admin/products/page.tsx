import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminProductsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Catalog Moderation | Admin Platform',
  description: 'Moderate marketplace products, specifications, and multi-vendor seller offers.',
};

export default function AdminProductsPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="catalog:read">
        <AdminLayout
          title="Catalog & Product Moderation"
          subtitle="Supervise canonical catalog products, listings compliance, and seller offers."
        >
          <AdminProductsView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
