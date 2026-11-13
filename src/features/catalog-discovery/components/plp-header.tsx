/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP HEADER
 * ==============================================================================
 * Renders page title, breadcrumb trail, and description with Aureon design styling.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ShieldCheck, Truck, Star } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/domains/catalog/fixtures';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import { getCategoryBreadcrumbs } from '@/domains/catalog/utils/tree';
import { useI18n } from '@/lib/i18n';

export interface PlpHeaderProps {
  params: CatalogQueryParams;
}

export function PlpHeader({ params }: PlpHeaderProps): React.JSX.Element {
  const { locale, t } = useI18n();

  const selectedCategory = params.categorySlug
    ? MOCK_CATEGORIES.find((c) => c.slug === params.categorySlug)
    : params.categoryId
      ? MOCK_CATEGORIES.find((c) => c.id === params.categoryId)
      : undefined;

  const breadcrumbs = selectedCategory
    ? getCategoryBreadcrumbs(selectedCategory.id, MOCK_CATEGORIES)
    : [];

  const hasQuery = Boolean(params.query && params.query.trim().length > 0);

  const pageTitle = hasQuery
    ? `${t('plp.searchResultsFor')}: \u201C${params.query}\u201D`
    : selectedCategory
      ? (selectedCategory.name[locale] ?? selectedCategory.name.en)
      : t('plp.title');

  const pageSubtitle = selectedCategory?.description
    ? (selectedCategory.description[locale] ?? selectedCategory.description.en)
    : selectedCategory
      ? ''
      : t('plp.subtitle');

  return (
    <header className="mb-6 space-y-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded-xs"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-slate-400 rtl:rotate-180" />
          </li>
          <li>
            <Link
              href="/products"
              className={
                breadcrumbs.length === 0
                  ? 'font-bold text-slate-900'
                  : 'hover:text-amber-600 transition-colors'
              }
            >
              {t('plp.products')}
            </Link>
          </li>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const crumbName = crumb.name[locale] ?? crumb.name.en;
            return (
              <React.Fragment key={crumb.id}>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5 text-slate-400 rtl:rotate-180" />
                </li>
                <li>
                  {isLast ? (
                    <span className="font-bold text-slate-900" aria-current="page">
                      {crumbName}
                    </span>
                  ) : (
                    <Link
                      href={`/products?category=${crumb.slug}`}
                      className="hover:text-amber-600 transition-colors"
                    >
                      {crumbName}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>

      {/* Hero Category Banner Card (Aureon Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0C0C0E] via-[#161411] to-[#0B0B0D] border border-[#27272A] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Verified Merchant Discovery</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              {pageTitle}
            </h1>

            {pageSubtitle && (
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>

          {/* Quick Assurance Badges */}
          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full text-[#D1D5DB]">
              <Truck className="h-3.5 w-3.5 text-amber-400" />
              <span>Fast Global Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full text-[#D1D5DB]">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Buyer Protection Escrow</span>
            </div>
            <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full text-[#D1D5DB]">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>4.8+ Rated Multi-Vendors</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
