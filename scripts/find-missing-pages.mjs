import fs from 'fs';
import path from 'path';

function getFiles(dir, files = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        getFiles(full, files);
      }
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getFiles('src');
const hrefs = new Set();
// match href: '/...' or href="/..." or href={'/...'}
const regexes = [
  /href=["'](\/[^"'?#]*)["'?#]/g,
  /href:\s*["'](\/[^"'?#]*)["'?#]/g,
];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const r of regexes) {
    let match;
    while ((match = r.exec(content)) !== null) {
      hrefs.add(match[1]);
    }
  }
}

// Find existing routes in src/app
const existingRoutes = new Set();
function getAppRoutes(dir, baseRoute = '') {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      getAppRoutes(full, `${baseRoute}/${item}`);
    } else if (item === 'page.tsx' || item === 'page.jsx') {
      existingRoutes.add(baseRoute === '' ? '/' : baseRoute);
    }
  }
}
getAppRoutes('src/app');

console.log('--- EXISTING APP ROUTES ---');
console.log(Array.from(existingRoutes).sort());

console.log('\n--- CHECKING LINKED ROUTES ---');
const missing = [];
const dynamicPatterns = [
  { regex: /^\/product\/[^/]+$/, matches: '/product/[slug]' },
  { regex: /^\/products\/[^/]+$/, matches: '/products/[slug]' },
  { regex: /^\/store\/[^/]+$/, matches: '/store/[slug]' },
  { regex: /^\/admin\/customers\/[^/]+$/, matches: '/admin/customers/[customerId]' },
  { regex: /^\/admin\/sellers\/[^/]+$/, matches: '/admin/sellers/[sellerId]' },
  { regex: /^\/admin\/products\/[^/]+$/, matches: '/admin/products/[productId]' },
  { regex: /^\/admin\/orders\/[^/]+$/, matches: '/admin/orders/[orderId]' },
  { regex: /^\/account\/orders\/[^/]+$/, matches: '/account/orders/[orderId]' },
  { regex: /^\/seller\/orders\/[^/]+$/, matches: '/seller/orders/[orderId]' },
  { regex: /^\/categories\/.+$/, matches: '/categories/[...slug]' },
];

for (const href of hrefs) {
  if (existingRoutes.has(href)) continue;
  let matchesDynamic = false;
  for (const p of dynamicPatterns) {
    if (p.regex.test(href)) {
      matchesDynamic = true;
      break;
    }
  }
  if (!matchesDynamic) {
    missing.push(href);
  }
}

console.log('\n--- MISSING ROUTES (NOT IN src/app) ---');
console.log(JSON.stringify(missing.sort(), null, 2));
