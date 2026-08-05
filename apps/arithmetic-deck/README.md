# Arithmetic Deck 🎴✨

A fun, responsive interactive arithmetic application built with **Next.js 15**, **React 19**, and **Tailwind CSS**. Designed for visual learning with stacked fraction displays, pie chart visualizations, 10-frame blocks, array grids, and quiz mode.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:9003](http://localhost:9003) in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## ✨ Features

- ➕ **Multiple Operations**: Addition, Subtraction, Multiplication, and Division.
- 🍕 **Fraction Visualizations**: Interactive pie charts, subdivide grid cuts, and automatic common denominator conversion badges (e.g. `1/2 - 3/6 = 0` converted to `3/6 - 3/6 = 0/6`).
- 🔢 **Whole Number Visualizations**: 10-frame fill-in/take-away blocks, multiplication grid arrays, and equal division groups.
- 📱 **Responsive Design**: Custom viewport layouts for Desktop Landscape, Tablet Landscape, Mobile Landscape, and Mobile Portrait with bounds checking to prevent UI overlaps.
- 🎯 **Quiz Mode**: Interactive practice mode with numeric keypad and score streak tracking.
- 🌓 **Themes**: Full Light Mode & Dark Mode support via `next-themes`.
- 🔊 **Audio Controls**: Text-to-speech audio reader and sound effects.

---

## 📸 Automated Visual Regression & Screenshot Testing

The project uses **Playwright** for automated screenshot diffing and visual regression testing across multiple viewports and themes.

### Run Visual Tests
```bash
npm run test:visual
```

### Update Screenshot Baselines
```bash
npm run test:visual:update
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
