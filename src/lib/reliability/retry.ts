/**
 * ==============================================================================
 * RELIABILITY — BOUNDED RETRY WITH EXPONENTIAL BACKOFF & JITTER
 * ==============================================================================
 * Executes operations with bounded retries, exponential backoff, randomized jitter,
 * and optional non-retryable error predicates.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export async function retryWithBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 3000;
  const backoffFactor = options.backoffFactor ?? 2;

  let attempt = 0;

  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      attempt++;

      if (attempt > maxRetries) {
        throw error;
      }

      if (options.isRetryable && !options.isRetryable(error)) {
        throw error;
      }

      // Calculate exponential backoff with +/- 20% randomized jitter
      const rawDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
      const cappedDelay = Math.min(rawDelay, maxDelayMs);
      const jitter = cappedDelay * 0.2 * (Math.random() * 2 - 1);
      const actualDelay = Math.max(10, Math.floor(cappedDelay + jitter));

      if (options.onRetry) {
        options.onRetry(error, attempt, actualDelay);
      }

      await new Promise((resolve) => setTimeout(resolve, actualDelay));
    }
  }
}

