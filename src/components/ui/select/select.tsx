'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root;
export const SelectGroup: typeof SelectPrimitive.Group = SelectPrimitive.Group;
export const SelectValue: typeof SelectPrimitive.Value = SelectPrimitive.Value;

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Trigger>>;
  error?: boolean;
}

export function SelectTrigger({
  ref,
  className,
  children,
  error,
  ...props
}: SelectTriggerProps): React.JSX.Element {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm text-fg-primary',
        'placeholder:text-fg-muted cursor-pointer transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
        '[&>span]:line-clamp-1',
        error
          ? 'border-destructive focus:ring-destructive'
          : 'border-border-default focus:border-border-focus',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 opacity-60 text-fg-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectScrollUpButtonProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.ScrollUpButton
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>>;
}

export function SelectScrollUpButton({
  ref,
  className,
  ...props
}: SelectScrollUpButtonProps): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-fg-muted',
        className
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

export interface SelectScrollDownButtonProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.ScrollDownButton
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>>;
}

export function SelectScrollDownButton({
  ref,
  className,
  ...props
}: SelectScrollDownButtonProps): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-fg-muted',
        className
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Content>>;
}

export function SelectContent({
  ref,
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps): React.JSX.Element {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border-subtle bg-surface-elevated text-fg-primary shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectLabelProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Label
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Label>>;
}

export function SelectLabel({ ref, className, ...props }: SelectLabelProps): React.JSX.Element {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('py-1.5 pl-8 pr-2 text-xs font-semibold text-fg-muted', className)}
      {...props}
    />
  );
}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Item>>;
}

export function SelectItem({
  ref,
  className,
  children,
  ...props
}: SelectItemProps): React.JSX.Element {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        'focus:bg-surface-muted focus:text-fg-primary',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Separator
> {
  ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Separator>>;
}

export function SelectSeparator({
  ref,
  className,
  ...props
}: SelectSeparatorProps): React.JSX.Element {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border-subtle', className)}
      {...props}
    />
  );
}
