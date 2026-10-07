import * as React from 'react';
import { cn } from '@/lib/utils';
import { DesktopHeader } from '@/components/layout/header/desktop-header';
import { MobileHeader } from '@/components/layout/header/mobile-header';

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

/**
 * Enterprise Site Header.
 * Coordinates DesktopHeader and MobileHeader with sticky viewport positioning.
 */
export function SiteHeader({
  sticky = true,
  className,
  ...props
}: SiteHeaderProps): React.JSX.Element {
  return (
    <header
      role="banner"
      className={cn(
        'w-full z-40 transition-all duration-200',
        sticky && 'sticky top-0 shadow-2xs',
        className
      )}
      {...props}
    >
      <DesktopHeader />
      <MobileHeader />
    </header>
  );
}
