'use client';

import * as React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container/container';

export interface AnnouncementBarProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  badge?: string;
  actionText?: string;
  actionHref?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Enterprise Global Announcement Bar.
 * Displays sitewide campaigns, shipping notices, or service alerts with optional dismiss.
 */
export function AnnouncementBar({
  message = 'Complimentary global express shipping on all enterprise merchant orders over $150.',
  badge = 'Limited Offer',
  actionText = 'Explore Perks',
  actionHref = '/deals',
  dismissible = true,
  onDismiss,
  className,
  ...props
}: AnnouncementBarProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  if (!isVisible) return null;

  const handleDismiss = (): void => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <aside
      aria-label="Sitewide announcement"
      className={cn(
        'relative z-30 bg-primary text-primary-foreground py-2 text-xs font-medium transition-all duration-200',
        className
      )}
      {...props}
    >
      <Container size="standard" className="flex items-center justify-between gap-3 px-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          {badge && (
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
              {badge}
            </span>
          )}

          <span className="truncate max-w-[280px] sm:max-w-none">{message}</span>

          {actionText && actionHref && (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:opacity-90 font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground rounded-xs"
            >
              <span>{actionText}</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="rounded-xs p-1 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground cursor-pointer transition-colors shrink-0"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </Container>
    </aside>
  );
}
