'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

const toastVariantStyles: Record<ToastVariant, string> = {
  info: 'border-info/30 bg-surface-elevated text-fg-primary [&>svg]:text-info',
  success: 'border-success/30 bg-surface-elevated text-fg-primary [&>svg]:text-success',
  warning: 'border-warning/30 bg-surface-elevated text-fg-primary [&>svg]:text-warning',
  error: 'border-destructive/30 bg-surface-elevated text-fg-primary [&>svg]:text-destructive',
  loading: 'border-border-default bg-surface-elevated text-fg-primary [&>svg]:text-primary',
};

export interface ToastVariantOptions {
  variant?: ToastVariant;
  className?: string;
}

export function toastVariants({ variant = 'info', className }: ToastVariantOptions = {}): string {
  return cn(
    'relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-200 select-none pointer-events-auto',
    toastVariantStyles[variant],
    className
  );
}

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
  loading: Loader2,
};

/**
 * Accessible Toast / Alert Primitive.
 * Communicates live announcements via role="status" / role="alert" with WCAG keyboard dismiss.
 */
export function Toast({
  variant = 'info',
  title,
  description,
  onDismiss,
  action,
  className,
  children,
  ...props
}: ToastProps): React.JSX.Element {
  const Icon = variantIcons[variant];
  const isDestructive = variant === 'error';

  return (
    <div
      role={isDestructive ? 'alert' : 'status'}
      aria-live={isDestructive ? 'assertive' : 'polite'}
      className={cn(toastVariants({ variant, className }))}
      {...props}
    >
      <Icon className={cn('size-5 shrink-0 mt-0.5', variant === 'loading' && 'animate-spin')} />

      <div className="flex-1 grid gap-1">
        {title && <h5 className="text-sm font-semibold leading-none text-fg-primary">{title}</h5>}
        {description && <p className="text-xs text-fg-muted leading-relaxed">{description}</p>}
        {children}
        {action && <div className="pt-2">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xs p-1 text-fg-muted opacity-70 transition-opacity hover:opacity-100 hover:text-fg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function ToastViewport({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-md gap-2 pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
