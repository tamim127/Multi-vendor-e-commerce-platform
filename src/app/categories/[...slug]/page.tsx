import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug
    .map((s) => s.replace(/-/g, ' '))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' · ');

  return {
    title: `${categoryName} | Aureon Marketplace`,
    description: `Browse verified ${categoryName} products from top merchants on Aureon.`,
  };
}

export default function CategoryCatchAllPage(): React.JSX.Element {
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
