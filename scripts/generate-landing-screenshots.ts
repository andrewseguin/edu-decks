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
        .nextjs-toast-errors-parent,
        [data-card-debug-badge],
        [data-card-debug-badge="true"],
        span:has-text("PROMPT CONTAINER"),
        span:has-text("REVEAL CONTAINER") {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        [data-card-section] {
          outline: none !important;
          border: none !important;
        }
        .outline-cyan-400\\/80,
        .outline-emerald-400\\/80,
        .outline-dashed,
        .outline-2 {
          outline: none !important;
        }
      `,
    });
    await page.evaluate(() => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-dev-tools], #nextjs-dev-tools, #__next-build-watcher, [data-card-debug-badge]').forEach(el => el.remove());
      document.querySelectorAll('[data-card-section]').forEach(el => {
        (el as HTMLElement).style.outline = 'none';
      });
    });
  } catch (e) {}
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
  await hideDevOverlays(page);
  await page.waitForTimeout(200);
}

async function generateLandingScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const root = process.cwd();

  const arithmeticDir = path.join(root, 'apps/landing-page/public/screenshots/arithmetic');
  const readingDir = path.join(root, 'apps/landing-page/public/screenshots/reading');

  fs.mkdirSync(arithmeticDir, { recursive: true });
  fs.mkdirSync(readingDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // ==========================================
  // 1. ARITHMETIC DECK (9003)
  // ==========================================
  console.log('Capturing Arithmetic Deck screenshots (Light & Dark)...');
  await page.goto('http://localhost:9003');
  await page.waitForSelector('main');
  await page.waitForTimeout(600);

  // Set Light Theme & Whole Numbers
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
    localStorage.setItem('math-deck-number-type', '"whole"');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);

  // 1. Front (Light)
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-1-card-front.png') });
  console.log('Saved: arithmetic/landscape-1-card-front.png');

  // 1. Front (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-1-card-front-dark.png') });
  console.log('Saved: arithmetic/landscape-1-card-front-dark.png');

  // 2. Back (Dark)
  await page.mouse.click(640, 360);
  await advanceToLastStep(page);
  await clearFocus(page);
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-2-card-back-dark.png') });
  console.log('Saved: arithmetic/landscape-2-card-back-dark.png');

  // 2. Back (Light)
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-2-card-back.png') });
  console.log('Saved: arithmetic/landscape-2-card-back.png');

  // 3. Quiz Mode (Light)
  const calcBtn = page.locator("button[aria-label='Select operations']");
  if (await calcBtn.isVisible()) {
    await calcBtn.click();
    await page.waitForTimeout(300);
    const startQuizBtn = page.locator("button:has-text('Start Quiz')");
    if (await startQuizBtn.isVisible()) {
      await startQuizBtn.click();
      await page.waitForTimeout(600);
    }
  }
  await clearFocus(page);
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-3-quiz-mode.png') });
  console.log('Saved: arithmetic/landscape-3-quiz-mode.png');

  // 3. Quiz Mode (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(arithmeticDir, 'landscape-3-quiz-mode-dark.png') });
  console.log('Saved: arithmetic/landscape-3-quiz-mode-dark.png');

  // ==========================================
  // 2. READING DECK (9002)
  // ==========================================
  console.log('\nCapturing Reading Deck screenshots (Light & Dark)...');
  await page.goto('http://localhost:9002');
  await page.waitForSelector('main');
  await page.waitForTimeout(600);

  // Set Light Theme & Letters mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('first-read-gamemode', '"letters"');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);

  // 1. Letters Front (Light)
  await page.screenshot({ path: path.join(readingDir, 'landscape-1-card-front.png') });
  console.log('Saved: reading/landscape-1-card-front.png');

  // 1. Letters Front (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(readingDir, 'landscape-1-card-front-dark.png') });
  console.log('Saved: reading/landscape-1-card-front-dark.png');

  // 2. Words (Dark)
  await page.evaluate(() => {
    localStorage.setItem('first-read-gamemode', '"words"');
    localStorage.setItem('first-read-word-difficulty', '"easy"');
  });
  await page.goto('http://localhost:9002');
  await page.waitForSelector('main');
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(400);
  await clearFocus(page);
  await page.screenshot({ path: path.join(readingDir, 'landscape-2-card-back-dark.png') });
  console.log('Saved: reading/landscape-2-card-back-dark.png');

  // 2. Words (Light)
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(readingDir, 'landscape-2-card-back.png') });
  console.log('Saved: reading/landscape-2-card-back.png');

  // 3. Quiz Mode (Light)
  await page.evaluate(() => {
    localStorage.setItem('first-read-gamemode', '"letters"');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await page.goto('http://localhost:9002');
  await page.waitForSelector('main');
  await page.waitForTimeout(400);
  const letterSelectorBtn = page.locator("button[aria-label='Select letters']");
  if (await letterSelectorBtn.isVisible()) {
    await letterSelectorBtn.click();
    await page.waitForTimeout(300);
    const startQuizBtn = page.locator("button:has-text('Start Quiz')");
    if (await startQuizBtn.isVisible()) {
      await startQuizBtn.click();
      await page.waitForTimeout(600);
    }
  }
  await clearFocus(page);
  await page.screenshot({ path: path.join(readingDir, 'landscape-3-quiz-mode.png') });
  console.log('Saved: reading/landscape-3-quiz-mode.png');

  // 3. Quiz Mode (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(readingDir, 'landscape-3-quiz-mode-dark.png') });
  console.log('Saved: reading/landscape-3-quiz-mode-dark.png');

  // ==========================================
  // 3. GEOMETRY DECK (9004)
  // ==========================================
  const geometryDir = path.join(root, 'apps/landing-page/public/screenshots/geometry');
  fs.mkdirSync(geometryDir, { recursive: true });

  console.log('Capturing Geometry Deck screenshots (Light & Dark)...');
  await page.goto('http://localhost:9004');
  await page.waitForSelector('main');
  await page.waitForTimeout(600);

  // Set Light Theme & Triangles topic (Brand Emerald Green Term Card)
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
    localStorage.setItem('geometry-deck-card-types', JSON.stringify(['term']));
  });
  await page.goto('http://localhost:9004');
  await page.waitForSelector('main');
  await page.waitForTimeout(500);
  await clearFocus(page);

  // 1. Front (Light)
  await page.screenshot({ path: path.join(geometryDir, 'landscape-1-card-front.png') });
  console.log('Saved: geometry/landscape-1-card-front.png');

  // 1. Front (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
    localStorage.setItem('geometry-deck-card-types', JSON.stringify(['term']));
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(geometryDir, 'landscape-1-card-front-dark.png') });
  console.log('Saved: geometry/landscape-1-card-front-dark.png');

  // 2. Step Reveal / Back (Light)
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
    localStorage.setItem('geometry-deck-card-types', JSON.stringify(['calculation']));
  });
  await page.goto('http://localhost:9004');
  await page.waitForSelector('main');
  await page.waitForTimeout(500);
  const cardLight = page.locator('main > div').first();
  if (await cardLight.isVisible()) {
    await cardLight.click();
    await advanceToLastStep(page);
  }
  await clearFocus(page);
  await page.screenshot({ path: path.join(geometryDir, 'landscape-2-card-back.png') });
  console.log('Saved: geometry/landscape-2-card-back.png');

  // 2. Step Reveal / Back (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
    localStorage.setItem('geometry-deck-card-types', JSON.stringify(['calculation']));
  });
  await page.goto('http://localhost:9004');
  await page.waitForSelector('main');
  await page.waitForTimeout(500);
  const cardDark = page.locator('main > div').first();
  if (await cardDark.isVisible()) {
    await cardDark.click();
    await advanceToLastStep(page);
  }
  await clearFocus(page);
  await page.screenshot({ path: path.join(geometryDir, 'landscape-2-card-back-dark.png') });
  console.log('Saved: geometry/landscape-2-card-back-dark.png');

  // 3. Quiz Mode (Light)
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  });
  await page.goto('http://localhost:9004');
  await page.waitForSelector('main');
  await page.waitForTimeout(400);
  const quizLaunchBtn = page.locator("button[aria-label='Start Quiz Mode'], button[aria-label='Quiz Mode']").first();
  if (await quizLaunchBtn.isVisible()) {
    await quizLaunchBtn.click();
    await page.waitForTimeout(600);
  }
  await clearFocus(page);
  await page.screenshot({ path: path.join(geometryDir, 'landscape-3-quiz-mode.png') });
  console.log('Saved: geometry/landscape-3-quiz-mode.png');

  // 3. Quiz Mode (Dark)
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await clearFocus(page);
  await page.screenshot({ path: path.join(geometryDir, 'landscape-3-quiz-mode-dark.png') });
  console.log('Saved: geometry/landscape-3-quiz-mode-dark.png');

  await browser.close();
  console.log('\n=== All 18 light and dark screenshots successfully generated! ===');
}

generateLandingScreenshots().catch(console.error);
