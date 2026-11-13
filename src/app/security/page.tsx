'use client';

import React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  Bug,
  CheckCircle2,
} from 'lucide-react';

const SECURITY_PILLARS = [
  {
    icon: Lock,
    title: 'PCI-DSS Level 1 Payment Security',
    desc: 'All customer financial transactions are tokenized through certified tier-1 banking processors. Cardholder data is never exposed to merchants or unencrypted web tiers.',
  },
  {
    icon: KeyRound,
    title: 'Multi-Factor & Hardware Passkeys',
    desc: 'Accounts are defended by WebAuthn FIDO2 passkeys, time-based one-time passwords (TOTP), and adaptive anomalous login detection.',
  },
  {
    icon: Server,
    title: 'SOC 2 Type II Certified Infrastructure',
    desc: 'Our distributed multi-region cloud servers maintain SOC 2 Type II, ISO/IEC 27001, and HIPAA-level operational security certifications.',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Escrow Custody Protection',
    desc: 'Merchant payouts are isolated in regulated custodial escrow accounts, guaranteeing full fund availability for refunds until delivery is verified.',
  },
];

export default function PlatformSecurityPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Institutional Trust & Infrastructure</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Platform Security Architecture
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Discover how Aureon safeguards billions in cross-border commerce, shields buyer identity, and
              enforces rigorous zero-trust protocols across every checkout.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SECURITY_PILLARS.map((p) => {
              const IconComp = p.icon;
              return (
                <div key={p.title} className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 space-y-3">
                  <div className="size-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Defense in Depth Architecture */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Defense-in-Depth Implementation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#D4D4D8]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Automated DDoS Shielding:</strong> Real-time edge filtering with multi-terabit mitigation against Layer 3/4 and Layer 7 volumetric attacks.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>End-to-End Cryptography:</strong> TLS 1.3 encryption with Perfect Forward Secrecy and HSTS preload across all subdomains.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Continuous Penetration Testing:</strong> Weekly external automated penetration reviews and bi-annual audits by top security firms.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Role-Based Access Control (RBAC):</strong> Least-privilege administrative access with mandatory hardware MFA and tamper-proof audit trails.</span>
              </div>
            </div>
          </div>

          {/* Responsible Disclosure & Bug Bounty */}
          <div className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bug className="h-5 w-5 text-amber-400" />
                Responsible Vulnerability Disclosure & Bug Bounty
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] max-w-lg leading-relaxed">
                We welcome reports from ethical security researchers. Aureon awards competitive bounties for
                qualifying security disclosures submitted through our coordinated disclosure program.
              </p>
            </div>
            <a
              href="mailto:security@aureon.market?subject=Vulnerability%20Disclosure"
              className="rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] hover:border-amber-400/60 px-5 py-2.5 text-xs font-bold text-slate-900 dark:text-white transition-colors shrink-0"
            >
              Report Security Issue
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
