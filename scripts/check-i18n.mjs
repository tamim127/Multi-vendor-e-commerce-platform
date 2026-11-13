import fs from 'fs';

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  const regex = /['"]([a-zA-Z0-9_.-]+)['"]\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

const en = extractKeys('src/lib/i18n/translations/en.ts');
const bn = extractKeys('src/lib/i18n/translations/bn.ts');
const ar = extractKeys('src/lib/i18n/translations/ar.ts');
const hi = extractKeys('src/lib/i18n/translations/hi.ts');
const contract = extractKeys('src/lib/i18n/translations/keys.ts');

console.log('Contract keys count:', contract.size);
console.log('EN keys count:', en.size);
console.log('BN keys count:', bn.size);
console.log('AR keys count:', ar.size);
console.log('HI keys count:', hi.size);

const missingInBn = [...contract].filter(k => !bn.has(k));
const missingInAr = [...contract].filter(k => !ar.has(k));
const missingInHi = [...contract].filter(k => !hi.has(k));

console.log('Contract keys missing in BN:', missingInBn);
console.log('Contract keys missing in AR:', missingInAr);
console.log('Contract keys missing in HI:', missingInHi);
