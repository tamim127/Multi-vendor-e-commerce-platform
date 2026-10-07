import * as React from 'react';
import { cn } from '@/lib/utils';

export type ContainerSize = 'narrow' | 'standard' | 'wide' | 'fluid' | 'full';

const containerSizeStyles: Record<ContainerSize, string> = {
  narrow: 'max-w-4xl',
  standard: 'max-w-7xl',
  wide: 'max-w-[1536px]',
  fluid: 'max-w-[1920px]',
  full: 'w-full',
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  size?: ContainerSize;
  noGutters?: boolean;
}

/**
 * Enterprise Responsive Container Primitive.
 * Ensures consistent gutters and maximum width boundaries across all viewports.
 */
export function Container({
  ref,
  size = 'standard',
  noGutters = false,
  className,
  children,
  ...props
}: ContainerProps): React.JSX.Element {
  return (
    <div
      ref={ref}
      className={cn(
        'w-full mx-auto',
        !noGutters && 'px-4 sm:px-6 lg:px-8',
        containerSizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type SectionSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sectionSpacingStyles: Record<SectionSpacing, string> = {
  none: 'py-0',
  xs: 'py-4 md:py-6',
  sm: 'py-6 md:py-8',
  md: 'py-8 md:py-12',
  lg: 'py-12 md:py-16',
  xl: 'py-16 md:py-24',
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  spacing?: SectionSpacing;
  bleed?: boolean;
}

/**
 * Semantic Section Primitive with responsive vertical spacing.
 */
export function Section({
  ref,
  spacing = 'md',
  bleed = false,
  className,
  children,
  ...props
}: SectionProps): React.JSX.Element {
  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full',
        sectionSpacingStyles[spacing],
        bleed && 'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export interface SkipToContentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
}

/**
 * WCAG 2.2 AA compliant Skip to Content link.
 * Remains visually hidden until focused via keyboard navigation.
 */
export function SkipToContent({
  targetId = 'main-content',
  className,
  children = 'Skip to main content',
  ...props
}: SkipToContentProps): React.JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]',
        'focus:px-4 focus:py-2.5 focus:rounded-md focus:bg-primary focus:text-primary-foreground',
        'focus:font-medium focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-canvas',
        'transition-all duration-150 select-none',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
