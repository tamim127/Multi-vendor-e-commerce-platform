import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import http from 'http';

function checkServerReady(port = 3000, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server readiness timed out'));
        } else {
          setTimeout(tryConnect, 1000);
        }
      });
    };
    tryConnect();
  });
}

async function main() {
  console.log('Spawning Next.js dev server on port 3000...');
  const devServer = spawn('pnpm', ['dev', '-p', '3000'], {
    shell: true,
    stdio: 'pipe',
  });

  devServer.stdout.on('data', (d) => process.stdout.write(d.toString()));
  devServer.stderr.on('data', (d) => process.stderr.write(d.toString()));

  console.log('Waiting for dev server to be ready...');
  await checkServerReady(3000);
  console.log('Server ready! Launching Chromium...');

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  // 1. Homepage
  console.log('Capturing Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/aureon-homepage-desktop.png', fullPage: false });

  // 2. Product Listing Page (PLP)
  console.log('Capturing Products PLP...');
  await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/aureon-plp-desktop.png', fullPage: false });

  // 3. Cart Page
  console.log('Capturing Cart Page...');
  await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/aureon-cart-desktop.png', fullPage: false });

  // 4. Mobile PLP (390x844)
  console.log('Capturing Mobile PLP...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: 'test-results/aureon-plp-mobile.png', fullPage: false });

  await browser.close();
  devServer.kill();
  console.log('All screenshots captured successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
