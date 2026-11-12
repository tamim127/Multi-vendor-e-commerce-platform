import { describe, it, expect, vi } from 'vitest';
import { redactSensitiveData } from '@/lib/observability/logger';
import { checkSystemHealth, checkSystemReadiness } from '@/lib/observability/health';
import { withTimeout, TimeoutError } from '@/lib/reliability/timeout';
import { retryWithBackoff } from '@/lib/reliability/retry';
import { CircuitBreaker, CircuitBreakerOpenError } from '@/lib/reliability/circuit-breaker';
import { IdempotencyTracker } from '@/lib/reliability/idempotency';

describe('Observability & Reliability Primitives', () => {
  it('redacts sensitive fields in structured logging data', () => {
    const raw = {
      username: 'johndoe',
      password: 'super-secret-password',
      apiKey: 'sk-1234567890',
      nested: {
        authorization: 'Bearer token-xyz',
        cvv: '123',
        normalField: 'visible-data',
      },
    };

    const redacted = redactSensitiveData(raw) as Record<string, unknown>;

    expect(redacted['username']).toBe('johndoe');
    expect(redacted['password']).toBe('[REDACTED]');
    expect(redacted['apiKey']).toBe('[REDACTED]');

    const nested = redacted['nested'] as Record<string, unknown>;
    expect(nested['authorization']).toBe('[REDACTED]');
    expect(nested['cvv']).toBe('[REDACTED]');
    expect(nested['normalField']).toBe('visible-data');
  });

  it('reports operational health status and readiness', () => {
    const health = checkSystemHealth();
    expect(health.status).toBe('ok');
    expect(health.services.length).toBeGreaterThanOrEqual(2);

    const readiness = checkSystemReadiness();
    expect(readiness.ready).toBe(true);
  });

  it('withTimeout rejects when operation exceeds time threshold', async () => {
    const slowOperation = new Promise((resolve) => setTimeout(resolve, 50));
    await expect(withTimeout(slowOperation, 10, 'SlowTask')).rejects.toThrowError(TimeoutError);
  });

  it('retryWithBackoff retries transient failures and eventually succeeds', async () => {
    let attempts = 0;
    const flakyOperation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Transient network error');
      }
      return 'SUCCESS';
    };

    const result = await retryWithBackoff(flakyOperation, {
      maxRetries: 4,
      initialDelayMs: 1,
      maxDelayMs: 5,
    });

    expect(result).toBe('SUCCESS');
    expect(attempts).toBe(3);
  });

  it('CircuitBreaker transitions to OPEN upon consecutive failures', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      recoveryTimeoutMs: 100,
    });

    const failingOp = async () => {
      throw new Error('Upstream down');
    };

    // First failure
    await expect(breaker.execute(failingOp)).rejects.toThrow('Upstream down');
    expect(breaker.getState()).toBe('CLOSED');

    // Second failure trips breaker open
    await expect(breaker.execute(failingOp)).rejects.toThrow('Upstream down');
    expect(breaker.getState()).toBe('OPEN');

    // Fast-fails immediately without running operation
    const mockSpy = vi.fn();
    await expect(breaker.execute(mockSpy)).rejects.toThrowError(CircuitBreakerOpenError);
    expect(mockSpy).not.toHaveBeenCalled();
  });

  it('IdempotencyTracker prevents duplicate operations', () => {
    const tracker = new IdempotencyTracker();
    const key = 'checkout-idemp-1234';

    // First attempt starts cleanly
    const allowed = tracker.start(key);
    expect(allowed).toBe(true);

    // Duplicate attempt rejected
    const secondAllowed = tracker.start(key);
    expect(secondAllowed).toBe(false);

    // Complete operation
    tracker.complete(key, { orderId: 'ord-999' });
    const record = tracker.get(key);
    expect(record?.status).toBe('completed');
  });
});

