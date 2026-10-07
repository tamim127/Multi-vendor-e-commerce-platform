'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  ref?: React.Ref<React.ComponentRef<typeof SwitchPrimitives.Root>>;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * Enterprise Switch Primitive.
 * Accessible toggle control with label binding and keyboard navigation.
 */
export function Switch({
  ref,
  className,
  id: explicitId,
  label,
  description,
  disabled,
  ...props
}: SwitchProps): React.JSX.Element {
  const generatedId = React.useId();
  const switchId = explicitId ?? generatedId;
  const descriptionId = description ? `${switchId}-desc` : undefined;

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitives.Root
        id={switchId}
        ref={ref}
        disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-border-strong',
          className
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block size-5 rounded-full bg-surface shadow-xs transition-transform',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitives.Root>

      {(label || description) && (
        <div className="grid gap-0.5 leading-none">
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                'text-sm font-medium text-fg-primary select-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="text-xs text-fg-muted">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
