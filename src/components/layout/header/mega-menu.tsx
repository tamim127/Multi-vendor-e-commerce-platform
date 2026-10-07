'use client';

import * as React from 'react';
import { LayoutGrid, ChevronDown, ArrowRight, Laptop, Shirt, Home, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MegaMenuCategory } from '@/types/navigation';
import { defaultMegaMenuCategories } from '@/config/navigation';
import { Container } from '@/components/layout/container/container';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  laptop: Laptop,
  shirt: Shirt,
  home: Home,
  sparkles: Sparkles,
};

export interface MegaMenuProps {
  categories?: MegaMenuCategory[];
  className?: string;
}

/**
 * Enterprise Mega Menu Foundation.
 * Accessible multi-column category catalogue with keyboard management,
 * category tab switching, and featured campaign card.
 */
export function MegaMenu({
  categories = defaultMegaMenuCategories,
  className,
}: MegaMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>(categories[0]?.id || '');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId) || categories[0];

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={menuRef} onKeyDown={handleKeyDown} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle all categories catalogue"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-xs tracking-wide transition-colors cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          isOpen
            ? 'bg-primary text-primary-foreground'
            : 'bg-surface-muted text-fg-primary hover:bg-surface-elevated hover:text-primary'
        )}
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
        <span>All Categories</span>
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Catalogue categories"
          className={cn(
            'fixed left-0 right-0 top-[var(--header-bottom,120px)] z-40 bg-surface-elevated/95 backdrop-blur-md border-y border-border-subtle shadow-xl',
            'animate-in fade-in-0 duration-150'
          )}
        >
          <Container size="standard" className="py-6">
            <div className="grid grid-cols-12 gap-8 min-h-[340px]">
              {/* Left Column: Category Tabs */}
              <div
                role="tablist"
                aria-label="Category tabs"
                className="col-span-3 border-r border-border-subtle pr-4 space-y-1"
              >
                {categories.map((category) => {
                  const Icon = category.icon ? categoryIcons[category.icon] : null;
                  const isActive = category.id === activeCategoryId;

                  return (
                    <button
                      key={category.id}
                      role="tab"
                      id={`tab-${category.id}`}
                      aria-selected={isActive}
                      aria-controls={`panel-${category.id}`}
                      onClick={() => setActiveCategoryId(category.id)}
                      onMouseEnter={() => setActiveCategoryId(category.id)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2.5 rounded-md text-xs font-semibold text-left transition-colors cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isActive
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-fg-secondary hover:bg-surface-muted hover:text-fg-primary'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {Icon && <Icon className="size-4 shrink-0 text-current opacity-80" />}
                        <span>{category.label}</span>
                      </div>
                      {category.badge && (
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                          {category.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Center Columns: Grouped Links */}
              <div
                id={`panel-${activeCategory?.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeCategory?.id}`}
                className="col-span-6 grid grid-cols-2 gap-6 pl-2"
              >
                {activeCategory?.columns.map((column) => (
                  <div key={column.id} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-fg-primary border-b border-border-subtle pb-1.5">
                      {column.title}
                    </h4>
                    <ul className="space-y-2">
                      {column.items.map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-fg-muted hover:text-primary transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Column: Featured Campaign Card */}
              {activeCategory?.featured && (
                <div className="col-span-3 border-l border-border-subtle pl-6 flex flex-col justify-between">
                  <div className="space-y-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Curated Spotlight
                    </span>
                    <h5 className="text-sm font-bold text-fg-primary leading-tight">
                      {activeCategory.featured.title}
                    </h5>
                    <p className="text-xs text-fg-muted leading-relaxed">
                      {activeCategory.featured.description}
                    </p>
                    <a
                      href={activeCategory.featured.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <span>{activeCategory.featured.ctaText}</span>
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </a>
                  </div>

                  <div className="pt-4 text-center">
                    <a
                      href={activeCategory.href}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-medium text-fg-muted hover:text-fg-primary underline underline-offset-4"
                    >
                      View all in {activeCategory.label}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
