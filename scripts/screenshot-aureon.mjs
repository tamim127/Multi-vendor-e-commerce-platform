import { chromium } from '@playwright/test';

async function main() {
  console.log('Connecting to existing Next.js server at http://localhost:3000...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Screenshot (1440x900)
  console.log('Capturing Desktop Screenshot...');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'test-results/aureon-homepage-desktop.png',
    fullPage: false,
  });
  console.log('Saved test-results/aureon-homepage-desktop.png');

  // Full page
  await page.screenshot({
    path: 'test-results/aureon-homepage-full.png',
    fullPage: true,
  });
  console.log('Saved test-results/aureon-homepage-full.png');

  // 2. Mobile Screenshot (390x844)
  console.log('Capturing Mobile Screenshot...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  await mobilePage.screenshot({
    path: 'test-results/aureon-homepage-mobile.png',
    fullPage: false,
  });
  console.log('Saved test-results/aureon-homepage-mobile.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
