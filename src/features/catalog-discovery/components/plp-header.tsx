/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP HEADER
 * ==============================================================================
 * Renders page title, breadcrumb trail, and description.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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

  const pageTitle = selectedCategory
    ? (selectedCategory.name[locale] ?? selectedCategory.name.en)
    : t('plp.title');

  const pageSubtitle = selectedCategory?.description
    ? (selectedCategory.description[locale] ?? selectedCategory.description.en)
    : t('plp.subtitle');

  return (
    <header className="mb-6 space-y-2">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 rtl:rotate-180" />
          </li>
          <li>
            <Link
              href="/products"
              className={
                breadcrumbs.length === 0
                  ? 'font-medium text-fg-primary'
                  : 'hover:text-fg-primary transition-colors'
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
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </li>
                <li>
                  {isLast ? (
                    <span className="font-medium text-fg-primary" aria-current="page">
                      {crumbName}
                    </span>
                  ) : (
                    <Link
                      href={`/products?category=${crumb.slug}`}
                      className="hover:text-fg-primary transition-colors"
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

      {/* Main Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg-primary">
          {pageTitle}
        </h1>
        <p className="mt-1 text-sm text-fg-muted max-w-2xl">{pageSubtitle}</p>
      </div>
    </header>
  );
}
