'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Drawer: typeof DialogPrimitive.Root = DialogPrimitive.Root;
export const DrawerTrigger: typeof DialogPrimitive.Trigger = DialogPrimitive.Trigger;
export const DrawerClose: typeof DialogPrimitive.Close = DialogPrimitive.Close;
export const DrawerPortal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal;

export interface DrawerOverlayProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Overlay>>;
}

export function DrawerOverlay({ ref, className, ...props }: DrawerOverlayProps): React.JSX.Element {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
      ref={ref}
    />
  );
}

export type DrawerSide = 'top' | 'bottom' | 'left' | 'right';

const drawerSideStyles: Record<DrawerSide, string> = {
  top: 'inset-x-0 top-0 border-b border-border-subtle data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom:
    'inset-x-0 bottom-0 rounded-t-xl border-t border-border-subtle data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[85vh] overflow-y-auto',
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border-subtle data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left overflow-y-auto',
  right:
    'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border-subtle data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right overflow-y-auto',
};

export interface DrawerVariantOptions {
  side?: DrawerSide;
  className?: string;
}

export function drawerVariants({ side = 'right', className }: DrawerVariantOptions = {}): string {
  return cn(
    'fixed z-50 gap-4 bg-surface-elevated p-6 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
    drawerSideStyles[side],
    className
  );
}

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Content>>;
  side?: DrawerSide;
}

export function DrawerContent({
  ref,
  side = 'right',
  className,
  children,
  ...props
}: DrawerContentProps): React.JSX.Element {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(drawerVariants({ side, className }))}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-xs p-1 text-fg-muted opacity-70 transition-opacity',
            'hover:opacity-100 hover:text-fg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label="Close drawer"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4',
        className
      )}
      {...props}
    />
  );
}

export interface DrawerTitleProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Title>>;
}

export function DrawerTitle({ ref, className, ...props }: DrawerTitleProps): React.JSX.Element {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold text-fg-primary', className)}
      {...props}
    />
  );
}

export interface DrawerDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Description>>;
}

export function DrawerDescription({
  ref,
  className,
  ...props
}: DrawerDescriptionProps): React.JSX.Element {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-fg-muted', className)}
      {...props}
    />
  );
}
