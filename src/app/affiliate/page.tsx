'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Share2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';

const COMMISSIONS = [
  { category: 'Fashion & Luxury Leather', rate: '12%', cookie: '30 Days', desc: 'Designer apparel, chronographs, and Italian footwear' },
  { category: 'Beauty & Skincare', rate: '10%', cookie: '30 Days', desc: 'Targeted serums, botanical cosmetics, and clean skincare' },
  { category: 'Home, Living & Decor', rate: '8%', cookie: '30 Days', desc: 'Modern artisan furniture, lighting, and kitchenware' },
  { category: 'Consumer Electronics & Audio', rate: '6%', cookie: '30 Days', desc: 'Laptops, flagship audio gear, monitors, and smart devices' },
];

export default function AffiliateProgramPage(): React.JSX.Element {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', channel: '', audience: '10k-50k' });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Share2 className="h-4 w-4 text-amber-400" />
              <span>Aureon Creator & Partner Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Earn Up to 12% Recommending World-Class Products
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Partner with the fastest-growing global multi-vendor platform. Monetize your content with
              industry-leading commission rates, 30-day tracking cookies, and real-time conversion metrics.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-2 text-center">
              <DollarSign className="h-6 w-6 text-emerald-400 mx-auto" />
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Up to 12%</div>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Highest commissions in verified e-commerce</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-2 text-center">
              <Clock className="h-6 w-6 text-amber-400 mx-auto" />
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">30-Day Cookie</div>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Earn credit on repeat purchases within 30 days</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-2 text-center">
              <TrendingUp className="h-6 w-6 text-blue-400 mx-auto" />
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Weekly Payouts</div>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Reliable bank deposits via Stripe or Wire</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-2 text-center">
              <Sparkles className="h-6 w-6 text-purple-400 mx-auto" />
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Dedicated Manager</div>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Personal strategist for high-volume creators</p>
            </div>
          </div>

          {/* Rates Table */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-[#1F1F24]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Commission Rates by Product Category</h2>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-1">Transparent rewards for every verified customer referral</p>
            </div>

            <div className="divide-y divide-[#1F1F24]">
              {COMMISSIONS.map((c) => (
                <div key={c.category} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.category}</h3>
                    <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">{c.desc}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-xl font-black text-amber-400">{c.rate}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-[#71717A] uppercase font-bold">Commission</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{c.cookie}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-[#71717A] uppercase font-bold">Attribution</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for the Affiliate Program</h2>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Applications are reviewed within 24 business hours</p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Received!</h3>
                <p className="text-xs text-[#D4D4D8]">
                  Thank you, {formData.name}. Our partnerships team will review your channel ({formData.channel}) and email your unique affiliate credentials to <strong className="text-amber-400">{formData.email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="aff-name" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      id="aff-name"
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="aff-email" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                      Business Email *
                    </label>
                    <input
                      id="aff-email"
                      type="email"
                      required
                      placeholder="alex@creator.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="aff-channel" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                      Primary Channel / Website URL *
                    </label>
                    <input
                      id="aff-channel"
                      type="text"
                      required
                      placeholder="https://youtube.com/@alex or instagram.com/..."
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="aff-aud" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                      Audience Reach
                    </label>
                    <select
                      id="aff-aud"
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="w-full rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="1k-10k">1,000 – 10,000 Followers / Visitors</option>
                      <option value="10k-50k">10,000 – 50,000 Followers / Visitors</option>
                      <option value="50k-250k">50,000 – 250,000 Followers / Visitors</option>
                      <option value="250k+">250,000+ Enterprise Creator</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 flex items-center justify-center gap-2"
                >
                  <span>Submit Partner Application</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
