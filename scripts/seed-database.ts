import fs from 'fs';
import path from 'path';
import { getDbPool, withTransaction } from '../src/server/db/client';
import { CATALOG_PRODUCTS_1000, CATALOG_OFFERS_1000 } from '../src/server/catalog/products-1000';
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SELLERS } from '../src/domains/catalog/fixtures';

/**
 * Enterprise Database Migration and Seed Runner for PostgreSQL.
 */
async function seedDatabase(): Promise<void> {
  console.log('--- Starting Aureon PostgreSQL Database Seeder ---');
  const pool = getDbPool();

  try {
    // 1. Run Schema DDL
    console.log('Applying PostgreSQL schema DDL (tables, indexes, foreign keys)...');
    const schemaSqlPath = path.resolve('./src/server/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 2. Insert Brands
    console.log(`Seeding ${MOCK_BRANDS.length} verified brands...`);
    for (const b of MOCK_BRANDS) {
      await pool.query(
        `INSERT INTO brands (id, name, slug, description, website, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
        [b.id, b.name, b.slug, b.description?.en || '', b.websiteUrl || '', b.isFeatured ?? true]
      );
    }
    console.log('✓ Brands seeded.');

    // 3. Insert Categories
    console.log(`Seeding ${MOCK_CATEGORIES.length} categories with deep hierarchy...`);
    const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.level - b.level);
    for (const c of sortedCategories) {
      await pool.query(
        `INSERT INTO categories (id, parent_id, slug, name_en, name_bn, name_ar, name_hi, level, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, updated_at = NOW()`,
        [c.id, c.parentId, c.slug, c.name.en, c.name.bn || '', c.name.ar || '', c.name.hi || '', c.level, c.isActive]
      );
    }
    console.log('✓ Categories seeded.');

    // 4. Insert Sellers
    console.log(`Seeding ${MOCK_SELLERS.length} multi-vendor merchants...`);
    for (const s of MOCK_SELLERS) {
      await pool.query(
        `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified, rating_avg, rating_count, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, updated_at = NOW()`,
        [
          s.id,
          s.name,
          s.slug,
          `${s.slug}@aureon-marketplace.demo`,
          'enterprise',
          'approved',
          s.isVerified ?? true,
          s.rating?.average || 4.8,
          s.rating?.count || 1200,
          s.logoUrl || '',
        ]
      );
    }
    console.log('✓ Sellers seeded.');

    // 5. Insert 1,000+ Real-World Products in Batches
    console.log(`Seeding ${CATALOG_PRODUCTS_1000.length} authentic real-world products...`);
    const batchSize = 100;
    for (let i = 0; i < CATALOG_PRODUCTS_1000.length; i += batchSize) {
      const batch = CATALOG_PRODUCTS_1000.slice(i, i + batchSize);
      await withTransaction(async (client) => {
        for (const p of batch) {
          const sku = `AUR-${p.id}`;
          await client.query(
            `INSERT INTO products (
               id, slug, sku, category_id, brand_id,
               title_en, title_bn, title_ar, title_hi,
               description_en, description_bn, description_ar, description_hi,
               tags, primary_image_url,
               rating_avg, rating_count, is_active
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (id) DO UPDATE SET title_en = EXCLUDED.title_en, updated_at = NOW()`,
            [
              p.id,
              p.slug,
              sku,
              p.categoryId,
              p.brand.id,
              p.title.en,
              p.title.bn || '',
              p.title.ar || '',
              p.title.hi || '',
              p.description.en,
              p.description.bn || '',
              p.description.ar || '',
              p.description.hi || '',
              p.tags,
              p.media[0]?.url || '',
              p.ratingSummary.average,
              p.ratingSummary.count,
              p.status === 'active',
            ]
          );
        }
      });
      process.stdout.write(`  Seeded ${Math.min(i + batchSize, CATALOG_PRODUCTS_1000.length)} / ${CATALOG_PRODUCTS_1000.length} products...\r`);
    }
    console.log(`\n✓ ${CATALOG_PRODUCTS_1000.length} products seeded successfully.`);

    // 6. Insert Seller Offers
    console.log(`Seeding ${CATALOG_OFFERS_1000.length} multi-vendor seller offers...`);
    for (let i = 0; i < CATALOG_OFFERS_1000.length; i += batchSize) {
      const batch = CATALOG_OFFERS_1000.slice(i, i + batchSize);
      await withTransaction(async (client) => {
        for (const o of batch) {
          await client.query(
            `INSERT INTO seller_offers (
               id, product_id, seller_id, sku,
               price_minor, compare_at_price_minor, currency,
               stock_quantity, inventory_state, condition,
               fulfillment_type, is_buy_box_winner,
               min_delivery_days, max_delivery_days, is_free_shipping
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (id) DO NOTHING`,
            [
              o.offerId,
              o.productId,
              o.sellerId,
              `SKU-${o.productId}`,
              o.price.amountMinor,
              o.compareAtPrice?.amountMinor || null,
              o.price.currency,
              o.inventory.quantityAvailable || 25,
              o.inventory.state,
              o.condition,
              o.fulfillmentType,
              o.isBuyBoxWinner,
              o.shippingEstimate.minDays,
              o.shippingEstimate.maxDays,
              o.shippingEstimate.isFreeShipping,
            ]
          );
        }
      });
    }
    console.log(`✓ ${CATALOG_OFFERS_1000.length} seller offers seeded.`);

    console.log('--- Database Seeding Completed Successfully! ---');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Allow running directly via CLI
if (process.argv[1]?.includes('seed-database')) {
  seedDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { seedDatabase };
