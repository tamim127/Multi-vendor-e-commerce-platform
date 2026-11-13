import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { ProductDiscoveryPage } from '@/features/catalog-discovery/components/product-discovery-page';
import { PlpSkeleton } from '@/features/catalog-discovery/components/plp-states';
import { Flame, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: "Today's Deals & Flash Clearance | Aureon Marketplace",
  description: 'Limited-time deals, clearance offers, and exclusive markdowns up to 70% off.',
};

export default function DealsPage(): React.JSX.Element {
  return (
    <AppShell>
      {/* Deals Hero Banner */}
      <div className="bg-gradient-to-r from-[#0C0C0E] via-[#161208] to-[#0B0B0D] border-b border-slate-200 dark:border-[#27272A] py-10 px-4 sm:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>Flash Clearance • Up to 70% Off</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Today&apos;s Special Deals & Offers
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9CA3AF] max-w-xl">
              Verified clearance markdowns from premier international merchants. All deals are backed by the Aureon Authenticity Guarantee.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Clock className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Prices refresh daily
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Hurry, while stocks last!</span>
            </div>
          </div>
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
