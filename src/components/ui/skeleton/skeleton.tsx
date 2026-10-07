import * as React from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Base Skeleton shimmer primitive.
 * Automatically disables pulsation under prefers-reduced-motion: reduce.
 */
export function Skeleton({ className, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-muted motion-reduce:animate-none',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
}

/**
 * Multi-line or single-line text skeleton.
 */
export function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonTextProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2 w-full', className)} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5 w-full', index === lines - 1 && lines > 1 && 'w-3/5')}
        />
      ))}
    </div>
  );
}

export interface SkeletonAvatarProps extends SkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
};

/**
 * Circular avatar skeleton.
 */
export function SkeletonAvatar({
  size = 'md',
  className,
  ...props
}: SkeletonAvatarProps): React.JSX.Element {
  return (
    <Skeleton className={cn('rounded-full shrink-0', avatarSizes[size], className)} {...props} />
  );
}

/**
 * Rectangular block skeleton.
 */
export function SkeletonBlock({ className, ...props }: SkeletonProps): React.JSX.Element {
  return <Skeleton className={cn('h-32 w-full rounded-md', className)} {...props} />;
}

/**
 * Media/Image placeholder skeleton with standard commerce aspect ratio.
 */
export function SkeletonImage({
  aspectRatio = 'aspect-[4/5]',
  className,
  ...props
}: SkeletonProps & { aspectRatio?: string }): React.JSX.Element {
  return <Skeleton className={cn('w-full rounded-md', aspectRatio, className)} {...props} />;
}

/**
 * Full card loading skeleton with media and text blocks.
 */
export function SkeletonCard({ className, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col gap-3 rounded-lg border border-border-subtle p-4', className)}
      aria-hidden="true"
      {...props}
    >
      <Skeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-xs" />
      <Skeleton className="h-3.5 w-1/2 rounded-xs" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-20 rounded-xs" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
