import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { MOCK_SELLERS } from '@/domains/catalog/fixtures/sellers.fixture';
import { Store, Star, ShieldCheck, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verified Merchant Stores | Aureon Marketplace',
  description: 'Discover verified independent sellers, global distributors, and flagship storefronts on Aureon.',
};

export default function StoresDirectoryPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="border-b border-[#1E1E24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>KYC Verified Seller Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Verified Marketplace Stores
            </h1>
            <p className="mt-2 text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
              Shop directly from certified multi-vendor stores. Each merchant undergoes stringent identity, business license, and fulfillment quality vetting.
            </p>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_SELLERS.map((seller) => (
              <div
                key={seller.id}
                className="rounded-3xl border border-[#27272A] bg-gradient-to-b from-[#121216] to-[#0D0D10] p-6 shadow-xl flex flex-col justify-between hover:border-amber-400/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Verified Merchant
                    </span>

                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{seller.rating.average.toFixed(1)}</span>
                      <span className="text-[#71717A] text-[10px]">({seller.rating.count})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E1E24] text-white font-bold text-lg border border-[#2B2B32] group-hover:border-amber-400/50 group-hover:scale-105 transition-all">
                      <Store className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {seller.name}
                      </h2>
                      <span className="text-xs text-[#71717A] font-mono">Store ID: {seller.id}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#1E1E24] space-y-2 text-xs text-[#9CA3AF]">
                    <div className="flex items-center justify-between">
                      <span>Fulfillment Mode:</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Truck className="h-3 w-3 text-amber-400" /> Aureon Express
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Handling Time:</span>
                      <span className="font-semibold text-white">Within 24 Hours</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1E1E24]">
                  <Link
                    href={`/store/${seller.slug}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#18181B] hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs py-2.5 border border-[#27272A] transition-all"
                  >
                    <span>Visit Official Storefront</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
