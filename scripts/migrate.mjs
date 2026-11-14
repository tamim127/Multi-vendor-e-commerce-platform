import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local or .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.join(rootDir, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          const val = rest.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val.trim();
          }
        }
      }
    }
  }
}

loadEnv();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres@localhost:5433/aureon_marketplace';

const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

function computeChecksum(content) {
  return crypto.createHash('sha256').update(content.replace(/\r\n/g, '\n').trim(), 'utf8').digest('hex');
}

async function run() {
  const action = process.argv[2] || 'status';
  const migrationsDir = path.resolve(rootDir, 'src/server/db/migrations');

  console.log(`[Aureon Migrator] Connecting to database...`);
  console.log(`[Aureon Migrator] Database: ${connectionString.replace(/:\/\/[^@]+@/, '://***@')}`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      execution_time_ms INTEGER NOT NULL
    );
  `);

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();

  const appliedRes = await pool.query('SELECT version, name, checksum, executed_at FROM schema_migrations ORDER BY version ASC');
  const appliedMap = new Map(appliedRes.rows.map(r => [r.version, r]));

  if (action === 'status') {
    console.log('\n--- MIGRATION STATUS ---');
    for (const file of files) {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      const version = match ? match[1] : file;
      const name = match ? match[2] : file;
      const app = appliedMap.get(version);

      if (app) {
        console.log(` [APPLIED]  ${version}: ${name} (Applied at: ${app.executed_at})`);
      } else {
        console.log(` [PENDING]  ${version}: ${name}`);
      }
    }
    console.log('------------------------\n');
  } else if (action === 'up') {
    console.log('\n--- APPLYING PENDING MIGRATIONS ---');
    let appliedCount = 0;
    for (const file of files) {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      const version = match ? match[1] : file;
      const name = match ? match[2] : file;

      if (!appliedMap.has(version)) {
        const fullPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(fullPath, 'utf8');
        const checksum = computeChecksum(sql);
        const start = Date.now();

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          const duration = Date.now() - start;
          await client.query(
            'INSERT INTO schema_migrations (version, name, checksum, executed_at, execution_time_ms) VALUES ($1, $2, $3, NOW(), $4)',
            [version, name, checksum, duration]
          );
          await client.query('COMMIT');
          console.log(` -> Successfully applied ${version}: ${name} (${duration}ms)`);
          appliedCount++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(` -> FAILED to apply ${version}: ${name}`, err);
          process.exit(1);
        } finally {
          client.release();
        }
      }
    }
    console.log(`Migrations complete. Applied ${appliedCount} new migrations.\n`);
  } else if (action === 'down') {
    const steps = parseInt(process.argv[3] || '1', 10);
    const applied = appliedRes.rows.reverse().slice(0, steps);

    if (applied.length === 0) {
      console.log('No applied migrations to rollback.');
      await pool.end();
      return;
    }

    console.log(`\n--- ROLLING BACK ${applied.length} MIGRATION(S) ---`);
    for (const record of applied) {
      const downFile = `${record.version}_${record.name}.down.sql`;
      const downPath = path.join(migrationsDir, downFile);

      if (!fs.existsSync(downPath)) {
        console.error(`Missing down migration file: ${downFile}`);
        process.exit(1);
      }

      const downSql = fs.readFileSync(downPath, 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(downSql);
        await client.query('DELETE FROM schema_migrations WHERE version = $1', [record.version]);
        await client.query('COMMIT');
        console.log(` -> Rolled back ${record.version}: ${record.name}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(` -> FAILED to rollback ${record.version}: ${record.name}`, err);
        process.exit(1);
      } finally {
        client.release();
      }
    }
    console.log('Rollback complete.\n');
  }

  await pool.end();
}

run().catch((err) => {
  console.error('[Aureon Migrator Error]', err);
  process.exit(1);
});
