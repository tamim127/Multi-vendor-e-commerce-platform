/**
 * ==============================================================================
 * RELIABILITY — CIRCUIT BREAKER
 * ==============================================================================
 * Fails fast when external services (e.g. AI APIs, payment gateways) suffer
 * elevated error rates, transitioning through CLOSED -> OPEN -> HALF_OPEN states.
 */

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of consecutive failures to trip open
  recoveryTimeoutMs?: number; // Duration to remain open before half-open probe
  successThreshold?: number; // Consecutive successes in half-open before closing
}

export class CircuitBreakerOpenError extends Error {
  public readonly resetTimeMs: number;

  constructor(resetTimeMs: number) {
    super(`Circuit breaker is OPEN. Fast failing request to protect system.`);
    this.name = 'CircuitBreakerOpenError';
    this.resetTimeMs = resetTimeMs;
  }
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTimestamp = 0;

  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly successThreshold: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 15000;
    this.successThreshold = options.successThreshold ?? 2;
  }

  public getState(): CircuitBreakerState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      throw new CircuitBreakerOpenError(this.nextAttemptTimestamp - Date.now());
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    if (this.state === 'HALF_OPEN') {
      this.tripOpen();
    } else {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.tripOpen();
      }
    }
  }

  private tripOpen(): void {
    this.state = 'OPEN';
    this.nextAttemptTimestamp = Date.now() + this.recoveryTimeoutMs;
    this.failureCount = 0;
    this.successCount = 0;
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTimestamp = 0;
  }
}

