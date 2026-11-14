import pg from 'pg';
import { appLogger } from '@/lib/observability/logger';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export type IsolationLevel = 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  readOnly?: boolean;
}

export interface PoolConfigOptions {
  connectionString?: string;
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statementTimeoutMillis?: number;
}

// Global pool cache for Next.js hot module reloading
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: pg.Pool | undefined;
}

/**
 * Sanitizes any raw database error to strip passwords, connection strings,
 * or low-level database infrastructure tokens before presenting to external clients.
 */
export function sanitizeDbError(err: unknown): { message: string; code?: string } {
  if (err instanceof Error) {
    const rawMsg = err.message;
    // Strip connection strings containing passwords
    const sanitizedMsg = rawMsg.replace(/postgres(?:ql)?:\/\/[^@]+@/gi, 'postgresql://***:***@');
    const pgCode = (err as any).code as string | undefined;

    // Map known PostgreSQL error codes to safe enterprise descriptions
    if (pgCode === '23505') {
      return { message: 'A record with this identifier or unique attribute already exists.', code: pgCode };
    }
    if (pgCode === '23503') {
      return { message: 'Referenced entity does not exist or violates foreign key constraints.', code: pgCode };
    }
    if (pgCode === '23514') {
      return { message: 'Database check constraint violation.', code: pgCode };
    }
    if (pgCode === '57014') {
      return { message: 'Database query execution exceeded statement timeout limit.', code: pgCode };
    }
    if (pgCode === '40001' || pgCode === '40P01') {
      return { message: 'Transaction concurrency conflict or deadlock detected. Retry requested.', code: pgCode };
    }

    return { message: sanitizedMsg, code: pgCode };
  }
  return { message: 'An unexpected database error occurred.' };
}

/**
 * Creates an isolated PostgreSQL connection pool with production safeguards.
 */
export function createDbPool(options?: PoolConfigOptions): pg.Pool {
  const connectionString =
    options?.connectionString ||
    process.env['DATABASE_URL'] ||
    process.env['POSTGRES_URL'] ||
    'postgresql://postgres@localhost:5433/aureon_marketplace';

  const isProduction = process.env['NODE_ENV'] === 'production';
  const ssl =
    isProduction || connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false;

  const max = options?.max ?? parseInt(process.env['DB_POOL_MAX'] || '20', 10);
  const min = options?.min ?? parseInt(process.env['DB_POOL_MIN'] || '2', 10);
  const idleTimeoutMillis = options?.idleTimeoutMillis ?? parseInt(process.env['DB_IDLE_TIMEOUT_MS'] || '30000', 10);
  const connectionTimeoutMillis = options?.connectionTimeoutMillis ?? parseInt(process.env['DB_CONNECTION_TIMEOUT_MS'] || '5000', 10);
  const statementTimeout = options?.statementTimeoutMillis ?? parseInt(process.env['DB_STATEMENT_TIMEOUT_MS'] || '10000', 10);

  const pool = new Pool({
    connectionString,
    ssl,
    max,
    min,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    statement_timeout: statementTimeout,
    maxUses: 7500,
  });

  pool.on('error', (err) => {
    appLogger.error('Unexpected error on idle PostgreSQL client in pool', {}, err);
  });

  return pool;
}

/**
 * Creates or retrieves the singleton PostgreSQL connection pool.
 */
export function getDbPool(): pg.Pool {
  if (global.__postgresPool) {
    return global.__postgresPool;
  }

  const pool = createDbPool();
  global.__postgresPool = pool;
  return pool;
}

/**
 * Gracefully shuts down the connection pool (used in graceful exit and test teardowns).
 */
export async function closeDbPool(pool?: pg.Pool): Promise<void> {
  const target = pool || global.__postgresPool;
  if (target) {
    try {
      await target.end();
    } catch (err) {
      appLogger.error('Error while closing database pool', {}, err);
    }
    if (!pool || pool === global.__postgresPool) {
      global.__postgresPool = undefined;
    }
  }
}

/**
 * Executes a parameterized SQL query with automatic connection management,
 * slow query monitoring, and sanitized error tracing.
 */
export async function dbQuery<T = any>(
  text: string,
  params?: any[],
  customPool?: pg.Pool
): Promise<QueryResult<T>> {
  const pool = customPool || getDbPool();
  const start = Date.now();
  const slowThreshold = parseInt(process.env['DB_SLOW_QUERY_THRESHOLD_MS'] || '200', 10);

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > slowThreshold) {
      appLogger.warn('Slow SQL Query Detected', {
        text: text.slice(0, 100),
        duration,
        rows: res.rowCount,
      });
    }

    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? 0,
    };
  } catch (err) {
    const sanitized = sanitizeDbError(err);
    appLogger.error('Database query execution error', { text: text.slice(0, 150), paramsCount: params?.length, code: sanitized.code }, err);
    throw new Error(`Database error [${sanitized.code || 'UNKNOWN'}]: ${sanitized.message}`);
  }
}

/**
 * Executes a callback inside an atomic database transaction.
 * Supports configurable isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE)
 * and automatic rollback on unhandled errors.
 */
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>,
  options?: TransactionOptions,
  customPool?: pg.Pool
): Promise<T> {
  const pool = customPool || getDbPool();
  const client = await pool.connect();

  try {
    const isolation = options?.isolationLevel ? ` ISOLATION LEVEL ${options.isolationLevel}` : '';
    const readOnly = options?.readOnly ? ' READ ONLY' : '';
    await client.query(`BEGIN${isolation}${readOnly}`);

    const result = await callback(client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      appLogger.error('Rollback query failed', {}, rollbackErr);
    }
    const sanitized = sanitizeDbError(err);
    appLogger.error('Transaction rolled back due to error', { code: sanitized.code }, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Verifies live database connectivity, round-trip ping, connection counts, and engine version.
 */
export function queryDb<T = any>(
  text: string,
  params?: any[],
  customPool?: pg.Pool
): Promise<QueryResult<T>> {
  return dbQuery<T>(text, params, customPool);
}

export async function checkDatabaseHealth(customPool?: pg.Pool): Promise<{
  isHealthy: boolean;
  latencyMs: number;
  poolTotal: number;
  poolIdle: number;
  poolWaiting: number;
  version?: string;
  database?: string;
  error?: string;
}> {
  const pool = customPool || getDbPool();
  const start = Date.now();

  try {
    const res = await pool.query('SELECT 1 AS ping, current_database() as db, version() as ver');
    const latencyMs = Date.now() - start;

    return {
      isHealthy: true,
      latencyMs,
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount,
      poolWaiting: pool.waitingCount,
      database: res.rows[0]?.db,
      version: res.rows[0]?.ver ? String(res.rows[0].ver).split(' ')[1] : undefined,
    };
  } catch (err) {
    const sanitized = sanitizeDbError(err);
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount,
      poolWaiting: pool.waitingCount,
      error: sanitized.message,
    };
  }
}

export async function checkDbHealth(customPool?: pg.Pool): Promise<{
  healthy: boolean;
  latencyMs: number;
  error?: string;
}> {
  const h = await checkDatabaseHealth(customPool);
  return {
    healthy: h.isHealthy,
    latencyMs: h.latencyMs,
    error: h.error,
  };
}
