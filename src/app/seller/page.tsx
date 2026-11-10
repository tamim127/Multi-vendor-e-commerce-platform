import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerLayout, SellerDashboardView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Seller Dashboard | Marketplace Seller Central',
  description: 'Manage your commercial store, orders, catalog offers, and inventory.',
};

export default function SellerDashboardPage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerLayout
        title="Seller Central Dashboard"
        subtitle="Overview of your store revenue, packages, and inventory health."
      >
        <SellerDashboardView />
      </SellerLayout>
    </AppShell>
  );
}
