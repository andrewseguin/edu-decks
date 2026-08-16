# Geometry Deck — Design & Interaction Guide

> [!NOTE]
> **Living Document**: This design specification is actively evolving as we progress card-by-card through the deck. The core layout hierarchy (frosted hero banner, open live equations, white-bordered answers, ambient auto-play that yields to touch) is universal, while semantic color palettes, diagram layouts, and interactive paradigms will expand to accommodate new topics (e.g. Quadrilaterals, Circles, Polygons, and 3D Shapes) as each topic is reviewed. Always update this document when introducing or refining new visual patterns.

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
   - **Ambient Interactivity on Reveal (Auto-Pulse / Ambient Motion)**: Explorer cards feature gentle ambient motion on initial reveal (e.g. subtle Lissajous orbit, slow rotation, height breathing) to immediately show learners that the diagram is dynamic and interactive. The instant the user touches or drags any handle, the animation cancels permanently, yielding 100% direct control.
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
- **Container**: `w-full px-4 py-2.5 my-1 bg-black/35 border-y border-white/20 flex flex-col items-center justify-center gap-1`
- **Full Bleed Design**: Spans horizontally from edge to edge of the card container, anchored cleanly with flat top and bottom borders (`border-y border-white/20`) and no side/drop shadows.
- **Primary Line**: Bold, prominent formula (e.g. `A = ½ · b · h`, `a² + b² = c²`, `2 equal sides, 2 equal base angles`).
- **Optional Secondary Subtitle**: Smaller plain English translation (e.g. `Area = ½ · base · height`, `Interior angles always sum to 180°`).

### 2.2 Interactive Diagram (Center)
- Clean SVG canvas with aspect ratio ~ `22/13.5` or `viewBox="0 0 240 170"`.
- Draggable vertices with `touch-none` and continuous 2D pointer dragging.
- **Ambient motion on reveal**: Explorer cards feature gentle ambient motion on reveal that immediately yields 100% control the instant the user drags or touches any control.

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
- **Gentle Auto-Pulse on Reveal**: Single-step interactive explorer cards gently pulse on initial reveal to demonstrate dynamic interactivity, immediately canceling and yielding permanent 100% control the instant the user touches or drags any handle. Multi-step proofs (e.g. Pythagoras square dissection, triangle fold) are user-triggered via step clicks or replay pills.

### 2.5 Area vs. Perimeter Structural Specifications
Geometry cards are fundamentally divided into **Area concepts** and **Perimeter concepts**, each with strict visual and structural rules:

- **Area Cards (Interior Focus)**:
  - **Unit Grid Visualization**: Subtle, neutral unit grid lines (`rgba(255, 255, 255, 0.12)`) across the enclosing bounding box to concretely ground square units.
  - **Perpendicular Altitude Lines ($h$)**: Dashed vertical height lines with $90^\circ$ right-angle markers in Cyan (`#5ee8ff`).
  - **Multi-Step Geometric Proofs**: Interactive step navigation pills (`[ 1. Shape ] [ 2. Proof ]`) demonstrating dissections (e.g. Parallelogram cut-and-slide, Trapezoid $180^\circ$ hinge duplicate flip).
  - **Live Banner**: $A = b \cdot h$ or $A = \frac{1}{2}(a+b)h$ in stacked fractions.

- **Perimeter Cards (Boundary Focus)**:
  - **No Interior Grid Lines**: Unit grids must be strictly omitted on perimeter cards to keep total visual focus on the 1D outer boundary path.
  - **No Altitude Lines or Interior Markers**: Omit interior dashed height lines and right-angle markers.
  - **Minimal Information Principle**:
    - Provide strictly the minimal sufficient set of dimensions.
    - On shapes with opposite equal sides (Rectangles, Parallelograms), only label **two adjacent sides** (e.g. bottom base $b$ in Gold and left slanted side $a$ in Cyan). This actively reinforces to the student that because opposite sides are equal by definition, $P = 2a + 2b$ or $P = 2l + 2w$ only requires two side measurements.
  - **Boundary Glow Tracing**: Reveal steps feature `traceStroke: "perimeter"` which animates a luminous perimeter trace around the outer edge.
  - **Live Banner**: $P = 2(a) + 2(b) = \text{total}$ or $P = a + b + c + d = \text{total}$.

### 2.6 Full Interactive Explorer Requirement for All Formulas
- **Every Formula Term Card Must Be Interactive**:
  - Every formula card (both Area AND Perimeter across Triangles, Quadrilaterals, Circles, Polygons) must have a dedicated interactive explorer component with live dynamic calculation banners and 1:1 drag handles rather than falling back to static SVGs.
  - Interactive explorers must support both `mode="area"` and `mode="perimeter"` with seamless resizing, clean responsive typography, and instant numeric-algebraic feedback.

### 2.7 Multi-Step Physical Proof Animations & Duplication
- **Physical 180° Hinge-Flip Duplication**:
  - Multi-step proofs that show shape duplication (e.g. Trapezoid $\to$ $2\times$ Parallelogram) must use physical $180^\circ$ hinge rotations around the shared seam (`transformOrigin: seamMidX seamMidY`) with 100% full opacity visibility throughout, rather than fading in out of nowhere.
- **Continuous Component Mounting**:
  - Sliding wedges and animated dissection parts must remain mounted continuously in the DOM so CSS transitions (`cubic-bezier(0.4, 0, 0.2, 1)`) smoothly glide across without snapping or layout popping.

### 2.8 Dynamic Container Responsiveness (`useContainerWidth`)
- **Card-Width Responsive Freedom**:
  - Interactive SVGs must dynamically adapt to the exact rendered card width using `useContainerWidth()` (backed by `ResizeObserver`).
  - Eliminates hardcoded small canvas widths so desktop cards can expand to `480px+` while mobile viewports cleanly scale down without horizontal clipping or empty dead space.
- **Symmetric 1:1 Center-Expansion Drag Math**:
  - For shapes centered horizontally at $C_X = \text{SVG\_W} / 2$ (e.g. rectangles, trapezoids), the delta calculation for horizontal dragging must use the centered distance:
    $$\text{rawUnits} = \text{round}\left(\frac{(p_x - C_X) \cdot 2}{\text{pxPerUnit}}\right)$$
  - This ensures the outer drag handle stays locked **1:1 directly underneath the cursor** at full speed with 0 lag, while the shape expands and contracts symmetrically from the exact center of the card.
- **Altitude Label Placement on the Interior**:
  - Height ($h$) labels must always be placed on the **interior side** of the altitude line (away from the slanted diagonal leg / vertex) to guarantee ample breathing room and prevent crowding or overlapping the slanted boundary edge.

### 2.9 Two-Column Calculation Proofs & Interactive Glossary
- **Responsive Layout via CSS Container Queries (`.proof-table-container`)**:
  - **Wide Containers ($\ge 480\text{px}$)**: Classic formal two-column proof table (Reason on Left `|` Equation on Right) separated by a subtle vertical divider (`bg-white/20`).
  - **Narrow Containers ($< 480\text{px}$)**: Centered stacked step layout (Reason on top, full-width bold Equation below). Eliminates horizontal line clipping and preserves full, precise theorem language on small mobile screens.
- **Interactive ELI5 Math Glossary Tooltips (`ProofReasonTooltip`)**:
  - Every justification reason has a subtle dotted underline (`decoration-dotted decoration-white/50`).
  - Hovering (desktop) or tapping (mobile) opens a frosted floating glossary card with ultra-accessible ELI5 explanations and clean unboxed examples (e.g. *Isolate*, *Substitute*, *Angle Sum*, *Evaluate*).
  - Built with `@radix-ui/react-popover` and React Portals to guarantee zero clipping from card overflow.
- **Front Prompts & Explicit Target Variable Naming**:
  - Front prompts on calculation cards must explicitly name the specific target variable shown in the diagram (e.g. *"Solve for angle B"*, *"Solve for angle C"*, *"Solve for the triangle area"*, *"Solve for hypotenuse (c)"*).
  - This establishes an immediate, unambiguous link between the question prompt and the corresponding target letter label on the canvas.
  - On flip, the front prompt smoothly collapses and fades (`opacity-0 max-h-0`) so learners focus entirely on the calculation proof.

### 2.10 Interactive Step Navigation Pills & Action Buttons
- **Multi-Step Proofs**:
  - When demonstrating geometric proofs (e.g. Parallelogram Cut & Slide, Trapezoid 2× Parallelogram Docking, Triangle Angle Sum Fold), wrap steps in a standardized numbered pill bar:
    ```tsx
    <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none">
      <button className={cn("px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none", !showProof ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10")}>
        1. Parallelogram
      </button>
      <button className={cn("px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none", showProof ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10")}>
        2. Rectangle Proof
      </button>
    </div>
    ```
- **Seamless Morphing Transitions**:
  - In cut-and-slide or docking animations, the remaining shape body must stay static while only the moving piece translates (`transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)`).
  - All moving proof pieces retain **neutral translucent white fill and stroke** (`fill="rgba(255, 255, 255, 0.14)" stroke="rgba(255, 255, 255, 0.95)"`) to avoid distracting or conflicting color shifts.
- **Definition Term Cards (No Redundant Bottom Formula Chip)**:
  - Pure definition cards (e.g. Parallelograms, Rhombuses, Trapezoids) do not require a bottom equation chip. The top hero banner + interactive diagram provide complete, unencumbered visual clarity.

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

### 3.2 Triangles Topic Palette *(Optimized for `#10b981` Emerald/Green)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Side $a$ / Altitude $h$ / Angle $A$** | Cyan | `#5ee8ff` | Vertical altitude $h$, side $a$, bottom-left angle $A$, base angles on isosceles |
| **Side $b$ / Base $b$ / Angle $B$** | Gold | `#ffd45e` | Horizontal baseline $b$, length $l$, side $b$, apex angle on isosceles |
| **Side $c$ / Hypotenuse $c$ / Angle $C$** | Neon Lilac | `#d8b4fe` | Hypotenuse $c$ in right triangles, third angle $C$ in scalene/angle sum |
| **Right Angle ($90^\circ$)** | Cyan / White | `#5ee8ff` / `#ffffff` | Perpendicular right-angle square marker ($\llcorner$) at base of altitude or right vertex |
| **Calculated Answer / Totals** | Bold White | `#ffffff` | Crisp bold white text inside the bottom frosted equation banner |
| **Grid Lines & Bounding Boxes** | Translucent White | `rgba(255,255,255,0.12)` / `0.25` | Subtle unit square grid lines (`rgba(255,255,255,0.12)`, `strokeDasharray="2 4"`), bounding boxes (`rgba(255,255,255,0.25)`, `strokeDasharray="4 3"`) |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.15)` | Interior fill of geometric shapes |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Primary polygon boundary edges (`strokeWidth={2.5}`) |

### 3.3 Quadrilaterals Topic Palette *(Optimized for `#6366f1` Indigo)*

> [!IMPORTANT]
> **1:1 Variable-to-Color Exclusivity (Never Reuse a Color for Multiple Dimensions on the Same Card)**:
> In any geometric figure (such as a trapezoid with dimensions $a, b, h$ or a 3D prism with $l, w, h$), every distinct dimension/variable must have its own unique color from the palette. Never reuse Cyan or Gold for two different dimensions on the same card.

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Top Base ($a$) / Angle $B$** | Soft Lilac | `#d8b4fe` | Top parallel base $a$ on trapezoids, second angle $B$ |
| **Bottom Base ($b$) / Length ($l$) / Angle $A$** | Warm Gold | `#ffd45e` | Horizontal baseline $b$, length $l$, bottom parallel base $b$ on trapezoid |
| **Vertical Altitude ($h$) / Width ($w$)** | Electric Cyan | `#5ee8ff` | Vertical altitude $h$, width $w$ |
| **Parallel Side Indicators** | Neutral White | `rgba(255,255,255,0.85)` | Solid parallel chevrons ($\blacktriangleright$ single on bases, $\blacktriangleright\blacktriangleright$ double on legs) |
| **Diagonals** | Neutral Translucent White | `rgba(255,255,255,0.55)` | Dashed bisecting diagonals ($d_1, d_2$) |
| **Equal Side Tick Marks** | Neutral White | `rgba(255,255,255,0.85)` | Clean hash marks (`|`) on equal sides |
| **Right Angle ($90^\circ$)** | Cyan / White | `#5ee8ff` / `#ffffff` | Corner right-angle boxes ($\llcorner$) on rectangles & altitude base |
| **Calculated Answer / Totals** | Bold White | `#ffffff` | Crisp bold white text inside the bottom frosted equation banner ($A$, $P$) |
| **Grid Lines & Bounding Boxes** | Translucent White | `rgba(255,255,255,0.12)` | Subtle unit square grid lines (skips rendering at altitude $x$-coordinate to avoid dash overlap) |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.14)` | Interior fill of geometric figures |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Primary quadrilateral perimeter boundary edges (`strokeWidth={2.5}`) |

### 3.4 Circles Topic Palette *(Optimized for `#8b5cf6` Violet)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Radius ($r$)** | Electric Cyan | `#5ee8ff` | Center to perimeter line segment, radius dimension label |
| **Diameter ($d$)** | Warm Gold | `#ffd45e` | Full edge-to-edge chord through center, diameter label |
| **Circumference Boundary ($C$)** | Neon Lilac | `#d8b4fe` | Outer perimeter circle line, arc length |
| **Center Point** | Crisp White | `#ffffff` | Center dot marker ($\odot$) |
| **Constant $\pi$** | Muted Warm Gold | `#ffd45e` / `#ffffff` | $\pi \approx 3.14159\dots$ |
| **Calculated Answer / Totals** | Bold White | `#ffffff` | Crisp bold white text inside bottom equation banner ($A = 25\pi$, $C = 8\pi$) |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.15)` | Interior disk surface fill |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Primary circle boundary line (`strokeWidth={2.5}`) |

### 3.5 Polygons Topic Palette *(Optimized for `#ec4899` Pink)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Number of Sides ($n$)** | Warm Gold | `#ffd45e` | Vertex/side count ($n = 3, 4, 5, 6, 8\dots$) |
| **Interior Angle ($\theta, A$)** | Electric Cyan | `#5ee8ff` | Interior vertex angle arcs and single interior angle values |
| **Exterior Angle ($\phi, E$)** | Neon Lilac | `#d8b4fe` | Outer extended exterior angle arcs (summing to $360^\circ$) |
| **Triangulation Diagonals** | Dashed Cyan | `#5ee8ff` | Internal diagonals fan from one vertex splitting into $(n-2)$ triangles |
| **Total Angle Sum / Answer** | Bold White | `#ffffff` | Total interior sum $(n-2)\times 180^\circ$ inside equation banner |
| **Shape Fills** | Soft Luminous White | `rgba(255,255,255,0.15)` | Interior polygon surface fill |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Polygon perimeter boundary edges (`strokeWidth={2.5}`) |

### 3.6 3D Shapes Topic Palette *(Optimized for `#06b6d4` Cyan)*

| Concept | Token / Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Vertices ($V$)** | Crisp White | `#ffffff` | Corner junction points where 3+ edges intersect |
| **Edges ($E$)** | Warm Gold | `#ffd45e` | Line segments where faces meet (solid front, dashed back) |
| **Faces ($F$) / Surface Area ($SA$)** | Luminous Frosted Fill | `rgba(255,255,255,0.22)` | Flat planar boundary polygon facets |
| **Length / Radius / Base ($l, w, r, B$)** | Electric Cyan | `#5ee8ff` | Horizontal floor plane dimensions |
| **Height ($h$)** | Warm Gold | `#ffd45e` | Vertical extrusion altitude |
| **Volume ($V$) / Calculated Answer** | Bold White | `#ffffff` | Enclosed cubic units / final answer text |
| **Shape Outlines** | Solid White | `rgba(255,255,255,0.95)` | Visible 3D silhouette edges (`strokeWidth={2.5}`) |
| **Hidden / Internal Edges** | Dashed White/Gold | `rgba(255,255,255,0.35)` | Occluded rear perspective edges (`strokeDasharray="3 3"`) |

---

## 📐 4. Area Formulas & Unit Grids

1. **Unit Grid Visualization**:
   - All area cards (triangle, rectangle, parallelogram, trapezoid, circle) must display subtle, neutral unit grid lines across the enclosing bounding rectangle ($b \times h$).
   - Concretely teaches that area is a countable measure of unit squares ($1 \times 1$).
   - **Grid Cleanliness**: The grid generator must skip rendering a white grid line at the altitude line's exact $x$-coordinate to prevent distracting double-stroke or overlapping dashes.
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
- [ ] Single-step explorer cards gently animate on initial reveal and cleanly cancel/yield permanent control upon touch.
- [ ] Card passes `pnpm -r typecheck` and `pnpm -r test`.
