import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner/spinner';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'link' | 'icon';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:opacity-95 shadow-xs',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:opacity-95 shadow-xs',
  tertiary:
    'bg-surface text-fg-primary border border-border-default hover:bg-surface-muted active:bg-surface-elevated shadow-xs',
  ghost: 'text-fg-primary hover:bg-surface-muted hover:text-fg-primary active:bg-surface-elevated',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:opacity-95 shadow-xs',
  link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
  icon: 'text-fg-primary hover:bg-surface-muted hover:text-fg-primary active:bg-surface-elevated rounded-full',
};

const buttonSizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-xs min-h-[32px]',
  sm: 'h-9 px-3 text-xs rounded-sm min-h-[36px]',
  md: 'h-10 px-4 text-sm rounded-md min-h-[40px]',
  lg: 'h-11 px-5 text-base rounded-md min-h-[44px]',
  xl: 'h-12 px-6 text-lg rounded-lg min-h-[48px]',
};

export interface ButtonVariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  touchTarget?: boolean;
  className?: string;
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  touchTarget = false,
  className,
}: ButtonVariantOptions = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
    buttonVariantStyles[variant],
    buttonSizeStyles[size],
    touchTarget && 'min-h-[44px] min-w-[44px]',
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  touchTarget?: boolean;
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Enterprise Button Primitive.
 * Supports design token variants, responsive sizing, accessible loading states,
 * and WCAG 2.2 touch target compliance.
 */
export function Button({
  ref,
  className,
  variant = 'primary',
  size = 'md',
  touchTarget,
  asChild = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const isIconOnly = variant === 'icon';
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (props.type ?? 'button')}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      className={cn(
        buttonVariants({
          variant,
          size,
          touchTarget: touchTarget ?? (size === 'lg' || size === 'xl'),
          className,
        })
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
          {loadingText ? <span>{loadingText}</span> : isIconOnly ? null : children}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
        </>
      )}
    </Comp>
  );
}
