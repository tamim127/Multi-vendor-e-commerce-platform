import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerInventoryView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Inventory Management | Marketplace Seller Central',
  description: 'Track SKU availability, location, and stock alert levels.',
};

export default function SellerInventoryPage(): React.JSX.Element {
  return (
    <SellerLayout
      title="Inventory Matrix"
      subtitle="Monitor SKU stock, warehouse locations, and trigger inventory replenishment."
    >
      <SellerInventoryView />
    </SellerLayout>
  );
}
