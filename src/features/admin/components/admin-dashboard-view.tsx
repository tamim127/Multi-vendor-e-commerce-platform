'use client';

/**
 * ==============================================================================
 * AUREON ADMIN DASHBOARD VIEW
 * ==============================================================================
 * Executive marketplace command center matching the Aureon design system:
 * - Dual Light & Dark theme support
 * - 6 KPI cards with dynamic SVG sparklines
 * - Sales Velocity multi-line area chart with gradient fills
 * - Order Status breakdown donut chart
 * - Top Selling Products with revenue and sales velocity
 * - Recent Orders table with customer avatars & status pills
 * - Recent Seller Activity timeline
 * - Administrative Shortcuts & Help Center card
 * - Platform Performance metrics & Seller recruitment banner
 * - Compliance Audit Log Events
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '../context/admin-context';
import { useTranslation } from '@/lib/i18n';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Clock,
  Package,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Activity,
  Percent,
  Server,
} from 'lucide-react';

export function AdminDashboardView(): React.JSX.Element {
  const { sellerStatuses, refunds, reviews, auditLogs } = useAdmin();
  const { t } = useTranslation();

  const [dateRange, setDateRange] = useState('Last 30 days');

  const pendingSellersCount = Object.values(sellerStatuses).filter((s) => s === 'pending').length;
  const reportedReviewsCount = reviews.filter((r) => r.status === 'reported').length;
  const pendingRefundsCount = refunds.filter((r) => r.status === 'pending').length;

  // Top selling products fixture matching screenshot
  const topProducts = [
    {
      id: 'p-1',
      rank: 1,
      name: 'Sony WH-1000XM5',
      category: 'Electronics',
      revenue: '$48,230.00',
      unitsSold: '324 sold',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&q=80',
    },
    {
      id: 'p-2',
      rank: 2,
      name: 'Apple Watch Series 10',
      category: 'Electronics',
      revenue: '$32,840.00',
      unitsSold: '276 sold',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&q=80',
    },
    {
      id: 'p-3',
      rank: 3,
      name: 'Nike Air Zoom Pegasus 41',
      category: 'Fashion',
      revenue: '$28,660.00',
      unitsSold: '241 sold',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&q=80',
    },
    {
      id: 'p-4',
      rank: 4,
      name: 'Samsung Galaxy S24',
      category: 'Electronics',
      revenue: '$24,390.00',
      unitsSold: '198 sold',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=160&q=80',
    },
    {
      id: 'p-5',
      rank: 5,
      name: 'MacBook Air M3',
      category: 'Electronics',
      revenue: '$22,750.00',
      unitsSold: '176 sold',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=160&q=80',
    },
  ];

  // Recent orders matching reference screenshot
  const recentOrders = [
    {
      id: '#ORD-7842',
      customer: {
        name: 'Rahim Ahmed',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=80',
      },
      itemsCount: 2,
      totalAmount: '$249.00',
      status: 'Delivered',
      date: 'May 1, 2025 10:24 AM',
    },
    {
      id: '#ORD-7841',
      customer: {
        name: 'Sadia Islam',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80',
      },
      itemsCount: 1,
      totalAmount: '$199.00',
      status: 'Processing',
      date: 'May 1, 2025 09:17 AM',
    },
    {
      id: '#ORD-7840',
      customer: {
        name: 'Fahim Hasan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80',
      },
      itemsCount: 3,
      totalAmount: '$598.00',
      status: 'Shipped',
      date: 'May 1, 2025 08:03 AM',
    },
    {
      id: '#ORD-7839',
      customer: {
        name: 'Nusrat Jahan',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&q=80',
      },
      itemsCount: 1,
      totalAmount: '$89.00',
      status: 'Delivered',
      date: 'Apr 30, 2025 07:45 PM',
    },
    {
      id: '#ORD-7838',
      customer: {
        name: 'Tanvir Islam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=80',
      },
      itemsCount: 2,
      totalAmount: '$378.00',
      status: 'Cancelled',
      date: 'Apr 30, 2025 06:22 PM',
    },
  ];

  // Recent seller activity matching screenshot
  const sellerActivity = [
    {
      id: 'act-1',
      title: 'New seller registration',
      desc: 'TechWorld Electronics',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'act-2',
      title: 'Product submitted for review',
      desc: 'Wireless Headphones (SKU: 4587)',
      time: '3 hours ago',
      icon: Package,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      id: 'act-3',
      title: 'Store verification completed',
      desc: 'Fashion Hub',
      time: '5 hours ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'act-4',
      title: 'New order received',
      desc: 'Order #ORD-7842',
      time: '6 hours ago',
      icon: ShoppingBag,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      id: 'act-5',
      title: 'Return request submitted',
      desc: 'Nike Air Zoom Pegasus 41',
      time: '8 hours ago',
      icon: RotateCcw,
      color: 'text-rose-500 bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Good morning, Admin</span>
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your marketplace today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live System Indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live System</span>
            <span className="hidden md:inline text-emerald-600/70 dark:text-emerald-400/70 font-normal">
              • All Systems Operational
            </span>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
              aria-label="Select Date Range"
            >
              <option value="Last 7 days" className="dark:bg-[#18181B] text-slate-900 dark:text-white">
                Last 7 days
              </option>
              <option value="Last 30 days" className="dark:bg-[#18181B] text-slate-900 dark:text-white">
                Last 30 days
              </option>
              <option value="This Quarter" className="dark:bg-[#18181B] text-slate-900 dark:text-white">
                This Quarter
              </option>
              <option value="Year to Date" className="dark:bg-[#18181B] text-slate-900 dark:text-white">
                Year to Date
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Platform Growth Feature Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                  Platform Growth
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  +18.4% MoM
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Your marketplace is growing faster than ever. Keep up the momentum!
              </h3>
            </div>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 shadow-md shadow-amber-400/20 transition-all shrink-0"
          >
            <span>View Analytics</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 3. Six Executive KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* KPI 1: Total GMV */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              {t('admin.totalGmv') || 'Platform Gross Merchandise'}
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              $284,500.00
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5%</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last 30 days</span>
            </div>
          </div>
          {/* SVG Sparkline (Gold) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,22 Q15,24 30,16 T60,18 T85,8 T100,6"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              {t('admin.totalOrders') || 'Total Orders'}
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              1,420
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3" />
              <span>+8.3%</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last 30 days</span>
            </div>
          </div>
          {/* SVG Sparkline (Blue) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,24 Q20,20 40,22 T70,12 T90,14 T100,8"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Active Sellers */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              Active Sellers
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              892
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+15.2%</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last 30 days</span>
            </div>
          </div>
          {/* SVG Sparkline (Emerald) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,22 Q25,26 45,15 T75,18 T90,10 T100,5"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: Total Customers */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              Total Customers
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              2,840
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-3 w-3" />
              <span>+11.7%</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last 30 days</span>
            </div>
          </div>
          {/* SVG Sparkline (Purple) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,26 Q18,20 38,24 T65,16 T85,12 T100,6"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 5: Commission Revenue */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              Commission Take
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              $24,680.00
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3 w-3" />
              <span>+10.4%</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last 30 days</span>
            </div>
          </div>
          {/* SVG Sparkline (Gold) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,20 Q22,25 40,18 T70,16 T90,9 T100,4"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 6: Pending Refunds */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 sm:p-5 shadow-xs hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9CA3AF]">
              Pending Refunds
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {pendingRefundsCount > 0 ? pendingRefundsCount : 5}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="h-3 w-3" />
              <span>-37.5%</span>
              <span className="font-normal text-slate-400 text-[10px]">improved</span>
            </div>
          </div>
          {/* SVG Sparkline (Rose) */}
          <div className="mt-3 h-8 w-full">
            <svg viewBox="0 0 100 28" className="h-full w-full overflow-visible">
              <path
                d="M0,8 Q20,10 40,16 T70,18 T90,24 T100,26"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Actionable Moderation Alert Banners */}
      {(pendingSellersCount > 0 || reportedReviewsCount > 0 || pendingRefundsCount > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pendingSellersCount > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingSellersCount} Seller Application{pendingSellersCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Requires merchant KYC review</div>
                </div>
              </div>
              <Link
                href="/admin/sellers"
                className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 transition-colors"
              >
                Review
              </Link>
            </div>
          )}

          {reportedReviewsCount > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {reportedReviewsCount} Flagged Review{reportedReviewsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Reported for spam or policy abuse</div>
                </div>
              </div>
              <Link
                href="/admin/reviews"
                className="rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-3 py-1.5 transition-colors"
              >
                Moderate
              </Link>
            </div>
          )}

          {pendingRefundsCount > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingRefundsCount} Refund Request{pendingRefundsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Pending customer claims</div>
                </div>
              </div>
              <Link
                href="/admin/refunds"
                className="rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs px-3 py-1.5 transition-colors"
              >
                Examine
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 5. Second Row: Sales Velocity Area Chart + Order Status Donut + Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sales Overview Area Chart (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  GMV &amp; Order volume trend over the last 7 days
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 text-xs font-semibold mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-600 dark:text-slate-300">GMV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-300">Orders</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Last 7 days
                </div>
              </div>
            </div>

            {/* Interactive SVG Multi-Line Chart */}
            <div className="mt-6 h-56 w-full relative">
              <svg viewBox="0 0 600 220" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Amber Gradient */}
                  <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Blue Gradient */}
                  <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="40" y1="30" x2="580" y2="30" stroke="currentColor" className="text-slate-100 dark:text-[#1F1F24]" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" className="text-slate-100 dark:text-[#1F1F24]" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-100 dark:text-[#1F1F24]" strokeDasharray="3 3" />
                <line x1="40" y1="180" x2="580" y2="180" stroke="currentColor" className="text-slate-100 dark:text-[#1F1F24]" />

                {/* Y-Axis Labels Left (GMV) */}
                <text x="10" y="34" className="text-[10px] fill-slate-400 font-mono">$60k</text>
                <text x="10" y="84" className="text-[10px] fill-slate-400 font-mono">$45k</text>
                <text x="10" y="134" className="text-[10px] fill-slate-400 font-mono">$30k</text>
                <text x="10" y="184" className="text-[10px] fill-slate-400 font-mono">$0</text>

                {/* Y-Axis Labels Right (Orders) */}
                <text x="585" y="34" className="text-[10px] fill-slate-400 font-mono">600</text>
                <text x="585" y="84" className="text-[10px] fill-slate-400 font-mono">450</text>
                <text x="585" y="134" className="text-[10px] fill-slate-400 font-mono">300</text>
                <text x="585" y="184" className="text-[10px] fill-slate-400 font-mono">0</text>

                {/* Blue Area & Line (Orders) */}
                <path
                  d="M50,160 Q130,130 210,145 T370,110 T490,95 T570,75 L570,180 L50,180 Z"
                  fill="url(#blueGlow)"
                />
                <path
                  d="M50,160 Q130,130 210,145 T370,110 T490,95 T570,75"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Amber Area & Line (GMV) */}
                <path
                  d="M50,140 Q130,105 210,120 T370,85 T490,65 T570,40 L570,180 L50,180 Z"
                  fill="url(#amberGlow)"
                />
                <path
                  d="M50,140 Q130,105 210,120 T370,85 T490,65 T570,40"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points on Amber line */}
                <circle cx="50" cy="140" r="4" fill="#F59E0B" className="stroke-white dark:stroke-[#121215] stroke-2" />
                <circle cx="210" cy="120" r="4" fill="#F59E0B" className="stroke-white dark:stroke-[#121215] stroke-2" />
                <circle cx="370" cy="85" r="4" fill="#F59E0B" className="stroke-white dark:stroke-[#121215] stroke-2" />
                <circle cx="490" cy="65" r="4" fill="#F59E0B" className="stroke-white dark:stroke-[#121215] stroke-2" />
                <circle cx="570" cy="40" r="4" fill="#F59E0B" className="stroke-white dark:stroke-[#121215] stroke-2" />

                {/* X-Axis Date Labels */}
                <text x="50" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 25</text>
                <text x="135" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 26</text>
                <text x="220" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 27</text>
                <text x="310" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 28</text>
                <text x="395" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 29</text>
                <text x="480" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Apr 30</text>
                <text x="565" y="202" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">May 1</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Order Status Donut Chart (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current order distribution</p>

            {/* SVG Donut Chart */}
            <div className="mt-4 flex items-center justify-center relative">
              <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" className="stroke-slate-100 dark:stroke-[#1F1F24]" strokeWidth="11" fill="none" />
                {/* Delivered 68.5% (dasharray ~ 163 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10B981"
                  strokeWidth="11"
                  strokeDasharray="163 238"
                  strokeDashoffset="0"
                  fill="none"
                />
                {/* Processing 18.2% (dasharray ~ 43 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#3B82F6"
                  strokeWidth="11"
                  strokeDasharray="43 238"
                  strokeDashoffset="-163"
                  fill="none"
                />
                {/* Shipped 9.8% (dasharray ~ 23 of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F59E0B"
                  strokeWidth="11"
                  strokeDasharray="23 238"
                  strokeDashoffset="-206"
                  fill="none"
                />
                {/* Cancelled 2.1% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#EF4444"
                  strokeWidth="11"
                  strokeDasharray="5 238"
                  strokeDashoffset="-229"
                  fill="none"
                />
                {/* Returned 1.4% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#8B5CF6"
                  strokeWidth="11"
                  strokeDasharray="4 238"
                  strokeDashoffset="-234"
                  fill="none"
                />
              </svg>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">1,420</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Delivered</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">68.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300">Processing</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">18.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300">Shipped</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">9.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300">Cancelled</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">2.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-slate-600 dark:text-slate-300">Returned</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">1.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">By GMV</p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3.5">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1E1E24] text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {p.rank}
                    </span>
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-100 dark:bg-[#18181B]">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.category}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{p.revenue}</div>
                    <div className="text-[10px] text-slate-400">{p.unitsSold}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Third Row: Recent Orders Table + Recent Seller Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Orders Table (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E1E24] pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest orders from customers</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1E1E24] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Products</th>
                  <th className="py-2.5">Total Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-[#18181D]/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-amber-400">
                      <Link href="/admin/orders" className="hover:underline">
                        {ord.id}
                      </Link>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-[#27272A]">
                          <Image src={ord.customer.avatar} alt={ord.customer.name} fill className="object-cover" sizes="24px" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{ord.customer.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {ord.itemsCount} {ord.itemsCount > 1 ? 'items' : 'item'}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{ord.totalAmount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : ord.status === 'Processing'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                            : ord.status === 'Shipped'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono text-[11px]">{ord.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Seller Activity Feed (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E1E24] pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Seller Activity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live updates from sellers</p>
              </div>
              <Link
                href="/admin/sellers"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {sellerActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${act.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.desc}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions / Administrative Shortcuts (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrative Shortcuts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Execute common management workflows</p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/products"
                className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] p-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-center group"
              >
                <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <Package className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Add Product</div>
                <div className="text-[10px] text-slate-400 truncate">List for sale</div>
              </Link>

              <Link
                href="/admin/sellers"
                className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] p-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-center group"
              >
                <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Store className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Manage Sellers</div>
                <div className="text-[10px] text-slate-400 truncate">Verify merchants</div>
              </Link>

              <Link
                href="/admin/refunds"
                className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] p-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-center group"
              >
                <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Process Refunds</div>
                <div className="text-[10px] text-slate-400 truncate">Customer claims</div>
              </Link>

              <Link
                href="/admin/analytics"
                className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] p-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-center group"
              >
                <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">View Reports</div>
                <div className="text-[10px] text-slate-400 truncate">Analytics data</div>
              </Link>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Need Help?</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#9CA3AF]">
              Contact our platform engineering team for system escalations.
            </p>
            <Link
              href="/admin/notifications"
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-1.5 transition-colors"
            >
              Open Support Center
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Platform Compliance & Audit Trail Table (Tested by unit tests) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E1E24] pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Audit Log Events</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Append-only security records of administrative interventions
            </p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Audit Trail</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1E1E24] overflow-hidden">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-100 dark:bg-[#1E1E24] px-2 py-1 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {log.action}
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.actor.name}</span>
                  <span className="text-slate-400"> modified </span>
                  <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    {log.targetType}:{log.targetId}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                  {log.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Bottom Bar: Platform Performance & Seller Growth Strip */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Performance KPIs (7 Cols) */}
          <div className="lg:col-span-7">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform Performance</h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Server className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Uptime</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">99.9%</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                  <span>Avg. Response</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">1.2s</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Satisfaction</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">4.8 / 5</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                  <span>Success Rate</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">98.2%</div>
              </div>
            </div>
          </div>

          {/* Seller Invitation Banner (5 Cols) */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-[#1E1E24] pt-4 lg:pt-0 lg:pl-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Build Your Business on Aureon</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Join thousands of sellers and scale globally.
              </p>
            </div>
            <Link
              href="/admin/sellers"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3.5 py-2 shadow-xs transition-colors shrink-0"
            >
              <span>Invite New Seller</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
