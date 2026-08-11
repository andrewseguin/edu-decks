# Arithmetic Deck 🎴✨

An interactive, distraction-free arithmetic application built with **Next.js 15**, **React 19**, and **Tailwind CSS**. Designed for young learners to build number sense and mental arithmetic fluency using visual fraction pie charts, 10-frame blocks, array grids, and quiz mode.

Part of the **[`edu-decks`](../../README.md)** educational flashcard monorepo.

---

## 🚀 Quick Start (pnpm Workspace)

### 1. Run Development Server
From the workspace root or inside `apps/arithmetic-deck`:
```bash
# From workspace root
pnpm --filter arithmetic-deck dev

# Or inside apps/arithmetic-deck
pnpm dev
```
Open [http://localhost:9003](http://localhost:9003) in your browser.

### 2. Build for Production
```bash
pnpm --filter arithmetic-deck build
```

---

## ✨ Features

- 🤝 **Built for Co-Learning**: Interactive flash cards designed for practicing together — providing visual hints and step animations while empowering parents, teachers, and partners to guide math practice and celebrate progress.
- ➕ **Multiple Operations**: Addition, Subtraction, Multiplication, and Division.
- 🍕 **Fraction Visualizations**: Interactive pie charts, subdivide grid cuts, and automatic common denominator conversion badges (e.g. `1/2 - 3/6 = 0` converted to `3/6 - 3/6 = 0/6`).
- 🔢 **Whole Number Visualizations**: 10-frame fill-in/take-away blocks, multiplication grid arrays, and equal division groups.
- 🎨 **Shared Core UX (`@decks/core`)**: Implements `FlashCardShell`, `QuizOverlayShell`, `DeckControlBar`, and `SessionStats` for seamless visual convergence across `edu-decks`.
- 📱 **Responsive Design**: Custom viewport layouts for Desktop Landscape, Tablet Landscape, Mobile Landscape, and Mobile Portrait with bounds checking to prevent UI overlaps.
- 🎯 **Quiz Mode**: Interactive practice mode with numeric keypad and score streak tracking.
- 🌓 **Themes**: Full Light Mode & Dark Mode support via `next-themes`.
- 🔊 **Audio & Screen Controls**: Text-to-speech audio reader, sound effects, and Screen Wake Lock API (`navigator.wakeLock`) persistence.

---

## 📸 Automated Visual Regression & Screenshot Testing

We use **Playwright** for automated screenshot diffing and visual regression testing across 4 viewports and Light/Dark themes.

### Run Visual Tests
```bash
pnpm --filter arithmetic-deck test:visual
```

### Update Screenshot Baselines
```bash
pnpm --filter arithmetic-deck test:visual:update
```

### Test Coverage
- **Viewports**:
  - `Desktop Landscape` (1280x720)
  - `Tablet Landscape` (1024x600)
  - `Mobile Landscape` (844x390)
  - `Mobile Portrait` (390x844)
- **Scenarios Tested**:
  - Light & Dark Themes (Front & Back)
  - Card Front (Frosted `?` badge)
  - Card Back (Revealed equation & visual representation)
  - Quiz Mode Overlay (Header, equation card, keypad grid)
