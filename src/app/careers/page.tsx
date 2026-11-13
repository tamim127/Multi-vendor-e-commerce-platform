'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Heart,
  Globe,
  Zap,
} from 'lucide-react';

const JOBS = [
  {
    id: 'eng-01',
    title: 'Staff Distributed Systems Engineer',
    dept: 'Engineering',
    location: 'Remote (Global) / London',
    type: 'Full-time',
    desc: 'Scale our high-throughput multi-region transaction processing engine and escrow smart contracts.',
  },
  {
    id: 'eng-02',
    title: 'Senior Frontend Architect (Next.js / TypeScript)',
    dept: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    desc: 'Design and elevate our micro-frontend web architecture, luxury design system, and sub-second catalog renderers.',
  },
  {
    id: 'prod-01',
    title: 'Lead Product Manager - Global Merchant Platform',
    dept: 'Product',
    location: 'London, UK / Remote',
    type: 'Full-time',
    desc: 'Empower 10,000+ independent sellers with next-generation analytics, inventory automation, and multi-currency tools.',
  },
  {
    id: 'sec-01',
    title: 'Principal Security & Fraud Prevention Engineer',
    dept: 'Security & Trust',
    location: 'Remote (US/EU timezones)',
    type: 'Full-time',
    desc: 'Lead our AI-driven fraud detection, anti-counterfeit catalog scanning, and biometric buyer protection systems.',
  },
  {
    id: 'ops-01',
    title: 'Global Logistics Operations Manager',
    dept: 'Operations',
    location: 'Singapore / Remote',
    type: 'Full-time',
    desc: 'Optimize international air priority freight lanes, DDP customs clearing brokers, and last-mile partner SLAs.',
  },
];

const PERKS = [
  { icon: Globe, title: 'Work From Anywhere', desc: 'Remote-first culture with beautiful collaborative offices in London, SF, and Singapore.' },
  { icon: Zap, title: 'Top-Tier Compensation & Equity', desc: 'Competitive Silicon Valley & London tier salaries with generous early-stage equity grants.' },
  { icon: Heart, title: 'Comprehensive Health & Wellness', desc: '100% premium coverage for medical, dental, vision, plus unlimited mental health support.' },
  { icon: Sparkles, title: 'Continuous Learning Budget', desc: '$4,000 annual education grant for books, conferences, coaching, and certifications.' },
];

export default function CareersPage(): React.JSX.Element {
  const [selectedDept, setSelectedDept] = useState('All');
  const departments = ['All', 'Engineering', 'Product', 'Security & Trust', 'Operations'];

  const filteredJobs =
    selectedDept === 'All' ? JOBS : JOBS.filter((j) => j.dept === selectedDept);

  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Briefcase className="h-4 w-4 text-amber-400" />
              <span>We Are Actively Hiring</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Build the Next Generation of Global Commerce
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              Join a team of passionate engineers, designers, and operators creating the world’s most trusted,
              elegant multi-vendor marketplace ecosystem.
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((perk) => {
              const IconComp = perk.icon;
              return (
                <div key={perk.title} className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 space-y-3">
                  <div className="size-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{perk.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Job Listings Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Open Positions ({filteredJobs.length})</h2>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5">Explore our high-impact opportunities worldwide</p>
              </div>

              {/* Department Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedDept === dept
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-[#141417] text-[#A1A1AA] hover:text-white border border-slate-200 dark:border-[#27272A]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-400/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        {job.dept}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-[#71717A] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-[#71717A] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {job.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">{job.desc}</p>
                  </div>

                  <a
                    href="mailto:careers@aureon.market?subject=Application%20for%20Job"
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] hover:bg-amber-400 hover:text-slate-950 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
