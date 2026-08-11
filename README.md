# `edu-decks` 🎴✨

An interactive, distraction-free educational flashcard suite built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **pnpm workspaces**. Designed for early learners and adults to practice mental arithmetic, phonics, and reading fluency together with visual animations, speech audio, and interactive practice quizzes.

> 🤝 **Built for Co-Learning**: EduDecks apps are interactive flash cards made for practicing together. Each deck includes visual hints and audio prompts, but kids learn best when someone sits with them to guide their practice, answer questions, and celebrate their progress.

---

## 📦 Workspace Overview

```
edu-decks/
├── apps/
│   ├── landing-page/      # EduDecks landing portal & deck apps showcase
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
Run applications concurrently:
```bash
pnpm dev
```
- **EduDecks Portal (landing-page)**: [http://localhost:9000](http://localhost:9000)
- **Arithmetic Deck**: [http://localhost:9003](http://localhost:9003)
- **Reading Deck**: [http://localhost:9002](http://localhost:9002)

To run a single application:
```bash
pnpm --filter landing-page dev
pnpm --filter arithmetic-deck dev
pnpm --filter reading-deck dev
```

---

## 🧪 Verification & Testing

### Typechecking & Unit Tests (Safe During Active Dev)
```bash
# Typecheck across all workspace packages
pnpm -r typecheck

# Run Vitest unit tests
pnpm -r test
```

### Production Build
```bash
# Full production build (run when dev servers are stopped)
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

## 📱 Mobile Native Apps (iOS & Android)

Both applications are configured with **Capacitor 8** for native iOS and Android packaging.

### 1. Sync Native Projects
Whenever web code, assets, or icons are updated:
```bash
pnpm cap:sync
```

### 2. Build & Publish iOS (App Store & TestFlight)
Open the native iOS project in Xcode:
```bash
# Arithmetic Deck
pnpm -F arithmetic-deck cap:open:ios

# Reading Deck
pnpm -F reading-deck cap:open:ios
```
- In Xcode: Select your Apple Team under **Signing & Capabilities**.
- Build / Distribute: Go to **Product > Archive > Distribute App** to upload directly to App Store Connect / TestFlight.

### 3. Build & Publish Android (Google Play Store)
Open the native Android project in Android Studio:
```bash
# Arithmetic Deck
pnpm -F arithmetic-deck cap:open:android

# Reading Deck
pnpm -F reading-deck cap:open:android
```
- In Android Studio: Select **Build > Generate Signed Bundle / APK...**
- Choose **Android App Bundle (`.aab`)** and upload the release bundle to Google Play Console.

### 4. Unified Icon & Asset Generator
The monorepo includes a visual HTML template for scalable, consistent app icons across future deck apps:
```bash
# Edit icon templates or preview in browser
open scripts/icon-generator.html
```

---

## 📚 Documentation
- [`packages/deck-core/README.md`](./packages/deck-core/README.md) — Shared core component & hook API reference.
- [`apps/arithmetic-deck/README.md`](./apps/arithmetic-deck/README.md) — Arithmetic Deck features & math generator details.
- [`apps/reading-deck/README.md`](./apps/reading-deck/README.md) — Reading Deck phonics, word audio, & tracing details.
