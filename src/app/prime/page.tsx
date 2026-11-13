import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Crown, Truck, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aureon Prime Membership | VIP Commerce Benefits',
  description: 'Join Aureon Prime for free unlimited express shipping, exclusive member discounts, and VIP trade perks.',
};

export default function PrimeMembershipPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#17130B] via-[#211A0E] to-[#120E08] p-8 sm:p-14 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-950 px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-md">
                <Crown className="h-4 w-4" />
                <span>Aureon Prime VIP</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Everything you love about shopping, <span className="text-amber-400">elevated.</span>
              </h1>

              <p className="text-base text-[#D1D5DB] leading-relaxed">
                Enjoy unlimited free express shipping, member-exclusive pricing drops, 24/7 dedicated concierge support, and early access to global flash clearance sales.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm px-8 py-3.5 shadow-lg shadow-amber-400/25 transition-all cursor-pointer"
                >
                  Start 30-Day Free Trial
                </button>
                <span className="text-xs text-slate-600 dark:text-[#9CA3AF]">Then $12.99/month. Cancel anytime.</span>
              </div>
            </div>
          </div>

          {/* Core Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free Express Shipping</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Unlimited 1-2 business day delivery on over 2 million Prime-eligible items with zero minimum order requirement.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">30-Minute Early Access</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Be the first to claim high-demand flash deals, limited inventory drops, and Black Friday promotional events.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">VIP Concierge & Returns</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Dedicated priority customer care phone line and hassle-free instant refunds with prepaid pickup at your doorstep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
