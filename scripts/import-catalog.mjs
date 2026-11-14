import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
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

async function run() {
  console.log('[Aureon Importer] Dynamic loading TypeScript importer via tsx / esbuild or project modules...');
  const { importCatalog } = await import('../src/server/catalog/importer.ts');
  console.log('[Aureon Importer] Starting catalog import...');
  const report = await importCatalog();
  console.log('\n=============================================');
  console.log('       AUREON CATALOG IMPORT REPORT           ');
  console.log('=============================================');
  console.log(` * Total Processed:          ${report.totalProcessed}`);
  console.log(` * Products Imported:        ${report.productsImported}`);
  console.log(` * Products Updated:         ${report.productsUpdated}`);
  console.log(` * Seller Offers Imported:   ${report.offersImported}`);
  console.log(` * Seller Offers Updated:    ${report.offersUpdated}`);
  console.log(` * Brands Synchronized:      ${report.brandsSynchronized}`);
  console.log(` * Categories Synchronized:  ${report.categoriesSynchronized}`);
  console.log(` * Sellers Synchronized:     ${report.sellersSynchronized}`);
  console.log(` * Validation Errors:        ${report.validationErrors.length}`);
  console.log(` * Duplicates Detected:      ${report.duplicatesDetected.length}`);
  console.log(` * Duration:                 ${report.durationMs}ms`);
  console.log('=============================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('[Aureon Importer Failed]', err);
  process.exit(1);
});
