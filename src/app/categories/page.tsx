import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { CategoriesDirectoryClient } from '@/components/categories/categories-directory-client';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Categories | Aureon Marketplace',
  description: 'Explore all departments, categories, and subcategories on Aureon Marketplace.',
};

export default function CategoriesPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="border-b border-[#1E1E24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Full Marketplace Taxonomy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              All Departments & Categories
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
              Explore over 40,000+ certified products from global manufacturers and authorized merchants across 24 distinct commerce categories.
            </p>
          </div>

          {/* Departments Grid */}
          <CategoriesDirectoryClient />

          {/* Bottom Trust Banner */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-gradient-to-r from-amber-500/10 via-[#18181B] to-purple-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Can&apos;t find what you need?</h4>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5">
                  Try searching our global supplier database or contact our 24/7 dedicated trade desk.
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-6 py-3 shrink-0 shadow-lg shadow-amber-400/20 transition-all"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
