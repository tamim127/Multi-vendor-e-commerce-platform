import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerAnalyticsView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Merchant Analytics | Marketplace Seller Central',
  description: 'Track store sales velocity, revenue trends, and operational performance.',
};

export default function SellerAnalyticsPage(): React.JSX.Element {
  return (
    <SellerLayout>
      <SellerAnalyticsView />
    </SellerLayout>
  );
}
