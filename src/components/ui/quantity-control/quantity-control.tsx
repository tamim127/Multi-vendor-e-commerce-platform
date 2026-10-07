'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner/spinner';

export interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  className?: string;
}

/**
 * Enterprise Commerce Quantity Control Primitive.
 * Accessible numeric stepper with increment, decrement, direct numeric input,
 * and boundary validation.
 */
export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  loading = false,
  id: explicitId,
  className,
}: QuantityControlProps): React.JSX.Element {
  const generatedId = React.useId();
  const inputId = explicitId ?? generatedId;

  const [inputValue, setInputValue] = React.useState<string>(String(value));

  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleDecrement = (): void => {
    if (disabled || loading) return;
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = (): void => {
    if (disabled || loading) return;
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = (): void => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < min) {
      setInputValue(String(min));
      onChange(min);
    } else if (parsed > max) {
      setInputValue(String(max));
      onChange(max);
    } else {
      setInputValue(String(parsed));
      onChange(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-border-default bg-surface shadow-xs',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        disabled={disabled || loading || isMin}
        onClick={handleDecrement}
        aria-label="Decrease quantity"
        className={cn(
          'flex size-9 items-center justify-center rounded-l-md text-fg-primary transition-colors',
          'hover:bg-surface-muted active:bg-surface-elevated',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
          'disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'
        )}
      >
        <Minus className="size-3.5" />
      </button>

      <div className="relative flex items-center justify-center">
        {loading ? (
          <div className="flex w-12 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : (
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            disabled={disabled}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label="Quantity"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            className={cn(
              'w-12 text-center text-sm font-semibold text-fg-primary tabular-nums border-x border-border-subtle bg-transparent py-1.5',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
              'disabled:cursor-not-allowed'
            )}
          />
        )}
      </div>

      <button
        type="button"
        disabled={disabled || loading || isMax}
        onClick={handleIncrement}
        aria-label="Increase quantity"
        className={cn(
          'flex size-9 items-center justify-center rounded-r-md text-fg-primary transition-colors',
          'hover:bg-surface-muted active:bg-surface-elevated',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
          'disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
