'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const avatarSizeStyles: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
};

export interface AvatarVariantOptions {
  size?: AvatarSize;
  className?: string;
}

export function avatarVariants({ size = 'md', className }: AvatarVariantOptions = {}): string {
  return cn(
    'relative flex shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface-muted',
    avatarSizeStyles[size],
    className
  );
}

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-fg-muted',
  busy: 'bg-destructive',
  away: 'bg-warning',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'size-1.5 ring-1',
  sm: 'size-2 ring-1.5',
  md: 'size-2.5 ring-2',
  lg: 'size-3 ring-2',
  xl: 'size-4 ring-2',
};

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Root>>;
  size?: AvatarSize;
  status?: AvatarStatus;
  statusLabel?: string;
}

export function Avatar({
  ref,
  className,
  size = 'md',
  status,
  statusLabel,
  children,
  ...props
}: AvatarProps): React.JSX.Element {
  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-canvas',
            statusColors[status],
            statusSizes[size]
          )}
        >
          {statusLabel && <span className="sr-only">{statusLabel}</span>}
        </span>
      )}
    </div>
  );
}

export interface AvatarImageProps extends React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Image
> {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Image>>;
}

export function AvatarImage({ ref, className, ...props }: AvatarImageProps): React.JSX.Element {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Fallback
> {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Fallback>>;
}

export function AvatarFallback({
  ref,
  className,
  ...props
}: AvatarFallbackProps): React.JSX.Element {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center font-medium text-fg-secondary uppercase select-none',
        className
      )}
      {...props}
    />
  );
}
