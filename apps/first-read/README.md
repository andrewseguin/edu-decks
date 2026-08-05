# First Read

Welcome to **First Read**! First Read is an interactive, playful web application designed to help young children learn their letters, practice phonics, and begin their reading journey.

Check out the live application on GitHub Pages: [https://andrewseguin.github.io/first-read/](https://andrewseguin.github.io/first-read/)

---

## 🌟 Features

- **Interactive Phonics & Word Cards**: Large, vibrant cards with letter tracing, color-coded levels, and instant voice playback.
- **Pre-rendered High-Quality Audio**: Built-in, pre-rendered natural MP3 audio files for 1,000+ vocabulary words in `public/sounds/words/` alongside Web Audio API letter sound buffers.
- **Interactive Quiz Mode**:
  - Practice matching spoken audio prompts to choices in Letters or Words mode.
  - **Configurable Challenge**: Choose between **4 Cards**, **6 Cards**, or **8 Cards** as choice options.
  - Animated score and streak tracking.
- **Screen Keep-Awake**: Integrated Web Standard Screen Wake Lock API (`navigator.wakeLock`) keeps tablet and phone screens awake during reading sessions.
- **Custom Parent Voice Recordings**: Record custom voice prompts saved locally in IndexedDB using `AudioStorage`.
- **Parental Controls & Lock Mode**: Quick settings lock with 3-second auto-dismissing startup notifications to prevent accidental setting changes by young children.
- **Offline PWA Support**: Progressive Web App support with service worker caching for offline use on iPads, tablets, and phones.

---

## 🛠️ Implementation Details

This project is built using modern web development practices and technologies:

- **Framework**: [Next.js](https://nextjs.org/) (v15) with Turbopack for fast, React-based development.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust, type-safe code.
- **UI & Styling**: Built with [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), and [Lucide Icons](https://lucide.dev/).
- **Audio System**: Web Audio API preloading for phonics, native HTMLAudio for 1,000+ word MP3s, and `SpeechSynthesis` fallback.
- **State & Storage**: React Hooks, `use-local-storage` for settings persistence, and IndexedDB for parent voice recordings.

### Key Parts of the Codebase

- `src/app/page.tsx`: Main entry point managing application state, navigation, settings, screen wake lock, and mode toggles.
- `src/components/quiz-display.tsx`: Interactive Quiz Mode component supporting 4, 6, and 8-card responsive layouts, target audio prompt playback, and scoring logic.
- `src/components/letter-display.tsx`: Core interactive card display supporting direct MP3 word playback, letter tracing canvas, and custom audio recordings.
- `src/components/app-settings.tsx`: Parent configuration modal for quiz card counts, theme, counters, auto-play, screen wake lock, and app lock.
- `src/hooks/use-wake-lock.ts`: Custom hook for Web Standard Screen Wake Lock API integration.
- `src/lib/letters.ts` & `src/lib/words.ts`: Phonics levels, letter info, and vocabulary lists (easy vs. hard words).
- `public/sounds/words/`: Pre-rendered high-clarity MP3 audio files for 1,000+ vocabulary words.

---

## 🚀 Getting Started Locally

If you'd like to run First Read locally or contribute to the project:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/andrewseguin/first-read.git
   cd first-read
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   *The Next.js development server starts on port `9002` (see `package.json`).*

4. Open [http://localhost:9002](http://localhost:9002) in your browser to start reading!
