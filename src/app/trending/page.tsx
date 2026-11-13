import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';
import { TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trending Products Today | Aureon Marketplace',
  description: 'Most popular and highly-rated products trending on Aureon Marketplace this week.',
};

export default function TrendingPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-gradient-to-r from-[#0C0C0E] via-[#10141A] to-[#0B0B0D] border-b border-slate-200 dark:border-[#27272A] py-10 px-4 sm:px-8 text-white">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 text-xs font-bold text-blue-300">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Community Most Loved</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Trending Marketplace Favorites
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9CA3AF] max-w-xl">
            Real-time popular items based on shopper volume, 5-star verified buyer reviews, and seller velocity.
          </p>
        </div>
      </div>

      <div className="bg-[#F6F8FB] dark:bg-slate-50 dark:bg-[#070708] min-h-screen py-6 md:py-8">
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
