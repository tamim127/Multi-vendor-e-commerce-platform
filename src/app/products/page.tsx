import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';

export const metadata: Metadata = {
  title: 'Products | Marketplace',
  description: 'Browse marketplace products by category, brand, and specifications.',
};

export default function ProductsRoutePage(): React.JSX.Element {
  return (
    <AppShell>
      <React.Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <PlpSkeleton />
          </div>
        }
      >
        <ProductDiscoveryPage />
      </React.Suspense>
    </AppShell>
  );
}
