import * as React from 'react';
import { cn } from '@/lib/utils';
import { SkipToContent } from '@/components/layout/container/container';
import { AnnouncementBar } from '@/components/layout/announcement-bar/announcement-bar';
import { SiteHeader } from '@/components/layout/header/site-header';
import { SiteFooter } from '@/components/layout/footer/footer';
import { MobileBottomNav } from '@/components/layout/footer/mobile-bottom-nav';

export interface AppShellProps {
  children: React.ReactNode;
  hideAnnouncement?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideBottomNav?: boolean;
  announcementMessage?: string;
  className?: string;
  mainClassName?: string;
}

/**
 * Enterprise Global Application Shell.
 * Integrates skip links, announcement bar, sticky responsive headers,
 * landmark content area, footer, and mobile bottom navigation.
 */
export function AppShell({
  children,
  hideAnnouncement = false,
  hideHeader = false,
  hideFooter = false,
  hideBottomNav = false,
  announcementMessage,
  className,
  mainClassName,
}: AppShellProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-canvas text-fg-primary antialiased selection:bg-primary selection:text-primary-foreground',
        className
      )}
    >
      {/* 1. Accessible Skip to Content Link */}
      <SkipToContent targetId="main-content" />

      {/* 2. Global Sitewide Announcement Bar */}
      {!hideAnnouncement && <AnnouncementBar message={announcementMessage} />}

      {/* 3. Global Responsive Header (Desktop + Mobile) */}
      {!hideHeader && <SiteHeader />}

      {/* 4. Primary Landmark Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn('flex-1 w-full outline-none focus:outline-none', mainClassName)}
      >
        {children}
      </main>

      {/* 5. Global Responsive Footer */}
      {!hideFooter && <SiteFooter />}

      {/* 6. Fixed Mobile Bottom Navigation */}
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
}
