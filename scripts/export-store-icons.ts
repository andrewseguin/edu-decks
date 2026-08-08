import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

async function exportStoreIcons() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1,
  });

  const root = process.cwd();
  const htmlPath = `file://${path.join(root, 'scripts/icon-generator.html')}`;

  console.log('Loading icon generator HTML...');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  // Remove border-radius and box-shadow on all icon-container elements so they are 100% full-bleed square
  await page.addStyleTag({
    content: `
      .icon-container {
        border-radius: 0px !important;
        box-shadow: none !important;
      }
    `,
  });
  await page.waitForTimeout(200);

  // 1. Arithmetic Deck Icon (512x512 full-bleed)
  const arithmeticIcon = page.locator('#icon-arithmetic');
  const arithmeticStorePath = path.join(root, 'store-assets/arithmetic-deck/app-icon-512x512.png');
  const arithmeticLandingPath = path.join(root, 'apps/landing-page/public/screenshots/arithmetic/app-icon-512x512.png');

  fs.mkdirSync(path.dirname(arithmeticStorePath), { recursive: true });
  fs.mkdirSync(path.dirname(arithmeticLandingPath), { recursive: true });

  await arithmeticIcon.screenshot({ path: arithmeticStorePath });
  fs.copyFileSync(arithmeticStorePath, arithmeticLandingPath);
  console.log('Exported full-bleed Arithmetic Deck icon (512x512)');

  // 2. Reading Deck Icon (512x512 full-bleed)
  const readingIcon = page.locator('#icon-reading');
  const readingStorePath = path.join(root, 'store-assets/reading-deck/app-icon-512x512.png');
  const readingLandingPath = path.join(root, 'apps/landing-page/public/screenshots/reading/app-icon-512x512.png');

  fs.mkdirSync(path.dirname(readingStorePath), { recursive: true });
  fs.mkdirSync(path.dirname(readingLandingPath), { recursive: true });

  await readingIcon.screenshot({ path: readingStorePath });
  fs.copyFileSync(readingStorePath, readingLandingPath);
  console.log('Exported full-bleed Reading Deck icon (512x512)');

  await browser.close();
  console.log('✨ Done exporting full-bleed square store icons!');
}

exportStoreIcons().catch(console.error);
