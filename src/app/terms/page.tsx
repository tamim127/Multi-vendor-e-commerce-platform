'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 dark:border-[#1F1F24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Legal Governance & User Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#71717A]">
              Last revised: October 2026 • Effective immediately for all buyers and registered vendors.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Summary of Key Provisions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#D4D4D8]">
              <a href="#section-1" className="hover:text-amber-400">1. Acceptance of Terms & Eligibility &rarr;</a>
              <a href="#section-2" className="hover:text-amber-400">2. Multi-Vendor Marketplace Operations &rarr;</a>
              <a href="#section-3" className="hover:text-amber-400">3. Smart Escrow & Payment Settlement &rarr;</a>
              <a href="#section-4" className="hover:text-amber-400">4. Shipping, Customs & Delivery &rarr;</a>
              <a href="#section-5" className="hover:text-amber-400">5. 30-Day Returns & Buyer Protection &rarr;</a>
              <a href="#section-6" className="hover:text-amber-400">6. Merchant Warranties & Anti-Counterfeiting &rarr;</a>
              <a href="#section-7" className="hover:text-amber-400">7. Intellectual Property & Brand Rights &rarr;</a>
              <a href="#section-8" className="hover:text-amber-400">8. Dispute Resolution & Arbitration &rarr;</a>
            </div>
          </div>

          {/* Legal Sections */}
          <div className="space-y-10 text-sm text-[#D4D4D8] leading-relaxed">
            <section id="section-1" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms & Platform Eligibility</h2>
              <p>
                By creating an account, browsing listings, or placing an order on Aureon Marketplace
                (&ldquo;Aureon&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be legally bound by these Terms of Service.
                If you do not agree to these terms, you must discontinue use of the platform immediately.
              </p>
              <p>
                Users must be at least 18 years of age or possess legal parental consent. Registered commercial vendors
                must provide valid corporate registration, tax identification numbers, and pass Know-Your-Customer (KYC)
                verification prior to activating catalog sales.
              </p>
            </section>

            <section id="section-2" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Multi-Vendor Marketplace Model</h2>
              <p>
                Aureon operates as a curated international commerce platform connecting independent third-party merchants
                with global retail and commercial buyers. Except where explicitly designated as an &ldquo;Aureon Official Brand&rdquo;
                item, products listed for sale are offered and dispatched by independent certified vendors.
              </p>
              <p>
                Aureon provides payment escrow processing, multi-currency conversion, catalog search indexing, and dispute
                resolution services to facilitate safe commerce between parties.
              </p>
            </section>

            <section id="section-3" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Smart Escrow & Payment Settlement</h2>
              <p>
                When a buyer submits payment for an order, funds are held securely in the Aureon Escrow Trust. The merchant does
                not receive payment disbursement until the parcel tracking confirms physical delivery to the buyer and the 72-hour
                inspection window passes without an unresolved dispute.
              </p>
              <p>
                Payments are processed via PCI-DSS Level 1 compliant gateway partners with end-to-end 256-bit encryption.
              </p>
            </section>

            <section id="section-4" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Shipping, Customs Duties & International Taxes</h2>
              <p>
                Unless stated otherwise at checkout, cross-border shipments are executed on a Delivered Duty Paid (DDP) basis.
                All applicable value-added taxes (VAT), import tariffs, and customs clearances are calculated and assessed at the
                point of checkout.
              </p>
            </section>

            <section id="section-5" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. 30-Day Returns & Escrow Guarantees</h2>
              <p>
                Buyers may request returns on eligible items within 30 days of confirmed delivery in accordance with our{' '}
                <Link href="/returns" className="text-amber-400 underline font-semibold">
                  Returns & Refunds Policy
                </Link>
                . Returned goods must be in original condition with tags intact. If an item arrives counterfeit or materially
                defective, Aureon reimburses 100% of purchase costs directly from escrow.
              </p>
            </section>

            <section id="section-6" className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Anti-Counterfeiting & Merchant Sanctions</h2>
              <p>
                Aureon strictly prohibits the listing, promotion, or sale of counterfeit, replica, stolen, or unauthorized gray-market
                merchandise. Any vendor attempting to distribute infringing goods faces immediate permanent account termination,
                forfeiture of escrow funds, and referral to international law enforcement agencies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
