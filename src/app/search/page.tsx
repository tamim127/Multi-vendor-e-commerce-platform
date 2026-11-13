import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';

export const metadata: Metadata = {
  title: 'Search Products | Aureon Marketplace',
  description: 'Search across 40,000+ catalog products, verified merchants, and brands.',
};

export default function SearchRoutePage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#F6F8FB] dark:bg-[#070708] min-h-screen py-6 md:py-8">
        <React.Suspense
          fallback={
            <div className="container mx-auto px-4 py-8">
              <PlpSkeleton />
            </div>
          }
        >
          <ProductDiscoveryPage />
        </React.Suspense>
      </div>
    </AppShell>
  );
}
