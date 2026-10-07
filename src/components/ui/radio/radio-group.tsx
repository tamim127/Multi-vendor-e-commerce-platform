'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Root>>;
}

export function RadioGroup({ ref, className, ...props }: RadioGroupProps): React.JSX.Element {
  return (
    <RadioGroupPrimitive.Root className={cn('grid gap-2.5', className)} {...props} ref={ref} />
  );
}

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Item>>;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function RadioGroupItem({
  ref,
  className,
  id: explicitId,
  label,
  description,
  disabled,
  ...props
}: RadioGroupItemProps): React.JSX.Element {
  const generatedId = React.useId();
  const itemId = explicitId ?? generatedId;
  const descriptionId = description ? `${itemId}-desc` : undefined;

  return (
    <div className="flex items-start gap-2.5">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={itemId}
        disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(
          'aspect-square size-4.5 rounded-full border border-border-strong text-primary transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
          'data-[state=checked]:border-primary cursor-pointer select-none',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="size-2.5 fill-primary text-primary" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      {(label || description) && (
        <div className="grid gap-1 leading-none pt-0.5">
          {label && (
            <label
              htmlFor={itemId}
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
