import { chromium, devices, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Helper to ensure visual diagram animations complete to their final post-animation step.
 */
async function advanceToLastAnimationStep(page: Page) {
  await page.waitForTimeout(600);
  try {
    const stepBtns = page.locator('div.backdrop-blur-md button');
    const count = await stepBtns.count();
    if (count >= 2) {
      const lastStepBtn = stepBtns.nth(count - 2);
      if (await lastStepBtn.isVisible()) {
        await lastStepBtn.click();
      }
    }
  } catch (e) {}
  await page.waitForTimeout(1200);
}

async function hideDevOverlays(page: Page) {
  try {
    await page.addStyleTag({
      content: `
        nextjs-portal,
        [data-nextjs-toast],
        [data-nextjs-dev-tools],
        #nextjs-dev-tools,
        #__next-build-watcher,
        div[data-nextjs-portal],
        .nextjs-toast-errors-parent {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `,
    });
    await page.evaluate(() => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-dev-tools], #nextjs-dev-tools, #__next-build-watcher').forEach(el => el.remove());
    });
  } catch (e) {}
}

/**
 * Helper to remove focus rings / blur active element before screenshot capture.
 */
async function clearFocus(page: Page) {
  try {
    await page.mouse.move(0, 0);
  } catch (e) {}
  await page.evaluate(() => {
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  });
  await hideDevOverlays(page);
  await page.waitForTimeout(200);
}

/**
 * Helper to open the selector and click Start Quiz to launch active Quiz Mode.
 */
async function launchActiveQuizMode(page: Page) {
  try {
    const selectorBtn = page.locator("button[aria-label*='Select'], button[aria-label*='settings']").first();
    if (await selectorBtn.isVisible()) {
      await selectorBtn.click();
      await page.waitForTimeout(400);

      const startQuizBtn = page.locator("button", { hasText: "Start Quiz" }).first();
      if (await startQuizBtn.isVisible()) {
        await startQuizBtn.click();
        await page.waitForTimeout(800);
        await clearFocus(page);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

async function generateAllStoreAssets() {
  const root = process.cwd();
  const browser = await chromium.launch({ headless: true });

  const iphone14Max = devices['iPhone 14 Pro Max'];

  // =========================================================================
  // 1. ARITHMETIC DECK (Port 9003)
  // =========================================================================
  {
    const appName = 'arithmetic-deck';
    const port = 9003;
    const storeDir = path.join(root, 'store-assets/arithmetic-deck');
    const tablet7Dir = path.join(storeDir, 'tablet');
    const tablet10Dir = path.join(storeDir, 'tablet-10inch');

    fs.mkdirSync(storeDir, { recursive: true });
    fs.mkdirSync(tablet7Dir, { recursive: true });
    fs.mkdirSync(tablet10Dir, { recursive: true });

    const baseUrl = `http://localhost:${port}`;
    console.log(`\n📸 Generating Feature-Rich Store Assets for ${appName}...`);

    // --- Phone Screenshots (iPhone 14 Pro Max - Light Mode) ---
    const phoneContext = await browser.newContext({
      ...iphone14Max,
      colorScheme: 'light',
    });
    const page = await phoneContext.newPage();

    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForSelector('main', { timeout: 5000 });

      // Screenshot 1: Addition Card
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
        localStorage.setItem('math-deck-number-type', '"whole"');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await clearFocus(page);
      await page.screenshot({ path: path.join(storeDir, 'screenshot-1-card-front.png') });

      // Screenshot 2: Multiplication Card with Final Visual Diagram
      await page.evaluate(() => {
        localStorage.setItem('math-deck-operations', JSON.stringify(['×']));
        localStorage.setItem('math-deck-min-range', '3');
        localStorage.setItem('math-deck-max-range', '6');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const card2 = page.locator('main > div').first();
      if (await card2.isVisible()) {
        await card2.click();
        await advanceToLastAnimationStep(page);
        await clearFocus(page);
        await page.screenshot({ path: path.join(storeDir, 'screenshot-2-card-back.png') });
      }

      // Screenshot 3: Fractions Card Visualizer
      await page.evaluate(() => {
        localStorage.setItem('math-deck-number-type', '"fractions"');
        localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const card3 = page.locator('main > div').first();
      if (await card3.isVisible()) {
        await card3.click();
        await advanceToLastAnimationStep(page);
        await clearFocus(page);
        await page.screenshot({ path: path.join(storeDir, 'screenshot-3-card-next.png') });
      }

      // Screenshot 4: Active Interactive Quiz Mode Overlay
      await page.evaluate(() => {
        localStorage.setItem('math-deck-number-type', '"whole"');
        localStorage.setItem('math-deck-operations', JSON.stringify(['+', '-']));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const quizStarted = await launchActiveQuizMode(page);
      if (quizStarted) {
        await clearFocus(page);
        await page.screenshot({ path: path.join(storeDir, 'screenshot-4-quiz-mode.png') });
      }
    } catch (e) {
      console.error(`Failed during ${appName} phone capture:`, e);
    } finally {
      await phoneContext.close();
    }

    // --- Feature Graphic (1024x500 px) ---
    const fgContext = await browser.newContext({
      viewport: { width: 1024, height: 500 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
    });
    const fgPage = await fgContext.newPage();
    try {
      await fgPage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await fgPage.evaluate(() => {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('math-deck-operations', JSON.stringify(['+', '×']));
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await fgPage.reload({ waitUntil: 'networkidle' });
      await fgPage.waitForTimeout(600);
      await clearFocus(fgPage);
      await fgPage.screenshot({ path: path.join(storeDir, 'feature-graphic-1024x500.png') });
    } finally {
      await fgContext.close();
    }

    // --- 7-inch & 10-inch Tablets ---
    const tab7Context = await browser.newContext({ ...devices['iPad Mini'], colorScheme: 'light' });
    const tab7Page = await tab7Context.newPage();
    try {
      await tab7Page.goto(baseUrl, { waitUntil: 'networkidle' });
      await clearFocus(tab7Page);
      await tab7Page.screenshot({ path: path.join(tablet7Dir, 'tablet-screenshot-1-card-front.png') });
    } finally {
      await tab7Context.close();
    }

    const tab10Context = await browser.newContext({ ...devices['iPad Pro 11'], colorScheme: 'light' });
    const tab10Page = await tab10Context.newPage();
    try {
      await tab10Page.goto(baseUrl, { waitUntil: 'networkidle' });
      await clearFocus(tab10Page);
      await tab10Page.screenshot({ path: path.join(tablet10Dir, 'tablet-10in-screenshot-1-card-front.png') });
    } finally {
      await tab10Context.close();
    }
  }

  // =========================================================================
  // 2. READING DECK (Port 9002)
  // =========================================================================
  {
    const appName = 'reading-deck';
    const port = 9002;
    const storeDir = path.join(root, 'store-assets/reading-deck');
    const tablet7Dir = path.join(storeDir, 'tablet');
    const tablet10Dir = path.join(storeDir, 'tablet-10inch');

    fs.mkdirSync(storeDir, { recursive: true });
    fs.mkdirSync(tablet7Dir, { recursive: true });
    fs.mkdirSync(tablet10Dir, { recursive: true });

    const baseUrl = `http://localhost:${port}`;
    console.log(`\n📸 Generating Feature-Rich Store Assets for ${appName}...`);

    // --- Phone Screenshots (iPhone 14 Pro Max - Light Mode) ---
    const phoneContext = await browser.newContext({
      ...iphone14Max,
      colorScheme: 'light',
    });
    const page = await phoneContext.newPage();

    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForSelector('main', { timeout: 5000 });

      // Screenshot 1: Letter Card Mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('first-read-gamemode', '"letters"');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await clearFocus(page);
      await page.screenshot({ path: path.join(storeDir, 'screenshot-1-card-front.png') });

      // Screenshot 2: Full Words Mode (e.g. CVC / Sight Words)
      await page.evaluate(() => {
        localStorage.setItem('first-read-gamemode', '"words"');
        localStorage.setItem('first-read-word-difficulty', '"easy"');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await clearFocus(page);
      await page.screenshot({ path: path.join(storeDir, 'screenshot-2-card-back.png') });

      // Screenshot 3: Interactive Word Card (Tapped / Phonics Breakdown)
      const card = page.locator('main > div').first();
      if (await card.isVisible()) {
        await card.click();
        await page.waitForTimeout(500);
        await clearFocus(page);
        await page.screenshot({ path: path.join(storeDir, 'screenshot-3-card-next.png') });
      }

      // Screenshot 4: Active Interactive Quiz Mode Overlay
      await page.evaluate(() => {
        localStorage.setItem('first-read-gamemode', '"letters"');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const quizStarted = await launchActiveQuizMode(page);
      if (quizStarted) {
        await clearFocus(page);
        await page.screenshot({ path: path.join(storeDir, 'screenshot-4-quiz-mode.png') });
      }
    } catch (e) {
      console.error(`Failed during ${appName} phone capture:`, e);
    } finally {
      await phoneContext.close();
    }

    // --- Feature Graphic (1024x500 px) ---
    const fgContext = await browser.newContext({
      viewport: { width: 1024, height: 500 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
    });
    const fgPage = await fgContext.newPage();
    try {
      await fgPage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await fgPage.evaluate(() => {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('first-read-gamemode', '"words"');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await fgPage.reload({ waitUntil: 'networkidle' });
      await fgPage.waitForTimeout(600);
      await clearFocus(fgPage);
      await fgPage.screenshot({ path: path.join(storeDir, 'feature-graphic-1024x500.png') });
    } finally {
      await fgContext.close();
    }

    // --- 7-inch & 10-inch Tablets ---
    const tab7Context = await browser.newContext({ ...devices['iPad Mini'], colorScheme: 'light' });
    const tab7Page = await tab7Context.newPage();
    try {
      await tab7Page.goto(baseUrl, { waitUntil: 'networkidle' });
      await clearFocus(tab7Page);
      await tab7Page.screenshot({ path: path.join(tablet7Dir, 'tablet-screenshot-1-card-front.png') });
    } finally {
      await tab7Context.close();
    }

    const tab10Context = await browser.newContext({ ...devices['iPad Pro 11'], colorScheme: 'light' });
    const tab10Page = await tab10Context.newPage();
    try {
      await tab10Page.goto(baseUrl, { waitUntil: 'networkidle' });
      await clearFocus(tab10Page);
      await tab10Page.screenshot({ path: path.join(tablet10Dir, 'tablet-10in-screenshot-1-card-front.png') });
    } finally {
      await tab10Context.close();
    }
  }

  await browser.close();
  console.log('\n✨ All store assets generated cleanly without focus rings!');
}

generateAllStoreAssets().catch(console.error);
