import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { SellerLayout, SellerProductsView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Products & Offers | Marketplace Seller Central',
  description:
    'Manage commercial offers, Buy Box status, and pricing for canonical catalog products.',
};

export default function SellerProductsPage(): React.JSX.Element {
  return (
    <AppShell>
      <SellerLayout
        title="Products & Commercial Offers"
        subtitle="List and adjust prices, conditions, and stock for marketplace products."
      >
        <SellerProductsView />
      </SellerLayout>
    </AppShell>
  );
}
