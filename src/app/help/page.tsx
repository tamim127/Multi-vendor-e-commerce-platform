'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Search, HelpCircle, MessageSquare, Mail, Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How do multi-vendor orders and shipping packages work?',
    a: 'When you order items from different verified sellers in a single checkout, each seller prepares and dispatches their package independently. You will receive separate tracking numbers for each shipment, but customer support and buyer protection are centrally managed by Aureon.',
  },
  {
    q: 'What is the Aureon Buyer Protection & Authenticity Guarantee?',
    a: 'Every transaction is backed by our escrow protection. If an item arrives damaged, defective, or materially different from its catalog listing, you are entitled to a full 100% refund, including return shipping costs.',
  },
  {
    q: 'How do I return a product within 30 days?',
    a: 'You can initiate a return directly from your Account Orders dashboard or the Returns Portal. Select the items you wish to return, choose your reason, and a prepaid shipping label will be automatically generated.',
  },
  {
    q: 'How do I become an authorized marketplace seller?',
    a: 'Visit our Seller Registration page to submit your business information and tax ID. Our vendor onboarding compliance team reviews applications within 24–48 business hours.',
  },
  {
    q: 'What payment methods does Aureon support?',
    a: 'We accept all major international credit/debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, PayPal, and regional bank transfers with 256-bit SSL encryption.',
  },
];

export default function HelpCenterPage(): React.JSX.Element {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header & Search */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span>Aureon Customer Care Desk</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How can we help you today?
            </h1>

            <div className="max-w-xl mx-auto mt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search questions, returns, shipping, policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 dark:border-[#27272A] bg-[#121216] pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Quick Support Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">24/7 Live Chat</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Instant assistance from our dedicated support specialists.</p>
              <button
                type="button"
                className="inline-block rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 mt-2 transition-all cursor-pointer"
              >
                Start Live Chat
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Email Support</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Send a support ticket with an average response time of 2 hours.</p>
              <Link
                href="/contact"
                className="inline-block rounded-xl bg-slate-100 dark:bg-[#18181B] hover:bg-[#202025] text-white border border-slate-200 dark:border-[#27272A] font-bold text-xs px-4 py-2 mt-2 transition-all"
              >
                Submit Ticket
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Phone Hotline</h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF]">Toll-free customer hotline available Monday – Saturday.</p>
              <span className="inline-block font-mono font-bold text-xs text-amber-400 mt-2">
                +1 (800) 555-0199
              </span>
            </div>
          </div>

          {/* Searchable FAQ Accordion */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-[#121216] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>

            <div className="divide-y divide-[#1E1E24]">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;

                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex items-center justify-between w-full text-left font-bold text-sm text-white hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform duration-200 shrink-0 ml-2', isOpen && 'rotate-180 text-amber-400')}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed animate-in fade-in-0 duration-150">
                        {faq.a}
                      </p>
                    )}
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
