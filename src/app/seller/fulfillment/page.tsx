'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Boxes,
  ShieldCheck,
  Zap,
  Globe2,
  ArrowRight,
  Clock,
} from 'lucide-react';

const HUBS = [
  { region: 'North America Hub (East)', location: 'Newark, NJ, USA', capacity: '250,000 sq ft', coverage: 'Next-Day to 75M clients' },
  { region: 'North America Hub (West)', location: 'Ontario, CA, USA', capacity: '300,000 sq ft', coverage: 'Same-Day Bay Area & SoCal' },
  { region: 'European Union Central Hub', location: 'Frankfurt, Germany', capacity: '400,000 sq ft', coverage: '24–48h across 27 EU nations' },
  { region: 'Asia-Pacific Gateway Hub', location: 'Changi Logistics Park, Singapore', capacity: '200,000 sq ft', coverage: 'Priority courier across ASEAN & JP' },
];

export default function SellerFulfillmentPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Boxes className="h-4 w-4 text-amber-400" />
              <span>Aureon Fulfilled Logistics (AFL)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Enterprise Warehousing & 1-Day Prime Delivery
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Focus on creating exceptional products while Aureon handles end-to-end warehousing, pick-and-pack,
              customs-cleared international dispatch, and reverse logistics.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/seller/register"
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 inline-flex items-center gap-2"
              >
                Enroll Your Catalog in AFL
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/seller/hub"
                className="rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-5 py-2.5 text-xs font-bold text-slate-900 dark:text-white hover:border-amber-400/50 transition-colors"
              >
                View Logistics Guidelines
              </Link>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-3">
              <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Unlock Aureon Prime Badge</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Products stored with AFL automatically display the gold Aureon Prime badge, boosting your
                search impression share and driving up to 3.4x higher conversion.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-3">
              <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">2-Hour Pick & Pack SLA</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Orders received before 4:00 PM local time are dispatched the very same afternoon with automated
                tracking scans pushed instantly to customer SMS and email.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-3">
              <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">100% Damage & Loss Cover</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Your inventory is fully insured in our climate-controlled facilities. Any transit damage or
                carrier mishandling is reimbursed at full retail value within 24 hours.
              </p>
            </div>
          </div>

          {/* Regional Hubs Directory */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-[#1F1F24]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-amber-400" />
                Global Fulfillment Infrastructure
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-1">
                Strategic multimodal logistics nodes connecting North America, Europe, and Asia-Pacific.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1F1F24]">
              {HUBS.map((hub) => (
                <div key={hub.region} className="p-6 space-y-2 hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{hub.region}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-semibold">{hub.location}</p>
                  <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">{hub.coverage}</p>
                  <div className="pt-2 text-[11px] text-slate-500 dark:text-[#71717A] flex items-center gap-1.5">
                    <Boxes className="h-3.5 w-3.5" />
                    <span>{hub.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compare Fulfillment Methods</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#27272A] text-[#A1A1AA] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4 text-amber-400">AFL (Aureon Fulfilled)</th>
                    <th className="py-3 px-4">Merchant Self-Fulfill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F24] text-[#D4D4D8]">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-white">Aureon Prime Badge</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Guaranteed on all SKUs</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#71717A]">Requires 99.8% on-time metric</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-white">Transit Speed</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Same-Day / Next-Day</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#71717A]">3–7 Business Days</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-white">Customer Support</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Managed 24/7 by Aureon</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#71717A]">Managed by seller staff</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-white">Return Processing</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Auto-inspected & restocked</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#71717A]">Manual RMA inspection</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
