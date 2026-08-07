import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const STORE_DEVICES = [
  { name: 'phone-portrait', width: 1080, height: 1920 },
  { name: 'phone-landscape', width: 1920, height: 1080 },
  { name: 'tablet-7inch', width: 1200, height: 1920 },
  { name: 'tablet-10inch', width: 1600, height: 2560 },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  const apps = [
    { name: 'arithmetic-deck', port: 9003, outDir: path.join(__dirname, '../apps/arithmetic-deck/store-assets/screenshots') },
    { name: 'reading-deck', port: 9002, outDir: path.join(__dirname, '../apps/reading-deck/store-assets/screenshots') },
  ];

  for (const app of apps) {
    fs.mkdirSync(app.outDir, { recursive: true });

    for (const dev of STORE_DEVICES) {
      const page = await browser.newPage({
        viewport: { width: dev.width, height: dev.height },
        deviceScaleFactor: 1,
      });

      // Add deterministic seed
      await page.addInitScript(() => {
        let seed = 123456789;
        Math.random = () => {
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          return seed / 4294967296;
        };
      });

      try {
        await page.goto(`http://localhost:${app.port}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForSelector('main', { timeout: 5000 });

        // Screenshot 1: Default / Main Deck Screen
        await page.screenshot({ path: path.join(app.outDir, `${dev.name}-1-main.png`) });

        // Screenshot 2: Active Card / Flipped or Clicked
        const card = page.locator('main > div').first();
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(app.outDir, `${dev.name}-2-interactive.png`) });
        }

        // Screenshot 3: Settings / Selector Dialog
        const selectorBtn = page.locator("button[aria-label*='Select'], button[aria-label*='settings']").first();
        if (await selectorBtn.isVisible()) {
          await selectorBtn.click();
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(app.outDir, `${dev.name}-3-settings.png`) });
        }
      } catch (err) {
        console.error(`Error capturing for ${app.name} on ${dev.name}:`, err);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();
  console.log('Store screenshots successfully captured!');
}

capture().catch(console.error);
