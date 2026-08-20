# Reading Deck — Design & Interaction Guide

> **Pedagogical Goal**: Foster early reading fluency, phonemic awareness, and handwriting motor memory (Ages 3–8 / Pre-K to 2nd Grade) through multisensory letter-sound pairing, animated stroke guides, and custom family voice scaffolding.

---

## 💡 1. Pedagogical Principles & Learning Philosophy

Reading Deck is built on the science of reading and early childhood motor development:

1. **Multisensory Phonics (Look, Hear, Trace)**:
   - Early literacy requires synchronizing **visual symbols (graphemes)** with **spoken sounds (phonemes)** and **kinesthetic stroke paths**.
   - Every card pairs crisp typography with crystal-clear human-voiced audio and dynamic stroke guides.

2. **Animated Stroke Handwriting (Kinesthetic Motor Memory)**:
   - Animated SVG stroke guides demonstrate the standard top-to-bottom, left-to-right stroke sequence for both uppercase and lowercase letters.
   - Numbered directional arrows guide the learner's finger, reinforcing proper pencil grip direction before muscle memory habits form.

3. **Leveled Sight Word Progression**:
   - 1,000+ essential vocabulary words organized into color-coded developmental tiers (Pre-K, Kindergarten, 1st Grade, 2nd Grade).
   - Instant audio playback helps bridge the gap between word recognition and verbal articulation.

4. **Co-Learning with Family Voice Scaffolding**:
   - Children learn speech and reading fastest from familiar voices. Parents and caregivers can record custom audio pronunciations directly into the app (persisted locally in IndexedDB), creating an intimate, personalized study loop.

---

## 🏛️ 2. Card Layout & Visual Hierarchy

Reading Deck cards follow the standardized 4-tier visual hierarchy on reveal:

```
┌─────────────────────────────────────────────────────────────┐
│                       Letter / Word                         │
├─────────────────────────────────────────────────────────────┤
│         M m  ·  /m/  (Primary Symbol)                       │  <-- Tier 1: Full-Bleed Frosted Definition Banner
│     "M makes the /m/ sound, like Monkey"                    │      (border-y border-white/20 bg-black/35)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ┌───────────────────────────┐                │
│                │   Interactive Canvas /    │                │  <-- Tier 2: Stroke Tracing Canvas / Large Letter
│                │   Animated Stroke Guide   │                │      (SVG stroke paths with directional cues)
│                └───────────────────────────┘                │
│                                                             │
│             [ Uppercase ] [ Lowercase ]  (↺ Trace)          │  <-- Tier 3: Frosted White Navigation Pills
│                                                             │      (Neutral translucent glassmorphism)
│         ( 🔊 "m"  ·  /m/  ·  "monkey" )                     │  <-- Tier 4: Bottom Audio / Phonics Banner
└─────────────────────────────────────────────────────────────┘      (Unboxed audio trigger & pronunciation)
```

### 2.1 Tier 1: Top Full-Bleed Frosted Definition Banner (Hero)
- **Container**: `w-full px-4 py-2.5 my-1 bg-black/35 border-y border-white/20 flex flex-col items-center justify-center gap-1`
- **Letters Mode**: Displays the uppercase/lowercase pair alongside phonetic notation (e.g. `B b  ·  /b/`). Subtitle provides context: *"B makes the /b/ sound, like Butterfly"*.
- **Words Mode**: Displays the target sight word in high-contrast typography with a natural example phrase or sentence.

### 2.2 Tier 2: Interactive Tracing Canvas & Visual Engine
- **Stroke Path Animation**: SVG `<path>` elements animated with `stroke-dashoffset` demonstrating stroke order.
- **Directional Hints**: Numbered circular badges at stroke starting points with subtle guiding arrows.
- **Dynamic Container Width**: Canvas scales cleanly from small phone screens to large tablets using `useContainerWidth`.

### 2.3 Tier 3: Frosted White Interactive Controls (Tier 3)
- **Neutral Glassmorphism**: Buttons and mode toggles strictly use frosted white styling (`bg-white/10` to `bg-white/25`, `border-white/25`, `text-white`).
- **Standard Controls**:
  - **Case Switcher**: `[ Uppercase ]` | `[ Lowercase ]`
  - **Replay Animation**: `↺ Trace` pill to replay the stroke sequence.
  - **Custom Voice Record**: `🎙️ Record` button opening the local voice recording modal.

### 2.4 Tier 4: Bottom Phonics & Audio Banner (Tier 4)
- **Container**: `px-5 py-2 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center gap-3 text-lg font-bold select-none`
- **Interaction**: Tapping anywhere on the banner plays the audio pronunciation with a gentle waveform pulse animation.

---

## 🎨 3. Semantic Color Palette & Grade Tiers

To keep visual cognitive load low while providing clear developmental signals, Reading Deck uses distinct color accents for grade tiers:

| Tier / Mode | Semantic Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Alphabet / Letters** | Warm Amber | `#f59e0b` | Letter recognition, phonemes, stroke tracing |
| **Pre-K Sight Words** | Coral Pink | `#f43f5e` | First words (a, the, in, to, and) |
| **Kindergarten Words** | Emerald Green | `#10b981` | Core kindergarten vocabulary |
| **1st Grade Words** | Electric Sky | `#0ea5e9` | Early grade 1 reading vocabulary |
| **2nd Grade Words** | Neon Lilac | `#8b5cf6` | Advanced grade 2 sight words |
| **Stroke Direction Arrows**| Bright Cyan | `#5ee8ff` | High-visibility handwriting guide points |
| **Custom Voice Indicator** | Vibrant Rose | `#fb7185` | Indicates active family voice recording |

---

## 🕹️ 4. Quiz Mode: Auditory Matching

Reading Deck's Quiz Mode focuses on auditory-to-visual symbol matching:

```
┌─────────────────────────────────────────────────────────────┐
│                 Quiz Mode  ·  Streak: 🔥 5                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     ( 🔊 Tap to Listen )                    │
│                        "Find the word: 'play'"              │
│                                                             │
│       ┌──────────────┐                 ┌──────────────┐     │
│       │     said     │                 │     play     │     │
│       └──────────────┘                 └──────────────┘     │
│       ┌──────────────┐                 ┌──────────────┐     │
│       │     make     │                 │     jump     │     │
│       └──────────────┘                 └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **Configurable Grid Size**:
   - Parents/educators can choose 4, 6, or 8 choices per question in Settings.
2. **Instant Auditory Feedback**:
   - Correct selection plays an affirmative chime + green border pulse and advances to the next question.
   - Incorrect selection plays a gentle wobble sound without penalizing the child aggressively.
3. **Session Mastery**:
   - Tracks session streak count with celebratory particle bursts upon reaching 5, 10, and 20 consecutive matches.

---

## 🎙️ 5. Family Voice Recording Architecture

- **Local-Only Privacy**: Audio recordings are recorded via `MediaRecorder` API and stored exclusively on the device in IndexedDB via `AudioStorage`.
- **Zero Cloud Upload**: Voice data never leaves the user's browser/device, strictly adhering to our privacy-first promise.
- **Playback Priority**: When a custom recording exists for a letter or word, the app automatically prioritizes the family recording over the default system audio.

---

## ✅ 6. Reading Deck Verification Checklist

- [ ] Letters display uppercase and lowercase variants with clear phonics subtitles.
- [ ] Stroke tracing animation clearly illustrates stroke order and direction.
- [ ] Frosted controls strictly use neutral white styling (`bg-white/10` to `bg-white/25`).
- [ ] Audio plays reliably across web browsers, iOS WebKit, and Android WebView without delay.
- [ ] Quiz mode supports 4, 6, and 8 card layouts with responsive wrapping.
- [ ] Screen Wake Lock stays active during co-learning sessions.
