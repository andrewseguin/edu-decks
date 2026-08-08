import { chromium, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

async function advanceToLastStep(page: Page) {
  await page.waitForTimeout(600);
  try {
    const stepBtns = page.locator('button:has-text("Step 2"), button:has-text("Step 3"), div.bg-black\\/30 button');
    const count = await stepBtns.count();
    if (count >= 2) {
      // Click the last step before replay button
      const lastStepBtn = stepBtns.nth(count - 2);
      if (await lastStepBtn.isVisible()) {
        await lastStepBtn.click();
      }
    }
  } catch (e) {}
  await page.waitForTimeout(800);
}

async function clearFocus(page: Page) {
  try {
    await page.mouse.move(0, 0);
  } catch (e) {}
  await page.evaluate(() => {
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  });
  await page.waitForTimeout(200);
}

async function generateLandingScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const root = process.cwd();

  const arithmeticDir = path.join(root, 'apps/edudecks-org/public/screenshots/arithmetic');
  const readingDir = path.join(root, 'apps/edudecks-org/public/screenshots/reading');

  fs.mkdirSync(arithmeticDir, { recursive: true });
  fs.mkdirSync(readingDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });

  const page = await context.newPage();

  // 1. ARITHMETIC DECK (9003)
  {
    console.log('Capturing Arithmetic Deck landscape screenshots...');
    await page.goto('http://localhost:9003', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
      localStorage.setItem('math-deck-number-type', '"whole"');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await clearFocus(page);

    // Front
    await page.screenshot({ path: path.join(arithmeticDir, 'landscape-1-card-front.png') });

    // Back with completed visual model (Step 2)
    const card = page.locator('main > div').first();
    if (await card.isVisible()) {
      await card.click();
      await advanceToLastStep(page);
      await clearFocus(page);
      await page.screenshot({ path: path.join(arithmeticDir, 'landscape-2-card-back.png') });
    }

    // Quiz Mode
    const selectorBtn = page.locator("button[aria-label*='Select'], button[aria-label*='settings']").first();
    if (await selectorBtn.isVisible()) {
      await selectorBtn.click();
      await page.waitForTimeout(400);
      const startQuizBtn = page.locator('button', { hasText: 'Start Quiz' }).first();
      if (await startQuizBtn.isVisible()) {
        await startQuizBtn.click();
        await page.waitForTimeout(800);
        await clearFocus(page);
        await page.screenshot({ path: path.join(arithmeticDir, 'landscape-3-quiz-mode.png') });
      }
    }
  }

  // 2. READING DECK (9002)
  {
    console.log('Capturing Reading Deck landscape screenshots...');
    await page.goto('http://localhost:9002', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('first-read-gamemode', '"letters"');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await clearFocus(page);

    // Letter Card Front
    await page.screenshot({ path: path.join(readingDir, 'landscape-1-card-front.png') });

    // Words / Sight Words
    await page.evaluate(() => {
      localStorage.setItem('first-read-gamemode', '"words"');
      localStorage.setItem('first-read-word-difficulty', '"easy"');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await clearFocus(page);
    await page.screenshot({ path: path.join(readingDir, 'landscape-2-card-back.png') });

    // Quiz Mode
    const settingsBtn = page.locator("button[aria-label*='Select']").first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(400);
      const startQuizBtn = page.locator("button:has-text('Start Quiz')").first();
      if (await startQuizBtn.isVisible()) {
        await startQuizBtn.click();
        await page.waitForTimeout(800);
        await clearFocus(page);
        await page.screenshot({ path: path.join(readingDir, 'landscape-3-quiz-mode.png') });
      }
    }
  }

  await browser.close();
  console.log('Done generating landscape landing screenshots with completed visual models!');
}

generateLandingScreenshots().catch(console.error);
