# Geometry Deck — Comprehensive Card Modernization Plan

> [!NOTE]
> **Status**: Comprehensive Master Roadmap for bringing all remaining geometry cards in `apps/geometry-deck` up to full compliance with [`apps/geometry-deck/DESIGN_GUIDE.md`](file:///Users/andrewseguin/git/edu-decks/apps/geometry-deck/DESIGN_GUIDE.md).
> **Reference Baseline**: The **Angles** and **Triangles** topics have been completed and serve as the architectural and visual benchmark.

---

## 📋 Table of Contents
1. [Core Design Invariants & Baseline Patterns](#1-core-design-invariants--baseline-patterns)
2. [Extended Semantic Color Systems by Topic](#2-extended-semantic-color-systems-by-topic)
3. [Topic-by-Topic Audit & Modernization Plans](#3-topic-by-topic-audit--modernization-plans)
   - [3.1 Topic: Angles (Completed Reference Baseline)](#31-topic-angles-completed-reference-baseline)
   - [3.2 Topic: Triangles (Completed Reference Baseline)](#32-topic-triangles-completed-reference-baseline)
   - [3.3 Topic: Quadrilaterals (Indigo `#6366f1`)](#33-topic-quadrilaterals-indigo-6366f1)
   - [3.4 Topic: Circles (Violet `#8b5cf6`)](#34-topic-circles-violet-8b5cf6)
   - [3.5 Topic: Polygons (Sky `#0ea5e9`)](#35-topic-polygons-sky-0ea5e9)
   - [3.6 Topic: 3D Shapes (Rose `#f43f5e`)](#36-topic-3d-shapes-rose-f43f5e)
4. [New Interactive Explorers & Visual Proof Paradigms](#4-new-interactive-explorers--visual-proof-paradigms)
5. [Calculation Cards: Front Prompts, Diagram RevealText & Two-Column Proofs](#5-calculation-cards-front-prompts-diagram-revealtext--two-column-proofs)
6. [Math Glossary & Typographic Refinements](#6-math-glossary--typographic-refinements)
7. [Implementation Milestones & Execution Order](#7-implementation-milestones--execution-order)

---

## 🏛️ 1. Core Design Invariants & Baseline Patterns

Every card in the geometry deck must strictly adhere to the six core pillars established in `DESIGN_GUIDE.md` and proven out in the Angles and Triangles implementations:

1. **Full-Bleed Flat Frosted Hero Banner (Definition / Formula)**:
   - Container: `w-full px-4 py-2.5 my-1 bg-black/35 border-y border-white/20 flex flex-col items-center justify-center gap-1`.
   - Edge-to-edge full width with top and bottom borders only (no rounded pill box, no horizontal side gaps, no edge blur shadows).
   - Primary bold formula line (e.g. `A = l · w`, `V = πr²h`, `C = 2πr`) paired with an optional plain English secondary subtitle (e.g. `Area = length · width`, `Volume = (base area) · height`).
   - Clean stacked fractions via `FormattedMathText` / `StackedFraction` (e.g. `½`, `⅓`, `⁴⁄₃`).

2. **Direct Vector Manipulation & Ambient Motion on Reveal**:
   - Interactive cards use 100% direct pointer manipulation on canvas vertices/handles (with `touch-none` and `r=24` invisible hit areas).
   - Drag handles share the universal white grab affordance (`fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)"` with solid white center dot).
   - Single-step exploratory cards (Scalene, Isosceles, Equilateral, Right Triangle) gently animate on initial reveal (e.g. gentle Lissajous orbit, slow rotation, apex height wave) to immediately demonstrate interactivity.
   - The instant the user touches or drags any handle (`isUserControlling = true`), the animation cancels permanently, yielding 100% manual control. Multi-step proofs (e.g. Pythagoras dissection, Triangle fold) are controlled via step navigation pills.

3. **Unit Grid Grounding for Area & Integer Snapping**:
   - All 2D area cards display subtle, neutral unit grid lines (`stroke="rgba(255,255,255,0.35)" strokeDasharray="2 2"`) across their enclosing bounding box.
   - Drag handles snap cleanly to integer unit coordinates so visual square cells match numerical readouts 1:1.
   - All live readouts ($l, w, b, h, r, \text{degrees}$) are rounded to whole integers to eliminate decimal noise.

4. **Pure Numeric Diagram Values & 14px Outward Normal Offsets**:
   - Because the hero banner and formula explain the variable names, diagrams display clean, pure numeric values (e.g. `7`, `4`, `60°`) in their matching semantic color rather than cluttered prefixes like `l = 7` or `w = 4`.
   - Dimension labels are placed along the outward perpendicular normal vector at an exact 14px offset.
   - All diagram text over the card canvas includes a drop shadow: `filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))`.

5. **Front Diagram Target Variable Standard (`RevealText`)**:
   - Calculation cards display unknown target variables on the front in bold 900 17px font (e.g. `A`, `P`, `l`, `r`, `V`, `C`), giving the learner an immediate, prominent focal point.
   - On card reveal, `RevealText` smoothly fades out the variable letter and fades in the calculated numeric answer (`opacity-0 max-h-0` on question prompt, smooth 0.35s transform on answer value).

6. **Two-Column Container-Query Proof Table & ELI5 Glossary**:
   - Calculation reveals render a formal two-column proof table wrapped in a matching full-bleed frosted banner (`w-full bg-black/35 border-y border-white/20`).
   - CSS Container Queries (`@container (min-width: 480px)`) toggle between two-column table (Desktop) and stacked step layout (Mobile).
   - Every justification reason links to an interactive ELI5 math glossary popover tooltip (`ProofReasonTooltip`).

---

## 🎨 2. Extended Semantic Color Systems by Topic

Semantic colors must be specifically tuned for contrast and clarity against each topic's background color:

### 2.1 Quadrilaterals (`#6366f1` Indigo)
- **Background**: Indigo `#6366f1`
- **Side $a$ / Altitude $h$ / Width $w$**: **Electric Cyan (`#5ee8ff`)**
- **Side $b$ / Base $b$ / Length $l$**: **Warm Gold (`#ffd45e`)**
- **Top Base $a$ (Trapezoid) / Diagonal $d_1$**: **Neon Lilac (`#d8b4fe`)**
- **Bottom Base $b$ (Trapezoid) / Diagonal $d_2$**: **Warm Gold (`#ffd45e`)**
- **Right Angle Box ($\llcorner$)**: Crisp White (`#ffffff`) or Cyan (`#5ee8ff`)
- **Calculated Totals (Area $A$, Perimeter $P$)**: Crisp Bold White (`#ffffff`)

### 2.2 Circles (`#8b5cf6` Violet)
- **Background**: Violet `#8b5cf6`
- **Radius $r$**: **Electric Cyan (`#5ee8ff`)**
- **Diameter $d$**: **Warm Gold (`#ffd45e`)**
- **Circumference Boundary $C$ / Arc Length**: **Neon Lilac (`#d8b4fe`)**
- **Center Point**: Crisp White (`#ffffff`)
- **Constant $\pi$**: Muted White/Gold accent (`#fde047` or `#ffffff`)
- **Calculated Totals (Area $A$, Circumference $C$)**: Crisp Bold White (`#ffffff`)

### 2.3 Polygons (`#0ea5e9` Sky)
- **Background**: Sky `#0ea5e9`
- **Number of Sides $n$ / Triangulation Count**: **Neon Lilac (`#d8b4fe`)**
- **Side Length $s$ / Base Edges**: **Warm Gold (`#ffd45e`)**
- **Interior Angle ($\theta$)**: **Electric Cyan (`#5ee8ff`)**
- **Exterior Angle**: **Coral / Amber (`#fb923c`)**
- **Triangulation Partition Lines**: Subtle Dashed White (`rgba(255,255,255,0.4)`)
- **Calculated Totals (Perimeter $P$, Angle Sum)**: Crisp Bold White (`#ffffff`)

### 2.4 3D Shapes (`#f43f5e` Rose)
- **Background**: Rose `#f43f5e`
- **Length $l$**: **Warm Gold (`#ffd45e`)**
- **Width $w$ / Depth $d$**: **Neon Lilac (`#d8b4fe`)**
- **Height $h$ / Slant Height $l$**: **Electric Cyan (`#5ee8ff`)**
- **Radius $r$ (Cylinder, Cone, Sphere)**: **Electric Cyan (`#5ee8ff`)**
- **Euler Vertices $V$**: **Electric Cyan (`#5ee8ff`)**
- **Euler Edges $E$**: **Neon Lilac (`#d8b4fe`)**
- **Euler Faces $F$**: **Warm Gold (`#ffd45e`)**
- **Calculated Totals (Volume $V$, Surface Area $SA$)**: Crisp Bold White (`#ffffff`)

---

## 🔍 3. Topic-by-Topic Audit & Modernization Plans

### 3.1 Topic: Angles (Completed Reference Baseline)
- Status: **100% Up to Spec**
- Components: `InteractiveAngleExplorer`, `InteractiveAnglePair`, `InteractiveVerticalAngles`, `InteractiveParallelAngles`.
- Features: Direct ray dragging, degree angle arc morphing, pure numeric angle values, two-column proofs.

### 3.2 Topic: Triangles (Completed Reference Baseline)
- Status: **100% Up to Spec**
- Components: `InteractiveEquilateralExplorer`, `InteractiveIsoscelesExplorer`, `InteractiveScaleneExplorer`, `InteractiveAngleSumExplorer`, `InteractiveRightTriangleExplorer`, `InteractivePythagorasExplorer`, `InteractiveTriangleAreaExplorer`, `InteractiveTrianglePerimeterExplorer`.
- Features: $b \times h$ unit grid bounding box, integer handle snapping, Pythagorean square dissection animations, corner folding angle sum proof, `RevealText` target variables.

---

### 3.3 Topic: Quadrilaterals (Indigo `#6366f1`)

#### Current Issues & Gaps
1. Term cards currently fall back to static small SVGs inside `renderShapeSvg` rather than dynamic interactive explorers.
2. SVG shapes (`Rectangle`, `Parallelogram`, `Trapezoid`) use raw text labels with hardcoded `l = ...`, `w = ...` prefixes and outdated `UnknownPill` components instead of modern `RevealText` and pure numeric labels.
3. Area calculation cards lack the $b \times h$ unit grid background and lack visual proof transformations (shear/dissection).
4. Calculation card front prompts are generic ("Calculate the area") instead of explicit ("Solve for the rectangle area", "Solve for length (l)").

#### Card-by-Card Modernization Plan

| Card ID | Type | Card Name / Concept | Planned Changes & Modernization |
| :--- | :--- | :--- | :--- |
| `term-quad-parallelogram` | Term | **Parallelograms** | **Hero Banner**: `Opposite sides ∥ & equal, opposite angles equal`<br>**Subtitle**: `Consecutive angles sum to 180°`<br>**Interactive Component**: Build `InteractiveParallelogramExplorer` allowing top vertex shear drag while displaying opposite side lengths and angle arcs in matching semantic colors (Cyan/Gold). |
| `term-quad-rhombus` | Term | **Rhombuses** | **Hero Banner**: `4 equal sides, opposite angles equal`<br>**Subtitle**: `Diagonals bisect at 90°`<br>**Interactive Component**: Build `InteractiveRhombusExplorer` showing 4 equal side tick marks and draggable diagonal vertex changing angles while preserving equal side lengths. |
| `term-quad-trapezoid` | Term | **Trapezoids** | **Hero Banner**: `Exactly one pair of parallel sides`<br>**Subtitle**: `Parallel sides are called bases (a and b)`<br>**Interactive Component**: Build `InteractiveTrapezoidExplorer` with draggable top base $a$ and bottom base $b$ showing parallel arrow markers. |
| `term-quad-rect-area` | Term | **Area of a rectangle** | **Hero Banner**: `A = l · w`<br>**Subtitle**: `Area = length · width`<br>**Interactive Component**: Build `InteractiveRectangleAreaExplorer` with direct 2D corner handle drag over neutral unit grid with live unit square count. |
| `term-quad-rect-perim` | Term | **Perimeter of a rectangle** | **Hero Banner**: `P = 2(l + w)`<br>**Subtitle**: `Perimeter = 2 · length + 2 · width`<br>**Interactive Component**: Build `InteractiveRectanglePerimeterExplorer` with interactive edge unrolling/trace animation. |
| `term-quad-para-area` | Term | **Area of a parallelogram** | **Hero Banner**: `A = b · h`<br>**Subtitle**: `Area = base · perpendicular height`<br>**Interactive Component**: Build `InteractiveParallelogramAreaExplorer` with shear drag and a "Show rectangle proof" toggle cutting off the left triangle wedge and translating it to the right to form a $b \times h$ rectangle over a unit grid. |
| `term-quad-trap-area` | Term | **Area of a trapezoid** | **Hero Banner**: `A = ½(a + b)h`<br>**Subtitle**: `Area = ½ · (sum of parallel bases) · height`<br>**Interactive Component**: Build `InteractiveTrapezoidAreaExplorer` with a "Duplicate & Rotate" proof showing two congruent trapezoids forming a parallelogram of base $(a+b)$ and height $h$. |
| `calc-quad-rect-area` | Calc | **Solve for rectangle area** | **Front Prompt**: `Solve for the rectangle area`<br>**Diagram**: Replace `UnknownPill` with `RevealText` for target variable `A`. Display clean numeric dimensions `l` (Gold) and `w` (Cyan) with unit grid.<br>**Proof Table**: Two-column proof table with glossary tooltips for *Rectangle area formula*, *Substitute*, *Evaluate*. |
| `calc-quad-rect-perim` | Calc | **Solve for rectangle perimeter** | **Front Prompt**: `Solve for the rectangle perimeter`<br>**Diagram**: `RevealText` for `P`. Clean numeric side dimensions with 14px outward offsets.<br>**Proof Table**: Two-column proof with glossary for *Rectangle perimeter formula*. |
| `calc-quad-para-area` | Calc | **Solve for parallelogram area** | **Front Prompt**: `Solve for the parallelogram area`<br>**Diagram**: Dashed Cyan altitude line ($h$) with right-angle box ($\llcorner$), Gold baseline ($b$), `RevealText` for `A`.<br>**Proof Table**: Parallelogram area formula proof. |
| `calc-quad-trap-area` | Calc | **Solve for trapezoid area** | **Front Prompt**: `Solve for the trapezoid area`<br>**Diagram**: Top base $a$ (Lilac), bottom base $b$ (Gold), altitude $h$ (Cyan), `RevealText` for `A`.<br>**Proof Table**: Stacked fraction `½(a + b)h` with *Trapezoid area formula*. |
| `calc-quad-rect-reverse` | Calc | **Solve for length (l)** | **Front Prompt**: `Solve for length (l)`<br>**Diagram**: Given Area $A$ (White) in center, width $w$ (Cyan), `RevealText` for target unknown $l$ (Gold).<br>**Proof Table**: *Isolate length (l)*, *Divide both sides by width (w)*. |

---

### 3.4 Topic: Circles (Violet `#8b5cf6`)

#### Current Issues & Gaps
1. `Circle` SVG shape uses small font sizes (`size={11}`) with redundant text labels (`radius (r) = 4`, `circumference (C) = 6π`) and lacks the 17px bold `RevealText` system.
2. Term cards are static drawings rather than dynamic interactive tools.
3. No visual proof explaining *why* Circle Area is $\pi r^2$ (e.g. radial sector rearrangement into a parallelogram) or *why* Circumference is $2\pi r$ (linear roll-out).
4. Calculation cards lack semantic color matching across radius (Cyan), diameter (Gold), and circumference (Lilac).

#### Card-by-Card Modernization Plan

| Card ID | Type | Card Name / Concept | Planned Changes & Modernization |
| :--- | :--- | :--- | :--- |
| `term-circle-circumference` | Term | **Circumference of a circle** | **Hero Banner**: `C = 2πr`<br>**Subtitle**: `Circumference = 2 · π · radius (or π · d)`<br>**Interactive Component**: Build `InteractiveCircleCircumferenceExplorer` with draggable radius handle and an "Unroll perimeter" button that rolls the circle boundary out into a straight line of length $2\pi r \approx 6.28 r$. |
| `term-circle-area` | Term | **Area of a circle** | **Hero Banner**: `A = πr²`<br>**Subtitle**: `Area = π · radius²`<br>**Interactive Component**: Build `InteractiveCircleAreaExplorer` with dynamic radius resize and a "Slice & Rearrange" proof button slicing the circle into 8/16 alternating wedge sectors to form an equivalent parallelogram of base $\pi r$ and height $r$. |
| `term-circle-pi` | Term | **π (pi)** | **Hero Banner**: `π = C ÷ d ≈ 3.14159…`<br>**Subtitle**: `The ratio of circumference to diameter for any circle`<br>**Interactive Component**: Build `InteractivePiExplorer` with a circle rolling along a diameter scale showing it travels exactly $3.14\times$ its diameter in one complete turn. |
| `term-circle-radius` | Term | **The radius** | **Hero Banner**: `r = distance from centre to edge`<br>**Subtitle**: `Half of the diameter (r = d ÷ 2)`<br>**Interactive Component**: Build `InteractiveRadiusExplorer` with a 360° rotating radius arm demonstrating constant distance in all directions. |
| `term-circle-diameter` | Term | **The diameter** | **Hero Banner**: `d = 2r`<br>**Subtitle**: `Straight line through the centre from edge to edge`<br>**Interactive Component**: Build `InteractiveDiameterExplorer` showing two collinear radius segments ($r + r = 2r$) rotating through center. |
| `calc-circle-circ` | Calc | **Solve for circumference (C)** | **Front Prompt**: `Solve for circumference (C)`<br>**Diagram**: Crisp circle with center dot, dashed Cyan radius line with numeric value ($r=4$), Lilac boundary with `RevealText` for unknown $C$.<br>**Proof Table**: Two-column proof: $C = 2\pi r \rightarrow C = 2\pi(4) \rightarrow C = 8\pi$. |
| `calc-circle-area` | Calc | **Solve for circle area** | **Front Prompt**: `Solve for the circle area`<br>**Diagram**: Cyan radius line ($r=5$), soft white interior fill, `RevealText` in center for unknown $A$.<br>**Proof Table**: $A = \pi r^2 \rightarrow A = \pi(5^2) \rightarrow A = 25\pi$. |
| `calc-circle-r-from-c` | Calc | **Solve for radius (r) from Circumference** | **Front Prompt**: `Solve for radius (r)`<br>**Diagram**: Boundary labeled $C = 6\pi$, Cyan radius line with `RevealText` for unknown $r$.<br>**Proof Table**: $C = 2\pi r \rightarrow 6\pi = 2\pi r \rightarrow r = 6\pi \div 2\pi \rightarrow r = 3$. |
| `calc-circle-r-from-a` | Calc | **Solve for radius (r) from Area** | **Front Prompt**: `Solve for radius (r)`<br>**Diagram**: Interior labeled $A = 9\pi$, Cyan radius line with `RevealText` for unknown $r$.<br>**Proof Table**: $A = \pi r^2 \rightarrow 9\pi = \pi r^2 \rightarrow r^2 = 9 \rightarrow r = \sqrt{9} = 3$. |

---

### 3.5 Topic: Polygons (Sky `#0ea5e9`)

#### Current Issues & Gaps
1. `Polygon` SVG shape is hardcoded with basic coordinate math and uses `UnknownPill` on top vertex.
2. Term cards are static and do not visually explain *why* the angle sum is $(n-2)\times 180^\circ$ (triangulation from one vertex).
3. No exterior angle card in the test catalogue (even though generator has one).
4. Calculation cards lack step-by-step bracket simplification and side-by-side angle highlight states.

#### Card-by-Card Modernization Plan

| Card ID | Type | Card Name / Concept | Planned Changes & Modernization |
| :--- | :--- | :--- | :--- |
| `term-poly-regular` | Term | **Regular polygons** | **Hero Banner**: `All sides equal, all interior angles equal`<br>**Subtitle**: `Equal side lengths and equal corner angles`<br>**Interactive Component**: Build `InteractiveRegularPolygonExplorer` with a side-count stepper ($n=3 \dots 8$) updating polygon shape, angle arcs, and congruence tick marks. |
| `term-poly-interior-sum` | Term | **Polygon interior angle sum** | **Hero Banner**: `Sum = (n − 2) · 180°`<br>**Subtitle**: `(number of sides − 2) · 180°`<br>**Interactive Component**: Build `InteractivePolygonTriangulationExplorer` with side count slider ($n=3 \dots 8$) showing dashed diagonal lines drawn from a single vertex, visually splitting the $n$-gon into exactly $(n-2)$ triangles each containing $180^\circ$. |
| `term-poly-perim` | Term | **Perimeter of a regular polygon** | **Hero Banner**: `P = n · s`<br>**Subtitle**: `Perimeter = number of sides · side length`<br>**Interactive Component**: Build `InteractivePolygonPerimeterExplorer` with polygon unrolling into $n$ equal segments along a straight ruler. |
| `term-poly-each-angle` | Term | **Regular polygon interior angle** | **Hero Banner**: `Each = (n − 2) · 180° ÷ n`<br>**Subtitle**: `Total angle sum divided equally among all n corners`<br>**Interactive Component**: Build `InteractivePolygonAngleExplorer` highlighting one corner angle and showing calculation from total sum. |
| `term-poly-exterior-sum` | Term | **Exterior angles of a polygon** | **Hero Banner**: `Exterior angles always sum to 360°`<br>**Subtitle**: `One full turn (360°) around any convex polygon`<br>**Interactive Component**: Build `InteractiveExteriorAngleExplorer` showing extended rays and shrinking the polygon to a point to prove exterior angles form a complete $360^\circ$ circle. |
| `calc-poly-perimeter` | Calc | **Solve for polygon perimeter** | **Front Prompt**: `Solve for the polygon perimeter`<br>**Diagram**: Regular hexagon/octagon with Gold side length $s$, `RevealText` for $P$.<br>**Proof Table**: Two-column proof: $P = n \cdot s \rightarrow P = 6 \cdot 8 \rightarrow P = 48$. |
| `calc-poly-angle-sum` | Calc | **Solve for interior angle sum** | **Front Prompt**: `Solve for the interior angle sum`<br>**Diagram**: 7-sided heptagon with `n = 7` (Lilac), `RevealText` for `Sum`.<br>**Proof Table**: Two-column proof: $\text{Sum} = (n-2)\cdot 180^\circ \rightarrow (7-2)\cdot 180^\circ \rightarrow 5 \cdot 180^\circ \rightarrow 900^\circ$. |
| `calc-poly-each-angle-hex` | Calc | **Solve for each interior angle (Hexagon)** | **Front Prompt**: `Solve for each interior angle`<br>**Diagram**: Regular hexagon ($n=6$), one Cyan angle arc with `RevealText` for `Each`.<br>**Proof Table**: Step 1: $\text{Sum} = (6-2)\cdot 180^\circ = 720^\circ$. Step 2: $\text{Each} = 720^\circ \div 6 = 120^\circ$. |
| `calc-poly-each-angle-oct` | Calc | **Solve for each interior angle (Octagon)** | **Front Prompt**: `Solve for each interior angle`<br>**Diagram**: Regular octagon ($n=8$), one Cyan angle arc with `RevealText` for `Each`.<br>**Proof Table**: Step 1: $\text{Sum} = 1080^\circ$. Step 2: $\text{Each} = 1080^\circ \div 8 = 135^\circ$. |

---

### 3.6 Topic: 3D Shapes (Rose `#f43f5e`)

#### Current Issues & Gaps
1. 3D shapes (`Prism`, `Cylinder`, `Cone`, `Sphere`) currently use static 2D vector projections with hardcoded label offsets.
2. Term cards lack physical interaction (e.g. 3D net unfolding, layer-stacking volume proofs, or vertex/edge counting).
3. Sphere surface area and volume cards have static SVG drawings and lack clear visual intuition for $\frac{4}{3}\pi r^3$ and $4\pi r^2$.
4. Euler's formula card ($V - E + F = 2$) is static and does not let learners count or highlight faces, edges, and vertices interactively.

#### Card-by-Card Modernization Plan

| Card ID | Type | Card Name / Concept | Planned Changes & Modernization |
| :--- | :--- | :--- | :--- |
| `term-3d-face` | Term | **A face** | **Hero Banner**: `Face = flat surface of a 3D shape`<br>**Subtitle**: `A cube has 6 congruent square faces`<br>**Interactive Component**: Build `Interactive3DElementExplorer` with toggle between Face, Edge, and Vertex, highlighting all 6 faces in translucent Gold with interactive rotation/expansion. |
| `term-3d-edge` | Term | **An edge** | **Hero Banner**: `Edge = line segment where two faces meet`<br>**Subtitle**: `A cube has 12 straight edges`<br>**Interactive Component**: Highlight all 12 edges in bold Lilac lines with count badges. |
| `term-3d-vertex` | Term | **A vertex** | **Hero Banner**: `Vertex = corner point where edges meet`<br>**Subtitle**: `A cube has 8 corner vertices`<br>**Interactive Component**: Highlight all 8 vertices in glowing Cyan spheres. |
| `term-3d-euler` | Term | **Euler's formula** | **Hero Banner**: `V − E + F = 2`<br>**Subtitle**: `Vertices − Edges + Faces = 2 (for any convex polyhedron)`<br>**Interactive Component**: Build `InteractiveEulerExplorer` with tabs for Cube ($8-12+6=2$), Triangular Prism ($6-9+5=2$), and Square Pyramid ($5-8+5=2$) with live interactive element counters. |
| `term-3d-prism-vol` | Term | **Volume of a rectangular prism** | **Hero Banner**: `V = l · w · h`<br>**Subtitle**: `Volume = length · width · height`<br>**Interactive Component**: Build `InteractivePrismVolumeExplorer` showing a 3D grid of unit cubes filling layer by layer: base layer has $l \times w$ cubes, stacked $h$ layers high. |
| `term-3d-cyl-vol` | Term | **Volume of a cylinder** | **Hero Banner**: `V = πr²h`<br>**Subtitle**: `Volume = (base area) · height = π · radius² · height`<br>**Interactive Component**: Build `InteractiveCylinderVolumeExplorer` showing circular disk slices of area $\pi r^2$ stacking upward to height $h$. |
| `term-3d-cone-vol` | Term | **Volume of a cone** | **Hero Banner**: `V = ⅓πr²h`<br>**Subtitle**: `Volume = ⅓ · (cylinder volume)`<br>**Interactive Component**: Build `InteractiveConeVolumeExplorer` with liquid fill animation showing exactly 3 full cones fill 1 cylinder of the same radius and height. |
| `term-3d-sphere-vol` | Term | **Volume of a sphere** | **Hero Banner**: `V = ⁴⁄₃πr³`<br>**Subtitle**: `Volume = ⁴⁄₃ · π · radius³`<br>**Interactive Component**: Build `InteractiveSphereVolumeExplorer` showing sphere cross-section and Archimedes ratio relation. |
| `term-3d-sphere-sa` | Term | **Surface area of a sphere** | **Hero Banner**: `SA = 4πr²`<br>**Subtitle**: `Surface area = 4 · (area of great circle)`<br>**Interactive Component**: Build `InteractiveSphereSurfaceAreaExplorer` showing 4 flat circles of radius $r$ wrapping to perfectly cover the sphere's surface. |
| `calc-3d-prism` | Calc | **Solve for prism volume** | **Front Prompt**: `Solve for the prism volume`<br>**Diagram**: Isometric prism with length $l$ (Gold), width $w$ (Lilac), height $h$ (Cyan), `RevealText` for unknown $V$.<br>**Proof Table**: $V = l \cdot w \cdot h \rightarrow V = 4 \cdot 3 \cdot 2 \rightarrow V = 24$. |
| `calc-3d-cylinder` | Calc | **Solve for cylinder volume** | **Front Prompt**: `Solve for the cylinder volume`<br>**Diagram**: Cylinder with Cyan radius ($r=3$), Cyan height ($h=4$), `RevealText` for unknown $V$.<br>**Proof Table**: $V = \pi r^2 h \rightarrow V = \pi(3^2)(4) \rightarrow V = 36\pi$. |
| `calc-3d-euler` | Calc | **Solve for vertices (V) using Euler's formula** | **Front Prompt**: `Solve for vertices (V)`<br>**Diagram**: Polyhedron diagram with given Edges $E=12$ (Lilac), Faces $F=6$ (Gold), `RevealText` for unknown $V$ (Cyan).<br>**Proof Table**: $V - E + F = 2 \rightarrow V - 12 + 6 = 2 \rightarrow V - 6 = 2 \rightarrow V = 8$. |

---

## 🛠️ 4. New Interactive Explorers & Visual Proof Paradigms

To replace static SVGs on term cards, we will create modular, performant interactive explorer components in `apps/geometry-deck/src/components/`:

### Quadrilaterals Explorers
1. **`InteractiveParallelogramAreaExplorer`**:
   - Visualizes unit grid bounding box ($b \times h$).
   - Drag handle to adjust shear angle or height.
   - "Show Rectangle Proof" action button: slices the triangular overhang on the left and animates it smoothly sliding across to fill the right gap, proving Area $= b \times h$.
2. **`InteractiveTrapezoidAreaExplorer`**:
   - Shows trapezoid with top base $a$, bottom base $b$, and altitude $h$.
   - "Show Parallelogram Proof" button: duplicates the trapezoid, rotates it $180^\circ$, and docks it against the original to form a single large parallelogram of base $(a+b)$ and height $h$.

### Circle Explorers
3. **`InteractiveCircleAreaExplorer`**:
   - Visualizes circle with draggable radius handle $r$.
   - "Sector Rearrangement Proof" button: splits circle into 8 or 16 alternating sectors that open up and interlock to form a rectangular parallelogram with height $r$ and base $\pi r$, yielding Area $= \pi r^2$.
4. **`InteractiveCircleCircumferenceExplorer`**:
   - Visualizes a circular wheel rolling along a straight line ruler to physically demonstrate that one rotation equals $2\pi r$.

### Polygon Explorers
5. **`InteractivePolygonTriangulationExplorer`**:
   - Renders a regular or irregular $n$-gon with an interactive stepper for $n \in [3, 8]$.
   - Draws dashed triangulation diagonals from Vertex 1 to all non-adjacent vertices, coloring each of the $(n-2)$ internal triangles with alternating soft tints and displaying $(n-2) \times 180^\circ$.
6. **`InteractiveExteriorAngleExplorer`**:
   - Renders polygon with extended directional ray lines at each vertex.
   - Stepper / "Shrink shape" slider collapses the perimeter edges down to a central point, showing all exterior angle arcs coalescing into a complete $360^\circ$ circle.

### 3D Explorers
7. **`InteractiveEulerExplorer`**:
   - Features 3D polyhedron wireframe models (Cube, Triangular Prism, Octahedron, Square Pyramid).
   - Interactive toggle pills for **Faces ($F$)**, **Edges ($E$)**, and **Vertices ($V$)** that highlight the selected elements with bright colors and increment live counters in Euler's formula $V - E + F = 2$.
8. **`InteractivePrismVolumeExplorer`**:
   - Visualizes 3D isometric box with layer-by-layer unit cube stacking.
   - Sliders or direct step pills for Length $l$, Width $w$, and Height $h$.
9. **`InteractiveConeVolumeExplorer`**:
   - Demonstrates the $\frac{1}{3}$ relationship between cone and cylinder via visual liquid fill transfer.

---

## 📝 5. Calculation Cards: Front Prompts, Diagram RevealText & Two-Column Proofs

All calculation cards across Topics 3–6 will be updated to follow the exact pattern established in Angles and Triangles:

### 5.1 Explicit Target Variable Prompts
Update all `frontPrompt` strings to explicitly reference the specific target letter or measurement:
- ❌ *"Calculate the area"* $\rightarrow$ ✅ *"Solve for the rectangle area"* / *"Solve for the circle area"*
- ❌ *"Calculate the perimeter"* $\rightarrow$ ✅ *"Solve for the polygon perimeter"*
- ❌ *"Calculate the volume"* $\rightarrow$ ✅ *"Solve for the prism volume"* / *"Solve for the cylinder volume"*
- ❌ *"Find the length"* $\rightarrow$ ✅ *"Solve for length (l)"*
- ❌ *"Find the radius"* $\rightarrow$ ✅ *"Solve for radius (r)"*

### 5.2 Dynamic `RevealText` in All Shape SVG Components
Replace legacy `UnknownPill` inside `Rectangle`, `Parallelogram`, `Trapezoid`, `Circle`, `Polygon`, `Prism`, and `Cylinder` with `RevealText`:
- **Unrevealed state**: Prominent variable letter (17px, font-weight 900, matching target semantic color).
- **Revealed state**: Smooth 0.35s fade/scale into the calculated numeric value (e.g. `28`, `8π`, `48`, `24`).

### 5.3 Two-Column Proof Tables & Morphing Equation Tokens
Every calculation card's `backSteps` will define structured `equationTokens` and precise pedagogical `reason` strings compatible with the two-column proof table and `ProofReasonTooltip`.

---

## 📚 6. Math Glossary & Typographic Refinements

### 6.1 Math Glossary Additions (`src/lib/math-glossary.ts`)
Add entries for all new justification reasons introduced in Topics 3–6:
- `rectangle area`: "Multiply length (l) by width (w) to find the enclosed rectangular area. Formula: $A = l \times w$."
- `rectangle perimeter`: "Add the lengths of all four sides or compute $2(l + w)$ for the total outer boundary."
- `parallelogram area`: "Multiply the base (b) by the perpendicular vertical height (h). Formula: $A = b \times h$."
- `trapezoid area`: "Average the two parallel bases $(a + b)/2$ and multiply by the height (h). Formula: $A = ½(a + b)h$."
- `circle area`: "Multiply $\pi$ by the square of the radius ($r^2$). Formula: $A = \pi r^2$."
- `circumference`: "The linear boundary distance around a circle. Formula: $C = 2\pi r$ (or $C = \pi d$)."
- `polygon angle sum`: "Split the $n$-sided polygon into $(n-2)$ internal triangles from one vertex. Formula: $\text{Sum} = (n-2) \times 180^\circ$."
- `regular polygon angle`: "Divide the total interior angle sum equally among all $n$ corners. Formula: $\text{Each} = (n-2)\times 180^\circ \div n$."
- `regular polygon perimeter`: "Multiply the number of equal sides ($n$) by the side length ($s$). Formula: $P = n \times s$."
- `prism volume`: "Multiply the 2D base area ($l \times w$) by the 3D height ($h$). Formula: $V = l \times w \times h$."
- `cylinder volume`: "Multiply the circular base area ($\pi r^2$) by the vertical height ($h$). Formula: $V = \pi r^2 h$."
- `cone volume`: "A cone holds exactly one-third the volume of a cylinder with the same base and height. Formula: $V = ⅓\pi r^2 h$."
- `sphere volume`: "The volume of a sphere of radius $r$. Formula: $V = ⁴⁄₃\pi r^3$."
- `sphere surface area`: "The total outer surface area of a sphere equals four great circles. Formula: $SA = 4\pi r^2$."
- `euler formula`: "For any convex 3D polyhedron: Vertices minus Edges plus Faces always equals 2. Formula: $V - E + F = 2$."

### 6.2 Keyword Color Matching (`FormattedMathText`)
Expand `COLOR_KEYWORDS` in `src/components/ui/formatted-math-text.tsx` to automatically color-code:
- `length (l)`, `length`, `l` $\rightarrow$ Gold (`#ffd45e`)
- `width (w)`, `width`, `w` $\rightarrow$ Cyan (`#5ee8ff`)
- `radius (r)`, `radius`, `r` $\rightarrow$ Cyan (`#5ee8ff`)
- `diameter (d)`, `diameter`, `d` $\rightarrow$ Gold (`#ffd45e`)
- `circumference (C)` $\rightarrow$ Neon Lilac (`#d8b4fe`)
- `V − E + F = 2` $\rightarrow$ Vertices (Cyan), Edges (Lilac), Faces (Gold)
- `(n − 2) × 180°` $\rightarrow$ $n$ (Neon Lilac)

---

## 🚀 7. Implementation Milestones & Execution Order

We will execute this modernization in sequential, atomic topic milestones:

```
┌──────────────────────────────────────────────────────────────────┐
│ Phase 1: Quadrilaterals Topic Modernization                     │
│ ├─ Update SVG primitives & RevealText for Rectangle, Para, Trap │
│ ├─ Build Interactive Parallelogram & Trapezoid Area Explorers    │
│ ├─ Update Quadrilateral Term & Calc Card definitions             │
│ └─ Verify typecheck, tests & visual fidelity                     │
├──────────────────────────────────────────────────────────────────┤
│ Phase 2: Circles Topic Modernization                             │
│ ├─ Update Circle SVG & RevealText for r, d, C, A                 │
│ ├─ Build Interactive Circle Area & Circumference Explorers       │
│ ├─ Update Circle Term & Calc Card definitions                    │
│ └─ Verify typecheck, tests & visual fidelity                     │
├──────────────────────────────────────────────────────────────────┤
│ Phase 3: Polygons Topic Modernization                            │
│ ├─ Update Polygon SVG & RevealText for n, s, Sum, Each           │
│ ├─ Build Interactive Triangulation & Exterior Angle Explorers    │
│ ├─ Update Polygon Term & Calc Card definitions                   │
│ └─ Verify typecheck, tests & visual fidelity                     │
├──────────────────────────────────────────────────────────────────┤
│ Phase 4: 3D Shapes Topic Modernization                           │
│ ├─ Update 3D SVG shapes (Prism, Cylinder, Cone, Sphere)          │
│ ├─ Build Interactive Euler & Volume Explorers                    │
│ ├─ Update 3D Term & Calc Card definitions                        │
│ └─ Verify typecheck, tests & visual fidelity                     │
├──────────────────────────────────────────────────────────────────┤
│ Phase 5: Final Deck Polish & Test Suite Verification             │
│ ├─ Math glossary entries & keyword token styling complete        │
│ ├─ Playwright test card catalogue parity check                   │
│ └─ Run pnpm -r typecheck & pnpm -r test                          │
└──────────────────────────────────────────────────────────────────┘
```

This plan guarantees every card in the deck meets the gold standard set by the Angles and Triangles cards, providing a consistent, intuitive, and pedagogical learning experience.
