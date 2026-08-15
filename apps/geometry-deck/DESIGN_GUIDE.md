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
- **Container**: `w-[calc(100%+1.5rem)] -mx-3 sm:w-[calc(100%+2.5rem)] sm:-mx-5 md:w-[calc(100%+3rem)] md:-mx-6 px-4 py-2.5 my-1 bg-black/45 backdrop-blur-md border-y border-white/20 flex flex-col items-center justify-center gap-1`
- **Full Bleed Design**: Spans horizontally from edge to edge of the card container, anchored cleanly with flat top and bottom borders (`border-y border-white/20`) and no side/drop shadows.
- **Primary Line**: Bold, prominent formula (e.g. `A = ½ · b · h`, `a² + b² = c²`, `2 equal sides, 2 equal base angles`).
- **Optional Secondary Subtitle**: Smaller plain English translation (e.g. `Area = ½ · base · height`, `Interior angles always sum to 180°`).

### 2.2 Interactive Diagram (Center)
- Clean SVG canvas with aspect ratio ~ `22/13.5` or `viewBox="0 0 240 170"`.
- Draggable vertices with `touch-none` and continuous 2D pointer dragging.
- **Zero auto-play**: Card stays completely stationary until the user drags or clicks a control.

### 2.3 Bottom Frosted Equation Banner (Unboxed Typographic Flow)
- Live calculations are wrapped in a frosted glass banner matching the top hero banner (`px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md flex items-center gap-2 text-base sm:text-lg font-bold font-headline select-none`).
- **No Inner Sub-Boxes**: The equation reads naturally from left to right as a clean, continuous statement without nested boxes or boxes inside boxes.
- Operators (`+`, `−`, `·`, `=`) render in muted translucent white (`text-white/70`).
- **Color Coding**:
  - Semantic terms ($a, b, c, A, B, C$) match their diagram colors.
  - Answers ($180^\circ$, calculated Area, Perimeter) render in crisp bold white (`text-white font-bold`).
  - When the answer directly corresponds to a semantic component (e.g. hypotenuse $c²$ in Pythagorean theorem), it uses its matching semantic color ($c² = 5²$ in Orange).
  ```tsx
  <div className="flex justify-center my-1">
    <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
      <span style={{ color: COLOR_A }}>{a}²</span>
      <span className="text-white/50">+</span>
      <span style={{ color: COLOR_B }}>{b}²</span>
      <span className="text-white/50">=</span>
      <span style={{ color: COLOR_C }}>{c}²</span>
    </div>
  </div>
  ```

### 2.4 Frosted White Interactive Controls & Button Standards
- **Neutral White Glassmorphism**:
  - UI buttons and interactive triggers must **NEVER** use card-colored backgrounds (e.g. green, blue, purple) or saturated semantic colors.
  - All interactive elements strictly use **neutral translucent frosted white styling** (`bg-white/10` to `bg-white/25`, `border-white/20` to `border-white/60`, `text-white/90`). This ensures the vibrant semantic palette (Cyan `#5ee8ff`, Gold `#ffd45e`, Orange `#ffa756`) remains exclusively dedicated to mathematical variables, dimensions, and angles.

- **Primary Action & Trigger Buttons** (e.g. `Fold corners`, `Unroll perimeter`, `Show proof`):
  - Frosted white pill with subtle glass border and hover state:
    ```tsx
    className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95 disabled:opacity-50 disabled:cursor-default"
    ```

- **Interactive Step Navigation Pills** (e.g. `1. Triangle` → `2. Squares` → `3. Combined` + `↺` Replay):
  - Modeled after the step controls pattern from mental math decks, wrapping steps in a compact frosted capsule:
    ```tsx
    {/* Capsule Container */}
    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
      {/* Active Step Pill (Borderless Soft Glow) */}
      <button className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 border-none bg-white/20 text-white shadow-none">
        2. Squares
      </button>

      {/* Inactive Step Pill */}
      <button className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 border-none bg-transparent text-white/70 hover:text-white hover:bg-white/10">
        3. Combined
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-3 bg-white/20 mx-0.5" />

      {/* Replay Button */}
      <button title="Replay animation" className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all active:scale-95 border-none">
        <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
      </button>
    </div>
    ```

- **Preset & Dimension Selectors** (e.g. `3, 4, 5`, `5, 12, 13`, `8, 15, 17`):
  - Compact borderless rounded pills for switching geometric scenarios:
    - **Active**: `bg-white/20 text-white shadow-none px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border-none`
    - **Inactive**: `bg-white/10 text-white/70 hover:bg-white/15 hover:text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border-none`
- **No Autoplay Loops**: All animations must be user-triggered via step clicks or replay pills; never run looping timers in the background.

### 2.5 Two-Column Calculation Proofs & Interactive Glossary
- **Responsive Layout via CSS Container Queries (`.proof-table-container`)**:
  - **Wide Containers ($\ge 480\text{px}$)**: Classic formal two-column proof table (Reason on Left `|` Equation on Right) separated by a subtle vertical divider (`bg-white/20`).
  - **Narrow Containers ($< 480\text{px}$)**: Centered stacked step layout (Reason on top, full-width bold Equation below). Eliminates horizontal line clipping and preserves full, precise theorem language on small mobile screens.
- **Interactive ELI5 Math Glossary Tooltips (`ProofReasonTooltip`)**:
  - Every justification reason has a subtle dotted underline (`decoration-dotted decoration-white/50`).
  - Hovering (desktop) or tapping (mobile) opens a frosted floating glossary card with ultra-accessible ELI5 explanations and clean unboxed examples (e.g. *Isolate*, *Substitute*, *Angle Sum*, *Evaluate*).
  - Built with `@radix-ui/react-popover` and React Portals to guarantee zero clipping from card overflow.
- **Front Question Prompt Fading**:
  - Action-verb prompt on the front (e.g. *"Solve for angle C"*) smoothly collapses and fades on flip (`opacity-0 max-h-0`) so learners focus entirely on the calculation proof.
### 2.6 Standard Diagram Typography Scale
All SVG vector diagrams and interactive explorer components adhere to a unified typographic scale:

| Role | Font Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Unknown Target Variables** | `17px` | `900` (Black/Heavy) | Target unknown variables on front diagrams before reveal ($C, a, b, c$) |
| **Known Angle Readouts & Side Dimensions** | `12px` – `13px` | `800` (Extra Bold) | Live interactive angle values ($67^\circ, 23^\circ$), side dimensions ($3, 4, 12$) |
| **Secondary Helper Annotations** | `11px` | `600` (Semi Bold) | Diagram helper notes (e.g. *alternate angles equal*, $180^\circ < \text{reflex} < 360^\circ$) |

- **No Concatenated Variable Prefixes**: Angle arcs in diagrams cleanly display only the pure numeric degree value (e.g. `67°`, `23°`) rather than wide, cluttered prefixes like `A=67°` or `B=23°`.
- **Always Include Drop Shadows**: Any text rendered directly over the card background includes `style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}`.

---

## 🎨 3. Semantic Color Standards

Colors must be consistent and intuitive within each topic. As new topic categories are developed, add their specific semantic color mapping here:

### 3.1 Angles Topic Palette *(Optimized for `#d97706` Amber/Orange)*

Colors on Angles cards follow a strict **progressive allocation order**:
1. **1 Angle Cards** (Acute, Obtuse, Reflex, Single Angle):
   - Primary angle arc & label: **Electric Cyan (`#5ee8ff`)**.
2. **2 Angles Cards** (Supplementary, Complementary, Vertically Opposite, Co-Interior):
   - First Angle ($A$): **Electric Cyan (`#5ee8ff`)**.
   - Second Angle ($B$): **Neon Lilac (`#d8b4fe`)**.
   - Congruent Pairs (Alternate Angles where $A = B$): both in **Electric Cyan (`#5ee8ff`)**.
3. **3 Angles Cards** (Multi-angle systems, 3 angles at a point):
   - Angle 1 ($A$): **Electric Cyan (`#5ee8ff`)**.
   - Angle 2 ($B$): **Neon Lilac (`#d8b4fe`)**.
   - Angle 3 ($C$): **Mint Green (`#4ade80`)**.

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Angle 1 ($A$) / Single Angle** | Electric Cyan | `#5ee8ff` | Acute, obtuse, reflex arcs, first angle in pairs/sums ($A + B$) |
| **Angle 2 ($B$)** | Neon Lilac | `#d8b4fe` | Supplementary/complementary second angle, co-interior angle |
| **Angle 3 ($C$)** | Mint Green | `#4ade80` | Third angle in multi-angle systems |
| **Right Angle / Rays** | Crisp White | `#ffffff` | Ray line segments, square $90^\circ$ perpendicular markers |

> [!IMPORTANT]
> **Text Drop Shadows on Cards**: Any text element rendered directly on top of the card background (without a frosted/dimmed banner container) must include `style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}` for maximum legibility and contrast.

> [!IMPORTANT]
> **Touch Points & Draggable Handles (Direct Shape Manipulation, Always White)**: All interactive controls are **100% direct vector drag manipulations** on vertex/ray endpoints (no disconnected horizontal range sliders). All drag handles strictly share the **unified white drag affordance** (solid white center dot with a frosted translucent grab ring: `fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)"` in SVG, paired with an invisible `r=24` touch hit area for effortless touch interaction). Semantic colors are strictly reserved for mathematical properties (angles, lengths, heights, areas), while frosted white serves as the universal signature for draggable controls.

### 3.2 Triangles Topic Palette *(Optimized for `#10b981` Emerald/Green)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Side $a$ / Altitude $h$ / Angle $A$** | Cyan | `#5ee8ff` | Vertical altitude $h$, side $a$, bottom-left angle $A$, base angles on isosceles |
| **Side $b$ / Base $b$ / Angle $B$** | Gold | `#ffd45e` | Horizontal baseline $b$, length $l$, side $b$, apex angle on isosceles |
| **Side $c$ / Hypotenuse $c$ / Angle $C$** | Neon Lilac | `#d8b4fe` | Hypotenuse $c$ in right triangles, third angle $C$ in scalene/angle sum |
| **Right Angle ($90^\circ$)** | Cyan / White | `#5ee8ff` / `#ffffff` | Perpendicular right-angle square marker ($\llcorner$) at base of altitude or right vertex |
| **Calculated Answer / Totals** | Bold White | `#ffffff` | Crisp bold white text inside the bottom frosted equation banner |
| **Grid Lines & Bounding Boxes** | Translucent White | `rgba(255,255,255,0.35)` | Unit square grid lines (`strokeDasharray="2 2"`), bounding boxes (`strokeDasharray="4 3"`) |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.15)` | Interior fill of geometric shapes |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Primary polygon boundary edges (`strokeWidth={2.5}`) |

### 3.3 Upcoming Topic Palettes *(To be formalized as we build)*
- **Quadrilaterals**: Parallel side pairs, diagonals, base/height, trapezoid bases ($a, b$).
- **Circles**: Radius ($r$), Diameter ($d$), Circumference ($C$), Area ($A$), $\pi$.
- **Polygons**: Side length ($s$), Interior angle sum $(n-2)\times 180^\circ$, Number of sides ($n$).
- **3D Shapes**: Surface Area ($SA$), Volume ($V$), Radius ($r$), Height ($h$), Slant height ($l$).

---

## 📐 4. Area Formulas & Unit Grids

1. **Unit Grid Visualization**:
   - All area cards (triangle, rectangle, parallelogram, trapezoid, circle) must display subtle, neutral unit grid lines across the enclosing bounding rectangle ($b \times h$).
   - Concretely teaches that area is a countable measure of unit squares ($1 \times 1$).
2. **Grid Snapping on Area Cards**:
   - On area cards with unit grids, drag handles snap cleanly to unit grid coordinates (e.g. integer width columns and height rows).
   - Ensures visual honesty: the apex, altitude line, and bounding box edges always align 1:1 with visible unit grid cells.
3. **Altitude Representation**:
   - Vertical altitude ($h$) is drawn with a dashed cyan line (`#5ee8ff`, `strokeDasharray="4 3"`).
   - An explicit right-angle square box marker ($\llcorner$, size 8px) is placed at the intersection of the altitude and base.
4. **Clamping & Geometric Invariants**:
   - Drag handles must be clamped within valid boundaries (e.g. apex $x$ clamped to base $[B_1, B_2]$) so the shape remains strictly enclosed inside its $b \times h$ unit grid box.

---

## 🔤 5. Typography & Mathematical Notation

1. **No LaTeX**:
   - Never use LaTeX (`$...$`, `\frac{...}{...}`, `\times`) in assistant messages, comments, or cards.
   - Use standard unicode symbols (`·`, `×`, `²`, `√`, `°`, `⟂`, `½`, `⅓`).
2. **Textbook Stacked Fractions**:
   - Always use `FormattedMathText` or `StackedFraction` (`<StackedFraction numerator="1" denominator="2" />`) for clean vertical fractions with horizontal fraction bars.
3. **Clean Integer Rounding & Snapping**:
   - Interactive handles move smoothly and snap to grid cells where appropriate.
   - All live numeric readouts ($b, h, A, \text{degrees}$) are rounded to whole integers to eliminate decimal clutter.
4. **Uniform Outward Label Spacing**:
   - Side length labels are positioned along their exact outward perpendicular normal vectors at a constant $14\text{px}$ offset, ensuring uniform breathing room away from shapes in any orientation.
5. **Angles vs. Side Lengths Lettering Convention**:
   - **Angles & Vertices**: Always **Uppercase** ($A, B, C$). E.g. `A + B + C = 180°`, angle $A$, vertex $C$.
   - **Side Lengths & Dimensions**: Always **Lowercase** ($a, b, c$, $b, h$, $l, w$, $s, r$). E.g. `P = a + b + c`, `a² + b² = c²`, `A = ½ · b · h`.
   - **Output Variables**: Calculated total variables ($A$ for Area, $P$ for Perimeter, $C$ for Circumference, $V$ for Volume) render in **crisp bold white**.
   - **Opposite Side-Angle Pairing**: Side $a$ is opposite Angle $A$, Side $b$ is opposite Angle $B$, and Side $c$ is opposite Angle $C$.
6. **Formula Token Color Matching**:
   - `FormattedMathText` automatically color-codes mathematical keywords:
     - `a²`, `a`, `height (h)`, `height`, `h`, `base angles` $\rightarrow$ **Cyan (`#5ee8ff`)**
     - `b²`, `b`, `base (b)`, `base` $\rightarrow$ **Gold (`#ffd45e`)**
     - `c²`, `c`, `hypotenuse (c)` $\rightarrow$ **Neon Lilac (`#d8b4fe`)**
     - `A + B + C` $\rightarrow$ Angle $A$ (Cyan), Angle $B$ (Gold), Angle $C$ (Neon Lilac)
7. **Diagram Simplicity & Pure Value Labels**:
   - Because the top frosted hero banner explicitly explains variable names and color tokens (e.g. $b = \text{base}$, $h = \text{height}$, $a, b, c$), diagrams should display clean numeric values directly (`10`, `7`, `40°`) in their matching semantic color rather than redundant prefixes (`b = 10`, `h = 7`). This keeps diagrams uncluttered and modern.

---

## ✅ 6. Card Verification Checklist

Before considering any geometry card complete:
- [ ] Top definition/formula is enclosed in the flat, full-bleed edge-to-edge frosted hero banner (`border-y border-white/20 bg-black/45`).
- [ ] Shows the "why" via direct manipulation or proof visualization.
- [ ] Semantic colors match across header text, diagram geometry, and live equation.
- [ ] Live bottom equation is in a matching frosted banner with clean unboxed typographic flow.
- [ ] Calculated answers render in crisp bold white text (or matching target token color if solving for a specific component like $c^2$).
- [ ] Labels maintain a consistent outward perpendicular offset ($14\text{px}$) from line segments.
- [ ] Area cards display the neutral dashed unit grid across the bounding box and snap to integer unit cells.
- [ ] Right angles feature a clean square box marker ($\llcorner$).
- [ ] Drag handles move smoothly without jitter; numbers round cleanly to integers.
- [ ] No auto-play loops are running in the background.
- [ ] Card passes `pnpm -r typecheck` and `pnpm -r test`.
