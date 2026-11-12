/**
 * ==============================================================================
 * RELIABILITY — TIMEOUT WRAPPER
 * ==============================================================================
 * Enforces bounded execution time on async operations, rejecting with a typed error.
 */

export class TimeoutError extends Error {
  public readonly timeoutMs: number;
  public readonly operationName: string;

  constructor(timeoutMs: number, operationName = 'Operation') {
    super(`${operationName} timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    this.operationName = operationName;
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName = 'Operation'
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new TimeoutError(timeoutMs, operationName));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  }
}

