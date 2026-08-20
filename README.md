# `edu-decks`

An interactive, distraction-free educational flashcard suite built for early learners and adults to explore together. Built with **Next.js 15**, **React 19**, **Tailwind CSS**, **Capacitor 8**, and **pnpm workspaces**.

**Live Apps**: [EduDecks Portal](https://edudecks.org) · [Geometry Deck](https://geometry.edudecks.org) · [Reading Deck](https://reading.edudecks.org) · [Arithmetic Deck](https://arithmetic.edudecks.org)

---

## Design Philosophy

EduDecks is designed to be 100% free, private, and distraction-free with zero ads, zero trackers, and no accounts required.

### Built for Co-Learning
EduDecks apps are interactive flash cards made for practicing together. Each deck includes visual hints and audio prompts, but kids learn best when someone sits with them to guide their practice, answer questions, and celebrate their progress.

### The EduDecks Suite
- **[Geometry Deck](https://geometry.edudecks.org)** (`apps/geometry-deck`) - Explore geometric proofs, angle rules, the Pythagorean theorem, area formulas, 3D solids, and polygon properties with interactive visual models.
- **[Reading Deck](https://reading.edudecks.org)** (`apps/reading-deck`) - Learn the alphabet, letter-sound phonics, animated stroke handwriting guides, and 1,000+ sight words with crystal-clear voice audio.
- **[Arithmetic Deck](https://arithmetic.edudecks.org)** (`apps/arithmetic-deck`) - Build mental math fluency across operations (+, −, ×, ÷), fractions, and 10-frame visual models with step-by-step strategy hints.
- **[EduDecks Portal](https://edudecks.org)** (`apps/landing-page`) - Central web portal showcasing the app suite, native screenshot previews, App Store / Google Play links, and privacy center.

---

## Quick Links & Navigation

- **Live Web Applications**:
  - [EduDecks Main Portal](https://edudecks.org)
  - [Geometry Deck Web App](https://geometry.edudecks.org)
  - [Reading Deck Web App](https://reading.edudecks.org)
  - [Arithmetic Deck Web App](https://arithmetic.edudecks.org)
- **Documentation & Publishing**:
  - [Multi-Environment & Deployment Guide](./docs/deployment-guide.md)
  - [App Store Listings & Copy](./docs/store_listings.md)
  - [Store Publishing & Release Guide](./docs/store-publishing-guide.md)
  - [iOS Packaging Guide](./docs/ios-publishing-guide.md)
- **Workspace Packages**:
  - [`apps/landing-page/README.md`](./apps/landing-page/README.md) - Portal web app details.
  - [`apps/geometry-deck/README.md`](./apps/geometry-deck/README.md) - Geometry Deck formulas & proofs.
  - [`apps/reading-deck/README.md`](./apps/reading-deck/README.md) - Reading Deck phonics, audio, & tracing details.
  - [`apps/arithmetic-deck/README.md`](./apps/arithmetic-deck/README.md) - Arithmetic Deck math generator & visualizer details.
  - [`packages/deck-core/README.md`](./packages/deck-core/README.md) - Shared `@decks/core` UI component & hook API reference.

---

## Workspace Overview

```text
edu-decks/
├── apps/
│   ├── landing-page/      # EduDecks landing portal (edudecks.org) & deck showcase
│   ├── geometry-deck/     # Geometry formulas, theorems, 3D solids, & step-by-step proofs
│   ├── arithmetic-deck/   # Mental math, operations (+, -, ×, ÷), fractions, & 10-frames
│   └── reading-deck/      # Alphabet phonics, 1,000+ sight words, letter tracing, & audio
├── packages/
│   └── deck-core/         # Shared UI shells, toolbars, quiz overlays, badges, audio & wake-lock hooks
├── docs/                  # Publishing guides & Play Store / App Store metadata
├── store-assets/          # App icons, feature graphics, & Play Store screenshots
├── pnpm-workspace.yaml    # Workspace package layout
└── turbo.json             # Turbopack task runner rules
```

---

## Quick Start for Developers

### 1. Prerequisites
- **Node.js** `>= 20.0.0`
- **pnpm** `>= 10.0.0` (`npm install -g pnpm`)

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Start Local Development Servers
Run applications concurrently:
```bash
pnpm dev
```
- **EduDecks Portal (`landing-page`)**: [http://localhost:9000](http://localhost:9000)
- **Reading Deck (`reading-deck`)**: [http://localhost:9002](http://localhost:9002)
- **Arithmetic Deck (`arithmetic-deck`)**: [http://localhost:9003](http://localhost:9003)

To run a single application:
```bash
pnpm --filter landing-page dev
pnpm --filter reading-deck dev
pnpm --filter arithmetic-deck dev
```

---

## Verification & Automated Testing

During active development, verify code changes using incremental typechecking and unit tests:

```bash
# Typecheck across all workspace packages
pnpm -r typecheck

# Run Vitest unit tests across all applications
pnpm -r test
```

### Automated Visual Regression Testing (Playwright)
We use **Playwright** for automated visual regression testing across 4 viewports (`Desktop Landscape`, `Tablet Landscape`, `Mobile Landscape`, `Mobile Portrait`) and Light/Dark themes:

```bash
# Run automated visual regression tests
pnpm -r test:visual

# Update baseline snapshots after intentional UI changes
pnpm -r test:visual:update
```

---

## Deployment Environments & Branching Strategy

EduDecks uses a multi-environment branching strategy on Vercel:

| Environment | Subdomain Pattern | Git Branch | Behavior & Environment Detection |
| :--- | :--- | :--- | :--- |
| **Dev** | `*-dev.edudecks.org` | `main` | Debug UI and verbose logging enabled (`isDevSite() === true`). |
| **Staging / Pre-Prod** | `*-staging.edudecks.org` | `main` | Production candidate, exact replica of production configuration (`isDevSite() === false`). |
| **Production** | `*.edudecks.org` | `prod` | Live production release (`isDevSite() === false`). |

### Multi-Environment Detection (`isDevSite()`)
The `@decks/core` package exports `isDevSite()`, which dynamically checks `window.location.hostname` at runtime:
- Returns `true` on `localhost`, `127.0.0.1`, or any `*-dev.edudecks.org` subdomain.
- Returns `false` on `*-staging.edudecks.org` or production domains (`*.edudecks.org`).

### Promoting to Production
1. Everyday commits & PRs merge into `main`, auto-deploying to both `*-dev` (with dev tools enabled) and `*-staging` (production candidate).
2. To push a verified release live to production (`*.edudecks.org`), merge `main` into the `prod` branch:
   ```bash
   git push origin main:prod
   ```

---


## Mobile Native Apps (iOS & Android)

Both `reading-deck` and `arithmetic-deck` are configured with **Capacitor 8** for native iOS and Android deployment.

### 1. Sync Native Projects
Whenever web code or static assets are updated:
```bash
pnpm cap:sync
```

### 2. Native iOS (Xcode & App Store)
```bash
pnpm -F reading-deck cap:open:ios
pnpm -F arithmetic-deck cap:open:ios
```

### 3. Native Android (Android Studio & Google Play Store)
```bash
pnpm -F reading-deck cap:open:android
pnpm -F arithmetic-deck cap:open:android
```

For full release instructions, credentials backup, and store submission commands, see [docs/store-publishing-guide.md](./docs/store-publishing-guide.md).

---

## License & Community

EduDecks is free & open-source software licensed under the **[MIT License](./LICENSE)**.  
For support or issue reporting, visit [GitHub Issues](https://github.com/edu-decks/edu-decks/issues) or email [support@edudecks.org](mailto:support@edudecks.org).
