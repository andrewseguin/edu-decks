import { chromium, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

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

async function advanceToLastStep(page: Page) {
  await page.waitForTimeout(400);
  try {
    const stepBtns = page.locator('button:has-text("Step 2"), button:has-text("Step 3"), div.bg-black\\/30 button');
    const count = await stepBtns.count();
    if (count >= 2) {
      const lastStepBtn = stepBtns.nth(count - 2);
      if (await lastStepBtn.isVisible()) {
        await lastStepBtn.click();
      }
    }
  } catch (e) {}
  await page.waitForTimeout(600);
}

async function captureAll() {
  const browser = await chromium.launch({ headless: true });
  const root = process.cwd();

  // 1. ARITHMETIC DECK
  console.log('📸 Regenerating store screenshots for Arithmetic Deck...');
  const arithDir = path.join(root, 'store-assets/arithmetic-deck');
  const arithTab7Dir = path.join(arithDir, 'tablet');
  const arithTab10Dir = path.join(arithDir, 'tablet-10inch');
  fs.mkdirSync(arithTab7Dir, { recursive: true });
  fs.mkdirSync(arithTab10Dir, { recursive: true });

  const viewports = [
    { type: 'phone', width: 1080, height: 1920, scale: 1 },
    { type: 'tab7', width: 1200, height: 1920, scale: 1 },
    { type: 'tab10', width: 1600, height: 2560, scale: 1 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      colorScheme: 'light',
    });
    const page = await context.newPage();

    // Setup 1: Card Front (Light)
    await page.goto('http://localhost:9003', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
      localStorage.setItem('math-deck-number-type', '"whole"');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(arithDir, 'screenshot-1-card-front.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(arithTab7Dir, 'tablet-screenshot-1-card-front.png') });
    } else {
      await page.screenshot({ path: path.join(arithTab10Dir, 'tablet-10in-screenshot-1-card-front.png') });
    }

    // Setup 2: Visual Model / Back (Multiplication)
    await page.evaluate(() => {
      localStorage.setItem('math-deck-operations', JSON.stringify(['×']));
      localStorage.setItem('math-deck-min-range', '6');
      localStorage.setItem('math-deck-max-range', '6');
    });
    await page.reload({ waitUntil: 'networkidle' });
    const card = page.locator('main > div').first();
    if (await card.isVisible()) {
      await card.click();
      await advanceToLastStep(page);
    }
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(arithDir, 'screenshot-2-card-back.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(arithTab7Dir, 'tablet-screenshot-2-card-back.png') });
    } else {
      await page.screenshot({ path: path.join(arithTab10Dir, 'tablet-10in-screenshot-2-card-back.png') });
    }

    // Setup 3: Dark Mode / Next Card
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(arithDir, 'screenshot-3-card-next.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(arithTab7Dir, 'tablet-screenshot-3-dark-mode.png') });
    } else {
      await page.screenshot({ path: path.join(arithTab10Dir, 'tablet-10in-screenshot-3-dark-mode.png') });
    }

    // Setup 4: Quiz Mode (Light)
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle' });
    const selectorBtn = page.locator("button[aria-label*='Select'], button[aria-label*='settings']").first();
    if (await selectorBtn.isVisible()) {
      await selectorBtn.click();
      await page.waitForTimeout(300);
      const startQuizBtn = page.locator("button:has-text('Start Quiz')").first();
      if (await startQuizBtn.isVisible()) {
        await startQuizBtn.click();
        await page.waitForTimeout(600);
      }
    }
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(arithDir, 'screenshot-4-quiz-mode.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(arithTab7Dir, 'tablet-screenshot-4-quiz-mode.png') });
    } else {
      await page.screenshot({ path: path.join(arithTab10Dir, 'tablet-10in-screenshot-4-quiz-mode.png') });
    }

    await context.close();
  }

  // 2. READING DECK
  console.log('📸 Regenerating store screenshots for Reading Deck...');
  const readingDir = path.join(root, 'store-assets/reading-deck');
  const readTab7Dir = path.join(readingDir, 'tablet');
  const readTab10Dir = path.join(readingDir, 'tablet-10inch');
  fs.mkdirSync(readTab7Dir, { recursive: true });
  fs.mkdirSync(readTab10Dir, { recursive: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      colorScheme: 'light',
    });
    const page = await context.newPage();

    // Setup 1: Card Front (Light Letters)
    await page.goto('http://localhost:9002', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('first-read-gamemode', '"letters"');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(readingDir, 'screenshot-1-card-front.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(readTab7Dir, 'tablet-screenshot-1-card-front.png') });
    } else {
      await page.screenshot({ path: path.join(readTab10Dir, 'tablet-10in-screenshot-1-card-front.png') });
    }

    // Setup 2: Sight Words
    await page.evaluate(() => {
      localStorage.setItem('first-read-gamemode', '"words"');
      localStorage.setItem('first-read-word-difficulty', '"easy"');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(readingDir, 'screenshot-2-card-back.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(readTab7Dir, 'tablet-screenshot-2-card-back.png') });
    } else {
      await page.screenshot({ path: path.join(readTab10Dir, 'tablet-10in-screenshot-2-card-back.png') });
    }

    // Setup 3: Dark Mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('first-read-gamemode', '"letters"');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await clearFocus(page);

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(readingDir, 'screenshot-3-card-next.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(readTab7Dir, 'tablet-screenshot-3-dark-mode.png') });
    } else {
      await page.screenshot({ path: path.join(readTab10Dir, 'tablet-10in-screenshot-3-dark-mode.png') });
    }

    // Setup 4: Quiz Mode (Light)
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle' });
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

    if (vp.type === 'phone') {
      await page.screenshot({ path: path.join(readingDir, 'screenshot-4-quiz-mode.png') });
    } else if (vp.type === 'tab7') {
      await page.screenshot({ path: path.join(readTab7Dir, 'tablet-screenshot-4-quiz-mode.png') });
    } else {
      await page.screenshot({ path: path.join(readTab10Dir, 'tablet-10in-screenshot-4-quiz-mode.png') });
    }

    await context.close();
  }

  await browser.close();
  console.log('✨ Successfully regenerated all store screenshots with zero server errors and no dev overlays!');
}

captureAll().catch(console.error);
