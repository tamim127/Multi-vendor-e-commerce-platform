import { chromium } from '@playwright/test';
import http from 'http';
import { spawn } from 'child_process';

const PORT = 3005;

function checkServerReady(port = PORT, timeout = 40000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server not ready'));
        } else {
          setTimeout(tryConnect, 1000);
        }
      });
    };
    tryConnect();
  });
}

async function main() {
  console.log(`Starting Next.js dev server on port ${PORT}...`);
  const devProcess = spawn('cmd.exe', ['/c', `npx next dev -p ${PORT}`], {
    stdio: 'pipe',
  });

  devProcess.stdout.on('data', (d) => process.stdout.write(d.toString()));
  devProcess.stderr.on('data', (d) => process.stderr.write(d.toString()));

  try {
    await checkServerReady(PORT, 35000);
    console.log(`Server is ready on http://127.0.0.1:${PORT}! Launching Playwright...`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1.5,
    });
    const page = await context.newPage();

    // 1. Admin Dashboard (Light)
    console.log('Capturing Admin Dashboard (Light Theme)...');
    await page.goto(`http://127.0.0.1:${PORT}/admin`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/aureon-admin-dashboard-light.png', fullPage: false });

    // 2. Toggle to Dark Mode
    console.log('Toggling theme to Dark...');
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]').first();
    await themeToggle.click();
    await page.waitForTimeout(1000);

    console.log('Capturing Admin Dashboard (Dark Theme)...');
    await page.screenshot({ path: 'test-results/aureon-admin-dashboard-dark.png', fullPage: false });

    // 3. Admin Sellers View (Dark Theme)
    console.log('Capturing Admin Sellers View (Dark Theme)...');
    await page.goto(`http://127.0.0.1:${PORT}/admin/sellers`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/aureon-admin-sellers-dark.png', fullPage: false });

    // 4. Seller Dashboard (Dark Theme)
    console.log('Capturing Seller Dashboard (Dark Theme)...');
    await page.goto(`http://127.0.0.1:${PORT}/seller`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/aureon-seller-dashboard-dark.png', fullPage: false });

    // 5. Toggle Seller to Light Theme
    console.log('Toggling theme back to Light for Seller Dashboard...');
    const sellerThemeToggle = page.locator('button[aria-label*="Toggle theme"]').first();
    await sellerThemeToggle.click();
    await page.waitForTimeout(1000);

    console.log('Capturing Seller Dashboard (Light Theme)...');
    await page.screenshot({ path: 'test-results/aureon-seller-dashboard-light.png', fullPage: false });

    await browser.close();
    console.log('Successfully captured all high-resolution screenshots!');
  } finally {
    console.log('Stopping dev server...');
    spawn('taskkill', ['/pid', String(devProcess.pid), '/f', '/t']);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
