/**
 * ==============================================================================
 * RELIABILITY — IDEMPOTENCY TRACKER
 * ==============================================================================
 * In-memory idempotency cache for sensitive non-idempotent operations (such as
 * checkout order placement, refunds, and promo code redemptions).
 */

export interface IdempotencyRecord<T = unknown> {
  key: string;
  status: 'pending' | 'completed' | 'failed';
  result?: T;
  error?: string;
  createdAt: number;
}

export class IdempotencyTracker {
  private readonly records = new Map<string, IdempotencyRecord>();
  private readonly ttlMs: number;

  constructor(ttlMs = 300_000) {
    // 5 minutes TTL default
    this.ttlMs = ttlMs;
  }

  public get<T>(key: string): IdempotencyRecord<T> | undefined {
    this.cleanExpired();
    return this.records.get(key) as IdempotencyRecord<T> | undefined;
  }

  public start(key: string): boolean {
    this.cleanExpired();
    const existing = this.records.get(key);
    if (existing) {
      return false; // Already started or processed
    }

    this.records.set(key, {
      key,
      status: 'pending',
      createdAt: Date.now(),
    });
    return true;
  }

  public complete<T>(key: string, result: T): void {
    const existing = this.records.get(key);
    if (existing) {
      this.records.set(key, {
        ...existing,
        status: 'completed',
        result,
      });
    }
  }

  public fail(key: string, errorMessage: string): void {
    const existing = this.records.get(key);
    if (existing) {
      this.records.set(key, {
        ...existing,
        status: 'failed',
        error: errorMessage,
      });
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now - record.createdAt > this.ttlMs) {
        this.records.delete(key);
      }
    }
  }
}

export const globalIdempotencyTracker: IdempotencyTracker =
  new IdempotencyTracker();
