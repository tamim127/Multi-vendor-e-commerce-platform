import fs from 'fs';
import path from 'path';

function findLinks(dir) {
  const links = new Set();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        for (const l of findLinks(full)) {
          links.add(l);
        }
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const hrefMatches = content.matchAll(/href=["'](\/[^"'#?]*)/g);
      for (const m of hrefMatches) {
        if (m[1]) links.add(m[1]);
      }
      const routerMatches = content.matchAll(/router\.push\(["'](\/[^"'#?]*)/g);
      for (const m of routerMatches) {
        if (m[1]) links.add(m[1]);
      }
    }
  }
  return links;
}

const allLinks = Array.from(findLinks('./src')).sort();
console.log('Total unique internal links found in src:', allLinks.length);

function routeExists(route) {
  if (route === '' || route === '/') return fs.existsSync('./src/app/page.tsx');
  const clean = route.replace(/^\//, '');
  const exactPage = path.join('./src/app', clean, 'page.tsx');
  if (fs.existsSync(exactPage)) return true;

  // Check dynamic route patterns
  const parts = clean.split('/');
  let currentDir = './src/app';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!fs.existsSync(currentDir)) return false;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true }).filter(e => e.isDirectory());
    // Match exact folder, [slug], [...slug], etc.
    const match = entries.find(e => e.name === p || (e.name.startsWith('[') && e.name.endsWith(']')));
    if (!match) return false;
    currentDir = path.join(currentDir, match.name);
  }
  return fs.existsSync(path.join(currentDir, 'page.tsx'));
}

const missing = [];
for (const link of allLinks) {
  if (!routeExists(link)) {
    missing.push(link);
  }
}

console.log('Missing routes count:', missing.length);
if (missing.length > 0) {
  console.log('Missing routes:', JSON.stringify(missing, null, 2));
} else {
  console.log('All linked routes exist!');
}

