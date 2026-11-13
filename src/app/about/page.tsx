'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Globe2,
  ShieldCheck,
  Zap,
  Award,
  Store,
  CheckCircle2,
} from 'lucide-react';

const STATS = [
  { value: '$480M+', label: 'Annualized Gross Volume', sub: 'Across global trade corridors' },
  { value: '8,240+', label: 'Verified Global Merchants', sub: 'Strictly vetted KYC & quality standards' },
  { value: '160+', label: 'Countries Delivered', sub: 'Seamless DDP international logistics' },
  { value: '99.9%', label: 'Platform Reliability', sub: 'Enterprise-grade microservice architecture' },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Smart Escrow Protection',
    desc: 'Buyers never take on risk. Funds are safely held in protected escrow until merchandise is inspected and verified upon arrival.',
  },
  {
    icon: Store,
    title: 'Independent Merchant Sovereignty',
    desc: 'We provide enterprise tools to artisanal brands, independent manufacturers, and authorized distributors with fair transparent fees.',
  },
  {
    icon: Zap,
    title: 'Next-Gen Commerce Infrastructure',
    desc: 'Real-time catalog synchronization, multi-currency settlement, AI-assisted catalog enrichment, and sub-second search speeds.',
  },
  {
    icon: Globe2,
    title: 'Frictionless Borderless Trade',
    desc: 'Automated customs classification, tax calculation, localized checkout currencies, and integrated international priority shipping.',
  },
];

export default function AboutUsPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Award className="h-4 w-4 text-amber-400" />
              <span>The Next Generation Multi-Vendor Platform</span>
            </div>
            <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Building the Future of Global Verified Commerce
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Aureon was founded to bridge the gap between premium global buyers and world-class independent
              merchants. We combine institutional security, high-velocity logistics, and editorial discovery into
              a seamless marketplace.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 text-center space-y-1 hover:border-amber-400/40 transition-colors"
              >
                <div className="text-3xl sm:text-4xl font-black text-amber-400">{stat.value}</div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">{stat.label}</div>
                <div className="text-[11px] text-[#71717A]">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Mission & Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-sm text-[#9CA3AF] leading-relaxed">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <span>Our Heritage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Reinventing the Marketplace for Discerning Clients
              </h2>
              <p>
                In a crowded e-commerce landscape dominated by uncurated listings, counterfeit merchandise, and
                unpredictable shipping times, Aureon was built with a different philosophy: quality over quantity,
                uncompromising merchant verification, and enterprise-grade escrow security.
              </p>
              <p>
                Whether you are ordering bespoke Italian tailoring, precision Japanese audio equipment, or
                cutting-edge consumer electronics, every item on Aureon is authenticated and backed by our
                guaranteed buyer protections.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/stores"
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
                >
                  Explore Verified Stores
                </Link>
                <Link
                  href="/seller/register"
                  className="rounded-xl bg-[#141417] border border-[#27272A] px-5 py-2.5 text-xs font-bold text-white hover:border-amber-400/50 transition-colors"
                >
                  Become a Merchant Partner
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-white">Why Global Brands & Buyers Choose Aureon</h3>
              <div className="space-y-3.5 text-xs text-[#D4D4D8]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">100% KYC-Verified Merchants:</strong>
                    Every seller submits corporate verification, warehouse origin proof, and product certifications.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Instant Global Payouts:</strong>
                    Merchants in 140+ countries receive automatic multicurrency disbursements in their local currency.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Transparent Fee Structure:</strong>
                    No hidden listing fees or predatory algorithms. We succeed only when our merchants succeed.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Our Platform Principles</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">Engineered from the ground up for trust and scale</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PILLARS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <div key={p.title} className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-3">
                    <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
