'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  ref?: React.Ref<React.ComponentRef<typeof CheckboxPrimitive.Root>>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  indeterminate?: boolean;
}

/**
 * Enterprise Checkbox Primitive.
 * Supports checked, unchecked, and indeterminate states with accessible label binding.
 */
export function Checkbox({
  ref,
  className,
  id: explicitId,
  checked,
  indeterminate,
  label,
  description,
  error,
  disabled,
  ...props
}: CheckboxProps): React.JSX.Element {
  const generatedId = React.useId();
  const checkboxId = explicitId ?? generatedId;
  const descriptionId = description ? `${checkboxId}-desc` : undefined;
  const errorId = error ? `${checkboxId}-err` : undefined;

  const effectiveChecked = indeterminate ? 'indeterminate' : checked;

  return (
    <div className="flex items-start gap-2.5">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        checked={effectiveChecked}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'peer size-4.5 shrink-0 rounded-xs border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
          'cursor-pointer select-none',
          error
            ? 'border-destructive'
            : 'border-border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {indeterminate ? (
            <Minus className="size-3.5 stroke-[3]" />
          ) : (
            <Check className="size-3.5 stroke-[3]" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {(label || description || error) && (
        <div className="grid gap-1 leading-none pt-0.5">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium text-fg-primary select-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}

          {description && !error && (
            <p id={descriptionId} className="text-xs text-fg-muted">
              {description}
            </p>
          )}

          {error && (
            <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
