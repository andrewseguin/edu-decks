# `edu-decks` 🎴✨

An interactive, distraction-free educational flashcard suite built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **Turborepo** + **pnpm workspaces**.

## 📦 Monorepo Architecture

```
edu-decks/
├── apps/
│   ├── arithmetic-deck/   # Numbers, arithmetic operations, ten-frames, and mental math
│   └── reading-deck/      # Phonics, letters, sight words, and reading fluency
├── packages/
│   └── deck-core/         # Shared UI shell, badges, control bars, quiz overlays, audio & wake-lock hooks
└── turbo.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Servers
```bash
pnpm dev
```
- **Arithmetic Deck**: http://localhost:9003
- **Reading Deck**: http://localhost:9002

### 3. Verification & Visual Regression Testing
```bash
# Typecheck across workspace
pnpm -r typecheck

# Production build across workspace
pnpm -r build

# Run visual regression suite (Playwright)
pnpm -r test:visual
```
