# Reading Deck 🎴📖

An interactive, playful web application designed to help children learn alphabet phonics, sight words, and reading fluency.

Part of the **[`edu-decks`](../../README.md)** educational flashcard monorepo.

---

## 🚀 Quick Start (pnpm Workspace)

### 1. Run Development Server
From the workspace root or inside `apps/reading-deck`:
```bash
# From workspace root
pnpm --filter reading-deck dev

# Or inside apps/reading-deck
pnpm dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser.

### 2. Build for Production
```bash
pnpm --filter reading-deck build
```

---

## 🌟 Features

- **Interactive Phonics & Word Cards**: Large, vibrant cards with letter tracing, color-coded difficulty levels, and instant speech playback.
- **Pre-rendered High-Quality Audio**: Built-in natural MP3 audio files for 1,000+ vocabulary words in `public/sounds/words/` alongside Web Audio API letter sound buffers.
- **Interactive Quiz Mode**:
  - Practice matching spoken audio prompts to choices in Letters or Words mode.
  - **Configurable Challenge**: Choose between **4 Cards**, **6 Cards**, or **8 Cards** as choice options.
  - Animated score and streak tracking.
- **Shared Core UX (`@decks/core`)**: Uses `FlashCardShell`, `QuizOverlayShell`, `DeckControlBar`, and `SessionStats` for seamless visual convergence across `edu-decks`.
- **Screen Keep-Awake**: Integrated Web Standard Screen Wake Lock API (`navigator.wakeLock`) keeps tablet and phone screens awake during reading sessions.
- **Custom Parent Voice Recordings**: Record custom voice prompts saved locally in IndexedDB using `AudioStorage`.
- **Parental Controls & Lock Mode**: Quick settings lock with 3-second auto-dismissing startup notifications to prevent accidental setting changes by young children.
- **Offline PWA Support**: Progressive Web App support with service worker caching for offline use on iPads, tablets, and phones.

---

## 📸 Automated Visual Regression & Screenshot Testing

We use **Playwright** for automated screenshot diffing and visual regression testing across 4 viewports and Light/Dark themes.

### Run Visual Tests
```bash
pnpm --filter reading-deck test:visual
```

### Update Screenshot Baselines
```bash
pnpm --filter reading-deck test:visual:update
```

### Test Coverage
- **Viewports**:
  - `Desktop Landscape` (1280x720)
  - `Tablet Landscape` (1024x600)
  - `Mobile Landscape` (844x390)
  - `Mobile Portrait` (390x844)
- **Scenarios Tested**:
  - Light & Dark Themes
  - Card Front & Card Navigation
  - Quiz Mode Overlay
