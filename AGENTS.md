# `edu-decks` — AI Agent & Developer Rules

This file defines mandatory behavioral constraints and operational workflows for any AI agent or contributor working in the `edu-decks` monorepo.

---

## 🚨 CRITICAL OPERATIONAL RULES

### 1. DO NOT KILL OR CORRUPT LOCAL DEVELOPMENT SERVERS
- **NEVER** run `kill`, `killall`, `pkill`, or `lsof ... | kill -9` on processes listening on ports `9000` (`landing-page`), `9002` (`reading-deck`), or `9003` (`arithmetic-deck`).
- **NEVER** terminate a running `pnpm dev` process.
- **NEVER** run `next build` or `pnpm -r build` while `pnpm dev` is running. Running `next build` concurrently overwrites the active `.next` cache and build manifests with production bundles, corrupting the dev server and causing `500 Internal Server Error`.
- Both `apps/arithmetic-deck/playwright.config.ts` and `apps/reading-deck/playwright.config.ts` are configured with `reuseExistingServer: true`. Automated visual regression tests (`pnpm -r test:visual`) will automatically attach to and reuse any already-running development server.

### 2. ZERO DESTRUCTION
- Never delete existing working logic until the shared replacement in `@decks/core` is tested and verified.

### 3. NO REGRESSIONS
- The visual layout, card flip transitions, frosted "?" badges, audio TTS pronunciation (`useAudio`), wake-lock behavior (`useWakeLock`), and parental lock snackbars in BOTH applications must remain 100% identical unless explicitly requested by the user.
- Card-to-card transitions across all decks use the subtle fade-in zoom animation (`animate-fade-in-zoom`).

### 4. INCREMENTAL VERIFICATION
- During active development, verify changes using type-checking and unit tests:
  ```bash
  pnpm -r typecheck
  pnpm -r test
  ```
- **Only run `pnpm -r build`** when dev servers are intentionally stopped or when performing final release/deployment validation.

### 5. MULTI-ENVIRONMENT DEPLOYMENTS & PRODUCTION BRANCH DISCIPLINE
- Everyday commits, feature work, and PRs merge into the `main` branch.
- Commits to `main` automatically deploy to `*-dev.edudecks.org` (`isDevSite() === true` for logs & dev tools) and `*-staging.edudecks.org` (`isDevSite() === false` for prod candidate testing).
- Live production sites (`*.edudecks.org`) are served exclusively from the **`prod`** branch.
- **NEVER** push directly to `prod` without validating changes on `main` / `*-staging.edudecks.org` first.
- To promote a verified candidate from `main` to live production:
  ```bash
  git push origin main:prod
  ```
- Always use `isDevSite()` from `@decks/core` to guard developer debug overlays, verbose logging, or diagnostic tools.

---


## 📦 Workspace Overview
- `apps/landing-page` (Port `9000`) — EduDecks Portal & Landing Showcase
- `apps/arithmetic-deck` (Port `9003`) — Mental Arithmetic & Number Sense
- `apps/reading-deck` (Port `9002`) — Phonics, Letters, & Reading Fluency
- `packages/deck-core` — Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
