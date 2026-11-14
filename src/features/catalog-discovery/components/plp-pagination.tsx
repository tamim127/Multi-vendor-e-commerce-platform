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

  // Generate smart page numbers with ellipsis
  const visiblePages: (number | 'ellipsis')[] = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
  }, [page, totalPages]);

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

      {/* Numbered Page Buttons with Ellipsis */}
      <div className="flex items-center gap-1">
        {visiblePages.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex items-center justify-center w-8 text-fg-muted font-bold select-none"
              >
                ...
              </span>
            );
          }
          const isCurrent = item === page;
          return (
            <Button
              key={item}
              type="button"
              variant={isCurrent ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => onPageChange(item)}
              className={`min-h-[44px] min-w-[44px] font-mono text-sm ${
                isCurrent ? 'font-bold bg-amber-400 text-slate-950 hover:bg-amber-300' : ''
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {item}
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
