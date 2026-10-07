import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
  label?: string;
  description?: string;
  error?: string;
  resize?: TextareaResize;
  showCount?: boolean;
  containerClassName?: string;
}

const resizeClasses: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

/**
 * Enterprise Textarea Primitive.
 * Features label association, character counting, accessible error/helper messaging,
 * and customizable resize behavior.
 */
export function Textarea({
  ref,
  className,
  id: explicitId,
  label,
  description,
  error,
  resize = 'vertical',
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  readOnly,
  containerClassName,
  ...props
}: TextareaProps): React.JSX.Element {
  const generatedId = React.useId();
  const textareaId = explicitId ?? generatedId;
  const descriptionId = description ? `${textareaId}-desc` : undefined;
  const errorId = error ? `${textareaId}-err` : undefined;

  const [charCount, setCharCount] = React.useState<number>(() => {
    if (typeof value === 'string') return value.length;
    if (typeof defaultValue === 'string') return defaultValue.length;
    return 0;
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  React.useEffect(() => {
    if (typeof value === 'string') {
      setCharCount(value.length);
    }
  }, [value]);

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-fg-primary flex items-center gap-1 select-none"
        >
          {label}
          {required && (
            <span className="text-destructive font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative w-full">
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg-primary',
            'placeholder:text-fg-muted selection:bg-primary selection:text-primary-foreground',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
            'read-only:bg-surface-muted read-only:cursor-default',
            resizeClasses[resize],
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border-default focus-visible:border-border-focus focus-visible:ring-primary',
            className
          )}
          {...props}
        />
      </div>

      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex-1">
          {description && !error && (
            <p id={descriptionId} className="text-fg-muted">
              {description}
            </p>
          )}

          {error && (
            <p id={errorId} role="alert" className="font-medium text-destructive">
              {error}
            </p>
          )}
        </div>

        {showCount && (
          <span
            className={cn(
              'text-fg-muted tabular-nums shrink-0',
              maxLength && charCount >= maxLength && 'text-destructive font-semibold'
            )}
            aria-live="polite"
          >
            {charCount}
            {maxLength ? ` / ${maxLength}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
