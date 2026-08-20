// ── Topic & Card taxonomy ─────────────────────────────────────────────────────

export type TopicType =
  | "angles"
  | "triangles"
  | "quadrilaterals"
  | "circles"
  | "polygons"
  | "3d-shapes";

export type CardType = "term" | "calculation";

/** Sub-variant within a CardType */
export type CardVariant =
  | "definition"        // term / formula card: "X are…?" / "X is…?"
  | "compute"           // calculation card: numeric SVG → number
  | "reverse"           // calculation card: given answer, find dimension
  | "true-false";       // quiz only

// ── SVG descriptor ────────────────────────────────────────────────────────────

export type SvgShape =
  | "angle-single"          // single angle arc with one ray
  | "angle-supplementary"   // straight line split into A + B
  | "angle-complementary"   // right-angle box split into A + B
  | "angle-vertically-opposite" // two intersecting lines
  | "angle-reflex"          // reflex arc (> 180°)
  | "angle-parallel-alternate"   // Z-angle
  | "angle-parallel-cointerior"  // C-angle
  | "triangle"
  | "right-triangle"
  | "rectangle"
  | "parallelogram"
  | "trapezoid"
  | "rhombus"
  | "circle"
  | "polygon"
  | "prism"
  | "cylinder"
  | "cone"
  | "sphere"
  | "pyramid";

export type ShapeDims = Record<string, number | string | boolean | undefined>;

export type SvgDescriptor = {
  shape: SvgShape;
  /** Named dimensions — variables use strings ("b", "h"), numbers use number, flags use boolean */
  dimensions: ShapeDims;
  /** Whether to render variable labels (formula card) or numeric labels (calculation) */
  labelMode: "variable" | "numeric";
  /** Which dimension label to mark with "?" (for calculation cards) */
  unknownDimension?: string;
};

// ── Animation steps ──────────────────────────────────────────────────────────

/**
 * A single slot in a structured equation display.
 * Tokens with the same `id` across adjacent steps morph in place;
 * tokens with different ids trigger a whole-equation crossfade.
 */
export type EquationToken = {
  /** Stable key — same id across steps = this slot animates to the new value */
  id: string;
  /** Text to render in this slot */
  value: string;
  /** Operators and equals signs render dimmer */
  dim?: boolean;
  /** Optional semantic text color (e.g. #5ee8ff, #ffd45e, #fb923c) */
  color?: string;
};

export type SvgMutation = {
  /** Highlight a specific dimension label (e.g. "h") */
  highlightDimension?: string;
  /** Trigger interior color fill animation */
  fillInterior?: boolean;
  /** Draw a stroke trace around the perimeter, circumference, or hypotenuse */
  traceStroke?: "perimeter" | "circumference" | "hypotenuse";
  /** Draw an arc for an angle (used for angle cards — key is the angle name e.g. "B") */
  drawAngleArc?: string;
  /** For 3D: which edge to draw */
  drawEdge?: string;
  /** Reveal the numeric answer on the unknown pill */
  revealAnswer?: number | string;
};

export type AnimationStep = {
  /**
   * Structured equation tokens for morphing display.
   * Tokens with the same id morph in place; different ids trigger a crossfade.
   */
  equationTokens?: EquationToken[];
  /** Plain-text fallback shown when equationTokens is absent */
  formulaLine?: string;
  /**
   * Right-column justification in the proof layout.
   * e.g. "Pythagorean theorem", "Substitute r = 4", "Divide both sides by \u03c0"
   */
  reason?: string;
  /** Optional SVG state mutation at this step */
  svgMutation?: SvgMutation;
  /** Text spoken aloud at this step */
  speechText?: string;
};

// ── Card ─────────────────────────────────────────────────────────────────────

export type GeometryCard = {
  id: string;
  topic: TopicType;
  cardType: CardType;
  variant: CardVariant;

  // Front face
  /** Term cards: the term text e.g. "Supplementary angles" */
  frontLabel?: string;
  /** Term cards: the predicate e.g. "are…?" / calculation cards: prompt */
  frontPrompt?: string;
  /** Optional updated prompt text displayed upon card reveal */
  revealedPrompt?: string;
  /** Formula + calculation cards: shape diagram on the front */
  frontSvg?: SvgDescriptor;
  frontSpeechText: string;

  // Back face (revealed on flip)
  /** Term cards: the definition text */
  backDefinition?: string;
  /** Optional subtitle explaining the definition in words/expanded format */
  backDefinitionSubtitle?: string;
  /** Formula/calculation cards: primary formula line (shown immediately on flip) */
  backFormula?: string;
  /** Term cards: one or more SVG examples shown on the back */
  backSvgExamples?: SvgDescriptor[];
  /** Formula/calculation: animated step-by-step working */
  backSteps?: AnimationStep[];
  backSpeechText: string;

  // Quiz & diagram reveal
  /** Numeric answer (for keypad quiz) */
  numericAnswer?: number;
  /** Formatted string or numeric answer for diagram reveal upon card flip (e.g. "√65") */
  revealAnswer?: string | number;
  /** Multiple-choice distractors (for formula quiz) */
  distractors?: string[];

  /** Hex color string from TOPIC_COLORS */
  color: string;
};

// ── Settings ─────────────────────────────────────────────────────────────────

export type MeasurementUnit = "none" | "cm" | "m" | "in";

