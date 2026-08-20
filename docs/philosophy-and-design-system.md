# EduDecks — Core Philosophy, Pedagogy & Design System

> **The EduDecks Thesis**: Flashcards shouldn't just test rote memorization—they should illuminate mental models, make abstract relationships tangible through direct manipulation, and facilitate active co-learning.

---

## 🎯 1. Objective & Educational Mission

### 1.1 Co-Learning by Design
EduDecks applications are built for **two people sitting side-by-side** (a parent and child, an educator and student, or peer study partners) as well as independent exploration. 

While each app provides audio prompts, stroke guides, and dynamic visual proofs, learners progress fastest when guided by a mentor who talks through strategies, asks probing questions (*"Why did the area stay the same when we slanted the parallelogram?"*), and celebrates breakthroughs.

### 1.2 The Distraction-Free Promise
Every EduDecks app is committed to an uncompromised learning environment:
- **100% Free & Open Source**: No paywalls, no subscriptions, no in-app purchases.
- **Zero Ads & Zero Trackers**: No third-party tracking scripts, analytics beacons, or behavioral profiling.
- **No Account Walls**: Works instantly upon opening; no registration or login required.
- **Offline & Cross-Platform**: Fully functional offline as Progressive Web Apps (PWA) and native iOS/Android applications.
- **Respect for Attention**: No predatory gamification loops, artificial cooldown timers, or notification guilt.

### 1.3 The Continuum of Learning
The EduDecks suite spans early developmental foundations through advanced geometric reasoning:

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│      READING DECK       │ ──> │     ARITHMETIC DECK     │ ──> │      GEOMETRY DECK      │
│       (Ages 3–8)        │     │       (Ages 4–10)       │     │      (Ages 9–18+)       │
│  Phonics, stroke paths, │     │ Number sense, 10-frame  │     │ Visual proofs, dynamic  │
│  sight words, audio     │     │ models, mental math     │     │ invariants, 3D solids   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 🧠 2. Core Pedagogical Methods

EduDecks replaces passive flashcard flipping with the **Concrete-Representational-Abstract (C-R-A)** progression across all subjects:

```
┌───────────────────────────────┐
│ 1. CONCRETE (Direct Touch)    │  Motor stroke tracing, physical draggable vertices, 10-frame counters
├───────────────────────────────┤
│ 2. REPRESENTATIONAL (Visual)  │  Area unit grids, fraction circles, dissection animations, angle arcs
├───────────────────────────────┤
│ 3. ABSTRACT (Symbolic)        │  Algebraic formulas, arithmetic equations, sight word spelling, phonemes
└───────────────────────────────┘
```

### 2.1 The "Reveal & Explore" Paradigm (Dual-State Cards)
Every card in EduDecks has two complementary states:
1. **The Front (Prompt State)**: High signal-to-noise prompt presenting a single problem or concept (e.g. `Solve for area`, `7 × 8 = ?`, letter `m`, or a spoken sight word prompt).
2. **The Back (Reveal & Explore State)**: Not simply a static answer, but an interactive visual engine explaining the underlying "why".

### 2.2 Direct Manipulation & Invariant Discovery
- **Discovery through Touch**: Learners build enduring mental models by touching and transforming shapes and numbers. Dragging handles reveals mathematical invariants (e.g. angle sums remaining locked at 180°, or base-times-height area remaining constant under shearing).
- **Ambient Interactivity**: Single-step explorer cards gently animate on initial reveal to signal interactivity, then permanently cancel the animation and yield 100% control the instant the user touches any handle.
- **Clean Precision (Zero Decimal Noise)**: Smooth 2D touch drag mechanics paired with clean integer rounding so learners focus on core concepts rather than floating-point decimals.

### 2.3 Dual Modes: Explorer vs. Quiz
Every app provides two distinct interaction modes:
- **Explorer Mode (Practice)**: Unhurried, self-paced, deep visual exploration with step controls, hints, and adjustable presets.
- **Quiz / Challenge Mode**: Active recall testing using customized input methods (e.g. on-screen numeric keypads, multi-choice audio cards, or theorem challenges) with streak counters and instant visual/auditory feedback.

---

## 🏛️ 3. Modular Card Anatomy & Visual Hierarchy (Guideline)

EduDecks cards draw from a standardized **4-tier modular hierarchy**. This serves as an overarching design guideline rather than a rigid requirement—cards adapt, combine, or omit tiers depending on the subject matter (e.g., Mathematics vs. Science vs. Language Arts) and the specific learning goal of the card.

```
┌─────────────────────────────────────────────────────────────┐
│                    Card Header / Category                   │
├─────────────────────────────────────────────────────────────┤
│         A = ½ · b · h  (Primary Headline / Concept)         │  <-- Tier 1: Full-Bleed Frosted Hero Banner
│     Area = ½ · base · height  (English Subtitle / Rule)     │      (border-y border-white/20 bg-black/35)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ┌───────────────────────────┐                │
│                │   Interactive Canvas /    │                │  <-- Tier 2: Visual Engine / Interactive Model
│                │      Visual Engine        │                │      (Dynamic sizing via useContainerWidth)
│                └───────────────────────────┘                │
│                                                             │
│             [ 1. Shape ] [ 2. Proof ]  (↺)                  │  <-- Tier 3: Optional Controls / Steppers / Presets
│                                                             │      (Neutral translucent glassmorphism)
│         (  A = ½ · 10 · 7 = 35  )                           │  <-- Tier 4: Optional Live Equation / Takeaway Banner
└─────────────────────────────────────────────────────────────┘      (Unboxed typographic flow or state readout)
```

### 3.1 Tier-by-Tier Modularity

| Tier | Component | When to Include | When to Omit / Adapt |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Full-Bleed Hero Banner** | Most cards with a core rule, formula, letter, or definition. | Single-focus prompt cards or minimalist sight-word flashcards. |
| **Tier 2** | **Visual Model / Canvas** | Always (the visual heart of every card). | Scales dynamically via `useContainerWidth`. |
| **Tier 3** | **Control Pills / Steppers** | Multi-step proofs, scenario switchers, or case toggles. | **Omit** on direct-drag single-step models or ambient explorers. |
| **Tier 4** | **Equation / Takeaway Banner** | Live calculated equations ($A = b \cdot h$) or algebraic results. | **Omit** on pure definition cards (e.g. Parallelogram properties) or **Adapt** for non-math decks (e.g. Science observation readouts, audio triggers in Reading, key takeaway chips). |

### 3.2 Tier 1: Full-Bleed Frosted Definition Banner (Hero)
- **Container**: Full width edge-to-edge frosted container (`w-full bg-black/35 border-y border-white/20 px-4 py-2.5 my-1 flex flex-col items-center justify-center gap-1`).
- **Primary Line**: Bold, prominent formula, rule, or core term.
- **Secondary Subtitle**: Clear, plain-English translation, context sentence, or definition.

### 3.3 Tier 2: Interactive Canvas / Visual Model
- Responsive SVG canvas auto-scaled to card container width using `useContainerWidth`.
- Draggable touch handles with direct 1:1 cursor tracking.
- Subtle unit grids (`rgba(255, 255, 255, 0.12)`) on area cards to concretely ground unit measurements.

### 3.4 Tier 3: Frosted White Interactive Controls & Navigation Pills (Optional)
- **Neutral Glassmorphism**: When controls are present, interactive buttons, step capsules, and preset pills strictly use **neutral translucent white styling** (`bg-white/10` to `bg-white/25`, `border-white/25`, `text-white`).
- **Color Preservation**: Never apply card subject colors (green, indigo, orange) to UI buttons; this guarantees that vibrant semantic colors remain reserved exclusively for variables, dimensions, and subject content.
- **Step Navigation Capsule**:
  ```tsx
  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/25 shadow-sm select-none">
    <button className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">1. Shape</button>
    <button className="px-3 py-0.5 rounded-full text-xs font-bold text-white/70 hover:text-white">2. Proof</button>
  </div>
  ```

### 3.5 Tier 4: Bottom Live Banner / Key Takeaway (Optional)
- **Container**: Rounded frosted capsule (`px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 text-lg font-bold font-headline select-none`).
- **Unboxed Typographic Flow**: Displays live equations without nested sub-boxes.
- **Adaptable Across Domains**:
  - *Math / Geometry*: Live equations ($a^2 + b^2 = c^2$, $A = b \cdot h$).
  - *Reading / Phonics*: Audio pronunciation and phonetic breakdown (`🔊 /m/ · "monkey"`).
  - *Science / Discovery (Future Decks)*: Live state readouts (e.g. `Volume: 250 mL`, `State: Liquid`, `Frequency: 440 Hz`), observation chips, or key takeaway summaries.

---

## 🎨 4. Design System & Semantic Color Tokens

### 4.1 Global Design Tokens
- **Surface Elevation**: Dark glassmorphism with frosted backdrops (`bg-black/35` to `bg-black/50`, `border-white/20`).
- **Card Radius**: `rounded-3xl` for outer cards, `rounded-2xl` for equation banners, `rounded-full` for control pills.
- **Typography**: Textbook-quality mathematical and humanist typography.
  - **Headlines**: Prominent sans-serif with tabular figures.
  - **Fractions**: Stacked vertical fractions with horizontal fraction bars (`StackedFraction`).
  - **Notation**: Standard unicode math symbols (`·`, `×`, `²`, `√`, `°`, `⟂`, `½`).

### 4.2 Semantic Mathematical Color Tokens
Every dimension or variable within a card is allocated a unique, dedicated color token:

| Concept / Role | Color Token | Hex Code | Typical Usage |
| :--- | :--- | :--- | :--- |
| **Altitude / Height / Side a / Angle A** | Electric Cyan | `#5ee8ff` | Vertical height ($h$), width ($w$), primary angle ($A$), side $a$ |
| **Base / Length / Side b / Angle B** | Warm Gold | `#ffd45e` | Horizontal baseline ($b$), length ($l$), apex angle, side $b$ |
| **Hypotenuse / Side c / Angle C / Outer** | Neon Lilac | `#d8b4fe` | Hypotenuse ($c$), third angle ($C$), circumference ($C$), top base ($a$) |
| **Angle 3 / Modifiers / Helpers** | Mint Green | `#4ade80` | Third angle in multi-angle systems, helper construction lines |
| **Totals / Answers / Final Results** | Crisp Bold White | `#ffffff` | Total Area ($A$), Perimeter ($P$), Volume ($V$), sum values |
| **Grid Lines & Bounding Boxes** | Translucent White | `rgba(255,255,255,0.12)` | $1 \times 1$ unit square grids, enclosing bounding boxes |
| **Shape Fills** | Luminous White | `rgba(255,255,255,0.14)` | Interior polygon/solid surface fills |

---

## ⚙️ 5. Shared Technical Infrastructure (`@decks/core`)

All EduDecks applications are powered by the shared `@decks/core` package:

### 5.1 Shared UI Primitives
- **`DeckAppShell`**: Universal responsive app layout with header navigation, settings drawer, and theme toggling.
- **`FlashCardShell`**: Card flip container with 3D perspective animations, gesture listeners, and keyboard bindings.
- **`DeckControlBar`**: Universal bottom action bar supporting flip, previous/next card navigation, mode switches, and shuffle.
- **`QuizOverlayShell`**: Standardized quiz interface supporting streak counters, question prompts, and celebratory animations.
- **`SessionStats`**: Non-intrusive progress and mastery summaries.
- **`AppSettingsModal`**: Universal settings modal with child-lock protection and customizable study preferences.

### 5.2 Shared Hooks & Utilities
- **`useDeckController`**: State engine for card progression, flip states, card shuffling, and history tracking.
- **`useDeckGestures`**: Touch swipe gestures and keyboard shortcut listeners (Space, Arrow keys, Keypad).
- **`useWakeLock`**: Keeps mobile/tablet screens awake during active co-learning sessions using the Screen Wake Lock API.
- **`useAudio`**: Synthesizer and sound effect manager for instant auditory reinforcement.
- **`useLocalStorage`**: Persistent, offline storage for learner settings, custom decks, and stats.

---

## 📚 6. Subject-Specific Specifications

For domain-specific pedagogical rules, component blueprints, and interaction patterns, refer to the individual design guides:

1. 📖 **[Reading Deck Design Guide](../apps/reading-deck/DESIGN_GUIDE.md)**
   - Phonics audio scaffolding, stroke handwriting animation, sight word tiers, and family voice recording.
2. 🔢 **[Arithmetic Deck Design Guide](../apps/arithmetic-deck/DESIGN_GUIDE.md)**
   - 10-frame visual models, fraction pie/grid conversions, multiplication arrays, and numeric keypad quiz flow.
3. 📐 **[Geometry Deck Design Guide](../apps/geometry-deck/DESIGN_GUIDE.md)**
   - Dynamic 2D/3D proof explorers, unit grid area grounding, angle pair invariants, and two-column calculation proofs.
