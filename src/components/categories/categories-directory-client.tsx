'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MEGA_NAV_CATEGORIES } from '@/components/layout/header/mega-nav-bar';

export function CategoriesDirectoryClient(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MEGA_NAV_CATEGORIES.map((cat) => {
        const Icon = cat.icon;

        return (
          <div
            key={cat.id}
            className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-gradient-to-b from-[#121216] to-[#0D0D10] p-6 shadow-xl flex flex-col justify-between hover:border-amber-400/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#1E1E24] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                      {cat.label}
                    </h2>
                    <span className="text-[11px] text-slate-500 dark:text-[#71717A]">Department</span>
                  </div>
                </div>

                {cat.badge && (
                  <span className="rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    {cat.badge}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {cat.columns?.map((col, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                      {col.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {col.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-[#18181B] hover:bg-amber-400/15 text-slate-600 dark:text-[#9CA3AF] hover:text-amber-300 border border-slate-200 dark:border-[#27272A] hover:border-amber-400/30 px-2.5 py-1 text-xs transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1E1E24] flex items-center justify-between">
              <Link
                href={cat.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Explore All {cat.label}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
