'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Store,
  BookOpen,
  TrendingUp,
  PackageCheck,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

const GUIDES = [
  {
    icon: Store,
    title: 'Launching Your Storefront',
    desc: 'Step-by-step checklist to configure your brand banner, bio, return policies, and business credentials.',
    readTime: '6 min read',
  },
  {
    icon: PackageCheck,
    title: 'Catalog Optimization & CSV Bulk Upload',
    desc: 'Master product variants, SKU structures, high-resolution imagery standards, and automated CSV uploads.',
    readTime: '8 min read',
  },
  {
    icon: TrendingUp,
    title: 'Marketplace SEO & Search Ranking',
    desc: 'How Aureon’s intelligent search algorithm ranks verified merchant products and maximizes conversions.',
    readTime: '10 min read',
  },
  {
    icon: CreditCard,
    title: 'Multicurrency Settlement & Escrow',
    desc: 'Understand automated escrow release schedules, local currency conversions, and zero-fee bank transfers.',
    readTime: '5 min read',
  },
  {
    icon: Zap,
    title: 'Aureon Fulfilled Logistics (AFL)',
    desc: 'Store inventory in our automated fulfillment centers to unlock 1-Day Aureon Prime badges on your products.',
    readTime: '7 min read',
  },
  {
    icon: ShieldCheck,
    title: 'Authenticity & Dispute Prevention',
    desc: 'Best practices for handling buyer returns, avoiding chargebacks, and maintaining Top-Rated seller status.',
    readTime: '4 min read',
  },
];

export default function SellerHubPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Store className="h-4 w-4 text-amber-400" />
              <span>Merchant Growth Academy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Aureon Seller Resource Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Everything you need to build, scale, and manage a profitable global commerce business on Aureon.
              Curated masterclasses, API documentation, and growth playbooks.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/seller"
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 inline-flex items-center gap-2"
              >
                Go to Seller Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/seller/register"
                className="rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-5 py-2.5 text-xs font-bold text-slate-900 dark:text-white hover:border-amber-400/50 transition-colors"
              >
                Register as a New Seller
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-5 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">8.5%</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1">Average Fee</div>
              <div className="text-[11px] text-slate-500 dark:text-[#71717A]">Industry lowest commission</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-5 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">48 Hours</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1">Escrow Release</div>
              <div className="text-[11px] text-slate-500 dark:text-[#71717A]">Fast merchant liquidity</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-5 text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">140+</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1">Payout Currencies</div>
              <div className="text-[11px] text-slate-500 dark:text-[#71717A]">Local bank wire or crypto</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-5 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">24/7</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1">Dedicated Account Rep</div>
              <div className="text-[11px] text-slate-500 dark:text-[#71717A]">Phone & Slack direct line</div>
            </div>
          </div>

          {/* Resource Guides Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Playbooks & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GUIDES.map((g) => {
                const IconComponent = g.icon;
                return (
                  <div
                    key={g.title}
                    className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-4 hover:border-amber-400/50 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-[#71717A] flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {g.readTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">{g.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-[#1F1F24]">
                      <span className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer">
                        Read Guide &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Banner */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="h-5 w-5 text-amber-400" />
                Need Personalized Merchant Onboarding?
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] max-w-lg leading-relaxed">
                Our merchant operations team assists brands doing over $100k/year with tailored migration, ERP catalog sync, and customized fee schedules.
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] hover:border-amber-400/60 px-5 py-2.5 text-xs font-bold text-slate-900 dark:text-white transition-colors shrink-0"
            >
              Contact Merchant Desk
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
