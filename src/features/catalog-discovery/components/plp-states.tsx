/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP STATES
 * ==============================================================================
 * Loading skeletons, empty state, and error state components.
 */

'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import { useI18n } from '@/lib/i18n';

/**
 * Layout-stable skeleton grid to prevent Cumulative Layout Shift (CLS).
 */
export function PlpSkeleton(): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between overflow-hidden rounded-lg border border-border-subtle bg-surface p-4 space-y-3"
          aria-hidden="true"
        >
          {/* Media placeholder */}
          <Skeleton className="aspect-square w-full rounded-md" />

          {/* Text placeholders */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-1/4 rounded-xs" />
            <Skeleton className="h-4 w-4/5 rounded-xs" />
            <Skeleton className="h-3.5 w-1/3 rounded-xs" />
          </div>

          {/* Price placeholder */}
          <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-xs" />
            <Skeleton className="h-3 w-12 rounded-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface PlpEmptyStateProps {
  onResetFilters: () => void;
}

/**
 * Zero-result state with informative messaging and reset action.
 */
export function PlpEmptyState({ onResetFilters }: PlpEmptyStateProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border-subtle rounded-xl bg-surface-subtle/30">
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted mb-4">
        <SearchX className="size-7" />
      </div>
      <h3 className="text-lg font-bold text-fg-primary mb-2">{t('plp.noResultsTitle')}</h3>
      <p className="text-sm text-fg-muted max-w-md mb-6">{t('plp.noResultsDesc')}</p>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={onResetFilters}
        className="min-h-[44px] px-6 font-medium"
      >
        {t('plp.resetFilters')}
      </Button>
    </div>
  );
}

export interface PlpErrorStateProps {
  onRetry: () => void;
  errorMessage?: string;
}

/**
 * Error recovery state with explicit retry trigger.
 */
export function PlpErrorState({ onRetry, errorMessage }: PlpErrorStateProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-16 px-4 text-center border border-destructive/20 rounded-xl bg-destructive/5"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="text-lg font-bold text-fg-primary mb-2">{t('plp.errorTitle')}</h3>
      <p className="text-sm text-fg-muted max-w-md mb-6">{errorMessage || t('plp.errorDesc')}</p>
      <Button
        type="button"
        variant="tertiary"
        size="md"
        onClick={onRetry}
        className="min-h-[44px] px-6 font-medium gap-2 border-border-strong"
      >
        <RefreshCw className="size-4" />
        {t('plp.retry')}
      </Button>
    </div>
  );
}
