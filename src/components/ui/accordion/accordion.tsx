'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion: typeof AccordionPrimitive.Root = AccordionPrimitive.Root;

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Item>>;
}

export function AccordionItem({ ref, className, ...props }: AccordionItemProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn('border-b border-border-subtle', className)}
      {...props}
    />
  );
}

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Trigger>>;
}

export function AccordionTrigger({
  ref,
  className,
  children,
  ...props
}: AccordionTriggerProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-fg-primary cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          '[&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 text-fg-muted" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export interface AccordionContentProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> {
  ref?: React.Ref<React.ComponentRef<typeof AccordionPrimitive.Content>>;
}

export function AccordionContent({
  ref,
  className,
  children,
  ...props
}: AccordionContentProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 pt-0 text-fg-muted', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
