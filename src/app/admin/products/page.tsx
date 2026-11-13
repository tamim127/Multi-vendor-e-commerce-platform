import * as React from 'react';
import type { Metadata } from 'next';
import { AdminLayout, AdminGuard, AdminProductsView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Catalog Moderation | Admin Platform',
  description: 'Moderate product listings, brand catalogs, and canonical representations.',
};

export default function AdminProductsPage(): React.JSX.Element {
  return (
    <AdminGuard requiredPermission="catalog:read">
      <AdminLayout
        title="Catalog Moderation & Inventory"
        subtitle="Review marketplace product listings, verify category assignments, and moderate active inventory."
      >
        <AdminProductsView />
      </AdminLayout>
    </AdminGuard>
  );
}
