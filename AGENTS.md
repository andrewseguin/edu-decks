# `edu-decks` — AI Agent & Developer Rules

This file defines mandatory behavioral constraints and operational workflows for any AI agent or contributor working in the `edu-decks` monorepo.

---

## 🚨 CRITICAL OPERATIONAL RULES

### 1. DO NOT KILL LOCAL DEVELOPMENT SERVERS
- **NEVER** run `kill`, `killall`, `pkill`, or `lsof ... | kill -9` on processes listening on ports `9002` (`reading-deck`) or `9003` (`arithmetic-deck`).
- **NEVER** terminate a running `pnpm dev` process.
- Both `apps/arithmetic-deck/playwright.config.ts` and `apps/reading-deck/playwright.config.ts` are configured with `reuseExistingServer: true`. Automated visual regression tests (`pnpm -r test:visual`) will automatically attach to and reuse any already-running development server.

### 2. ZERO DESTRUCTION
- Never delete existing working logic until the shared replacement in `@decks/core` is tested and verified.

### 3. NO REGRESSIONS
- The visual layout, card flip transitions, frosted "?" badges, audio TTS pronunciation (`useAudio`), wake-lock behavior (`useWakeLock`), and parental lock snackbars in BOTH applications must remain 100% identical unless explicitly requested by the user.
- Card-to-card transitions across all decks use the subtle fade-in zoom animation (`animate-fade-in-zoom`).

### 4. INCREMENTAL VERIFICATION
- After every phase of changes, you must run type-checking and the build command across the workspace to prove the workspace is green before proceeding:
  ```bash
  pnpm -r typecheck
  pnpm -r build
  ```

---

## 📦 Workspace Overview
- `apps/landing-page` (Port `9000`) — EduDecks Portal & Landing Showcase
- `apps/arithmetic-deck` (Port `9003`) — Mental Arithmetic & Number Sense
- `apps/reading-deck` (Port `9002`) — Phonics, Letters, & Reading Fluency
- `packages/deck-core` — Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
