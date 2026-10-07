'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog: typeof DialogPrimitive.Root = DialogPrimitive.Root;
export const DialogTrigger: typeof DialogPrimitive.Trigger = DialogPrimitive.Trigger;
export const DialogPortal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal;
export const DialogClose: typeof DialogPrimitive.Close = DialogPrimitive.Close;

export interface DialogOverlayProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Overlay>>;
}

export function DialogOverlay({ ref, className, ...props }: DialogOverlayProps): React.JSX.Element {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Content>>;
}

export function DialogContent({
  ref,
  className,
  children,
  ...props
}: DialogContentProps): React.JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border-subtle bg-surface-elevated p-6 shadow-xl rounded-lg duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-xs p-1 text-fg-muted opacity-70 transition-opacity',
            'hover:opacity-100 hover:text-fg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:pointer-events-none'
          )}
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0',
        className
      )}
      {...props}
    />
  );
}

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Title>>;
}

export function DialogTitle({ ref, className, ...props }: DialogTitleProps): React.JSX.Element {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-fg-primary', className)}
      {...props}
    />
  );
}

export interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
> {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Description>>;
}

export function DialogDescription({
  ref,
  className,
  ...props
}: DialogDescriptionProps): React.JSX.Element {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-fg-muted', className)}
      {...props}
    />
  );
}
