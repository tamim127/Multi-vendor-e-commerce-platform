'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer/drawer';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion/accordion';
import { Button } from '@/components/ui/button/button';
import { Menu, User, Store, HelpCircle, Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultMegaMenuCategories, primaryNavigationLinks } from '@/config/navigation';
import { useTheme } from '@/lib/theme/theme-context';

export interface MobileDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Enterprise Mobile Navigation Drawer.
 * Built on Phase 1D Drawer primitive with category accordions and theme controls.
 */
export function MobileDrawer({
  open,
  onOpenChange,
  className,
}: MobileDrawerProps): React.JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Open mobile navigation menu"
          className={cn(
            'flex size-10 items-center justify-center rounded-md text-fg-primary hover:bg-surface-muted transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            className
          )}
        >
          <Menu className="size-5.5" />
        </button>
      </DrawerTrigger>

      <DrawerContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col justify-between">
        {/* Drawer Header with User Access */}
        <div>
          <DrawerHeader className="p-5 border-b border-border-subtle bg-surface-muted/50 text-left">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                <User className="size-5" />
              </div>
              <div className="flex flex-col text-left">
                <DrawerTitle className="text-sm font-bold text-fg-primary">
                  Welcome to Marketplace
                </DrawerTitle>
                <DrawerDescription className="text-xs text-fg-muted">
                  Sign in for personalized recommendations
                </DrawerDescription>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button size="sm" variant="primary" asChild>
                <a href="/account/login">Sign In</a>
              </Button>
              <Button size="sm" variant="tertiary" asChild>
                <a href="/account/register">Register</a>
              </Button>
            </div>
          </DrawerHeader>

          {/* Navigation Sections */}
          <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
            {/* Quick Links */}
            <div className="space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-fg-muted block mb-2">
                Featured Highlights
              </span>
              {primaryNavigationLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between py-2 text-sm font-semibold text-fg-primary hover:text-primary transition-colors"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase text-destructive bg-destructive/15 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div className="h-px bg-border-subtle" />

            {/* Category Catalogue Accordion */}
            <div className="space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-fg-muted block">
                Shop By Category
              </span>
              <Accordion type="single" collapsible className="w-full">
                {defaultMegaMenuCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm font-medium py-2.5">
                      {category.label}
                    </AccordionTrigger>
                    <AccordionContent className="pl-3 space-y-2 pt-1 pb-3">
                      {category.columns
                        .flatMap((col) => col.items)
                        .map((subItem) => (
                          <a
                            key={subItem.id}
                            href={subItem.href}
                            className="block text-xs text-fg-muted hover:text-primary py-1"
                          >
                            {subItem.label}
                          </a>
                        ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="h-px bg-border-subtle" />

            {/* Seller & Support Portals */}
            <div className="space-y-2.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-fg-muted block">
                Merchant &amp; Services
              </span>
              <a
                href="/seller/register"
                className="flex items-center gap-2.5 text-xs font-semibold text-fg-secondary hover:text-primary py-1"
              >
                <Store className="size-4 text-primary" />
                <span>Become a Verified Seller</span>
              </a>
              <a
                href="/help"
                className="flex items-center gap-2.5 text-xs font-semibold text-fg-secondary hover:text-primary py-1"
              >
                <HelpCircle className="size-4 text-fg-muted" />
                <span>Customer Care &amp; Disputes</span>
              </a>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Theme Controller */}
        <DrawerFooter className="p-4 border-t border-border-subtle bg-surface-muted/40">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-fg-muted">Appearance:</span>
            <div className="flex items-center gap-1 bg-surface rounded-md p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                className={cn(
                  'p-1.5 rounded-xs transition-colors',
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-fg-muted hover:text-fg-primary'
                )}
              >
                <Sun className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                className={cn(
                  'p-1.5 rounded-xs transition-colors',
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-fg-muted hover:text-fg-primary'
                )}
              >
                <Moon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                aria-label="System preference"
                className={cn(
                  'p-1.5 rounded-xs transition-colors',
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-fg-muted hover:text-fg-primary'
                )}
              >
                <Laptop className="size-3.5" />
              </button>
            </div>
          </div>

          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
              Close Menu
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
