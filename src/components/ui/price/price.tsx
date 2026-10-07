import * as React from 'react';
import { cn } from '@/lib/utils';

export type PriceSize = 'sm' | 'md' | 'lg' | 'hero';
export type PriceEmphasis = 'default' | 'sale';

const priceSizeStyles: Record<PriceSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-bold',
  hero: 'text-3xl font-extrabold',
};

const priceEmphasisStyles: Record<PriceEmphasis, string> = {
  default: '',
  sale: 'text-price-sale',
};

export interface PriceVariantOptions {
  size?: PriceSize;
  emphasis?: PriceEmphasis;
  className?: string;
}

export function priceVariants({
  size = 'md',
  emphasis = 'default',
  className,
}: PriceVariantOptions = {}): string {
  return cn(
    'inline-flex items-baseline gap-2 font-mono tabular-nums',
    priceSizeStyles[size],
    priceEmphasisStyles[emphasis],
    className
  );
}

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  current: string;
  compareAt?: string;
  discount?: string;
  currencyCode?: string;
  compact?: boolean;
  size?: PriceSize;
  emphasis?: PriceEmphasis;
}

/**
 * Enterprise Commerce Price Primitive.
 * Displays formatted currency prices, discount percentages, and compare-at strikes
 * with WCAG screen-reader announcements.
 */
export function Price({
  current,
  compareAt,
  discount,
  currencyCode,
  compact = false,
  size = 'md',
  emphasis,
  className,
  ...props
}: PriceProps): React.JSX.Element {
  const isSale = Boolean(compareAt);
  const effectiveEmphasis = emphasis ?? (isSale ? 'sale' : 'default');

  const accessibleLabel = React.useMemo(() => {
    let label = `Current price ${current}`;
    if (compareAt) label += `, original price ${compareAt}`;
    if (discount) label += `, save ${discount}`;
    if (currencyCode) label += ` ${currencyCode}`;
    return label;
  }, [current, compareAt, discount, currencyCode]);

  return (
    <div
      className={cn(priceVariants({ size, emphasis: effectiveEmphasis, className }))}
      aria-label={accessibleLabel}
      {...props}
    >
      <span className={cn('font-bold', isSale ? 'text-price-sale' : 'text-price')}>{current}</span>

      {compareAt && (
        <span className="text-price-strike line-through text-xs font-normal opacity-70">
          {compareAt}
        </span>
      )}

      {discount && !compact && (
        <span className="rounded-xs bg-destructive/10 px-1.5 py-0.5 text-xs font-semibold text-destructive">
          {discount}
        </span>
      )}

      {currencyCode && (
        <span className="text-2xs text-fg-muted uppercase tracking-wider font-normal">
          {currencyCode}
        </span>
      )}
    </div>
  );
}
