'use client';

import * as React from 'react';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n, SUPPORTED_LOCALES, LOCALE_CONFIGS } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

/**
 * Enterprise Language Selector Component.
 * Allows seamless switching between English, Bangla, Arabic, and Hindi
 * with immediate document direction (LTR/RTL) and typography adaptation.
 */
export function LanguageSelector({
  compact = false,
  className,
}: LanguageSelectorProps): React.JSX.Element {
  const { locale, setLocale, isRtl } = useI18n();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (code: Locale): void => {
    setLocale(code);
    setIsOpen(false);
  };

  const currentConfig = LOCALE_CONFIGS[locale];

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={cn('relative inline-block text-start', className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language. Current language: ${currentConfig.name}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md p-1.5 text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
        )}
      >
        <Globe className="size-3.5 shrink-0" aria-hidden="true" />
        {!compact ? (
          <span className="font-semibold uppercase tracking-wider">
            {currentConfig.code} / {currentConfig.nativeName}
          </span>
        ) : (
          <span className="font-semibold uppercase">{currentConfig.code}</span>
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className={cn(
            'absolute z-50 mt-1 min-w-[12rem] rounded-md border border-border-subtle bg-surface-elevated p-1 shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            isRtl ? 'left-0' : 'right-0'
          )}
        >
          {SUPPORTED_LOCALES.map((code) => {
            const config = LOCALE_CONFIGS[code];
            const isSelected = code === locale;

            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(code)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 rounded-xs text-xs transition-colors cursor-pointer text-start',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-fg-primary hover:bg-surface-muted'
                )}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{config.nativeName}</span>
                  <span className="text-[10px] text-fg-muted">
                    {config.name} ({config.direction.toUpperCase()})
                  </span>
                </div>

                {isSelected && (
                  <Check className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
