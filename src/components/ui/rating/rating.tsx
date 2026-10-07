import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  reviewCount?: number;
  showValue?: boolean;
  size?: RatingSize;
}

const sizeClasses: Record<RatingSize, { star: string; text: string }> = {
  sm: { star: 'size-3.5', text: 'text-xs' },
  md: { star: 'size-4', text: 'text-sm' },
  lg: { star: 'size-5', text: 'text-base' },
};

/**
 * Enterprise Commerce Rating Primitive.
 * Renders fractional star visualization with accessible ARIA descriptions and review counters.
 */
export function Rating({
  value,
  max = 5,
  reviewCount,
  showValue = true,
  size = 'md',
  className,
  ...props
}: RatingProps): React.JSX.Element {
  const clampedValue = Math.max(0, Math.min(value, max));

  const accessibleLabel = React.useMemo(() => {
    let label = `${clampedValue.toFixed(1)} out of ${max} stars`;
    if (reviewCount !== undefined) {
      label += ` based on ${reviewCount.toLocaleString()} reviews`;
    }
    return label;
  }, [clampedValue, max, reviewCount]);

  return (
    <div
      className={cn('inline-flex items-center gap-1.5 select-none', className)}
      aria-label={accessibleLabel}
      {...props}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: max }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, clampedValue - index));

          return (
            <div key={index} className="relative inline-flex items-center">
              {/* Background empty star */}
              <Star
                className={cn('text-border-strong', sizeClasses[size].star)}
                strokeWidth={1.5}
              />

              {/* Foreground filled/partial star */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star
                    className={cn('fill-rating-star text-rating-star', sizeClasses[size].star)}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span
          className={cn('font-semibold text-fg-primary tabular-nums', sizeClasses[size].text)}
          aria-hidden="true"
        >
          {clampedValue.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span
          className={cn('text-fg-muted tabular-nums', sizeClasses[size].text)}
          aria-hidden="true"
        >
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
