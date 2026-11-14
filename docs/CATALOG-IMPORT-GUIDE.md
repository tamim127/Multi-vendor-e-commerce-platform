# Aureon Marketplace — Real Product Catalog Import Guide

## 1. Overview

The Aureon catalog import pipeline (`src/server/catalog/importer.ts`) is an idempotent, enterprise-grade ingestion system that imports 1,050+ authentic products and seller offers into PostgreSQL.

## 2. Key Capabilities

- **Strict Validation**: Zod-based schema validation ensures every product record has valid slugs, titles, descriptions, categories, and brand associations.
- **Reference Normalization**: Missing brands, categories, and merchants are automatically synchronized to prevent foreign key errors.
- **Minor-Unit Pricing**: Validates that all prices are positive integers representing minor currency units (e.g., $19.99 is stored as `1999`).
- **Duplicate Detection**: Identifies duplicate product IDs or SKUs before executing batch insertions.
- **Idempotency**: Utilizes `ON CONFLICT (id) DO UPDATE SET ...` to guarantee that running imports repeatedly updates existing records without creating duplicates.
- **Structured Reporting**: Emits an `ImportReport` containing exact counts of imported, updated, and failed records alongside execution time.

## 3. Running the Importer

```bash
# Seed or synchronize the 1,050 product catalog into PostgreSQL
pnpm catalog:import
# or
pnpm db:seed
```

### Sample Output:
```
[Aureon Importer] Starting catalog import...
=============================================
       AUREON CATALOG IMPORT REPORT           
=============================================
 * Total Processed:          1050
 * Products Imported:        1050
 * Products Updated:         0
 * Seller Offers Imported:   1050
 * Seller Offers Updated:    0
 * Brands Synchronized:      29
 * Categories Synchronized:  19
 * Sellers Synchronized:     9
 * Validation Errors:        0
 * Duplicates Detected:      0
 * Duration:                 2450ms
=============================================
```
