'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Package,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

const RETURN_STEPS = [
  {
    step: '01',
    icon: FileText,
    title: 'Initiate Return Online',
    desc: 'Enter your order number and email address below or select the item from your Account Orders page.',
  },
  {
    step: '02',
    icon: Printer,
    title: 'Get Prepaid Label',
    desc: 'Download your prepaid digital return shipping label or present the QR code at any drop-off station.',
  },
  {
    step: '03',
    icon: Package,
    title: 'Pack & Hand Off',
    desc: 'Place item in its original box with tags attached and drop off at any authorized FedEx, UPS, or DHL facility.',
  },
  {
    step: '04',
    icon: CreditCard,
    title: 'Rapid Refund Issued',
    desc: 'Once the carrier scans your package, escrow funds are released back to your card within 3–5 business days.',
  },
];

export default function ReturnsRefundsPage(): React.JSX.Element {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setStatusMessage('Please enter both your order ID and the email address used during purchase.');
      return;
    }
    setStatusMessage(
      `Return eligible: Order #${orderNumber.trim()} found. Directing to Return Label generation portal...`
    );
  };

  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Returns & Escrow Refunds
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              Shop with absolute peace of mind. Every product purchased through Aureon is backed by our
              comprehensive buyer protection and simple 30-day return policy.
            </p>
          </div>

          {/* Interactive RMA Lookup Box */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-400" />
              Quick Return & Exchange Portal
            </h2>
            <p className="text-xs text-[#9CA3AF] mb-6">
              Already have an account? You can also initiate returns in one click directly from{' '}
              <Link href="/account/orders" className="text-amber-400 hover:underline font-semibold">
                Your Orders Dashboard
              </Link>
              .
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order-num" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                    Order ID
                  </label>
                  <input
                    id="order-num"
                    type="text"
                    placeholder="e.g. ORD-78452"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-3 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="order-email" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                    Purchaser Email
                  </label>
                  <input
                    id="order-email"
                    type="email"
                    placeholder="client@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-3 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    statusMessage.startsWith('Return eligible')
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 py-3 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                <span>Find My Order & Generate Return Label</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* 4-Step Return Workflow */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">How Returns Work in 4 Simple Steps</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">Zero hidden restocking fees or complicated RMA approvals</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RETURN_STEPS.map((s) => {
                const IconComponent = s.icon;
                return (
                  <div key={s.step} className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-black text-[#3F3F46]">{s.step}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines & Exemptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Return Policy Highlights
              </h3>
              <ul className="space-y-2.5 text-xs text-[#D4D4D8]">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>30 Days Window:</strong> Initiated within 30 days of confirmed parcel delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Original Condition:</strong> Items must be unworn, undamaged, with original tags intact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Prepaid Return Shipping:</strong> Free returns on fashion, footwear, and defective merchandise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Instant Store Credit:</strong> Get instant Aureon credit or 3–5 days to bank card.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                Aureon Buyer Escrow Assurance
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Unlike unverified online marketplaces, all merchant payouts on Aureon are held in smart escrow
                until the buyer confirms delivery and condition. If a merchant disputes a legitimate return,
                Aureon customer ombudsmen immediately review and release funds to you.
              </p>
              <div className="pt-2">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Need more help? Visit Customer Care Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

