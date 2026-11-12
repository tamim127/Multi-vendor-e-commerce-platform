'use client';

/**
 * ==============================================================================
 * SELLER DASHBOARD VIEW — ULTRA-SMOOTH MODERN LIGHT AESTHETIC
 * ==============================================================================
 * Modeled directly after enterprise SaaS & marketplace dashboard standards (Image 2):
 * - Personalized greeting header with date range selector
 * - 4 clean pastel stat cards with trend badges (+2.2%, +10.6%, etc.)
 * - Smooth sales curve chart with tooltip pill
 * - Live transaction table with multi-platform channels
 * - AI Assistant recommendation hub with detailed report pill actions
 */

import React from 'react';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import {
  ShoppingBag,
  Package,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  Search,
  Bell,
} from 'lucide-react';

export function SellerDashboardView(): React.JSX.Element {
  const { sellerProfile, metrics } = useSeller();
  const selectedMonth = 'July';

  // Sample transactions matching Image 2
  const sampleTransactions = [
    { id: 'CRP7291', item: 'Apple MacBook Pro 16″', date: '20.09.2024', price: '$3,499', platform: 'Direct Store' },
    { id: 'CRP7290', item: 'Sony WH-1000XM5', date: '20.09.2024', price: '$398', platform: 'Amazon' },
    { id: 'CTB1301', item: 'Nike Alphafly 3', date: '19.09.2024', price: '$285', platform: 'Instagram' },
    { id: 'TTR9387', item: 'Anker 737 GaNPrime', date: '19.09.2024', price: '$149', platform: 'TikTok' },
    { id: 'ACP7731', item: 'Herman Miller Aeron', date: '19.09.2024', price: '$1,295', platform: 'Direct Store' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Greeting Header (matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-lg">
              {sellerProfile?.name ? sellerProfile.name.charAt(0) : 'S'}
            </div>
            <div className="absolute -top-1 -right-1 size-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hello, {sellerProfile?.name || 'Partner'}!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Let&apos;s see what&apos;s new in your store today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="size-3.5 text-slate-400" />
            <span>Thu, Apr 23 – Fri, Apr 24</span>
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. Four Stat Cards Grid (matching Image 2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total products */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Total products</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {metrics.activeListingsCount || 85}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="size-3" />
                +2.2%
              </span>
            </div>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Package className="size-5" />
          </div>
        </div>

        {/* Card 2: Completed order */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Completed order</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {metrics.totalOrdersCount || 172}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="size-3" />
                +10.6%
              </span>
            </div>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Card 3: Canceled order */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Canceled order</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">5</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                <TrendingDown className="size-3" />
                -10.2%
              </span>
            </div>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="size-5" />
          </div>
        </div>

        {/* Card 4: Top category */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Top category</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">
                Electronics
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">54% of store volume</span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShoppingBag className="size-5" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Sales Curve Chart + Last Transaction Table (matching Image 2) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Your Sales Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Total Revenue
                </span>
                <h3 className="text-sm font-bold text-slate-800">Sales & Revenue Trends</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <span>{selectedMonth}</span>
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {formatMoneyMinor(metrics.totalRevenue)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="size-3.5" />
                +6.8%
              </span>
            </div>
          </div>

          {/* Smooth SVG Curve Line Chart */}
          <div className="mt-6 relative pt-4">
            {/* Tooltip Pill from Image 2 */}
            <div className="absolute top-0 right-12 z-10 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-md text-xs font-bold text-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">19 July</span>
              <span>$3,742.76</span>
              <span className="text-emerald-600 text-[11px]">+20.4%</span>
            </div>

            <svg viewBox="0 0 400 160" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Soft area under curve */}
              <path
                d="M 10 140 C 60 120, 90 130, 140 90 C 190 50, 230 80, 280 40 C 330 10, 360 30, 390 20 L 390 150 L 10 150 Z"
                fill="url(#salesGrad)"
              />
              {/* Smooth line */}
              <path
                d="M 10 140 C 60 120, 90 130, 140 90 C 190 50, 230 80, 280 40 C 330 10, 360 30, 390 20"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Tooltip point */}
              <circle cx="280" cy="40" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
            </svg>

            <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
              <span>$100</span>
              <span>$500</span>
              <span>$1k</span>
              <span>$2.5k</span>
              <span>$4k</span>
              <span>$6k</span>
              <span>$10k</span>
            </div>
          </div>
        </div>

        {/* Last Transaction Table (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">Last transaction</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary w-28 sm:w-36"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium text-right">Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sampleTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-mono font-semibold text-slate-700">{tx.id}</td>
                      <td className="py-2.5 font-medium text-slate-900 truncate max-w-40">{tx.item}</td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                      <td className="py-2.5 font-bold text-slate-900">{tx.price}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {tx.platform}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Showing 5 recent orders</span>
            <Link
              href="/seller/orders"
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              View full order ledger
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. AI Assistant Section (matching Image 2) */}
      <div className="rounded-3xl border border-indigo-100/80 bg-linear-to-r from-indigo-50/60 via-white to-purple-50/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              AI Assistant bootsy
            </h2>
            <p className="text-xs text-slate-500">
              I analyzed the sales statistics for this month and have some recommendations for you. This month you sold 172 products on 6 different platforms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recommendation 1: Copywriting and SEO */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900">Copywriting and SEO</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                I found 18 products that need to have their descriptions updated.
              </p>
            </div>
            <button
              type="button"
              className="w-full py-2 px-3 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-full transition-all duration-200"
            >
              Detailed report
            </button>
          </div>

          {/* Recommendation 2: Advertising */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900">Advertising</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                2 methods of promotion that you don&apos;t use. This can increase sales by 17%.
              </p>
            </div>
            <button
              type="button"
              className="w-full py-2 px-3 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-full transition-all duration-200"
            >
              Detailed report
            </button>
          </div>

          {/* Recommendation 3: Service */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900">Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have received 12 product returns. Logistical problems. Please fix it now.
              </p>
            </div>
            <button
              type="button"
              className="w-full py-2 px-3 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-full transition-all duration-200"
            >
              Detailed report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
