import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type pg from 'pg';
import { getDbPool, queryDb, withTransaction } from './client';
import { appLogger } from '@/lib/observability/logger';

export interface MigrationRecord {
  version: string;
  name: string;
  checksum: string;
  executedAt: Date;
  executionTimeMs: number;
}

export interface MigrationFile {
  version: string;
  name: string;
  filename: string;
  fullPath: string;
  downPath?: string;
  checksum: string;
}

export interface MigrationStatusItem {
  version: string;
  name: string;
  status: 'APPLIED' | 'PENDING';
  executedAt?: Date;
  executionTimeMs?: number;
  checksumValid: boolean;
}

const ADVISORY_LOCK_ID = 9823412;

/**
 * Computes SHA-256 hash of a file's content (normalized line-endings to avoid CRLF vs LF issues).
 */
export function computeFileChecksum(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Finds and parses all migration files in the migrations directory.
 */
export function discoverMigrationFiles(migrationsDir?: string): MigrationFile[] {
  const dir = migrationsDir || path.resolve(process.cwd(), 'src/server/db/migrations');
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  const upFiles = files.filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'));

  return upFiles
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => {
      const match = filename.match(/^(\d+)_(.+)\.sql$/);
      const version = match ? match[1]! : filename;
      const name = match ? match[2]! : filename;
      const fullPath = path.join(dir, filename);
      const downFilename = `${version}_${name}.down.sql`;
      const downPath = fs.existsSync(path.join(dir, downFilename)) ? path.join(dir, downFilename) : undefined;
      const content = fs.readFileSync(fullPath, 'utf8');
      const checksum = computeFileChecksum(content);

      return {
        version,
        name,
        filename,
        fullPath,
        downPath,
        checksum,
      };
    });
}

/**
 * Initializes the schema_migrations tracking table if it does not exist.
 */
export async function initMigrationTable(pool?: pg.Pool): Promise<void> {
  const ddl = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      execution_time_ms INTEGER NOT NULL
    );
  `;
  await queryDb(ddl, [], pool);
}

/**
 * Executes a callback holding a PostgreSQL session advisory lock to prevent concurrent runs.
 */
export async function withMigrationLock<T>(pool: pg.Pool, callback: () => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    const lockRes = await client.query('SELECT pg_try_advisory_lock($1) AS acquired;', [ADVISORY_LOCK_ID]);
    const acquired = Boolean(lockRes.rows[0]?.acquired);
    if (!acquired) {
      throw new Error(`Migration lock (${ADVISORY_LOCK_ID}) is currently held by another worker or deployment process.`);
    }

    try {
      return await callback();
    } finally {
      await client.query('SELECT pg_advisory_unlock($1);', [ADVISORY_LOCK_ID]);
    }
  } finally {
    client.release();
  }
}

/**
 * Retrieves the list of currently applied migrations from the database.
 */
export async function getAppliedMigrations(pool?: pg.Pool): Promise<MigrationRecord[]> {
  await initMigrationTable(pool);
  const result = await queryDb<any>(
    'SELECT version, name, checksum, executed_at, execution_time_ms FROM schema_migrations ORDER BY version ASC;',
    [],
    pool
  );

  return result.rows.map((r) => ({
    version: r.version,
    name: r.name,
    checksum: r.checksum,
    executedAt: new Date(r.executed_at),
    executionTimeMs: Number(r.execution_time_ms),
  }));
}

/**
 * Computes the complete migration status (applied vs pending, checksum validity).
 */
export async function getMigrationStatus(options?: {
  pool?: pg.Pool;
  migrationsDir?: string;
}): Promise<MigrationStatusItem[]> {
  const pool = options?.pool || getDbPool();
  const available = discoverMigrationFiles(options?.migrationsDir);
  const applied = await getAppliedMigrations(pool);
  const appliedMap = new Map<string, MigrationRecord>(applied.map((a) => [a.version, a]));

  return available.map((file) => {
    const app = appliedMap.get(file.version);
    if (app) {
      return {
        version: file.version,
        name: file.name,
        status: 'APPLIED',
        executedAt: app.executedAt,
        executionTimeMs: app.executionTimeMs,
        checksumValid: app.checksum === file.checksum,
      };
    }
    return {
      version: file.version,
      name: file.name,
      status: 'PENDING',
      checksumValid: true,
    };
  });
}

/**
 * Applies all pending migrations sequentially inside transactions.
 */
export async function migrateUp(options?: {
  pool?: pg.Pool;
  migrationsDir?: string;
}): Promise<{ appliedCount: number; appliedVersions: string[] }> {
  const pool = options?.pool || getDbPool();
  await initMigrationTable(pool);

  return await withMigrationLock(pool, async () => {
    const available = discoverMigrationFiles(options?.migrationsDir);
    const applied = await getAppliedMigrations(pool);
    const appliedMap = new Map<string, MigrationRecord>(applied.map((a) => [a.version, a]));

    // Check for checksum tampering on previously applied migrations
    for (const file of available) {
      const app = appliedMap.get(file.version);
      if (app && app.checksum !== file.checksum) {
        throw new Error(
          `Migration checksum mismatch for version ${file.version} (${file.name}). ` +
          `Database recorded: ${app.checksum}, Disk has: ${file.checksum}. ` +
          `Never modify existing applied migration files.`
        );
      }
    }

    const pending = available.filter((f) => !appliedMap.has(f.version));
    const appliedVersions: string[] = [];

    for (const file of pending) {
      const startTime = Date.now();
      const sqlContent = fs.readFileSync(file.fullPath, 'utf8');

      appLogger.info(`Applying database migration ${file.version}: ${file.name}`);

      await withTransaction(
        async (client) => {
          await client.query(sqlContent);
          const durationMs = Date.now() - startTime;
          await client.query(
            `INSERT INTO schema_migrations (version, name, checksum, executed_at, execution_time_ms)
             VALUES ($1, $2, $3, NOW(), $4);`,
            [file.version, file.name, file.checksum, durationMs]
          );
        },
        undefined,
        pool
      );

      appliedVersions.push(file.version);
      appLogger.info(`Applied migration ${file.version} successfully in ${Date.now() - startTime}ms`);
    }

    return { appliedCount: appliedVersions.length, appliedVersions };
  });
}

/**
 * Rolls back the specified number of migrations (default: 1) using down files.
 */
export async function migrateDown(options?: {
  pool?: pg.Pool;
  migrationsDir?: string;
  steps?: number;
}): Promise<{ rolledBackCount: number; rolledBackVersions: string[] }> {
  const pool = options?.pool || getDbPool();
  const steps = options?.steps ?? 1;
  await initMigrationTable(pool);

  return await withMigrationLock(pool, async () => {
    const available = discoverMigrationFiles(options?.migrationsDir);
    const applied = await getAppliedMigrations(pool);

    if (applied.length === 0) {
      return { rolledBackCount: 0, rolledBackVersions: [] };
    }

    const availableMap = new Map<string, MigrationFile>(available.map((a) => [a.version, a]));
    const toRollback = [...applied].reverse().slice(0, steps);
    const rolledBackVersions: string[] = [];

    for (const record of toRollback) {
      const file = availableMap.get(record.version);
      if (!file || !file.downPath) {
        throw new Error(
          `Cannot rollback migration ${record.version} (${record.name}): No down migration file found.`
        );
      }

      const downSql = fs.readFileSync(file.downPath, 'utf8');
      appLogger.warn(`Rolling back database migration ${record.version}: ${record.name}`);

      await withTransaction(
        async (client) => {
          await client.query(downSql);
          await client.query('DELETE FROM schema_migrations WHERE version = $1;', [record.version]);
        },
        undefined,
        pool
      );

      rolledBackVersions.push(record.version);
      appLogger.info(`Rolled back migration ${record.version} successfully`);
    }

    return { rolledBackCount: rolledBackVersions.length, rolledBackVersions };
  });
}
