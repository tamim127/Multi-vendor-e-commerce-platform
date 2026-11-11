import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { AdminLayout, AdminGuard, AdminCategoriesView } from '@/features/admin';

export const metadata: Metadata = {
  title: 'Category Taxonomy | Admin Platform',
  description: 'Manage hierarchical product categories and classification trees.',
};

export default function AdminCategoriesPage(): React.JSX.Element {
  return (
    <AppShell>
      <AdminGuard requiredPermission="catalog:read">
        <AdminLayout
          title="Taxonomy & Category Hierarchy"
          subtitle="Organize multi-level product classifications, activate trees, and add taxonomy nodes."
        >
          <AdminCategoriesView />
        </AdminLayout>
      </AdminGuard>
    </AppShell>
  );
}
