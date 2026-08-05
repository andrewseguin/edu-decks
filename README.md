# `edu-decks` 🎴✨

An interactive, distraction-free educational flashcard suite built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **pnpm workspaces**. Designed for early learners to practice mental arithmetic, phonics, and reading fluency with visual animations, speech audio, and interactive practice quizzes.

---

## 📦 Workspace Overview

```
edu-decks/
├── apps/
│   ├── arithmetic-deck/   # Numbers, operations (+, -, ×, ÷), fraction pie charts, & 10-frames
│   └── reading-deck/      # Alphabet phonics, 1,000+ sight words, letter tracing, & reading fluency
├── packages/
│   └── deck-core/         # Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
├── pnpm-workspace.yaml    # Workspace configuration
└── turbo.json             # Workspace task runner rules
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** `>= 20.0.0`
- **pnpm** `>= 10.0.0` (`npm install -g pnpm`)

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Start Development Servers
Run both applications concurrently:
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

### Workspace Typechecking & Build
```bash
pnpm -r typecheck
pnpm -r build
```

### Automated Visual Regression Testing
We use **Playwright** for automated screenshot diffing across 4 viewports (`Desktop Landscape`, `Tablet Landscape`, `Mobile Landscape`, `Mobile Portrait`) and Light/Dark themes:
```bash
# Run automated screenshot comparison tests
pnpm -r test:visual

# Update baseline snapshots after UI changes
pnpm -r test:visual:update
```

---

## 📚 Documentation
- [`packages/deck-core/README.md`](./packages/deck-core/README.md) — Shared core component & hook API reference.
- [`apps/arithmetic-deck/README.md`](./apps/arithmetic-deck/README.md) — Arithmetic Deck features & math generator details.
- [`apps/reading-deck/README.md`](./apps/reading-deck/README.md) — Reading Deck phonics, word audio, & tracing details.
