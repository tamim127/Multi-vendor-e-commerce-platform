import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerOrdersView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Order Fulfillment | Marketplace Seller Central',
  description: 'Manage customer orders, track package fulfillment, and dispatch shipments.',
};

export default function SellerOrdersPage(): React.JSX.Element {
  return (
    <SellerLayout
      title="Orders & Shipments"
      subtitle="Fulfill customer orders, assign tracking numbers, and manage split packages."
    >
      <SellerOrdersView />
    </SellerLayout>
  );
}
