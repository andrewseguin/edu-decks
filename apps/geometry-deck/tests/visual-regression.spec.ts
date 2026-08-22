import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 123456789;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  });

  await page.goto("http://127.0.0.1:9004");
  await page.waitForSelector("main");

  // Inject CSS to freeze animations and hide ticking timer seconds for 100% stable snapshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after, html, body, :root {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      .SessionStats {
        visibility: hidden !important;
      }
      nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], #__next-build-watcher, [data-next-badge] {
        display: none !important;
        visibility: hidden !important;
      }
    `,
  });
});

const screenshotOptions = {
  animations: "disabled" as const,
  maxDiffPixelRatio: 0.05,
};

// -------------------------------------------------------------
// 1. LIGHT & DARK THEME TESTS
// -------------------------------------------------------------
test("Light Theme", async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  });
  await page.waitForTimeout(200);

  // Front (Unrevealed)
  await expect(page).toHaveScreenshot("theme-light-front.png", screenshotOptions);

  // Flip to Back (Revealed)
  const card = page.locator("main > div").first();
  await card.click();
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("theme-light-back.png", screenshotOptions);
});

test("Dark Theme", async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });
  await page.waitForTimeout(200);

  // Front (Unrevealed)
  await expect(page).toHaveScreenshot("theme-dark-front.png", screenshotOptions);

  // Flip to Back (Revealed)
  const card = page.locator("main > div").first();
  await card.click();
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("theme-dark-back.png", screenshotOptions);
});

// -------------------------------------------------------------
// 2. CARD FRONT & BACK REVEALED
// -------------------------------------------------------------
test("Card Front", async ({ page }) => {
  await expect(page).toHaveScreenshot("card-front-unrevealed.png", screenshotOptions);
});

test("Card Back", async ({ page }) => {
  const card = page.locator("main > div").first();
  await card.click();
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("card-back-revealed.png", screenshotOptions);
});

// -------------------------------------------------------------
// 3. QUIZ MODE OVERLAY
// -------------------------------------------------------------
test("Quiz Mode", async ({ page }) => {
  const topicBtn = page.locator("button[aria-label='Select topics']");
  if (await topicBtn.isVisible()) {
    await topicBtn.click();
    await page.waitForTimeout(200);

    const startQuizBtn = page.locator("button:has-text('Start Quiz')");
    if (await startQuizBtn.isVisible()) {
      await startQuizBtn.evaluate((btn) => (btn as HTMLElement).click());
      await page.waitForTimeout(300);
    }
  }

  await expect(page).toHaveScreenshot("quiz-mode-overlay.png", screenshotOptions);
});

