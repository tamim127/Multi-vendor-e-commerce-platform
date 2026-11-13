import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'New Arrivals & Latest Drops | Aureon Marketplace',
  description: 'Discover the newest products, flagship electronics, and fresh season arrivals.',
};

export default function NewArrivalsPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-gradient-to-r from-[#0C0C0E] via-[#140F16] to-[#0B0B0D] border-b border-[#27272A] py-10 px-4 sm:px-8 text-white">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-500/30 px-3.5 py-1 text-xs font-bold text-purple-300">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Just Dropped • Fresh Catalog Additions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            New Arrivals & Next-Gen Releases
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-xl">
            Explore newly launched hardware, designer collections, and innovative lifestyle solutions newly listed on the platform.
          </p>
        </div>
      </div>

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
