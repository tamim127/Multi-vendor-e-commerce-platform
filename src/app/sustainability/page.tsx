'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Leaf,
  Recycle,
  Sun,
  TreePine,
  Boxes,
} from 'lucide-react';

const METRICS = [
  { value: '100%', label: 'Carbon Offset Ground Delivery', sub: 'Every kilometer calculated & retired' },
  { value: '88%', label: 'Plastic-Free Packaging', sub: 'FSC-certified biodegradable corrugate' },
  { value: '45,000+', label: 'Trees Planted Annually', sub: 'In partnership with Eden Reforestation' },
  { value: '100%', label: 'Ethical Labor Audits', sub: 'Zero-tolerance forced or underpaid labor' },
];

export default function SustainabilityPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Leaf className="h-4 w-4 text-emerald-400" />
              <span>Environmental & Social Governance (ESG)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Responsible Commerce for a Sustainable World
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Global commerce shouldn’t cost the earth. At Aureon, sustainability is woven into our platform
              architecture, fulfillment logistics, and merchant standards.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 text-center space-y-1 hover:border-emerald-400/40 transition-colors"
              >
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">{m.value}</div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">{m.label}</div>
                <div className="text-[11px] text-[#71717A]">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Detailed Commitments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <div className="size-10 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center">
                <Sun className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Renewable Energy Fulfillment</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Our tier-1 regional fulfillment hubs run on 100% renewable solar and geothermal energy. We
                actively assist independent merchants with green energy transition subsidies.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <div className="size-10 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% Circular Packaging</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                All Aureon Fulfilled shipments use certified recyclable cardboard, water-based non-toxic inks,
                and water-activated paper tape. Zero single-use styrofoam or non-biodegradable air bubbles.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <div className="size-10 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center">
                <Recycle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Certified Refurbished Circular Hub</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                We empower customers to buy certified refurbished electronics and luxury fashion, keeping
                valuable hardware in circulation and preventing over 120 metric tons of e-waste every year.
              </p>
            </div>
          </div>

          {/* Ethical Vendor Charter */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TreePine className="h-5 w-5 text-emerald-400" />
              The Aureon Ethical Merchant Charter
            </h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Every seller registered on Aureon commits in writing to our Supplier Code of Conduct. We require
              safe working conditions, fair living wages, and complete ban on hazardous manufacturing substances.
              Independent third-party audits are conducted annually.
            </p>
            <div className="pt-2">
              <Link
                href="/compliance"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Review Our Full Compliance and Human Rights Standards &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
