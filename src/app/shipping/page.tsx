'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Truck,
  Globe2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PackageCheck,
  Plane,
  HelpCircle,
} from 'lucide-react';

const SHIPPING_TIERS = [
  {
    name: 'Aureon Prime Delivery',
    time: 'Next-Day / 1-2 Business Days',
    cost: 'FREE with Prime',
    desc: 'Priority order fulfillment from nearest regional fulfillment centers for all eligible items.',
    badge: 'Fastest',
    badgeClass: 'bg-amber-400 text-slate-950',
  },
  {
    name: 'Standard Ground Express',
    time: '3–5 Business Days',
    cost: '$4.99 (Free over $50)',
    desc: 'Fully tracked door-to-door delivery with carbon-neutral ground transport.',
    badge: 'Most Popular',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
  {
    name: 'International Air Priority',
    time: '5–9 Business Days',
    cost: '$14.99 flat rate',
    desc: 'Delivered Duty Paid (DDP). Customs clearance handled seamlessly with no surprise fees on delivery.',
    badge: 'Global',
    badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
];

const DESTINATIONS = [
  { region: 'United States & Canada', carrier: 'FedEx, UPS, USPS Priority', avgDays: '2–4 days', freeMin: '$50' },
  { region: 'United Kingdom & European Union', carrier: 'DHL Express, DPD', avgDays: '3–5 days', freeMin: '€60' },
  { region: 'Asia-Pacific (JP, SG, AU, NZ)', carrier: 'Yamato, Australia Post, SF Express', avgDays: '4–7 days', freeMin: '$75' },
  { region: 'Middle East & Gulf (UAE, SA)', carrier: 'Aramex, DHL Global', avgDays: '5–8 days', freeMin: '$100' },
  { region: 'Latin America & Rest of World', carrier: 'DHL Express Worldwide', avgDays: '6–10 days', freeMin: '$120' },
];

export default function ShippingPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Truck className="h-4 w-4 text-amber-400" />
              <span>Global Fulfillment & Logistics Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Shipping & Delivery Information
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              Fast, reliable, and transparent shipping to over 160 countries. Real-time GPS tracking and
              customs-cleared priority courier services for every order.
            </p>

            <div className="pt-2">
              <Link
                href="/orders/track"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20"
              >
                <PackageCheck className="h-4 w-4" />
                Track An Existing Shipment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Shipping Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHIPPING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4 relative flex flex-col justify-between hover:border-amber-400/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${tier.badgeClass}`}>
                      {tier.badge}
                    </span>
                    <Clock className="h-4 w-4 text-[#71717A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-amber-400 font-semibold mt-0.5">{tier.time}</p>
                  </div>
                  <div className="text-2xl font-black text-white">{tier.cost}</div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{tier.desc}</p>
                </div>

                <div className="pt-4 border-t border-[#1F1F24] text-[11px] text-[#A1A1AA] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Insured with Aureon Escrow Protection</span>
                </div>
              </div>
            ))}
          </div>

          {/* Destination & Regional Rates Table */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] overflow-hidden">
            <div className="p-6 border-b border-[#1F1F24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-amber-400" />
                  International Coverage & Estimated Transit Times
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Average dispatch timeline across regional customs hubs with certified tier-1 carrier networks.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4D4D8]">
                160+ Countries Supported
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141417] text-[#A1A1AA] uppercase tracking-wider font-bold border-b border-[#1F1F24]">
                  <tr>
                    <th className="py-3.5 px-6">Destination Region</th>
                    <th className="py-3.5 px-6">Logistics Partners</th>
                    <th className="py-3.5 px-6">Typical Transit</th>
                    <th className="py-3.5 px-6 text-right">Free Shipping Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F24] text-[#D4D4D8]">
                  {DESTINATIONS.map((row) => (
                    <tr key={row.region} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">{row.region}</td>
                      <td className="py-4 px-6 text-[#A1A1AA]">{row.carrier}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          {row.avgDays}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-400">{row.freeMin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Shipping Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Customs, Duties & Taxes (DDP)</h3>
                  <p className="text-xs text-[#9CA3AF]">Zero surprise arrival tariffs</p>
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                For international shipments, Aureon supports Delivered Duty Paid (DDP). All relevant VAT,
                customs duties, and import fees are calculated and collected during checkout. No additional
                handling fees or surprise charges will be required upon carrier drop-off.
              </p>
              <ul className="space-y-2 text-xs text-[#D4D4D8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Pre-cleared electronic manifests with local customs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Compliant with EU IOSS and UK HMRC regulations
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Multi-Vendor Shipments</h3>
                  <p className="text-xs text-[#9CA3AF]">Handling independent seller dispatches</p>
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                When purchasing products from multiple independent verified sellers in one checkout cart,
                items ship directly from each respective vendor’s warehouse. You will receive separate
                tracking links and estimated arrival dates for each parcel.
              </p>
              <ul className="space-y-2 text-xs text-[#D4D4D8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Individual parcel tracking per vendor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Unified customer dispute desk and refund resolution
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
