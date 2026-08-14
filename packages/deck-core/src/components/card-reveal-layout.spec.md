# Flash Card Reveal & Dynamic Equal-Padding Layout Specification

## 1. Overview & Objectives

The EduDecks flash card system provides a unified, responsive card shell (`FlashCardShell`) and automated layout engine (`CardRevealLayout`) shared across all learning applications (`arithmetic-deck`, `reading-deck`, `geometry-deck`).

The goal of this layout engine is to automatically position card content, manage reveal transitions, enforce balanced vertical spacing, and handle dynamic content height changes **without requiring consuming apps or deck cards to manually compute pixel offsets or manage height flags**.

### Design Principles

1. **Consumer Transparency**: Consuming apps pass `promptContent` and `revealContent` as opaque React nodes. They never manage layout coordinates, insets, or expansion. Content may use CSS transitions (font-size changes, `max-height` collapses, opacity fades) freely — the engine handles it.
2. **Measurement Correctness**: Positions are always calculated from the **final** post-transition content heights, not mid-transition values, ensuring one smooth animation with no two-step corrections.
3. **No Feedback Loops**: Height expansion calculations use a stored baseline, never reading back the expanded height.
4. **Dynamic Insets**: Corner button safe zones are computed from actually-present corner slots, not hardcoded. Cards without corner buttons use the full card height.

---

## 2. Card Architecture & Elements

A flash card consists of three distinct visual layers:

1. **Card Container Shell (`FlashCardShell`)**: The outer rounded card container (`rounded-3xl`) with backdrop blur, shadow, theme colors, and smooth 500ms CSS height transition.
2. **Corner Action Controls**: Absolute utility buttons pinned to the card corners with `1rem` (16px) margin and standard 48px button touch targets:
   - **Top-Left**: Navigation / Tracing / Pushpin toggle buttons.
   - **Top-Right**: Audio speaker / Star / Settings buttons.
   - **Bottom-Left**: Voice recording mic / Trash buttons.
   - **Bottom-Right**: Audio playback / Action buttons.
3. **Card Reveal Engine (`CardRevealLayout`)**:
   - **Prompt Content (`primary`)**: Always-visible learning stimulus (equation, letter glyph, geometry term label).
   - **Reveal Content (`detail`)**: Answer or multi-step breakdown revealed on click.

---

## 3. Core Layout & Spacing Rules

### 3.1 Dynamic Corner Icon Insets

Corner button insets are **computed by `FlashCardShell`** based on which corner slots actually have content:

- **Corner Inset Value**: $64\text{px}$ ($1\text{rem}$ / 16px edge padding + 48px button target) — applied only when a corner has a button.
- **`topInset`**: $64\text{px}$ if any top corner has content (`topLeft`, `topRight`, or top-right speaker), else $0$.
- **`bottomInset`**: $64\text{px}$ if any bottom corner has content (`bottomLeft`, `bottomRight`, or bottom-right speaker), else $0$.
- **Available Base Height ($H_{available}$)**:
  $$H_{available} = H_{base} - \text{topInset} - \text{bottomInset}$$

> **Why dynamic?** Hardcoded $128\text{px}$ insets wasted ~30% of card height on cards without corner buttons, triggering unnecessary height expansion.

---

### 3.2 Unrevealed State (Prompt Only)
- When `isRevealed` is `false`, the reveal content is hidden below the card (`top-full`, `opacity: 0`).
- Prompt content (`primary`) is **vertically centered within the full card height** (corner insets are ignored for centering — they only apply to the revealed layout):
  $$\text{unrevealedTop} = \left\lfloor\frac{H_{base} - h_{prompt}}{2}\right\rfloor$$
- **Why no insets for centering?** The prompt is typically compact and centered — it won't overlap with corner buttons. Applying insets shifts the prompt visually below center by $\text{topInset}/2$ pixels, which looks unbalanced.

---

### 3.3 Revealed State — Fits Baseline Card Height
- When `isRevealed` becomes `true` and the combined height of prompt + reveal content fits within the card:
  - **Prompt** sits flush at the top inset (right below any corner buttons):
    $$\text{promptTop} = \text{topInset}$$
  - **Reveal** sits flush at the bottom inset (right above any corner buttons):
    $$\text{revealTop} = H_{base} - \text{bottomInset} - h_{reveal}$$
  - The **gap** between prompt and reveal is whatever space remains. No minimum gap is enforced — content provides its own visual spacing via internal padding.
  - **Card Height**: Remains at standard un-expanded baseline height ($H_{base}$).

---

### 3.4 Revealed State — Dynamic Height Expansion
- When `isRevealed` is `true` and prompt + reveal content exceeds the space between insets (gap $< 0$):
  - **Required Card Container Height ($H_{req}$)** is automatically requested:
    $$H_{req} = \text{topInset} + h_{prompt} + h_{reveal} + \text{bottomInset}$$
  - The outer card shell container (`FlashCardShell`) smoothly expands its CSS height to $H_{req}$ in a single 500ms motion.
- **Dynamic Content Monitoring**: `CardRevealLayout` attaches `ResizeObserver` to both the prompt container (`primaryEl`) and reveal container (`detailEl`). Observer callbacks are suppressed during the 600ms transition grace period and debounced via `requestAnimationFrame` to avoid mid-transition noise.

---

## 4. Technical Constraints & Stability Guarantees

### 4.1 No Layout Loop / Feedback Cycles
- `CardRevealLayout` records the un-expanded baseline height ($H_{base}$) from its own container (`absolute inset-0`) before expansion, preventing expanded inline heights from corrupting subsequent padding calculations.
- The layout container uses `absolute inset-0` to span the shell's padding box, giving direct access to the outer card height without `parentElement` traversal.

### 4.2 Clone-Based Final-Size Measurement
- **Problem**: Content inside `primary` or `detail` may have CSS transitions that change its layout height on reveal (e.g., font-size shrink, `max-height` collapse). Measuring `offsetHeight` directly returns the **pre-transition** value, causing positions to be calculated from stale sizes and then corrected after the transition settles — producing a visible two-step position jump.
- **Solution**: When `isRevealed` changes, the engine **clones** each content element, disables all transitions on the clone (`transition: none` on the clone and all descendants), inserts the clone into the same parent (inheriting the same CSS context), measures `offsetHeight`, then removes the clone. The original element's transitions are untouched and play normally.
- **Guarantee**: Consuming apps can freely use `transition-all`, `max-h-0`, font-size changes, `scale()`, or any other CSS transitions inside their `promptContent` / `revealContent` — the layout engine will always calculate positions from the **final** post-transition heights.

### 4.3 No Animation Flickering
- `ResizeObserver` monitors only the `primaryEl` and `detailEl` content wrappers, **never** the transitioning card shell.
- Observer callbacks are suppressed for 600ms after `isRevealed` changes (grace period covering the 500ms CSS transition) and debounced via `requestAnimationFrame`.

### 4.4 Card Shell Height Transition
- `FlashCardShell`'s outer container uses `transition-[height]`, **not** `transition-all`.
  - **Why**: `transition-all` causes `max-height` to transition between a length and `none` (non-interpolable), producing a momentary uncapped height.
- The card height CSS uses a **single computed value**: `h-[min(55vw,420px,68svh)]` instead of separate `h-[55vw]` + `max-h-[min(420px,68svh)]`.
  - **Why**: When `h-[55vw]` resolved to (e.g.) 808px but was visually capped at 419px by `max-height`, applying an inline `height: 514px` would transition FROM 808px (the computed `height` property value), not from 419px (the rendered value). Using a single `min()` expression ensures the computed value IS the rendered value.

### 4.5 Content Measurement Precision
- Content height is measured using `offsetHeight` (rendered box size), **not** `scrollHeight` (which includes overflow content and can produce inflated values).
- Primary and detail wrappers use targeted CSS property transitions (`transition-[top,transform,opacity]`) rather than `transition-all`.
- Debug badges use `position: absolute` so they do not affect `offsetHeight` measurements.

### 4.6 Corner Slot Separation
- Corner action buttons must be passed to `FlashCardShell`'s dedicated corner props (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`) so intrinsic content measurements reflect only the actual prompt concept payload.
- Content that appears only on reveal (conversion pills, answer text) should either be conditionally rendered (`{isRevealed && ...}`) or use layout-preserving transitions (opacity, transforms). Avoid rendering hidden content inside `promptContent` that inflates `primaryH` when unrevealed.

---

## 5. Developer Debug Overlay

When `showDebugOutlines` is enabled (or automatically when running in local dev / `-dev.` staging environments via `isDevSite()`):
- **Prompt Container**: Rendered with a cyan dashed outline (`outline-cyan-400/80`) and a `PROMPT CONTAINER` badge.
- **Reveal Container**: Rendered with an emerald dashed outline (`outline-emerald-400/80`) and a `REVEAL CONTAINER` badge.
- Debug overlay state is deferred to the client via `useState`/`useEffect` to prevent SSR hydration mismatches (`isDevSite()` reads `window.location`, which is unavailable on the server).
