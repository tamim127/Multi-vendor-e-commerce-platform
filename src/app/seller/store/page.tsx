import * as React from 'react';
import type { Metadata } from 'next';
import { SellerLayout, SellerStoreView } from '@/features/seller';

export const metadata: Metadata = {
  title: 'Store Settings | Marketplace Seller Central',
  description: 'Manage storefront identity, policies, and support contact information.',
};

export default function SellerStorePage(): React.JSX.Element {
  return (
    <SellerLayout>
      <SellerStoreView />
    </SellerLayout>
  );
}
