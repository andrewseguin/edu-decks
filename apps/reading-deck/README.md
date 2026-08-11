# Reading Deck 🎴📖

[![Live Web App](https://img.shields.io/badge/Web-reading.edudecks.org-blue?style=for-the-badge&logo=googlechrome)](https://reading.edudecks.org)
[![Google Play](https://img.shields.io/badge/Google%20Play-Reading%20Deck-emerald?style=for-the-badge&logo=googleplay)](https://play.google.com/store/apps/details?id=org.edudecks.reading)
[![EduDecks Portal](https://img.shields.io/badge/Portal-edudecks.org-purple?style=for-the-badge)](https://edudecks.org)
[![Workspace Root](https://img.shields.io/badge/Monorepo-edu--decks-purple?style=for-the-badge)](../../README.md)

An interactive, playful flashcard application designed to help children (Ages 3–8 / Pre-K to 2nd grade) learn alphabet phonics, stroke-guided letter tracing, sight words, and reading fluency.

---

## 🔗 Quick Links & Navigation

- 📖 **Live Web Application**: [https://reading.edudecks.org](https://reading.edudecks.org)
- 🌐 **EduDecks Main Portal**: [https://edudecks.org](https://edudecks.org)
- 🔒 **Privacy Policy**: [https://reading.edudecks.org/privacy](https://reading.edudecks.org/privacy)
- 🏠 **Monorepo Root README**: [`../../README.md`](../../README.md)
- 🔢 **Arithmetic Deck App**: [`../arithmetic-deck/README.md`](../arithmetic-deck/README.md)
- 🎨 **Shared Core UI (`@decks/core`)**: [`../../packages/deck-core/README.md`](../../packages/deck-core/README.md)

---

## 🤝 Built for Co-Learning

Reading Deck is designed for children to explore together with a parent, teacher, caregiver, or study partner. While the app provides clear audio prompts, letter sounds, and stroke tracing guides, kids learn best when someone sits with them to guide their practice, answer questions, and celebrate their progress.

---

## 🌟 Key Features

- **Alphabet Phonics & Tracing**:
  - Interactive uppercase and lowercase letter cards.
  - Animated stroke guides for proper handwriting technique.
  - Natural letter sound pronunciations powered by Web Audio API.
- **1,000+ Vocabulary Sight Words**:
  - Pre-rendered natural voice MP3 audio for 1,000+ words (`public/sounds/words/`).
  - Color-coded difficulty levels (Pre-K, Kindergarten, 1st Grade, 2nd Grade).
- **Interactive Quiz Mode**:
  - Practice matching spoken audio prompts to choices in Letters or Words mode.
  - Configurable challenge options (choose 4, 6, or 8 cards per question).
  - Animated score streak counter and victory feedback.
- **Custom Family Voice Recordings**:
  - Record custom voice prompts saved locally in IndexedDB using `AudioStorage` so children can hear familiar voices.
- **Parental Controls & Lock Mode**:
  - Settings lock with 3-second auto-dismissing toast notifications to prevent accidental menu changes by young children.
- **Screen Keep-Awake**:
  - Integrated Web Standard Screen Wake Lock API (`navigator.wakeLock`) keeps phone and tablet displays awake during reading sessions.
- **100% Free & Private**:
  - Zero ads, zero tracking, no accounts required, fully offline PWA support.

---

## 💻 Tech Stack & Architecture

- **Framework**: [Next.js 15](https://nextjs.org) (App Router), [React 19](https://react.dev)
- **Shared Core**: Uses `@decks/core` (`FlashCardShell`, `QuizOverlayShell`, `DeckControlBar`, `SessionStats`, `useAudio`, `useWakeLock`)
- **Native Packaging**: [Capacitor 8](https://capacitorjs.com) for iOS and Android
- **Testing**: [Vitest](https://vitest.dev) for unit tests & [Playwright](https://playwright.dev) for 4-viewport visual regression tests

---

## 🚀 Quick Start (pnpm Workspace)

### 1. Run Local Development Server (Port `9002`)
From the workspace root or inside `apps/reading-deck`:
```bash
# From workspace root
pnpm --filter reading-deck dev

# Or inside apps/reading-deck
pnpm dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser.

### 2. Verification & Testing
```bash
# Typecheck TypeScript
pnpm --filter reading-deck typecheck

# Run Vitest unit tests
pnpm --filter reading-deck test

# Run Playwright visual regression tests
pnpm --filter reading-deck test:visual
```

### 3. Native Mobile App Sync
```bash
# Open native iOS project in Xcode
pnpm --filter reading-deck cap:open:ios

# Open native Android project in Android Studio
pnpm --filter reading-deck cap:open:android
```

---

## 🏠 Navigation
- Back to [EduDecks Monorepo Root](../../README.md)
- Explore [Arithmetic Deck (`apps/arithmetic-deck`)](../arithmetic-deck/README.md)
- Explore [EduDecks Portal (`apps/landing-page`)](../landing-page/README.md)
- Visit [reading.edudecks.org](https://reading.edudecks.org)
