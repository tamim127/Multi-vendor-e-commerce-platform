/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP PAGINATION
 * ==============================================================================
 * Accessible pagination controls updating canonical page state.
 */

'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';

export interface PlpPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PlpPagination({
  page,
  totalPages,
  onPageChange,
}: PlpPaginationProps): React.JSX.Element | null {
  const { t } = useI18n();

  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers array
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2 border-t border-border-subtle pt-6"
    >
      {/* Previous Page */}
      <Button
        type="button"
        variant="tertiary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="min-h-[44px] min-w-[44px] px-3 gap-1"
        aria-label={t('plp.pagePrevious')}
      >
        <ChevronLeft className="size-4 rtl:rotate-180" />
        <span className="hidden sm:inline">{t('plp.pagePrevious')}</span>
      </Button>

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const isCurrent = p === page;
          return (
            <Button
              key={p}
              type="button"
              variant={isCurrent ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`min-h-[44px] min-w-[44px] font-mono text-sm ${
                isCurrent ? 'font-bold' : ''
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {p}
            </Button>
          );
        })}
      </div>

      {/* Next Page */}
      <Button
        type="button"
        variant="tertiary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="min-h-[44px] min-w-[44px] px-3 gap-1"
        aria-label={t('plp.pageNext')}
      >
        <span className="hidden sm:inline">{t('plp.pageNext')}</span>
        <ChevronRight className="size-4 rtl:rotate-180" />
      </Button>
    </nav>
  );
}
