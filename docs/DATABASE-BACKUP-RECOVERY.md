# Aureon Marketplace — Database Backup & Disaster Recovery Guide

## 1. Backup Strategies

Aureon PostgreSQL deployments require regular logical dumps and continuous physical WAL archiving to meet Recovery Point Objective (RPO < 5 minutes) and Recovery Time Objective (RTO < 30 minutes).

### Logical Daily Backup (pg_dump)

```bash
# Full compressed custom-format backup of production marketplace database
pg_dump -h localhost -p 5433 -U postgres -F c -b -v -f "aureon_marketplace_backup_$(date +%Y%m%d_%H%M%S).dump" aureon_marketplace
```

### Schema-Only Backup
```bash
pg_dump -h localhost -p 5433 -U postgres --schema-only -F p -f "aureon_marketplace_schema_only.sql" aureon_marketplace
```

## 2. Point-in-Time Recovery (PITR)

For high-availability production clusters (e.g. AWS RDS, Neon, self-hosted clusters):
1. **Enable WAL Archiving**:
   In `postgresql.conf`:
   ```ini
   wal_level = replica
   archive_mode = on
   archive_command = 'test ! -f /mnt/wal_archive/%f && cp %p /mnt/wal_archive/%f'
   ```
2. **Base Backup**:
   Run `pg_basebackup` periodically.

## 3. Database Restoration Procedure

```bash
# 1. Terminate active connection pool clients
psql -h localhost -p 5433 -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'aureon_marketplace' AND pid <> pg_backend_pid();"

# 2. Re-create database shell
psql -h localhost -p 5433 -U postgres -c "DROP DATABASE IF EXISTS aureon_marketplace;"
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE aureon_marketplace;"

# 3. Restore data from custom dump archive
pg_restore -h localhost -p 5433 -U postgres -d aureon_marketplace -v "aureon_marketplace_backup.dump"

# 4. Verify post-restoration record counts
psql -h localhost -p 5433 -U postgres -d aureon_marketplace -c "SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM seller_offers;"
```
