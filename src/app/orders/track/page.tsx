'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Search, Truck } from 'lucide-react';

export default function OrderTrackingPage(): React.JSX.Element {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSearched(true);
    }
  };

  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Truck className="h-4 w-4 text-amber-400" />
              <span>Real-Time Logistics Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Track Your Shipment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF] max-w-md mx-auto">
              Enter your Order Number and Customer Email address to inspect package transit checkpoints and estimated delivery.
            </p>
          </div>

          {/* Tracking Form */}
          <form
            onSubmit={handleTrack}
            className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Order ID or Package Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #ORD-7842"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-100 dark:bg-[#18181B] px-4 py-3 text-sm text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Billing / Account Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahim@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-100 dark:bg-[#18181B] px-4 py-3 text-sm text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm py-3.5 shadow-lg shadow-amber-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Track Order Status</span>
            </button>
          </form>

          {/* Tracking Results View */}
          {searched && (
            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in-0 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E24] pb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                    Package Dispatched
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Order {orderId || '#ORD-7842'}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-[#71717A] font-mono">
                    Tracking ID: AUREON-EXP-98234710
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#A1A1AA] block">Estimated Delivery:</span>
                  <span className="text-base font-bold text-emerald-400">Tomorrow by 4:00 PM</span>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Order Confirmed</span>
                    <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Yesterday, 10:24 AM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Package Packed</span>
                    <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Yesterday, 4:15 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">In Transit (Active)</span>
                    <span className="text-[10px] text-[#A1A1AA]">Departed Sorting Hub</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-[#18181B] text-slate-500 dark:text-[#71717A] border border-slate-200 dark:border-[#27272A] flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#A1A1AA] block">Delivered</span>
                    <span className="text-[10px] text-slate-500 dark:text-[#71717A]">Pending arrival</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
