import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 123456789;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  });

  await page.goto("http://localhost:9003");
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
// 2. MATH CARD FRONT & BACK REVEALED
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

test("Fraction Card Back", async ({ page }) => {
  // Set local storage to fractions only and reload for deterministic fraction problem generation
  await page.evaluate(() => {
    localStorage.setItem("math-deck-show-fractions", "true");
    localStorage.setItem("math-deck-show-whole-numbers", "false");
  });
  await page.reload();
  await page.waitForSelector("main");
  await page.waitForTimeout(300);

  // Flip card to reveal answer
  const card = page.locator("main > div").first();
  await card.click();
  await page.waitForTimeout(300);

  // If problem has same denominators, advance to next problem until conversion helper badge is visible
  for (let i = 0; i < 10; i++) {
    const conversionBadge = page.locator("main > div .bg-black\\/25");
    if (await conversionBadge.isVisible()) {
      break;
    }
    await card.click(); // Advance to next card
    await page.waitForTimeout(200);
    await card.click(); // Flip to reveal
    await page.waitForTimeout(300);
  }

  await expect(page).toHaveScreenshot("fraction-card-back-revealed.png", screenshotOptions);
});

// -------------------------------------------------------------
// 3. QUIZ MODE OVERLAY (Header, Input Box, Keypad)
// -------------------------------------------------------------
test("Quiz Mode", async ({ page }) => {
  const calcBtn = page.locator("button[aria-label='Select operations']");
  if (await calcBtn.isVisible()) {
    await calcBtn.click();
    await page.waitForTimeout(200);

    const startQuizBtn = page.locator("button:has-text('Start Quiz')");
    if (await startQuizBtn.isVisible()) {
      await startQuizBtn.click();
      await page.waitForTimeout(300);
    }
  }

  await expect(page).toHaveScreenshot("quiz-mode-overlay.png", screenshotOptions);
});
