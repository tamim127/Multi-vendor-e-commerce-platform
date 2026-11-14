import pg from 'pg';
import { appLogger } from '@/lib/observability/logger';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Global pool cache for Next.js hot module reloading
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: pg.Pool | undefined;
}

/**
 * Creates or retrieves the singleton PostgreSQL connection pool.
 */
export function getDbPool(): pg.Pool {
  if (global.__postgresPool) {
    return global.__postgresPool;
  }

  const connectionString =
    process.env['DATABASE_URL'] ||
    process.env['POSTGRES_URL'] ||
    'postgresql://postgres@localhost:5433/aureon_marketplace';

  const isProduction = process.env['NODE_ENV'] === 'production';
  const ssl =
    isProduction || connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false;

  const pool = new Pool({
    connectionString,
    ssl,
    max: parseInt(process.env['DB_POOL_MAX'] || '20', 10),
    min: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    maxUses: 7500,
  });

  pool.on('error', (err) => {
    appLogger.error('Unexpected error on idle PostgreSQL client in pool', {}, err);
  });

  global.__postgresPool = pool;
  return pool;
}

/**
 * Executes a parameterized SQL query with automatic connection management.
 */
export async function dbQuery<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getDbPool();
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 200) {
      appLogger.warn('Slow SQL Query Detected', { text, duration, rows: res.rowCount });
    }

    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? 0,
    };
  } catch (err) {
    appLogger.error('Database query execution error', { text, params }, err);
    throw err;
  }
}

/**
 * Executes a callback inside an atomic database transaction.
 */
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    appLogger.error('Transaction rolled back due to error', {}, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Verifies live database connectivity and round-trip ping.
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latencyMs: number;
  poolTotal: number;
  poolIdle: number;
  poolWaiting: number;
  error?: string;
}> {
  const pool = getDbPool();
  const start = Date.now();

  try {
    await pool.query('SELECT 1 AS ping');
    const latencyMs = Date.now() - start;

    return {
      isHealthy: true,
      latencyMs,
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount,
      poolWaiting: pool.waitingCount,
    };
  } catch (err) {
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount,
      poolWaiting: pool.waitingCount,
      error: err instanceof Error ? err.message : 'Database ping failed',
    };
  }
}
