# `edu-decks` 🎴✨

An interactive, distraction-free educational flashcard suite built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **Turborepo** + **pnpm workspaces**. Designed for early learners to practice mental arithmetic, phonics, reading fluency, and spatial reasoning with visual animations, speech audio, and interactive practice quizzes.

---

## 📦 Monorepo Architecture

```
edu-decks/
├── apps/
│   ├── arithmetic-deck/   # Numbers, operations (+, -, ×, ÷), fraction pie charts, & 10-frames
│   └── reading-deck/      # Alphabet phonics, 1,000+ sight words, letter tracing, & reading fluency
├── packages/
│   └── deck-core/         # Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
├── pnpm-workspace.yaml    # Worksace configuration
└── turbo.json             # Turborepo task runner rules
```

### Why a Monorepo?
By centralizing shared UI primitives and ergonomics in `@decks/core`, every deck in the `edu-decks` suite inherits:
- **Unified Visual Layout**: Consistently styled top control bars (`DeckControlBar`), score/timer counters (`SessionStats`), and full-screen quiz overlays (`QuizOverlayShell`).
- **Child-Friendly Controls**: Accessible corner buttons (`CardCornerButton`), frosted help badges (`FrostedBadge`), and 3-second parental settings locks (`LockSnackbar`).
- **Shared Browser APIs**: Screen wake-lock persistence (`useWakeLock`), audio speech synthesis & sound effects (`useAudio`), and deck session history (`useDeckHistory`).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** `>= 20.0.0`
- **pnpm** `>= 10.0.0` (Install via `npm install -g pnpm`)

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Start Development Servers
Run all applications concurrently with Turborepo:
```bash
pnpm dev
```
- **Arithmetic Deck**: [http://localhost:9003](http://localhost:9003)
- **Reading Deck**: [http://localhost:9002](http://localhost:9002)

To run a single application:
```bash
pnpm --filter arithmetic-deck dev
pnpm --filter reading-deck dev
```

---

## 🧪 Verification & Testing

Our suite enforces **zero regressions** across layout, audio, animations, and responsive viewports.

### Workspace Typechecking & Build
```bash
# Typecheck all packages and applications
pnpm -r typecheck

# Build production static exports across the monorepo
pnpm -r build
```

### Playwright Visual Regression Testing
Both applications feature automated visual regression screenshot testing across 4 viewports (`Desktop Landscape`, `Tablet Landscape`, `Mobile Landscape`, `Mobile Portrait`) and Light/Dark themes:
```bash
# Run automated screenshot comparison tests
pnpm -r test:visual

# Update baseline snapshots after UI changes
pnpm -r test:visual:update
```

---

## 🌐 Deployment Guide

### Option 1: Vercel (Recommended)
Vercel automatically detects Turborepo workspaces and shares build caches across projects:
1. In Vercel, import the `andrewseguin/edu-decks` repository.
2. For **Site 1 (`arithmetic-deck`)**: Set **Root Directory** to `apps/arithmetic-deck`.
3. For **Site 2 (`reading-deck`)**: Import the same repo again and set **Root Directory** to `apps/reading-deck`.

### Option 2: Cloudflare Pages / GitHub Pages
Both applications produce static HTML/JS exports via Next.js:
- Set Build Command to `npx pnpm@10.14.0 run build` and Output Directory to `out` (or `.next` for hybrid rendering).

---

## 📚 Documentation
- [`packages/deck-core/README.md`](./packages/deck-core/README.md) — Shared core component & hook API reference.
- [`apps/arithmetic-deck/README.md`](./apps/arithmetic-deck/README.md) — Arithmetic Deck features & math generator details.
- [`apps/reading-deck/README.md`](./apps/reading-deck/README.md) — Reading Deck phonics, word audio, & tracing details.
