'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Cookie, CheckCircle2 } from 'lucide-react';

export default function CookieSettingsPage(): React.JSX.Element {
  const [preferences, setPreferences] = useState({
    functional: true,
    analytics: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 dark:border-[#1F1F24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Cookie className="h-4 w-4 text-amber-400" />
              <span>Cookie Consent & Preferences</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cookie Settings & Privacy Controls
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
              We respect your right to privacy. Customize which categories of cookies and tracking technologies
              you permit while navigating Aureon Marketplace.
            </p>
          </div>

          {/* Interactive Preferences Toggles */}
          <div className="space-y-6">
            {/* 1. Necessary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Strictly Necessary Cookies</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  Required for essential platform functionality, such as secure sign-in, maintaining cart items across pages, CSRF protection, and fraud prevention. These cannot be disabled.
                </p>
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-[#71717A] bg-[#141417] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272A]">
                Required
              </div>
            </div>

            {/* 2. Functional */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Functional & Preference Cookies</h3>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  Remembers your selected browsing currency (USD, EUR, GBP), localized language translation, and regional shipping destination filters.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {/* 3. Analytics */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Performance & Analytics Cookies</h3>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  Enables us to measure catalog render performance, identify broken links, and optimize product search algorithms with completely anonymized usage logs.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {/* 4. Marketing */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-slate-200 dark:border-[#27272A] shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Marketing & Tailored Recommendations</h3>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  Used by our AI recommendation engine to surface relevant products and promotions based on your shopping interests across verified merchant stores.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-[#1F1F24]">
            <p className="text-xs text-slate-500 dark:text-[#71717A]">
              Read our full{' '}
              <Link href="/privacy" className="text-amber-400 underline">
                Privacy Policy
              </Link>{' '}
              for details on how data is handled.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setPreferences({ functional: true, analytics: true, marketing: true })}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141417] border border-slate-200 dark:border-[#27272A] hover:border-amber-400 text-xs font-bold text-slate-900 dark:text-white transition-colors"
              >
                Accept All Cookies
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
              >
                Save My Preferences
              </button>
            </div>
          </div>

          {saved && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your cookie consent preferences have been updated successfully.</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
