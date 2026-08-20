# Arithmetic Deck — Design & Interaction Guide

> **Pedagogical Goal**: Build intuitive number sense, mental math agility, and fractional reasoning (Ages 4–10 / Pre-K to 4th Grade) through concrete 10-frame models, dynamic multiplication arrays, and common denominator fraction visualizations.

---

## 💡 1. Pedagogical Principles & Number Sense Philosophy

Arithmetic Deck replaces mechanical rote memorization with visual strategy models:

1. **Concrete Number Sense Before Abstract Algorithms**:
   - Young minds understand quantities before symbols. Visualizing numbers on a **10-frame** or within a **multiplication grid array** anchors the physical reality of addition, subtraction, and multiplication.

2. **Step-by-Step Strategy Decomposition**:
   - Rather than jumping straight from `8 + 7` to `15`, the visual model shows the mental decomposition strategy:
     - Make 10: `8 + 2 = 10`, leaving `5`, totaling `15`.
   - Stepper capsules let the learner and mentor walk through the transformation step-by-step.

3. **Dynamic Fractional Equivalence**:
   - Fractions are fundamentally tricky when taught purely as abstract symbols.
   - Arithmetic Deck visualizes fraction operations with synchronized circle/pie slices and dynamic common denominator conversion badges (e.g. showing `1/2 - 3/6` visually converting into `3/6 - 3/6 = 0/6`).

4. **Frictionless Active Recall (Interactive Keypad Quiz)**:
   - Mental math fluency requires low-friction repetition. The integrated quiz mode provides an on-screen responsive numeric keypad optimized for rapid tablet/phone entry with instant auditory validation.

---

## 🏛️ 2. Card Layout & Visual Hierarchy

Arithmetic Deck cards follow the standardized 4-tier visual hierarchy on reveal:

```
┌─────────────────────────────────────────────────────────────┐
│                    Operation / Category                     │
├─────────────────────────────────────────────────────────────┤
│         8 + 7 = 15  (Primary Equation)                      │  <-- Tier 1: Full-Bleed Frosted Problem Banner
│     "Decompose 7 into 2 and 5 to make a 10"                 │      (border-y border-white/20 bg-black/35)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ┌───────────────────────────┐                │
│                │   10-Frame / Array /      │                │  <-- Tier 2: Interactive Strategy Visualizer
│                │   Fraction Circle Canvas  │                │      (Dynamic sizing via useContainerWidth)
│                └───────────────────────────┘                │
│                                                             │
│             [ 1. Problem ] [ 2. Strategy ] [ 3. Solved ]    │  <-- Tier 3: Frosted White Stepper Capsule
│                                                             │      (Neutral translucent glassmorphism)
│         (  8 + 2 + 5 = 10 + 5 = 15  )                       │  <-- Tier 4: Bottom Strategy Equation Banner
└─────────────────────────────────────────────────────────────┘      (Unboxed typographic flow)
```

### 2.1 Tier 1: Top Full-Bleed Frosted Definition Banner (Hero)
- **Container**: `w-full px-4 py-2.5 my-1 bg-black/35 border-y border-white/20 flex flex-col items-center justify-center gap-1`
- **Primary Line**: High-contrast equation in bold display typography (e.g. `8 + 7 = 15` or `¾ + ½ = 1 ¼`).
- **Secondary Subtitle**: Clear mental math strategy hint (e.g. *"Make a ten: 8 + 2 = 10, then add 5"*).

### 2.2 Tier 2: Interactive Strategy Visualizer Canvas
- **10-Frame Models (Addition / Subtraction)**: Two side-by-side 10-frames showing filled counters, bridge-to-ten animations, and crossed-out subtraction tokens.
- **Grid Arrays (Multiplication / Division)**: $M \times N$ discrete colored tile matrices demonstrating area and equal-grouping factors.
- **Fraction Pie & Bar Visualizers**: Interactive circular sectors and subdivide grid cuts demonstrating common denominators with stacked vertical fraction typography.

### 2.3 Tier 3: Frosted White Interactive Controls (Tier 3)
- **Neutral Glassmorphism**: Step controls and replay buttons strictly use frosted white styling (`bg-white/10` to `bg-white/25`, `border-white/25`, `text-white`).
- **Standard Controls**:
  - **Step Pills**: `[ 1. Problem ]` → `[ 2. Strategy ]` → `[ 3. Solved ]`
  - **Replay**: `↺ Replay` button to restart the step animation sequence.

### 2.4 Tier 4: Bottom Strategy Equation Banner (Tier 4)
- **Container**: `px-5 py-2 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 text-lg font-bold font-headline select-none`
- **Unboxed Typographic Flow**: Displays the intermediate breakdown steps (e.g. `8 + (2 + 5) = 10 + 5 = 15`) with clean, color-coordinated terms.

---

## 🎨 3. Semantic Color Palette & Operations

Arithmetic Deck uses distinct color accents to differentiate operations and visual tokens:

| Operation / Concept | Semantic Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Addition (+)** | Emerald Green | `#10b981` | Combining quantities, additive 10-frame counters |
| **Subtraction (−)** | Coral Rose | `#f43f5e` | Deductive takeaway, crossed-out counters |
| **Multiplication (×)**| Warm Amber | `#f59e0b` | Array dimensions, scaling factors |
| **Division (÷)** | Electric Cyan | `#06b6d4` | Equal partition groupings |
| **Fractions (½, ¾)** | Royal Indigo | `#6366f1` | Circular sectors, common denominator badges |
| **First Operand / Term 1**| Cyan Accent | `#5ee8ff` | First number in operations and visual components |
| **Second Operand / Term 2**| Gold Accent | `#ffd45e` | Second number in operations and visual components |
| **Calculated Answer** | Bold White | `#ffffff` | Final calculated sum, difference, product, quotient |

---

## 🔢 4. Quiz Mode: On-Screen Numeric Keypad

Arithmetic Deck provides an on-screen numeric keypad designed for rapid, distraction-free calculation:

```
┌─────────────────────────────────────────────────────────────┐
│                 Quiz Mode  ·  Streak: 🔥 8                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                          7 × 6 = [ ? ]                      │
│                                                             │
│                   ┌─────┬─────┬─────┐                       │
│                   │  1  │  2  │  3  │                       │
│                   ├─────┼─────┼─────┤                       │
│                   │  4  │  5  │  6  │                       │
│                   ├─────┼─────┼─────┤                       │
│                   │  7  │  8  │  9  │                       │
│                   ├─────┼─────┼─────┤                       │
│                   │  ⌫  │  0  │  ↵  │                       │
│                   └─────┴─────┴─────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **Custom Keypad UX**:
   - Ergonomic 3×4 touch grid with large tap targets, tactile click audio feedback, and backspace/submit controls.
   - Physical keyboard numerical input support (Number keys, Numpad, Backspace, Enter).
2. **Custom Number Ranges & Presets**:
   - Learners and teachers can configure specific number ceilings (`0–5`, `0–10`, `0–20`, `0–50`, `0–100`) and fraction subsets.
3. **Instant Validation**:
   - Correct input immediately triggers an affirmative chime, streak increments, and automatically advances after a brief celebration pause.

---

## 📐 5. Fraction Typography Standards

1. **Textbook Stacked Fractions**:
   - Fractions must never be displayed as slanted raw characters (`1/2` or `3/4`) in primary equation banners.
   - Always use `StackedFraction` with explicit numerator, horizontal fraction bar, and denominator.
2. **Common Denominator Conversions**:
   - When fractions with unlike denominators are added or subtracted, the step visualizer displays a conversion chip showing the common denominator multiplier (e.g. $\frac{1}{2} \times \frac{3}{3} = \frac{3}{6}$).

---

## ✅ 6. Arithmetic Deck Verification Checklist

- [ ] Top problem banner is enclosed in the full-bleed frosted banner (`bg-black/35 border-y border-white/20`).
- [ ] Visualizer uses 10-frames for addition/subtraction and grid arrays for multiplication.
- [ ] Fractions use stacked vertical fraction typography.
- [ ] Stepper controls strictly use neutral white styling (`bg-white/10` to `bg-white/25`).
- [ ] Numeric keypad responds to both touch and physical keyboard events.
- [ ] Unit tests pass via `pnpm --filter arithmetic-deck test`.
