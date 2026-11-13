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

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        onSearchSubmit?.(query.trim());
      }
    }
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
          'relative flex items-center w-full rounded-full border bg-[#18181B] p-1 pl-3.5 transition-all duration-200 shadow-inner',
          isFocused
            ? 'border-amber-400/80 ring-2 ring-amber-400/20 ring-offset-0 bg-[#121214]'
            : 'border-[#27272A] hover:border-[#3F3F46]',
          compact ? 'h-9' : 'h-11'
        )}
      >
        {/* Leading Search Icon */}
        <div className="flex items-center pl-1 pointer-events-none text-[#71717A] shrink-0">
          <Search
            className={cn(
              'transition-colors',
              compact ? 'size-4' : 'size-4.5',
              isFocused && 'text-amber-400'
            )}
          />
        </div>

        {/* Input Element */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-label="Search query"
          autoComplete="off"
          spellCheck="false"
          className={cn(
            'w-full bg-transparent px-3 text-sm text-white placeholder:text-[#71717A]',
            'focus:outline-none focus:ring-0 select-text font-normal',
            '[&::-webkit-search-cancel-button]:hidden'
          )}
        />

        {/* Clear Affordance */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="flex items-center justify-center p-1.5 mr-1 text-[#71717A] hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}

        {/* Keyboard shortcut hint (desktop only when idle) */}
        {!query && !isFocused && !compact && (
          <div className="hidden lg:flex items-center pr-3 pointer-events-none">
            <kbd className="rounded-full border border-[#27272A] bg-[#27272A]/60 px-2 py-0.5 text-[10px] font-mono text-[#A1A1AA]">
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
            'flex items-center justify-center px-4 rounded-full bg-white text-slate-950 font-bold text-xs',
            'hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shrink-0 shadow-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
            compact ? 'h-7' : 'h-9'
          )}
        >
          <span className="hidden sm:inline font-bold">Search</span>
          <ArrowRight className="sm:hidden size-4" />
        </button>
      </div>
    </form>
  );
}
