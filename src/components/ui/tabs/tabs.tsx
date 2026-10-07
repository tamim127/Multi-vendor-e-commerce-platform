'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs: typeof TabsPrimitive.Root = TabsPrimitive.Root;

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.List>>;
}

export function TabsList({ ref, className, ...props }: TabsListProps): React.JSX.Element {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-surface-muted p-1 text-fg-muted',
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.Trigger>>;
}

export function TabsTrigger({ ref, className, ...props }: TabsTriggerProps): React.JSX.Element {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-xs px-3 py-1.5 text-sm font-medium transition-all select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        'data-[state=active]:bg-surface data-[state=active]:text-fg-primary data-[state=active]:shadow-xs',
        className
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> {
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.Content>>;
}

export function TabsContent({ ref, className, ...props }: TabsContentProps): React.JSX.Element {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-2 ring-offset-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}
