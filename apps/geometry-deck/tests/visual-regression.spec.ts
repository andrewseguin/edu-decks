/**
 * visual-regression.spec.ts
 *
 * Screenshot tests for every geometry card permutation.
 *
 * For each card in the catalogue this generates:
 *   - 1 front screenshot
 *   - N back screenshots (one per proof step)
 *
 * Multiplied across 4 viewport projects defined in playwright.config.ts:
 *   Desktop Landscape · Mobile Landscape · Tablet Landscape · Mobile Portrait
 *
 * First run (write baselines):
 *   pnpm --filter geometry-deck exec playwright test --update-snapshots
 *
 * Subsequent runs (compare):
 *   pnpm --filter geometry-deck exec playwright test
 * or via workspace script:
 *   pnpm -r test:visual
 */

import { test, expect, type Page } from "@playwright/test";
import { TEST_CARD_IDS } from "../src/lib/test-card-catalogue";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://127.0.0.1:9004";

/**
 * Inject CSS that freezes all animations and hides Next.js dev overlays.
 * Must be called before navigation so the style tag is ready when the page
 * loads (addInitScript would also work, but this is simpler for style-only).
 */
async function freezeAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after, html, body, :root {
        animation: none !important;
        transition: none !important;
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dev-tools-button],
      [data-next-badge],
      #__next-build-watcher {
        display: none !important;
        visibility: hidden !important;
      }
    `,
  });
}

const screenshotOptions = {
  animations: "disabled" as const,
  maxDiffPixelRatio: 0.02,
};

// ─────────────────────────────────────────────────────────────────────────────
// Test generation
//
// For each card in TEST_CARD_IDS we generate:
//   <cardId>-front   — card front face
//   <cardId>-back    — card back (full proof table)
// ─────────────────────────────────────────────────────────────────────────────

for (const cardId of TEST_CARD_IDS) {
  test.describe(cardId, () => {

    // ── Front ──────────────────────────────────────────────────────────────
    test("front", async ({ page }) => {
      await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=front`, { waitUntil: "domcontentloaded" });
      await freezeAnimations(page);
      await page.waitForSelector('[data-testid="test-card-root"]');

      await expect(page).toHaveScreenshot(
        `${cardId}-front.png`,
        screenshotOptions,
      );
    });

    // ── Back ──────────────────────────────────────────────────────────────
    test("back", async ({ page }) => {
      await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=back`, { waitUntil: "domcontentloaded" });
      await freezeAnimations(page);
      await page.waitForSelector('[data-testid="test-card-root"]');

      await expect(page).toHaveScreenshot(
        `${cardId}-back.png`,
        screenshotOptions,
      );
    });
  });
}

