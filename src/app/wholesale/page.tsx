import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Building2, Package, ShieldCheck, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'B2B Wholesale & Enterprise Trade Desk | Aureon Marketplace',
  description: 'Source bulk commercial products directly from verified manufacturers with volume discounts and flexible payment terms.',
};

export default function WholesalePage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="border-b border-[#1E1E24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 mb-3">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Aureon B2B Direct Trade</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Enterprise Bulk Sourcing & Wholesale
            </h1>
            <p className="mt-2 text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
              Connect directly with verified Tier-1 manufacturers. Volume pricing, customized RFQ bidding, corporate purchase orders, and multi-destination freight logistics.
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#27272A] bg-[#121216] p-6 space-y-3">
              <Package className="h-8 w-8 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Tiered Quantity Pricing</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Save up to 45% on volume orders over 50 units. Automated invoice generation with corporate tax ID support.
              </p>
            </div>

            <div className="rounded-3xl border border-[#27272A] bg-[#121216] p-6 space-y-3">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Escrow Payment Protection</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Funds are held in secure platform escrow until physical cargo inspection and customs release are confirmed.
              </p>
            </div>

            <div className="rounded-3xl border border-[#27272A] bg-[#121216] p-6 space-y-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Customized RFQ Desk</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Submit custom bill of materials (BOM) and receive competitive bids from certified vendors within 24 hours.
              </p>
            </div>
          </div>

          {/* RFQ Callout */}
          <div className="rounded-3xl border border-[#27272A] bg-gradient-to-r from-[#141418] via-[#1A1813] to-[#121216] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Ready to source at scale?</h3>
              <p className="text-xs text-[#9CA3AF] max-w-lg">
                Speak directly with an Aureon Trade Specialist to discuss custom freight agreements, net-30 terms, and container logistics.
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs px-6 py-3.5 shadow-lg shadow-amber-400/20 shrink-0 transition-all"
            >
              Request Enterprise Quote
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
