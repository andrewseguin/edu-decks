# Geometry Deck — Design & Interaction Guide

> [!NOTE]
> **Living Document**: This design specification is actively evolving as we progress card-by-card through the deck. The core layout hierarchy (frosted hero banner, open live equations, white-bordered answers, zero auto-play) is universal, while semantic color palettes, diagram layouts, and interactive paradigms will expand to accommodate new topics (e.g. Quadrilaterals, Circles, Polygons, and 3D Shapes) as each topic is reviewed. Always update this document when introducing or refining new visual patterns.

---

## 💡 1. Pedagogical Principles & Interaction Philosophy

The geometry deck is built on the principle that **true mathematical understanding comes from direct manipulation, visual proofs, and minimal cognitive load**:

1. **Interactive by Default (Direct Manipulation)**:
   - Wherever mathematically meaningful, cards must be interactive rather than static drawings.
   - Learners build lasting geometric intuition by *touching and transforming* shapes:
     - Dragging vertices to observe invariants (e.g. watching triangle area change with height while base is fixed, or angles dynamically balancing to maintain $180^\circ$).
     - Moving sliders to test edge cases (e.g. near-flat obtuse triangles vs. tall acute triangles).
     - Triggering physical proofs (e.g. folding corner angles to form a straight $180^\circ$ line).

2. **State-of-the-Art Pedagogy ("Show the 'Why', Not Just the 'What'")**:
   - Every visualization should illuminate the underlying mathematical proof or conceptual intuition:
     - **Triangle Area ($A = ½bh$)**: Visualized with a neutral $b \times h$ unit grid bounding box, showing that the altitude divides the box into two sub-rectangles that are each cut in half.
     - **Angle Sum ($180^\circ$)**: Visualized through congruent corner folding along mid-segments to form a straight $180^\circ$ line.
     - **Pythagorean Theorem ($a² + b² = c²$)**: Visualized with actual geometric squares built on each side and animated rearrangement proofs.
     - **Circle Area ($A = \pi r²$)**: Unrolling circular sectors into an equivalent parallelogram of base $\pi r$ and height $r$.

3. **Simplicity Over Clutter (Low Cognitive Load)**:
   - **Zero Auto-Play Loops**: Cards must remain completely stationary until the user decides to interact. Auto-playing loops distract the user and remove agency.
   - **No Decimal Noise**: Dragging is continuous and smooth in 2D, while displayed numbers ($b, h, A, \text{degrees}$) are cleanly rounded to whole integers so learners focus on conceptual relationships rather than floating-point decimals.
   - **Minimalist Controls**: Use subtle, translucent controls (frosted pills, clear slider tracks) that keep the focus entirely on the geometric figure.

4. **Instant Algebraic-Visual Feedback**:
   - The live equation at the bottom updates instantaneously as the user drags handles, cementing the direct 1:1 mapping between visual shapes and algebraic formulas.

---

## 🏛️ 2. Card Layout & Visual Hierarchy

Every geometry card follows a standardized 4-tier visual hierarchy on reveal:

```
┌─────────────────────────────────────────────────────────────┐
│                      Card Title                             │
├─────────────────────────────────────────────────────────────┤
│         A = ½ · b · h  (Primary Headline)                   │  <-- Tier 1: Full-Bleed Frosted Definition
│     Area = ½ · base · height  (English Subtitle)            │      (Edge-to-edge border-y banner)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ┌───────────────────────────┐                │
│                │   Interactive Geometry    │                │  <-- Tier 2: Interactive SVG Diagram
│                │          Diagram          │                │      (Unit grids, handles, angle arcs)
│                └───────────────────────────┘                │
│                                                             │
│         (  A = ½ · 10 · 7 = 35  )                           │  <-- Tier 3: Bottom Frosted Equation Banner
│                                                             │
│             ( Preset 1 )  ( Preset 2 )                      │  <-- Tier 4: Frosted Controls / Sliders
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Top Full-Bleed Frosted Definition Banner (Hero)
- **Container**: `w-[calc(100%+2rem)] -mx-4 sm:w-[calc(100%+3rem)] sm:-mx-6 px-4 py-2.5 my-1 bg-black/25 backdrop-blur-md border-y border-white/20 shadow-md flex flex-col items-center justify-center gap-1`
- **Full Bleed Design**: Spans horizontally from edge to edge of the card container, anchored with top and bottom borders (`border-y border-white/20`).
- **Primary Line**: Bold, prominent formula (e.g. `A = ½ · b · h`, `a² + b² = c²`, `2 equal sides, 2 equal base angles`).
- **Optional Secondary Subtitle**: Smaller plain English translation (e.g. `Area = ½ · base · height`, `Interior angles always sum to 180°`).

### 2.2 Interactive Diagram (Center)
- Clean SVG canvas with aspect ratio ~ `22/13.5` or `viewBox="0 0 240 170"`.
- Draggable vertices with `touch-none` and continuous 2D pointer dragging.
- **Zero auto-play**: Card stays completely stationary until the user drags or clicks a control.

### 2.3 Bottom Frosted Equation Banner (Unboxed Typographic Flow)
- Live calculations are wrapped in a frosted glass banner matching the top hero banner (`px-5 py-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-md flex items-center gap-2 text-base sm:text-lg font-bold font-headline select-none`).
- **No Inner Sub-Boxes**: The equation reads naturally from left to right as a clean, continuous statement without nested boxes or boxes inside boxes.
- Operators (`+`, `−`, `·`, `=`) render in muted translucent white (`text-white/50`).
- **Color Coding**:
  - Semantic terms ($a, b, c, A, B, C$) match their diagram colors.
  - Answers ($180^\circ$, calculated Area, Perimeter) render in crisp bold white (`text-white font-bold`).
  - When the answer directly corresponds to a semantic component (e.g. hypotenuse $c²$ in Pythagorean theorem), it uses its matching semantic color ($c² = 5²$ in Orange).
  ```tsx
  <div className="flex justify-center my-1">
    <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
      <span style={{ color: COLOR_A }}>{a}²</span>
      <span className="text-white/50">+</span>
      <span style={{ color: COLOR_B }}>{b}²</span>
      <span className="text-white/50">=</span>
      <span style={{ color: COLOR_C }}>{c}²</span>
    </div>
  </div>
  ```

### 2.5 Frosted Controls & Action Buttons
- Presets and action buttons (e.g. `Show proof ▶`, `Fold corners ▶`, presets `3, 4, 5`) use rounded frosted pills:
  ```tsx
  className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm disabled:opacity-50"
  ```

---

## 🎨 3. Semantic Color Standards

Colors must be consistent and intuitive within each topic. As new topic categories are developed, add their specific semantic color mapping here:

### 3.1 Angles & Triangles Palette *(Established)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Angle 1 / Base Angle / Side $a$** | Cyan | `#5ee8ff` | Bottom-left angle, base angles on isosceles, vertical altitude $h$, side $a$ |
| **Angle 2 / Apex Angle / Base $b$** | Gold | `#ffd45e` | Bottom-right angle, apex angle on isosceles, baseline $b$, length $l$, side $b$ |
| **Angle 3 / Hypotenuse $c$** | Orange | `#fb923c` | Third angle in scalene, hypotenuse $c$ in right triangles |
| **Right Angle ($90^\circ$)** | Cyan / White | `#5ee8ff` / `#ffffff` | Perpendicular right-angle square marker ($\llcorner$) at base of altitude or right vertex |
| **Calculated Answer / Angle Sum** | White Pill | `#ffffff` | Answer pill in live equation (`border: 1.5px solid white/65; bg: white/15`) |
| **Grid Lines & Bounding Boxes** | Translucent White | `rgba(255,255,255,0.35)` | Unit square grid lines (`strokeDasharray="2 2"`), bounding boxes (`strokeDasharray="4 3"`) |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.15)` | Interior fill of geometric shapes |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Primary polygon boundary edges (`strokeWidth={2.5}`) |

### 3.2 Upcoming Topic Palettes *(To be formalized as we build)*
- **Quadrilaterals**: Parallel side pairs, diagonals, base/height, trapezoid bases ($a, b$).
- **Circles**: Radius ($r$), Diameter ($d$), Circumference ($C$), Area ($A$), $\pi$.
- **Polygons**: Side length ($s$), Interior angle sum $(n-2)\times 180^\circ$, Number of sides ($n$).
- **3D Shapes**: Surface Area ($SA$), Volume ($V$), Radius ($r$), Height ($h$), Slant height ($l$).

---

## 📐 4. Area Formulas & Unit Grids

1. **Unit Grid Visualization**:
   - All area cards (triangle, rectangle, parallelogram, trapezoid, circle) must display subtle, neutral unit grid lines across the enclosing bounding rectangle ($b \times h$).
   - Concretely teaches that area is a countable measure of unit squares ($1 \times 1$).
2. **Altitude Representation**:
   - Vertical altitude ($h$) is drawn with a dashed cyan line (`#5ee8ff`, `strokeDasharray="4 3"`).
   - An explicit right-angle square box marker ($\llcorner$, size 8px) is placed at the intersection of the altitude and base.
3. **Clamping & Geometric Invariants**:
   - Drag handles must be clamped within valid boundaries (e.g. apex $x$ clamped to base $[B_1, B_2]$) so the shape remains strictly enclosed inside its $b \times h$ unit grid box.

---

## 🔤 5. Typography & Mathematical Notation

1. **No LaTeX**:
   - Never use LaTeX (`$...$`, `\frac{...}{...}`, `\times`) in assistant messages, comments, or cards.
   - Use standard unicode symbols (`·`, `×`, `²`, `√`, `°`, `⟂`, `½`, `⅓`).
2. **Textbook Stacked Fractions**:
   - Always use `FormattedMathText` or `StackedFraction` (`<StackedFraction numerator="1" denominator="2" />`) for clean vertical fractions with horizontal fraction bars.
3. **Clean Integer Rounding**:
   - Interactive handles move smoothly and continuously in 2D without stepped snapping.
   - All live numeric readouts ($b, h, A, \text{degrees}$) are rounded to whole integers to eliminate decimal clutter.
4. **Angles vs. Side Lengths Lettering Convention**:
   - **Angles & Vertices**: Always **Uppercase** ($A, B, C$). E.g. `A + B + C = 180°`, angle $A$, vertex $C$.
   - **Side Lengths & Dimensions**: Always **Lowercase** ($a, b, c$, $b, h$, $l, w$, $s, r$). E.g. `P = a + b + c`, `a² + b² = c²`, `A = ½ · b · h`.
   - **Opposite Side-Angle Pairing**: Side $a$ is opposite Angle $A$, Side $b$ is opposite Angle $B$, and Side $c$ is opposite Angle $C$.
5. **Formula Token Color Matching**:
   - `FormattedMathText` automatically color-codes mathematical keywords:
     - `A`, `a²`, `a`, `height (h)`, `height`, `h`, `base angles` $\rightarrow$ **Cyan (`#5ee8ff`)**
     - `B`, `b²`, `b`, `base (b)`, `base` $\rightarrow$ **Gold (`#ffd45e`)**
     - `C`, `c²`, `c`, `hypotenuse (c)` $\rightarrow$ **Orange (`#fb923c`)**
6. **Diagram Simplicity & Pure Value Labels**:
   - Because the top frosted hero banner explicitly explains variable names and color tokens (e.g. $b = \text{base}$, $h = \text{height}$, $a, b, c$), diagrams should display clean numeric values directly (`10`, `7`, `40°`) in their matching semantic color rather than redundant prefixes (`b = 10`, `h = 7`). This keeps diagrams uncluttered and modern.

---

## ✅ 6. Card Verification Checklist

Before considering any geometry card complete:
- [ ] Top definition/formula is enclosed in the frosted glass hero banner.
- [ ] Shows the "why" via direct manipulation or proof visualization.
- [ ] Semantic colors match across header text, diagram geometry, and live equation.
- [ ] Live bottom equation is open (no dark blocky token boxes).
- [ ] Calculated answer is in a crisp white pill with white border.
- [ ] Area cards display the neutral dashed unit grid across the bounding box.
- [ ] Right angles feature a clean square box marker ($\llcorner$).
- [ ] Drag handles move smoothly without jitter; numbers round cleanly to integers.
- [ ] No auto-play loops are running in the background.
- [ ] Card passes `pnpm -r typecheck` and `pnpm -r test`.
