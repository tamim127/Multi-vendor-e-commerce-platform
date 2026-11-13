'use client';

import React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Newspaper,
  Calendar,
  Download,
  Mail,
  Sparkles,
} from 'lucide-react';

const ARTICLES = [
  {
    date: 'October 24, 2026',
    tag: 'Corporate & Growth',
    title: 'Aureon Crosses $480M Annualized GMV Across 160 Trade Corridors',
    desc: 'Rapid adoption by premium independent merchants and enterprise suppliers drives record quarterly volume, backed by automated multicurrency settlement.',
  },
  {
    date: 'September 12, 2026',
    tag: 'Platform Innovation',
    title: 'Introducing Aureon Escrow 3.0: Zero-Trust Buyer Protection for Cross-Border Orders',
    desc: 'Our patent-pending smart contract escrow guarantees complete buyer reimbursement while giving verified merchants faster automated payouts upon verified tracking scans.',
  },
  {
    date: 'August 05, 2026',
    tag: 'Sustainability',
    title: 'Aureon Achieves 100% Carbon-Neutral Ground Logistics Across Europe and North America',
    desc: 'Through investments in localized micro-fulfillment hubs and verified solar offsets, Aureon eliminates direct emissions from standard residential parcel deliveries.',
  },
  {
    date: 'June 18, 2026',
    tag: 'Partnerships',
    title: 'Aureon Partners With Leading European Luxury Houses for Direct Verified Marketplace Stores',
    desc: 'Bringing artisanal leather goods, bespoke tailoring, and heritage chronographs into our curated multi-vendor ecosystem with cryptographic authenticity certificates.',
  },
];

export default function PressNewsPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Newspaper className="h-4 w-4 text-amber-400" />
              <span>Aureon Global Newsroom</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              News, Releases & Media Center
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Official press announcements, corporate updates, and media resources for journalists and industry analysts.
            </p>
          </div>

          {/* Media Kit Card */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Aureon Official Press & Media Kit
              </h2>
              <p className="text-xs text-[#9CA3AF] max-w-lg leading-relaxed">
                Download high-resolution vectors of our brand identity, executive headshots, platform screenshots, and company fact sheet.
              </p>
            </div>
            <a
              href="mailto:press@aureon.market?subject=Press%20Kit%20Request"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 inline-flex items-center gap-2 shrink-0"
            >
              <Download className="h-4 w-4" />
              Download Media Kit (ZIP)
            </a>
          </div>

          {/* Press Releases List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Recent Announcements</h2>
            <div className="space-y-4">
              {ARTICLES.map((art) => (
                <div
                  key={art.title}
                  className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-2.5 hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                      {art.tag}
                    </span>
                    <span className="text-[#71717A] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {art.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{art.title}</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{art.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Contact Box */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 text-center space-y-3">
            <Mail className="h-6 w-6 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Press & Media Inquiries</h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              Members of the media can direct interview requests and inquiries to{' '}
              <a href="mailto:press@aureon.market" className="text-amber-400 underline font-semibold">
                press@aureon.market
              </a>
              . We respond within 4 hours.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
