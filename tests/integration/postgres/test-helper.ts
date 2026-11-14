import pg from 'pg';
import { createDbPool } from '@/server/db/client';

export const TEST_DATABASE_URL: string =
  process.env['TEST_DATABASE_URL'] || 'postgresql://postgres@localhost:5433/aureon_marketplace_test';

export function getTestPool(): pg.Pool {
  return createDbPool({
    connectionString: TEST_DATABASE_URL,
    max: 10,
    min: 1,
    connectionTimeoutMillis: 3000,
    statementTimeoutMillis: 5000,
  });
}
