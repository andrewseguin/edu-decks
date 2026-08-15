# `edu-decks` — AI Agent & Developer Rules

This file defines mandatory behavioral constraints and operational workflows for any AI agent or contributor working in the `edu-decks` monorepo.

---

## 🚨 CRITICAL OPERATIONAL RULES

### 1. DO NOT KILL OR CORRUPT LOCAL DEVELOPMENT SERVERS
- **NEVER** run `kill`, `killall`, `pkill`, or `lsof ... | kill -9` on processes listening on ports `9000` (`landing-page`), `9002` (`reading-deck`), `9003` (`arithmetic-deck`), or `9004` (`geometry-deck`).
- **NEVER** terminate a running `pnpm dev` process.
- **NEVER** run `next build` or `pnpm -r build` while `pnpm dev` is running. Running `next build` concurrently overwrites the active `.next` cache and build manifests with production bundles, corrupting the dev server and causing `500 Internal Server Error`.
- Both `apps/arithmetic-deck/playwright.config.ts`, `apps/reading-deck/playwright.config.ts`, and `apps/geometry-deck/playwright.config.ts` are configured with `reuseExistingServer: true`. Automated visual regression tests (`pnpm -r test:visual`) will automatically attach to and reuse any already-running development server.

### 2. INCREMENTAL VERIFICATION
- During active development, verify changes using type-checking and unit tests:
  ```bash
  pnpm -r typecheck
  pnpm -r test
  ```
- **Only run `pnpm -r build`** when dev servers are intentionally stopped or when performing final release/deployment validation.

### 3. MULTI-ENVIRONMENT DEPLOYMENTS & PRODUCTION BRANCH DISCIPLINE
- Everyday commits, feature work, and PRs merge into the `main` branch.
- Commits to `main` automatically deploy to `*-dev.edudecks.org` (`isDevSite() === true` for logs & dev tools) and `*-staging.edudecks.org` (`isDevSite() === false` for prod candidate testing).
- Live production sites (`*.edudecks.org`) are served exclusively from the **`prod`** branch.
- **NEVER** push directly to `prod` without validating changes on `main` / `*-staging.edudecks.org` first.
- To promote a verified candidate from `main` to live production:
  ```bash
  git push origin main:prod
  ```
- Always use `isDevSite()` from `@decks/core` to guard developer debug overlays, verbose logging, or diagnostic tools.

### 4. COMMUNICATION & FORMATTING
- **NEVER use LaTeX** (such as `$...$`, `$$...$$`, `\frac{...}{...}`, `\times`, etc.) in responses or chat messages. The user cannot read LaTeX. Use plain text, standard unicode symbols (e.g. ½, ×, ², √, °, ⟂), or standard HTML/markdown formatting instead.

### 5. GEOMETRY DECK — DESIGN & INTERACTION STANDARDS
- All cards in `apps/geometry-deck` MUST follow [apps/geometry-deck/DESIGN_GUIDE.md](file:///Users/andrewseguin/git/edu-decks/apps/geometry-deck/DESIGN_GUIDE.md).
- **Frosted Formula Banner**: Always wrap top definitions/formulas in the frosted hero banner with primary formula + optional plain English subtitle.
- **Unit Grid Visualization**: All area cards must visualize area using subtle, neutral unit grid lines (e.g. dashed 1×1 square cells) across the enclosing bounding box to concretely ground square units.
- **Semantic Color Coding**:
  - **Cyan (`#5ee8ff`)**: Height / vertical altitude ($h$), Side $a$, Angle $A$, Base angles.
  - **Gold (`#ffd45e`)**: Base / horizontal dimensions ($b$, $l$, $w$), Side $b$, Angle $B$, Apex angle.
  - **Orange (`#fb923c`)**: Hypotenuse ($c$), Angle $C$.
  - **White Bordered Pill**: Calculated answer / angle sum (`180°`).
  - **Neutral Translucent White**: Grid lines, bounding boxes, and shape fills.
- **Interaction & Numbers**: Allow smooth, continuous dragging on handles/vertices while cleanly rounding displayed numbers to whole integers. No auto-play loops.
- **Stacked Fractions**: Use `FormattedMathText` / `StackedFraction` for formulas to ensure textbook-quality typography rather than squished raw unicode fraction glyphs (e.g. `½`).

---


## 📦 Workspace Overview
- `apps/landing-page` (Port `9000`) — EduDecks Portal & Landing Showcase
- `apps/arithmetic-deck` (Port `9003`) — Mental Arithmetic & Number Sense
- `apps/reading-deck` (Port `9002`) — Phonics, Letters, & Reading Fluency
- `apps/geometry-deck` (Port `9004`) — Geometry Formulas, Properties & Theorems *(beta — no public deployment yet)*
- `apps/dev-site` (Port `9005`) — Internal Core Showcase & Card Reveal Height Lab
- `packages/deck-core` — Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
