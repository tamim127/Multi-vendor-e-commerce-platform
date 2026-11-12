import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  interactive?: boolean;
}

/**
 * Enterprise Composable Card Primitive.
 * Token-driven surface container for products, dashboards, sellers, and analytics.
 */
export function Card({
  ref,
  className,
  interactive = false,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-slate-100/80 bg-surface text-fg-primary shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300',
        interactive &&
          'hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)] hover:border-primary/20 hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardHeader({ ref, className, ...props }: CardHeaderProps): React.JSX.Element {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLHeadingElement>;
}

export function CardTitle({ ref, className, ...props }: CardTitleProps): React.JSX.Element {
  return (
    <h3
      ref={ref}
      className={cn(
        'font-semibold leading-none tracking-tight text-fg-primary text-base',
        className
      )}
      {...props}
    />
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>;
}

export function CardDescription({
  ref,
  className,
  ...props
}: CardDescriptionProps): React.JSX.Element {
  return <p ref={ref} className={cn('text-sm text-fg-muted', className)} {...props} />;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardContent({ ref, className, ...props }: CardContentProps): React.JSX.Element {
  return <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardFooter({ ref, className, ...props }: CardFooterProps): React.JSX.Element {
  return <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}
