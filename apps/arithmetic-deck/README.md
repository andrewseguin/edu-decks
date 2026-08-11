# Arithmetic Deck

An interactive, distraction-free mental arithmetic application designed for young learners (Ages 4–10 / Pre-K to 4th grade) to build number sense and math fluency through visual strategy models and interactive flashcards.

**Live App**: [arithmetic.edudecks.org](https://arithmetic.edudecks.org) · **Main Portal**: [edudecks.org](https://edudecks.org) · **Monorepo**: [`../../README.md`](../../README.md)

---

## Quick Links & Navigation

- **Live Web Application**: [https://arithmetic.edudecks.org](https://arithmetic.edudecks.org)
- **EduDecks Main Portal**: [https://edudecks.org](https://edudecks.org)
- **Privacy Policy**: [https://arithmetic.edudecks.org/privacy](https://arithmetic.edudecks.org/privacy)
- **Monorepo Root README**: [`../../README.md`](../../README.md)
- **Reading Deck App**: [`../reading-deck/README.md`](../reading-deck/README.md)
- **Shared Core UI (`@decks/core`)**: [`../../packages/deck-core/README.md`](../../packages/deck-core/README.md)

---

## Built for Co-Learning

Arithmetic Deck is designed for children to explore together with a parent, teacher, caregiver, or study partner. While the app provides step animations, visual models, and audio hints, kids learn best when someone sits with them to guide their practice, talk through math strategies, and celebrate their progress.

---

## Key Features

- **Four Arithmetic Operations**:
  - Addition, Subtraction, Multiplication, and Division.
  - Customizable number range presets (0–5, 0–10, 0–20, 0–50, 0–100).
- **Interactive Fraction Visualizations**:
  - Dynamic fraction pie charts and subdivide grid cuts.
  - Common denominator conversion badges (e.g. `1/2 - 3/6 = 0` converted to `3/6 - 3/6 = 0/6`).
- **Whole Number Strategy Visualizers**:
  - 10-frame fill-in/take-away blocks.
  - Multiplication grid arrays and equal division grouping visualizers.
- **Interactive Quiz Mode**:
  - Responsive numeric keypad overlay for mental math practice.
  - Score streak counter, victory animations, and sound effects.
- **Responsive Design & Dark Mode**:
  - Optimized layouts for Desktop, Tablet, and Mobile devices in both Light and Dark themes.
- **Parental Controls & Screen Keep-Awake**:
  - Settings lock with 3-second auto-dismissing notifications.
  - Screen Wake Lock API (`navigator.wakeLock`) keeps displays awake during practice.
- **100% Free & Private**: Zero ads, zero tracking, no accounts required, fully offline PWA support.

---

## Tech Stack & Architecture

- **Framework**: [Next.js 15](https://nextjs.org) (App Router), [React 19](https://react.dev)
- **Shared Core**: Uses `@decks/core` (`FlashCardShell`, `QuizOverlayShell`, `DeckControlBar`, `SessionStats`, `useAudio`, `useWakeLock`)
- **Native Packaging**: [Capacitor 8](https://capacitorjs.com) for iOS and Android
- **Testing**: [Vitest](https://vitest.dev) for unit tests & [Playwright](https://playwright.dev) for 4-viewport visual regression tests

---

## Quick Start (pnpm Workspace)

### 1. Run Local Development Server (Port `9003`)
From the workspace root or inside `apps/arithmetic-deck`:
```bash
# From workspace root
pnpm --filter arithmetic-deck dev

# Or inside apps/arithmetic-deck
pnpm dev
```
Open [http://localhost:9003](http://localhost:9003) in your browser.

### 2. Verification & Testing
```bash
# Typecheck TypeScript
pnpm --filter arithmetic-deck typecheck

# Run Vitest unit tests
pnpm --filter arithmetic-deck test

# Run Playwright visual regression tests
pnpm --filter arithmetic-deck test:visual
```

### 3. Native Mobile App Sync
```bash
# Open native iOS project in Xcode
pnpm --filter arithmetic-deck cap:open:ios

# Open native Android project in Android Studio
pnpm --filter arithmetic-deck cap:open:android
```

---

## Navigation
- Back to [EduDecks Monorepo Root](../../README.md)
- Explore [Reading Deck (`apps/reading-deck`)](../reading-deck/README.md)
- Explore [EduDecks Portal (`apps/landing-page`)](../landing-page/README.md)
- Visit [arithmetic.edudecks.org](https://arithmetic.edudecks.org)
