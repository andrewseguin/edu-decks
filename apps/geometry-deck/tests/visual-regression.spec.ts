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

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:9004";

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
// Card IDs
//
// We enumerate card IDs here (mirroring TEST_CARD_IDS from the catalogue)
// rather than importing TypeScript because Playwright runs in its own Node
// context without Next.js path-alias resolution.
//
// If you add a card to test-card-catalogue.ts, add its ID here too.
// ─────────────────────────────────────────────────────────────────────────────

const CARD_IDS: string[] = [
  // Angles — term
  "term-angle-acute",
  "term-angle-obtuse",
  "term-angle-reflex",
  "term-angle-complementary",
  "term-angle-supplementary",
  "term-angle-vertically-opp",
  "term-angle-alternate",
  "term-angle-cointerior",
  // Angles — calc
  "calc-angle-supplementary",
  "calc-angle-complementary",
  "calc-angle-vertically-opp",
  // Triangles — term
  "term-tri-equilateral",
  "term-tri-isosceles",
  "term-tri-scalene",
  "term-tri-right",
  "term-tri-angle-sum",
  "term-tri-pythag",
  // Triangles — formula
  "formula-tri-area",
  "formula-tri-perim",
  "formula-tri-pyth",
  // Triangles — calc
  "calc-tri-angle-sum",
  "calc-tri-area",
  "calc-tri-perimeter",
  "calc-tri-pyth-c",
  "calc-tri-pyth-b",
  // Quadrilaterals — term
  "term-quad-parallelogram",
  "term-quad-rhombus",
  "term-quad-trapezoid",
  // Quadrilaterals — formula
  "formula-quad-rect-area",
  "formula-quad-rect-perim",
  "formula-quad-para-area",
  "formula-quad-trap-area",
  // Quadrilaterals — calc
  "calc-quad-rect-area",
  "calc-quad-rect-perim",
  "calc-quad-para-area",
  "calc-quad-trap-area",
  "calc-quad-rect-reverse",
  // Circles — term
  "term-circle-circumference",
  "term-circle-pi",
  "term-circle-radius",
  "term-circle-diameter",
  // Circles — calc
  "calc-circle-circ",
  "calc-circle-area",
  "calc-circle-r-from-c",
  "calc-circle-r-from-a",
  // Polygons — term
  "term-poly-regular",
  "term-poly-interior-sum",
  // Polygons — calc
  "calc-poly-perimeter",
  "calc-poly-angle-sum",
  "calc-poly-each-angle-hex",
  // 3D — term
  "term-3d-face",
  "term-3d-edge",
  "term-3d-vertex",
  "term-3d-euler",
  // 3D — calc
  "calc-3d-prism",
  "calc-3d-cylinder",
  "calc-3d-euler",
];

// ─────────────────────────────────────────────────────────────────────────────
// Test generation
//
// For each card we generate:
//   <cardId>-front          — card front face
//   <cardId>-back-step-N    — card back at each step index
// ─────────────────────────────────────────────────────────────────────────────

for (const cardId of CARD_IDS) {
  test.describe(cardId, () => {

    // ── Front ──────────────────────────────────────────────────────────────
    test("front", async ({ page }) => {
      await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=front`);
      await freezeAnimations(page);
      await page.waitForSelector('[data-testid="test-card-root"]');

      await expect(page).toHaveScreenshot(
        `${cardId}-front.png`,
        screenshotOptions,
      );
    });

    // ── Back — one screenshot per step ────────────────────────────────────
    test("back", async ({ page }) => {
      // Navigate to step 0 first to discover the total step count
      await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=back&step=0`);
      await freezeAnimations(page);
      await page.waitForSelector('[data-testid="test-card-root"]');

      const stepCountAttr = await page.getAttribute("#card-meta", "data-step-count");
      const stepCount = parseInt(stepCountAttr ?? "0", 10);

      // Screenshot each step (including step 0 which we're already on)
      for (let s = 0; s < stepCount; s++) {
        if (s > 0) {
          await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=back&step=${s}`);
          await freezeAnimations(page);
          await page.waitForSelector('[data-testid="test-card-root"]');
        }

        await expect(page).toHaveScreenshot(
          `${cardId}-back-step-${s}.png`,
          screenshotOptions,
        );
      }

      // Also capture the "no step visible" initial state (step = -1)
      await page.goto(`${BASE_URL}/test-cards?card=${cardId}&state=back&step=-1`);
      await freezeAnimations(page);
      await page.waitForSelector('[data-testid="test-card-root"]');
      await expect(page).toHaveScreenshot(
        `${cardId}-back-empty.png`,
        screenshotOptions,
      );
    });
  });
}
