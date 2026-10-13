/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — BREADCRUMBS COMPONENT
 * ==============================================================================
 * Accessible, responsive hierarchical breadcrumbs trail reflecting category depth.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { Product } from '@/domains/catalog/types/product';

export interface PdpBreadcrumbsProps {
  product: Product;
}

export function PdpBreadcrumbs({ product }: PdpBreadcrumbsProps): React.JSX.Element {
  const { t, locale, isRtl } = useI18n();

  const title = product.title[locale as keyof typeof product.title] ?? product.title.en;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {t('common.home')}
          </Link>
        </li>

        <li aria-hidden="true">
          <ChevronRight className={`size-3 text-fg-subtle ${isRtl ? 'rotate-180' : ''}`} />
        </li>

        <li>
          <Link
            href="/products"
            className="hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {t('plp.products')}
          </Link>
        </li>

        {product.categoryBreadcrumbs?.map((crumb) => {
          const crumbName = crumb.name[locale as keyof typeof crumb.name] ?? crumb.name.en;
          return (
            <React.Fragment key={crumb.id}>
              <li aria-hidden="true">
                <ChevronRight className={`size-3 text-fg-subtle ${isRtl ? 'rotate-180' : ''}`} />
              </li>
              <li>
                <Link
                  href={`/products?category=${crumb.slug}`}
                  className="hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {crumbName}
                </Link>
              </li>
            </React.Fragment>
          );
        })}

        <li aria-hidden="true">
          <ChevronRight className={`size-3 text-fg-subtle ${isRtl ? 'rotate-180' : ''}`} />
        </li>

        <li
          className="font-medium text-fg-primary truncate max-w-xs sm:max-w-md"
          aria-current="page"
        >
          {title}
        </li>
      </ol>
    </nav>
  );
}
