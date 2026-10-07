import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  label?: string;
  description?: string;
  error?: string;
  success?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Enterprise Form Input Primitive.
 * Features label association, accessible error/helper messaging, leading/trailing icons,
 * and WCAG 2.2 focus-visible states.
 */
export function Input({
  ref,
  className,
  type = 'text',
  id: explicitId,
  label,
  description,
  error,
  success,
  leadingIcon,
  trailingIcon,
  required,
  disabled,
  readOnly,
  containerClassName,
  ...props
}: InputProps): React.JSX.Element {
  const generatedId = React.useId();
  const inputId = explicitId ?? generatedId;
  const descriptionId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-err` : undefined;

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
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

      <div className="relative flex items-center w-full">
        {leadingIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-fg-muted shrink-0">
            {leadingIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg-primary',
            'placeholder:text-fg-muted selection:bg-primary selection:text-primary-foreground',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
            'read-only:bg-surface-muted read-only:cursor-default',
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : success
                ? 'border-success focus-visible:ring-success'
                : 'border-border-default focus-visible:border-border-focus focus-visible:ring-primary',
            leadingIcon ? 'pl-9' : 'pl-3',
            trailingIcon ? 'pr-9' : 'pr-3',
            className
          )}
          {...props}
        />

        {trailingIcon && (
          <div className="absolute right-3 flex items-center text-fg-muted shrink-0">
            {trailingIcon}
          </div>
        )}
      </div>

      {description && !error && (
        <p id={descriptionId} className="text-xs text-fg-muted">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
