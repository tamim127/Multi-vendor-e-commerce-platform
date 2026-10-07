import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

const badgeVariantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-muted text-fg-secondary border border-border-default',
  brand: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  info: 'bg-info/15 text-info border border-info/30',
};

const badgeSizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 rounded-full',
  md: 'text-xs px-2.5 py-0.5 rounded-full',
  lg: 'text-sm px-3 py-1 rounded-full',
};

export interface BadgeVariantOptions {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function badgeVariants({
  variant = 'neutral',
  size = 'md',
  className,
}: BadgeVariantOptions = {}): string {
  return cn(
    'inline-flex items-center gap-1.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 select-none',
    badgeVariantStyles[variant],
    badgeSizeStyles[size],
    className
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

/**
 * Enterprise Badge Primitive.
 * Status and category indicator with token-aligned colors and sizing.
 */
export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      {children}
    </div>
  );
}
