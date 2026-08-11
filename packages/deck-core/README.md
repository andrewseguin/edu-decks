# `@decks/core`

[![Workspace Root](https://img.shields.io/badge/Monorepo-edu--decks-purple?style=for-the-badge)](../../README.md)
[![EduDecks Portal](https://img.shields.io/badge/Portal-edudecks.org-emerald?style=for-the-badge)](https://edudecks.org)

The shared UI component library, layout shells, accessibility standards, and browser utility hooks for the **EduDecks** educational flashcard monorepo (`edudecks.org`).

---

## Quick Links & Navigation

- **Monorepo Root README**: [`../../README.md`](../../README.md)
- **EduDecks Portal App**: [`../../apps/landing-page/README.md`](../../apps/landing-page/README.md)
- **Reading Deck App**: [`../../apps/reading-deck/README.md`](../../apps/reading-deck/README.md)
- **Arithmetic Deck App**: [`../../apps/arithmetic-deck/README.md`](../../apps/arithmetic-deck/README.md)

---

## What is `@decks/core`?

`@decks/core` centralizes all common user experience, visual convergence, accessibility patterns, and co-learning UI flows across `apps/arithmetic-deck`, `apps/reading-deck`, and future educational decks.

By importing from `@decks/core`, applications ensure 100% consistent layouts, touch animations, audio feedback, parental controls, and full-screen quiz overlays.

---

## Exported Components

### Layout Shells & Overlays
- **`FlashCardShell`**: Primary 3D-flipping, swipable flashcard wrapper supporting interactive front/back content, customizable card colors, corner control slots, and frosted question-mark badges.
- **`QuizOverlayShell`**: Full-screen responsive quiz mode overlay with integrated exit controls, score & streak badge header, replay prompt button, and animated entrance.
- **`DeckControlBar`**: Responsive top-right control toolbar wrapper with proper touch z-indexing and event propagation shielding.

### UI Controls & Badges
- **`CardCornerButton`**: Accessible, touch-friendly circular action button for card corners (`top-left`, `top-right`, `bottom-left`, `bottom-right`) with size variants (`md`, `lg`).
- **`SessionStats`**: Shared card counter and timer pill supporting flexible layouts (`top-left`, `bottom-center`, `top-right`).
- **`FrostedBadge`**: Translucent frosted glass icon badge used for visual hints and card states.

### Parental Controls & Settings
- **`AppSettingsModal`**: Accessible settings modal shell with tabs for theme switching, counters, and application lock mode.
- **`LockSnackbar`**: 3-second auto-dismissing toast snackbar preventing young learners from accidentally opening settings menus.

---

## Exported Hooks

- **`useAudio(defaultPlayFn)`**: Manages Web Audio speech prompts, sound effects, and pronunciation chimes.
- **`useWakeLock(enabled)`**: Integrates the Web Standard Screen Wake Lock API (`navigator.wakeLock`) to keep tablet and mobile displays awake during active learning sessions.
- **`useDeckHistory(key)`**: Manages session history and card progression tracking.

---

## Usage & Tailwind CSS Configuration

In any Next.js application within `apps/*`:

```tsx
import {
  FlashCardShell,
  QuizOverlayShell,
  DeckControlBar,
  SessionStats,
  useAudio,
  useWakeLock,
} from "@decks/core";
```

### Critical Tailwind JIT Requirement
To ensure Tailwind CSS compiles utility classes used inside `@decks/core` (such as absolute corner positioning and fixed quiz overlays), add `@decks/core` to your application's `tailwind.config.ts`:

```ts
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/deck-core/src/**/*.{js,ts,jsx,tsx,mdx}", // Required!
  ],
  // ...
};
```

---

## Navigation
- Back to [EduDecks Monorepo Root](../../README.md)
- Visit [edudecks.org](https://edudecks.org)
