import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type pg from 'pg';
import { getTestPool } from './test-helper';
import {
  migrateUp,
  getMigrationStatus,
  initMigrationTable,
  withMigrationLock,
} from '@/server/db/migrator';

describe('PostgreSQL Migration Engine Integration Tests', () => {
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = getTestPool();
    await initMigrationTable(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('reports correct status for migration files', async () => {
    const status = await getMigrationStatus({ pool });
    expect(status.length).toBeGreaterThanOrEqual(3);
    for (const item of status) {
      expect(item.checksumValid).toBe(true);
      expect(['APPLIED', 'PENDING']).toContain(item.status);
    }
  });

  it('acquires and releases PostgreSQL advisory lock safely', async () => {
    let executed = false;
    await withMigrationLock(pool, async () => {
      executed = true;
    });
    expect(executed).toBe(true);
  });

  it('prevents concurrent migration execution when lock is held', async () => {
    const client = await pool.connect();
    try {
      const lockRes = await client.query('SELECT pg_try_advisory_lock(9823412) as locked;');
      expect(lockRes.rows[0]?.locked).toBe(true);

      // Attempting to execute withMigrationLock from another client while lock is held must fail
      await expect(
        withMigrationLock(pool, async () => {
          return 'should not reach';
        })
      ).rejects.toThrow(/Migration lock \(9823412\) is currently held/);
    } finally {
      await client.query('SELECT pg_advisory_unlock(9823412);');
      client.release();
    }
  });

  it('safely applies up migrations idempotently', async () => {
    const result = await migrateUp({ pool });
    expect(result.appliedCount).toBeGreaterThanOrEqual(0);

    const statusAfter = await getMigrationStatus({ pool });
    const pending = statusAfter.filter((s) => s.status === 'PENDING');
    expect(pending.length).toBe(0);
  });
});
