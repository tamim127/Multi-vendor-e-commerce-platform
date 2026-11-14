import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/aureon_marketplace';

async function seed() {
  console.log(`Connecting to PostgreSQL at: ${connectionString}...`);
  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log('✓ Successfully connected to PostgreSQL.');

    // 1. Check and Apply Schema if needed
    console.log('Verifying relational schema...');
    const schemaSql = fs.readFileSync(path.resolve('./src/server/db/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ Schema tables and indexes verified.');

    // 2. Load catalog data from products-1000.ts
    console.log('Importing catalog data...');
    // We can read products-1000.ts content or import it
    const fileContent = fs.readFileSync(path.resolve('./src/server/catalog/products-1000.ts'), 'utf8');
    
    // Extract CATALOG_PRODUCTS_1000 JSON
    const prodMatch = fileContent.match(/export const CATALOG_PRODUCTS_1000: Product\[\] = (\[[\s\S]*?\]);\s*export const/);
    const offerMatch = fileContent.match(/export const CATALOG_OFFERS_1000: SellerOffer\[\] = (\[[\s\S]*?\]);/);

    if (!prodMatch || !offerMatch) {
      throw new Error('Failed to parse products-1000.ts');
    }

    const products = JSON.parse(prodMatch[1]);
    const offers = JSON.parse(offerMatch[1]);

    console.log(`Loaded ${products.length} products and ${offers.length} offers.`);

    // 3. Extract unique brands, categories, sellers
    const brandMap = new Map();
    const catMap = new Map();
    const sellerMap = new Map();

    for (const p of products) {
      if (p.brand && !brandMap.has(p.brand.id)) {
        brandMap.set(p.brand.id, p.brand);
      }
      for (const bc of p.categoryBreadcrumbs || []) {
        if (!catMap.has(bc.id)) {
          catMap.set(bc.id, bc);
        }
      }
    }

    for (const o of offers) {
      if (o.seller && !sellerMap.has(o.seller.id)) {
        sellerMap.set(o.seller.id, o.seller);
      }
    }

    // Insert Brands
    console.log(`Seeding ${brandMap.size} brands into PostgreSQL...`);
    for (const b of brandMap.values()) {
      await client.query(
        `INSERT INTO brands (id, name, slug, description, website, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [b.id, b.name, b.slug, b.name, `https://${b.slug}.com`, true]
      );
    }
    console.log('✓ Brands seeded.');

    // Insert Categories
    console.log(`Seeding ${catMap.size} categories into PostgreSQL...`);
    const sortedCats = [...catMap.values()].sort((a, b) => (a.level || 0) - (b.level || 0));
    for (const c of sortedCats) {
      await client.query(
        `INSERT INTO categories (id, slug, name_en, level, is_active)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.slug, c.name?.en || c.slug, c.level || 0, true]
      );
    }
    console.log('✓ Categories seeded.');

    // Insert Sellers
    console.log(`Seeding ${sellerMap.size} sellers into PostgreSQL...`);
    for (const s of sellerMap.values()) {
      await client.query(
        `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified, rating_avg, rating_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          s.id,
          s.name,
          s.slug,
          `${s.slug}@aureon.marketplace`,
          'enterprise',
          'approved',
          true,
          s.rating?.average || 4.9,
          s.rating?.count || 3200
        ]
      );
    }
    console.log('✓ Sellers seeded.');

    // Insert Products in Batches
    console.log(`Seeding ${products.length} authentic products into PostgreSQL...`);
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await client.query('BEGIN');
      try {
        for (const p of batch) {
          await client.query(
            `INSERT INTO products (
               id, slug, sku, category_id, brand_id,
               title_en, title_bn, title_ar, title_hi,
               description_en, description_bn, description_ar, description_hi,
               tags, primary_image_url,
               rating_avg, rating_count, is_active
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (id) DO UPDATE SET title_en = EXCLUDED.title_en`,
            [
              p.id,
              p.slug,
              `AUR-${p.id}`,
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
              p.ratingSummary?.average || 4.8,
              p.ratingSummary?.count || 100,
              true
            ]
          );
        }
        await client.query('COMMIT');
        process.stdout.write(`  Seeded ${Math.min(i + batchSize, products.length)} / ${products.length} products...\r`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log(`\n✓ ${products.length} products seeded.`);

    // Insert Offers in Batches
    console.log(`Seeding ${offers.length} seller offers into PostgreSQL...`);
    for (let i = 0; i < offers.length; i += batchSize) {
      const batch = offers.slice(i, i + batchSize);
      await client.query('BEGIN');
      try {
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
              o.inventory?.quantityAvailable || 35,
              o.inventory?.state || 'in_stock',
              o.condition || 'new',
              o.fulfillmentType || 'marketplace_fulfilled',
              o.isBuyBoxWinner ?? true,
              o.shippingEstimate?.minDays || 2,
              o.shippingEstimate?.maxDays || 4,
              o.shippingEstimate?.isFreeShipping ?? true
            ]
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log(`✓ ${offers.length} seller offers seeded.`);

    // Verify row counts
    const prodCountRes = await client.query('SELECT count(*) FROM products');
    const offerCountRes = await client.query('SELECT count(*) FROM seller_offers');
    const brandCountRes = await client.query('SELECT count(*) FROM brands');

    console.log('\n======================================================');
    console.log('   POSTGRESQL DATABASE SEEDING COMPLETE! 🎉');
    console.log(`   - Total Products in Database: ${prodCountRes.rows[0].count}`);
    console.log(`   - Total Seller Offers:        ${offerCountRes.rows[0].count}`);
    console.log(`   - Total Verified Brands:      ${brandCountRes.rows[0].count}`);
    console.log('======================================================\n');

    client.release();
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
