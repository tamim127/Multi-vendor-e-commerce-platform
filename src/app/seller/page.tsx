import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerDashboardView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Seller Dashboard | Aureon Seller Central',
  description: 'Manage your commercial store, orders, catalog offers, and inventory.',
};

export default function SellerDashboardPage(): React.JSX.Element {
  return (
    <SellerLayout>
      <SellerDashboardView />
    </SellerLayout>
  );
}
