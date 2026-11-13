'use client';

import React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';

const PROTOCOLS = [
  {
    title: 'KYC & Merchant Due Diligence',
    desc: 'Before any merchant can list a single product, our compliance team validates legal corporate formation, tax registration numbers (EIN/VAT), ultimate beneficial ownership (UBO), and physical warehouse facilities.',
  },
  {
    title: 'Anti-Money Laundering (AML) & Sanctions',
    desc: 'Real-time automated transaction screening against OFAC, United Nations, European Union, and UK HM Treasury consolidated financial sanctions lists to prevent illicit financial flows.',
  },
  {
    title: 'Intellectual Property Protection (IPR)',
    desc: 'Aureon maintains an automated Brand Registry allowing trademark holders and rights owners to submit expedited Notice-and-Takedown requests within 4 hours of submission.',
  },
  {
    title: 'Consumer Product Safety & Recalls',
    desc: 'Continuous monitoring of global consumer safety databases (CPSC, EU Safety Gate). Immediate automated notification and escrow refunds in the event of any verified manufacturer recall.',
  },
];

export default function CompliancePage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>Regulatory Governance & Trust Standards</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Compliance, Consumer Rights & Legal Standards
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Aureon adheres to the strictest global regulatory frameworks governing digital marketplaces,
              merchant verification, consumer product safety, and financial integrity.
            </p>
          </div>

          {/* 4 Compliance Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROTOCOLS.map((p) => (
              <div key={p.title} className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 space-y-3">
                <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Consumer Rights Framework */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-400" />
              International Consumer Rights & Protection
            </h2>
            <div className="space-y-4 text-xs text-[#D4D4D8] leading-relaxed">
              <p>
                <strong>European Union & UK Statutory Rights:</strong> European consumers have a statutory right
                of withdrawal under Directive 2011/83/EU within 14 days of receipt without providing a reason. Aureon
                extends this protection voluntarily to <strong>30 days</strong> worldwide for all eligible catalog goods.
              </p>
              <p>
                <strong>United States Consumer Warranties:</strong> Products sold on Aureon are backed by the Magnuson-Moss
                Warranty Act and UCC implied warranties of merchantability, administered directly through our smart escrow
                guarantee.
              </p>
              <p>
                <strong>Digital Services Act (DSA) Compliance:</strong> In accordance with the EU Digital Services Act,
                Aureon provides public reports on content moderation, vendor KYC statistics, and single point-of-contact
                liaison for member state authorities.
              </p>
            </div>
          </div>

          {/* Notice & Takedown Box */}
          <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                DMCA & Trademark Infringement Report
              </h3>
              <p className="text-xs text-[#9CA3AF] max-w-lg leading-relaxed">
                If you believe an item listed by a third-party seller infringes upon your copyright or registered trademark,
                submit an expedited DMCA takedown notice to our legal operations desk.
              </p>
            </div>
            <a
              href="mailto:compliance@aureon.market?subject=DMCA%20Takedown%20Notice"
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 shrink-0"
            >
              Submit Infringement Report
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
