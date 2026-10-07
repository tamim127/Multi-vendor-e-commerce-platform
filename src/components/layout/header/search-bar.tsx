'use client';

import * as React from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends React.FormHTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  initialQuery?: string;
  onSearchSubmit?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  isLoading?: boolean;
  expanded?: boolean;
  compact?: boolean;
}

/**
 * Enterprise Marketplace Search Bar UI Shell.
 * Supports visual focus states, keyboard clear affordance, shortcut hint, and accessible search landmarks.
 */
export function SearchBar({
  placeholder = 'Search millions of products, verified merchants, and brands...',
  initialQuery = '',
  onSearchSubmit,
  onQueryChange,
  isLoading = false,
  expanded = false,
  compact = false,
  className,
  ...props
}: SearchBarProps): React.JSX.Element {
  const [query, setQuery] = React.useState<string>(initialQuery);
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setQuery(val);
    onQueryChange?.(val);
  };

  const handleClear = (): void => {
    setQuery('');
    onQueryChange?.('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit?.(query.trim());
    }
  };

  return (
    <form
      role="search"
      aria-label="Marketplace search"
      onSubmit={handleSubmit}
      className={cn(
        'relative flex items-center w-full transition-all duration-200',
        expanded ? 'max-w-3xl' : 'max-w-2xl',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex items-center w-full rounded-md border bg-surface transition-all duration-200 shadow-2xs',
          isFocused
            ? 'border-primary ring-2 ring-primary/20 ring-offset-1 ring-offset-canvas'
            : 'border-border-default hover:border-border-strong',
          compact ? 'h-9' : 'h-11'
        )}
      >
        {/* Leading Search Icon */}
        <div className="flex items-center pl-3.5 pointer-events-none text-fg-muted shrink-0">
          <Search
            className={cn(
              'transition-colors',
              compact ? 'size-4' : 'size-4.5',
              isFocused && 'text-primary'
            )}
          />
        </div>

        {/* Input Element */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-label="Search query"
          autoComplete="off"
          spellCheck="false"
          className={cn(
            'w-full bg-transparent px-3 text-sm text-fg-primary placeholder:text-fg-muted',
            'focus:outline-none focus:ring-0 select-text',
            '[&::-webkit-search-cancel-button]:hidden'
          )}
        />

        {/* Clear Affordance */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="flex items-center justify-center p-1.5 mr-1 text-fg-muted hover:text-fg-primary rounded-xs transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}

        {/* Keyboard shortcut hint (desktop only when idle) */}
        {!query && !isFocused && !compact && (
          <div className="hidden lg:flex items-center pr-3 pointer-events-none">
            <kbd className="rounded-xs border border-border-default bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-fg-muted">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Perform search"
          className={cn(
            'flex items-center justify-center px-4 rounded-r-[5px] bg-primary text-primary-foreground font-medium text-xs',
            'hover:bg-primary-hover active:opacity-95 transition-colors cursor-pointer shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            compact ? 'h-9' : 'h-11'
          )}
        >
          <span className="hidden sm:inline font-semibold">Search</span>
          <ArrowRight className="sm:hidden size-4" />
        </button>
      </div>
    </form>
  );
}
