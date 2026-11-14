# Aureon Marketplace — Database Migration Guide

## 1. Overview

Aureon features a version-controlled migration system with:
- Dedicated forward (`.sql`) and rollback (`.down.sql`) migration scripts.
- Session advisory locking (`SELECT pg_try_advisory_lock(9823412)`) to eliminate deployment race conditions.
- SHA-256 checksum verification to detect unauthorized file tampering.
- Tracking stored in the `schema_migrations` table.

## 2. Directory Structure

```
src/server/db/migrations/
├── 001_initial_schema.sql
├── 001_initial_schema.down.sql
├── 002_performance_indexes.sql
├── 002_performance_indexes.down.sql
├── 003_commerce_constraints.sql
├── 003_commerce_constraints.down.sql
├── 004_seller_packages.sql
└── 004_seller_packages.down.sql
```

## 3. CLI Commands

### Check Migration Status
```bash
pnpm db:migrate status
```

### Apply Pending Migrations (Up)
```bash
pnpm db:migrate up
```

### Rollback Last Migration (Down)
```bash
pnpm db:migrate down
# Or rollback N steps:
node scripts/migrate.mjs down 2
```

## 4. Production Deployment Procedure

1. **Pre-Deployment Check**:
   - Verify connection health:
     ```bash
     pnpm vitest run tests/integration/postgres/connection-health.integration.test.ts
     ```
2. **Execute Migrations**:
   - Run `pnpm db:migrate up`. The migrator acquires an advisory lock to prevent concurrent workers from running conflicting schema operations.
3. **Verify Status**:
   - Run `pnpm db:migrate status` to confirm all versions are marked as `[APPLIED]`.
4. **Zero-Downtime Principles**:
   - Never add non-nullable columns without defaults to high-traffic tables.
   - Always create indexes concurrently or during scheduled maintenance windows if table sizes exceed 1,000,000 rows.
