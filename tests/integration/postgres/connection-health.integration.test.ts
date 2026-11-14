import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type pg from 'pg';
import { getTestPool } from './test-helper';
import {
  checkDbHealth,
  createDbPool,
  sanitizeDbError,
  queryDb,
} from '@/server/db/client';

describe('PostgreSQL Connection Infrastructure & Health Integration Tests', () => {
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = getTestPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('reports healthy status and low latency on live database', async () => {
    const health = await checkDbHealth(pool);
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.latencyMs).toBeLessThan(1000);
  });

  it('safely handles and sanitizes database connection failures', async () => {
    // Pool pointing to an unreachable port
    const unreachablePool = createDbPool({
      connectionString: 'postgresql://postgres:secret_pass@localhost:59999/non_existent_db',
      connectionTimeoutMillis: 1000,
      statementTimeoutMillis: 1000,
    });

    try {
      const health = await checkDbHealth(unreachablePool);
      expect(health.healthy).toBe(false);
      expect(health.error).toBeDefined();

      const sanitized = sanitizeDbError(new Error(health.error));
      // Credentials must NEVER be present in sanitized output
      expect(sanitized.message).not.toContain('secret_pass');
    } finally {
      await unreachablePool.end().catch(() => {});
    }
  });

  it('enforces statement timeout when query exceeds configured threshold', async () => {
    const timeoutPool = createDbPool({
      connectionString: 'postgresql://postgres@localhost:5433/aureon_marketplace_test',
      statementTimeoutMillis: 500, // 500ms timeout
    });

    try {
      // Execute pg_sleep(2) which is 2000ms > 500ms
      await expect(queryDb('SELECT pg_sleep(2);', [], timeoutPool)).rejects.toThrow();
    } finally {
      await timeoutPool.end().catch(() => {});
    }
  });

  it('sanitizes common PostgreSQL enterprise error codes', () => {
    const uniqueViolationErr = Object.assign(new Error('duplicate key value violates unique constraint "products_sku_key"'), {
      code: '23505',
    });
    const sanitizedUnique = sanitizeDbError(uniqueViolationErr);
    expect(sanitizedUnique.message).toContain('unique attribute already exists');
    expect(sanitizedUnique.code).toBe('23505');

    const fkErr = Object.assign(new Error('insert or update on table "products" violates foreign key constraint'), {
      code: '23503',
    });
    const sanitizedFk = sanitizeDbError(fkErr);
    expect(sanitizedFk.message).toContain('foreign key constraints');
    expect(sanitizedFk.code).toBe('23503');

    const timeoutErr = Object.assign(new Error('canceling statement due to statement timeout'), {
      code: '57014',
    });
    const sanitizedTimeout = sanitizeDbError(timeoutErr);
    expect(sanitizedTimeout.message).toContain('statement timeout limit');
  });
});
