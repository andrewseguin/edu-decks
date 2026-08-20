import { chromium, devices, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

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

async function openSelectorModal(page: Page) {
  try {
    const selectorBtn = page.locator("button[aria-label*='Select'], button[aria-label*='settings']").first();
    if (await selectorBtn.isVisible()) {
      await selectorBtn.click();
      await page.waitForTimeout(500);
      await clearFocus(page);
      return true;
    }
  } catch (e) {}
  return false;
}

async function generateAllStoreAssets() {
  const root = process.cwd();
  const browser = await chromium.launch({ headless: true });

  const APPS = [
    {
      name: 'arithmetic-deck',
      url: 'https://arithmetic-dev.edudecks.org',
      dir: path.join(root, 'store-assets/arithmetic-deck'),
      setupCard1: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
          localStorage.setItem('math-deck-operations', JSON.stringify(['+']));
          localStorage.setItem('math-deck-number-type', '"whole"');
        });
        await page.reload({ waitUntil: 'networkidle' });
      },
      setupCard2: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('math-deck-operations', JSON.stringify(['×']));
          localStorage.setItem('math-deck-min-range', '3');
          localStorage.setItem('math-deck-max-range', '6');
        });
        await page.reload({ waitUntil: 'networkidle' });
        const card = page.locator('main > div').first();
        if (await card.isVisible()) {
          await card.click();
          await advanceToLastAnimationStep(page);
        }
      },
      setupCard3: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
        });
        await page.reload({ waitUntil: 'networkidle' });
        await openSelectorModal(page);
      },
      setupCard4: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('math-deck-number-type', '"whole"');
          localStorage.setItem('math-deck-operations', JSON.stringify(['+', '-']));
        });
        await page.reload({ waitUntil: 'networkidle' });
        await launchActiveQuizMode(page);
      },
    },
    {
      name: 'reading-deck',
      url: 'https://reading-dev.edudecks.org',
      dir: path.join(root, 'store-assets/reading-deck'),
      setupCard1: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
          localStorage.setItem('first-read-gamemode', '"letters"');
        });
        await page.reload({ waitUntil: 'networkidle' });
      },
      setupCard2: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('first-read-gamemode', '"words"');
          localStorage.setItem('first-read-word-difficulty', '"easy"');
        });
        await page.reload({ waitUntil: 'networkidle' });
      },
      setupCard3: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
        });
        await page.reload({ waitUntil: 'networkidle' });
        await openSelectorModal(page);
      },
      setupCard4: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('first-read-gamemode', '"letters"');
        });
        await page.reload({ waitUntil: 'networkidle' });
        await launchActiveQuizMode(page);
      },
    },
    {
      name: 'geometry-deck',
      url: 'https://geometry-dev.edudecks.org',
      dir: path.join(root, 'store-assets/geometry-deck'),
      setupCard1: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
          localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
          localStorage.setItem('geometry-deck-card-types', JSON.stringify(['term']));
        });
        await page.reload({ waitUntil: 'networkidle' });
      },
      setupCard2: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles']));
          localStorage.setItem('geometry-deck-card-types', JSON.stringify(['calculation']));
        });
        await page.reload({ waitUntil: 'networkidle' });
        const card = page.locator('main > div').first();
        if (await card.isVisible()) {
          await card.click();
          await advanceToLastAnimationStep(page);
        }
      },
      setupCard3: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light');
        });
        await page.reload({ waitUntil: 'networkidle' });
        await openSelectorModal(page);
      },
      setupCard4: async (page: Page) => {
        await page.evaluate(() => {
          localStorage.setItem('geometry-deck-topics', JSON.stringify(['triangles', 'angles', 'quadrilaterals']));
        });
        await page.reload({ waitUntil: 'networkidle' });
        await launchActiveQuizMode(page);
      },
    },
  ];

  for (const app of APPS) {
    console.log(`\n📸 Capturing Native iPhone (Portrait) & Native iPad (Landscape) Screenshots for ${app.name}...`);
    fs.mkdirSync(app.dir, { recursive: true });

    // 1. Native iPhone Viewport (iPhone 14 Pro Max -> 1290x2796)
    const phoneContext = await browser.newContext({
      ...devices['iPhone 14 Pro Max'],
      colorScheme: 'light',
    });
    const phonePage = await phoneContext.newPage();

    // 2. Native iPad Landscape Viewport (iPad Pro 12.9" Landscape -> 2732x2048)
    const ipadContext = await browser.newContext({
      viewport: { width: 1366, height: 1024 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      colorScheme: 'light',
    });
    const ipadPage = await ipadContext.newPage();

    const shots = [
      { name: 'screenshot-1-card-front', setup: app.setupCard1 },
      { name: 'screenshot-2-card-back', setup: app.setupCard2 },
      { name: 'screenshot-3-card-next', setup: app.setupCard3 },
      { name: 'screenshot-4-quiz-mode', setup: app.setupCard4 },
    ];

    await phonePage.goto(app.url, { waitUntil: 'networkidle' });
    await ipadPage.goto(app.url, { waitUntil: 'networkidle' });

    for (const shot of shots) {
      // Capture iPhone Native Viewport
      await shot.setup(phonePage);
      await clearFocus(phonePage);
      await phonePage.screenshot({ path: path.join(app.dir, `${shot.name}.png`) });
      console.log(`  ✓ Captured iPhone Native Portrait: ${shot.name}.png`);

      // Capture iPad Native Landscape Viewport
      await shot.setup(ipadPage);
      await clearFocus(ipadPage);
      await ipadPage.screenshot({ path: path.join(app.dir, `${shot.name}-ipad.png`) });
      console.log(`  ✓ Captured iPad Native Landscape: ${shot.name}-ipad.png`);
    }

    await phoneContext.close();
    await ipadContext.close();
  }

  await browser.close();
  console.log('\n✨ All native iPhone Portrait & iPad Landscape screenshots captured cleanly!');
}

generateAllStoreAssets().catch(console.error);
