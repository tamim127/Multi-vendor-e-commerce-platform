'use client';

import React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-[#1F1F24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Data Protection & Privacy Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#71717A]">
              Effective Date: October 2026 • Compliant with GDPR (EU/UK), CCPA/CPRA (California), and global privacy frameworks.
            </p>
          </div>

          {/* Core Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-5 space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Never Sold</h3>
              <p className="text-xs text-[#9CA3AF]">We do not sell, rent, or broker your personal information to third-party data brokers.</p>
            </div>
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-5 space-y-2">
              <Lock className="h-5 w-5 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Encrypted At Rest</h3>
              <p className="text-xs text-[#9CA3AF]">AES-256 bit encryption on databases and TLS 1.3 transit encryption across all API requests.</p>
            </div>
            <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-5 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Complete User Control</h3>
              <p className="text-xs text-[#9CA3AF]">Export or permanently delete your account data anytime directly from your settings.</p>
            </div>
          </div>

          {/* Policy Text */}
          <div className="space-y-10 text-sm text-[#D4D4D8] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
              <p>
                When you interact with Aureon Marketplace, we collect information necessary to provide seamless commerce
                services, process financial transactions, and deliver shipments safely to your door:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A1A1AA]">
                <li><strong>Identity Data:</strong> Full name, verified email address, phone number, and account credentials.</li>
                <li><strong>Logistics Data:</strong> Shipping destination, billing address, recipient contact, and delivery instructions.</li>
                <li><strong>Financial Data:</strong> Tokenized payment identifiers processed through PCI-DSS Level 1 payment gateways. Full credit card numbers are never stored on Aureon servers.</li>
                <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, localized currency preferences, and session telemetry.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. How We Share Data With Independent Vendors</h2>
              <p>
                When you purchase merchandise from independent marketplace sellers, Aureon provides the seller only with the
                necessary fulfillment information (your delivery name, address, and purchased SKU line items). Sellers do not have
                access to your credit card data, bank details, or purchase history with other vendors.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. Your Data Protection Rights (GDPR & CCPA)</h2>
              <p>
                Regardless of your geographic location, Aureon affords all registered users universal data dignity rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A1A1AA]">
                <li><strong>Right to Access:</strong> You can download a complete machine-readable copy of your profile and orders.</li>
                <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request permanent deletion of all stored personal records.</li>
                <li><strong>Right to Rectification:</strong> Update inaccurate account or shipping records at any time.</li>
                <li><strong>Right to Opt-Out:</strong> Toggle non-essential marketing emails and analytical telemetry in Cookie Settings.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Contact Our Data Protection Officer</h2>
              <p>
                For privacy inquiries or to submit a formal Data Subject Request (DSR), contact our Data Protection Office at{' '}
                <a href="mailto:privacy@aureon.market" className="text-amber-400 underline font-semibold">
                  privacy@aureon.market
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
