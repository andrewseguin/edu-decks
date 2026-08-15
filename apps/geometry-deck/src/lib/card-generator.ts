import type { GeometryCard, TopicType, CardType, AnimationStep, SvgDescriptor, EquationToken } from "./types";
import { TOPIC_COLORS } from "./colors";

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

export type GeneratorSettings = {
  activeTopics: TopicType[];
  activeCardTypes: CardType[];
  includeReverseProblems: boolean;
  measurementUnit: "none" | "cm" | "m" | "in";
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
let _seq = 0;
function nextId(): string { return `geo-${Date.now()}-${_seq++}`; }
function uid(u: "none" | "cm" | "m" | "in"): string { return u === "none" ? "" : u; }

// -------------------------------------------------------------------------------
// Equation token helpers -- drive the morphing equation UX in EquationDisplay
// tok()  = value slot (the interesting part)
// dim()  = operator / equals sign (dimmer)
// eq()   = shorthand for a single "=" operator
// -------------------------------------------------------------------------------
const tok = (id: string, value: string, color?: string): EquationToken => ({ id, value, color });
const dim = (id: string, value: string): EquationToken => ({ id, value, dim: true });
const eq = (id = "eq"): EquationToken => dim(id, " = ");
const op = (value: string): EquationToken => dim("op", ` ${value} `);

// ─────────────────────────────────────────────────────────────────────────────
// ── ANGLES ───────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function makeAnglesTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS.angles;
  return [
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Acute angles", frontPrompt: "are…?",
      frontSpeechText: "Acute angles are…?",
      backDefinition: "Greater than 0°, less than 90°",
      backDefinitionSubtitle: "Smaller and sharper than a right angle",
      backSvgExamples: [{ shape: "angle-single", dimensions: { angle: 30 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "0° < acute < 90°" }],
      backSpeechText: "Greater than 0 degrees, less than 90 degrees", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Obtuse angles", frontPrompt: "are…?",
      frontSpeechText: "Obtuse angles are…?",
      backDefinition: "Greater than 90°, less than 180°",
      backDefinitionSubtitle: "Between a right angle and a straight line",
      backSvgExamples: [{ shape: "angle-single", dimensions: { angle: 130 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "90° < obtuse < 180°" }],
      backSpeechText: "Greater than 90 degrees, less than 180 degrees", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Reflex angles", frontPrompt: "are…?",
      frontSpeechText: "Reflex angles are…?",
      backDefinition: "Greater than 180°, less than 360°",
      backDefinitionSubtitle: "Larger than a straight line (the outside angle)",
      backSvgExamples: [{ shape: "angle-reflex", dimensions: { angles: "200,270,330" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "180° < reflex < 360°" }],
      backSpeechText: "Greater than 180 degrees, less than 360 degrees", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Complementary angles", frontPrompt: "are…?",
      frontSpeechText: "Complementary angles are…?",
      backDefinition: "Two angles that sum to 90°",
      backDefinitionSubtitle: "Together they make a right angle (A + B = 90°)",
      backSvgExamples: [{ shape: "angle-complementary", dimensions: { A: 30 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "A + B = 90°" }, { formulaLine: "e.g. 30° + 60° = 90°" }],
      backSpeechText: "Two angles that sum to 90 degrees", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Supplementary angles", frontPrompt: "are…?",
      frontSpeechText: "Supplementary angles are…?",
      backDefinition: "Two angles that sum to 180°",
      backDefinitionSubtitle: "Together they form a straight line (A + B = 180°)",
      backSvgExamples: [{ shape: "angle-supplementary", dimensions: { A: 120 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "A + B = 180°" }, { formulaLine: "e.g. 120° + 60° = 180°" }],
      backSpeechText: "Two angles that sum to 180 degrees", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Vertically opposite angles", frontPrompt: "are…?",
      frontSpeechText: "Vertically opposite angles are…?",
      backDefinition: "Vertically opposite angles are equal",
      backDefinitionSubtitle: "Formed opposite each other where two lines intersect",
      backSvgExamples: [{ shape: "angle-vertically-opposite", dimensions: { A: 42 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "A = C,   B = D" }, { formulaLine: "A + B = 180° (supplementary)" }],
      backSpeechText: "Vertically opposite angles are equal", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Alternate angles", frontPrompt: "are…?",
      frontSpeechText: "Alternate angles are…?",
      backDefinition: "Alternate angles are equal",
      backDefinitionSubtitle: "Opposite sides of a transversal between parallel lines",
      backSvgExamples: [{ shape: "angle-parallel-alternate", dimensions: { angle: 55 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "alternate angles are equal" }],
      backSpeechText: "Alternate angles are on opposite sides of the transversal and are equal when lines are parallel", color,
    },
    {
      id: nextId(), topic: "angles", cardType: "term", variant: "definition",
      frontLabel: "Co-interior angles", frontPrompt: "are…?",
      frontSpeechText: "Co-interior angles are…?",
      backDefinition: "Co-interior angles sum to 180°",
      backDefinitionSubtitle: "Same side of a transversal between parallel lines",
      backSvgExamples: [{ shape: "angle-parallel-cointerior", dimensions: { A: 110 }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "A + B = 180°" }],
      backSpeechText: "Co-interior angles are on the same side of the transversal and sum to 180 degrees", color,
    },
  ];
}

function makeAnglesCalcCard(): GeometryCard {
  const color = TOPIC_COLORS.angles;
  const t = pick(["supp", "comp", "vert"] as const);
  if (t === "supp") {
    const A = randInt(20, 155); const B = 180 - A;
    return {
      id: nextId(), topic: "angles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for angle B",
      frontSvg: { shape: "angle-supplementary", dimensions: { A, unknown: "B" }, labelMode: "numeric", unknownDimension: "B" },
      frontSpeechText: `One angle is ${A} degrees. Find the unknown supplementary angle B.`,
      backSteps: [
        { equationTokens: [tok("lhs","A","#5ee8ff"), op("+"), tok("mid","B","#d8b4fe"), eq(), tok("sum","180°")], reason: "Supplementary angles sum to 180°" },
        { equationTokens: [tok("lhs",`${A}°`,"#5ee8ff"), op("+"), tok("mid","B","#d8b4fe"), eq(), tok("sum","180°")], reason: `Substitute A = ${A}°` },
        { equationTokens: [tok("lhs","B","#d8b4fe"), eq(), tok("rhs1","180°"), op("−"), tok("rhs2",`${A}°`,"#5ee8ff")], reason: "Isolate B" },
        { equationTokens: [tok("lhs","B","#d8b4fe"), eq(), tok("rhs",`${B}°`,"#d8b4fe")], reason: "Evaluate" },
      ],
      backSpeechText: `B equals ${B} degrees`, numericAnswer: B, color,
    };
  }
  if (t === "comp") {
    const A = randInt(10, 79); const B = 90 - A;
    return {
      id: nextId(), topic: "angles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for angle B",
      frontSvg: { shape: "angle-complementary", dimensions: { A, unknown: "B" }, labelMode: "numeric", unknownDimension: "B" },
      frontSpeechText: `One angle is ${A} degrees. Find the unknown complementary angle B.`,
      backSteps: [
        { equationTokens: [tok("lhs","A","#5ee8ff"), op("+"), tok("mid","B","#d8b4fe"), eq(), tok("sum","90°")], reason: "Complementary angles sum to 90°" },
        { equationTokens: [tok("lhs",`${A}°`,"#5ee8ff"), op("+"), tok("mid","B","#d8b4fe"), eq(), tok("sum","90°")], reason: `Substitute A = ${A}°` },
        { equationTokens: [tok("lhs","B","#d8b4fe"), eq(), tok("rhs1","90°"), op("−"), tok("rhs2",`${A}°`,"#5ee8ff")], reason: "Isolate B" },
        { equationTokens: [tok("lhs","B","#d8b4fe"), eq(), tok("rhs",`${B}°`,"#d8b4fe")], reason: "Evaluate" },
      ],
      backSpeechText: `B equals ${B} degrees`, numericAnswer: B, color,
    };
  }
  const A = randInt(15, 80);
  return {
    id: nextId(), topic: "angles", cardType: "calculation", variant: "compute",
    frontPrompt: "Solve for angle C",
    frontSvg: { shape: "angle-vertically-opposite", dimensions: { A, unknown: "C" }, labelMode: "numeric", unknownDimension: "C" },
    frontSpeechText: `One angle is ${A} degrees. Find vertically opposite angle C.`,
    backSteps: [
      { equationTokens: [tok("lhs","C","#d8b4fe"), eq(), tok("rhs","A","#5ee8ff")], reason: "Vertically opposite angles are equal" },
      { equationTokens: [tok("lhs","C","#d8b4fe"), eq(), tok("rhs",`${A}°`,"#d8b4fe")], reason: `Substitute A = ${A}°` },
    ],
    backSpeechText: `C equals ${A} degrees`, numericAnswer: A, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── TRIANGLES ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function makeTrianglesTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS.triangles;
  return [
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Equilateral triangles", frontPrompt: "are…?",
      frontSpeechText: "Equilateral triangles are…?",
      backDefinition: "3 equal sides, 3 equal angles (60° each)",
      backSvgExamples: [{ shape: "triangle", dimensions: { style: "equilateral", labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "All sides equal, all angles = 60°" }],
      backSpeechText: "Equilateral triangles have 3 equal sides and 3 equal angles of 60 degrees each", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Isosceles triangles", frontPrompt: "are…?",
      frontSpeechText: "Isosceles triangles are…?",
      backDefinition: "2 equal sides, 2 equal base angles",
      backSvgExamples: [{ shape: "triangle", dimensions: { style: "isosceles", labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "2 equal sides → 2 equal base angles" }],
      backSpeechText: "Isosceles triangles have 2 equal sides and 2 equal base angles", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Scalene triangles", frontPrompt: "are…?",
      frontSpeechText: "Scalene triangles are…?",
      backDefinition: "No equal sides, no equal angles",
      backSvgExamples: [{ shape: "triangle", dimensions: { style: "scalene", labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "All sides different, all angles different" }],
      backSpeechText: "Scalene triangles have no equal sides and no equal angles", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Right triangles", frontPrompt: "are…?",
      frontSpeechText: "Right triangles are…?",
      backDefinition: "One angle is exactly 90°",
      backSvgExamples: [{ shape: "right-triangle", dimensions: { a: 3, b: 4, c: 5, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "One angle = 90° (right angle)" }],
      backSpeechText: "Right triangles have one angle of exactly 90 degrees", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "The triangle angle sum", frontPrompt: "is…?",
      frontSpeechText: "The triangle angle sum is…?",
      backDefinition: "A + B + C = 180°",
      backDefinitionSubtitle: "Interior angles always sum to 180°",
      backSvgExamples: [{ shape: "triangle", dimensions: { angA: 60, angB: 70, unknown: "C", style: "scalene", labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "A + B + C = 180°" }, { formulaLine: "Interior angles always sum to 180°" }],
      backSpeechText: "The triangle angle sum is A plus B plus C equals 180 degrees", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "The Pythagorean theorem", frontPrompt: "states…?",
      frontSpeechText: "The Pythagorean theorem states…?",
      backDefinition: "a² + b² = c²",
      backDefinitionSubtitle: "leg² + leg² = hypotenuse²",
      backSvgExamples: [{ shape: "right-triangle", dimensions: { a: "a", b: "b", c: "c", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "a² + b² = c²" },
        { formulaLine: "leg² + leg² = hypotenuse²" },
        { formulaLine: "c = √(a² + b²)" },
      ],
      backSpeechText: "The Pythagorean theorem states a squared plus b squared equals c squared", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Area of a triangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a triangle is…?",
      backDefinition: "A = ½ · b · h",
      backDefinitionSubtitle: "Area = ½ · base · height",
      backSvgExamples: [{ shape: "triangle", dimensions: { b: "b", h: "h", style: "scalene", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "A = ½ · b · h" },
        { formulaLine: "Area = ½ · base · height" },
      ],
      backSpeechText: "Area equals one half base times height", color,
    },
    {
      id: nextId(), topic: "triangles", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a triangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a triangle is…?",
      backDefinition: "P = a + b + c",
      backDefinitionSubtitle: "Perimeter = sum of all 3 sides",
      backSvgExamples: [{ shape: "triangle", dimensions: { a: "a", b: "b", c: "c", style: "scalene", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "P = a + b + c" },
        { formulaLine: "Perimeter = sum of all 3 sides" },
      ],
      backSpeechText: "Perimeter equals a plus b plus c", color,
    },
  ];
}

function makeTrianglesCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS.triangles;
  const u = uid(settings.measurementUnit);
  const t = pick(["angle-sum", "area", "perimeter", "pyth-c", "pyth-b"] as const);

  if (t === "angle-sum") {
    const A = randInt(30, 85), B = randInt(30, 85);
    const C = 180 - A - B;
    return {
      id: nextId(), topic: "triangles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for angle C",
      frontSvg: { shape: "triangle", dimensions: { angA: A, angB: B, unknown: "C", style: "scalene", labelMode: "numeric" }, labelMode: "numeric" },
      frontSpeechText: `A is ${A} degrees, B is ${B} degrees. Find C.`,
      backSteps: [
        { equationTokens: [tok("A","A","#5ee8ff"), dim("p1"," + "), tok("B","B","#ffd45e"), dim("p2"," + "), tok("C","C","#d8b4fe"), eq(), tok("sum","180°")], reason: "Triangle angle sum theorem" },
        { equationTokens: [tok("A",`${A}°`,"#5ee8ff"), dim("p1"," + "), tok("B",`${B}°`,"#ffd45e"), dim("p2"," + "), tok("C","C","#d8b4fe"), eq(), tok("sum","180°")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","C","#d8b4fe"), eq(), tok("r1","180°"), op("−"), tok("r2",`${A}°`,"#5ee8ff"), op("−"), tok("r3",`${B}°`,"#ffd45e")], reason: "Isolate C" },
        { equationTokens: [tok("lhs","C","#d8b4fe"), eq(), tok("rhs",`${C}°`,"#d8b4fe")], reason: "Evaluate" },
      ],
      backSpeechText: `C equals ${C} degrees`, numericAnswer: C, color,
    };
  }
  if (t === "area") {
    const b = randInt(4, 16), h = randInt(3, 12);
    const A = Math.round(0.5 * b * h * 10) / 10;
    return {
      id: nextId(), topic: "triangles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the triangle area",
      frontSvg: { shape: "triangle", dimensions: { b, h, style: "scalene", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Base is ${b}, height is ${h}. Find the triangle area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("half","½"), op("×"), tok("b","b","#ffd45e"), op("×"), tok("h","h","#5ee8ff")], reason: "Triangle area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("half","½"), op("×"), tok("b",`${b}`,"#ffd45e"), op("×"), tok("h",`${h}`,"#5ee8ff")], svgMutation: { fillInterior: true }, reason: "Substitute known values" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A} square ${settings.measurementUnit === "none" ? "units" : settings.measurementUnit}`, numericAnswer: A, color,
    };
  }
  if (t === "perimeter") {
    const a = randInt(3, 10), b = randInt(3, 10), c = randInt(3, 10);
    const P = a + b + c;
    return {
      id: nextId(), topic: "triangles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the triangle perimeter",
      frontSvg: { shape: "triangle", dimensions: { a, b, c, style: "scalene", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Sides are ${a}, ${b}, and ${c}. Find the triangle perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), tok("a","a","#5ee8ff"), op("+"), tok("b","b","#ffd45e"), op("+"), tok("c","c","#d8b4fe")], svgMutation: { traceStroke: "perimeter" }, reason: "Triangle perimeter formula" },
        { equationTokens: [tok("lhs","P"), eq(), tok("a",`${a}`,"#5ee8ff"), op("+"), tok("b",`${b}`,"#ffd45e"), op("+"), tok("c",`${c}`,"#d8b4fe")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}${u}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  if (t === "pyth-c") {
    const a = randInt(3, 8), b = randInt(3, 8);
    const c2 = a * a + b * b;
    const c = Math.sqrt(c2);
    const cDisp = Number.isInteger(c) ? c : `√${c2}`;
    return {
      id: nextId(), topic: "triangles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for hypotenuse (c)",
      frontSvg: { shape: "right-triangle", dimensions: { a, b, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "c" },
      frontSpeechText: `a is ${a}, b is ${b}. Find c.`,
      backSteps: [
        { equationTokens: [tok("a","a²","#5ee8ff"), op("+"), tok("b","b²","#ffd45e"), eq(), tok("c","c²","#d8b4fe")], reason: "Pythagorean theorem" },
        { equationTokens: [tok("a",`${a}²`,"#5ee8ff"), op("+"), tok("b",`${b}²`,"#ffd45e"), eq(), tok("c","c²","#d8b4fe")], reason: "Substitute known values" },
        { equationTokens: [tok("a",`${a * a}`,"#5ee8ff"), op("+"), tok("b",`${b * b}`,"#ffd45e"), eq(), tok("c",`${c2}`,"#d8b4fe")], svgMutation: { traceStroke: "hypotenuse" }, reason: "Square both values" },
        { equationTokens: [tok("c","c","#d8b4fe"), eq(), tok("rhs",`${cDisp}${u}`,"#d8b4fe")], reason: "Take the square root" },
      ],
      backSpeechText: `c equals ${cDisp}`, numericAnswer: Number.isInteger(c) ? c : 0, color,
    };
  }
  // pyth-b: find missing leg
  const b = pick([3, 4, 5, 6, 8, 9, 12] as const);
  const c = pick([5, 10, 13, 15, 17] as const);
  const a2 = c * c - b * b;
  const a = Math.sqrt(a2);
  const aDisp = Number.isInteger(a) ? a : `√${a2}`;
  return {
    id: nextId(), topic: "triangles", cardType: "calculation", variant: "reverse",
    frontPrompt: "Solve for leg (a)",
    frontSvg: { shape: "right-triangle", dimensions: { b, c, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "a" },
    frontSpeechText: `b is ${b}, c is ${c}. Find a.`,
    backSteps: [
      { equationTokens: [tok("a","a²","#5ee8ff"), op("+"), tok("b","b²","#ffd45e"), eq(), tok("c","c²","#d8b4fe")], reason: "Pythagorean theorem" },
      { equationTokens: [tok("a","a²","#5ee8ff"), op("+"), tok("b",`${b}²`,"#ffd45e"), eq(), tok("c",`${c}²`,"#d8b4fe")], reason: "Substitute known values" },
      { equationTokens: [tok("a","a²","#5ee8ff"), eq(), tok("c",`${c * c}`,"#d8b4fe"), op("−"), tok("b",`${b * b}`,"#ffd45e"), eq(), tok("ans",`${a2}`,"#5ee8ff")], reason: "Isolate a²" },
      { equationTokens: [tok("a","a","#5ee8ff"), eq(), tok("rhs",`${aDisp}${u}`,"#5ee8ff")], svgMutation: { traceStroke: "hypotenuse" }, reason: "Take the square root" },
    ],
    backSpeechText: `a equals ${aDisp}`, numericAnswer: Number.isInteger(a) ? a : 0, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── QUADRILATERALS ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function makeQuadTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS.quadrilaterals;
  return [
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Parallelograms", frontPrompt: "are…?",
      frontSpeechText: "Parallelograms are…?",
      backDefinition: "Opposite sides equal and parallel, opposite angles equal",
      backSvgExamples: [{ shape: "parallelogram", dimensions: { b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "Opposite sides ∥ and equal" }, { formulaLine: "Opposite angles equal" }],
      backSpeechText: "Parallelograms have opposite sides equal and parallel, and opposite angles equal", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Rhombuses", frontPrompt: "are…?",
      frontSpeechText: "Rhombuses are…?",
      backDefinition: "4 equal sides, opposite angles equal, NOT necessarily 90°",
      backSvgExamples: [{ shape: "parallelogram", dimensions: { b: 6, h: 4, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "All 4 sides equal" }, { formulaLine: "Angles NOT necessarily 90°" }],
      backSpeechText: "Rhombuses have 4 equal sides and opposite angles equal, but are not necessarily right angles", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Trapezoids", frontPrompt: "are…?",
      frontSpeechText: "Trapezoids are…?",
      backDefinition: "Exactly one pair of parallel sides",
      backSvgExamples: [{ shape: "trapezoid", dimensions: { a: 5, b: 9, h: 4, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Exactly 1 pair of parallel sides" }],
      backSpeechText: "Trapezoids have exactly one pair of parallel sides", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Area of a rectangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a rectangle is…?",
      backDefinition: "A = l × w",
      backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = length × width" }],
      backSpeechText: "Area equals length times width", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a rectangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a rectangle is…?",
      backDefinition: "P = 2(l + w)",
      backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = 2(l + w)" }],
      backSpeechText: "Perimeter equals 2 times length plus width", color,
    },
  ];
}

function makeQuadCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS.quadrilaterals;
  const u = uid(settings.measurementUnit);
  const t = pick(["rect-area", "rect-perim", "para-area", "trap-area", "rect-reverse"] as const);

  if (t === "rect-area") {
    const l = randInt(4, 15), w = randInt(3, 10);
    const A = l * w;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the area",
      frontSvg: { shape: "rectangle", dimensions: { l, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Length is ${l}, width is ${w}. Find the area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs","l × w")], reason: "Rectangle area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${l} × ${w}`)], svgMutation: { fillInterior: true }, reason: `Substitute l = ${l}, w = ${w}` },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A}`, numericAnswer: A, color,
    };
  }
  if (t === "rect-perim") {
    const l = randInt(3, 15), w = randInt(3, 12);
    const P = 2 * (l + w);
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the perimeter",
      frontSvg: { shape: "rectangle", dimensions: { l, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Length is ${l}, width is ${w}. Find the perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs","2(l + w)")], svgMutation: { traceStroke: "perimeter" }, reason: "Rectangle perimeter formula" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`2(${l} + ${w})`)], reason: `Substitute l = ${l}, w = ${w}` },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}${u}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  if (t === "para-area") {
    const b = randInt(4, 14), h = randInt(3, 10);
    const A = b * h;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the area",
      frontSvg: { shape: "parallelogram", dimensions: { b, h, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Base is ${b}, height is ${h}. Find the area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs","b × h")], reason: "Parallelogram area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${b} × ${h}`)], svgMutation: { fillInterior: true }, reason: `Substitute b = ${b}, h = ${h}` },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A}`, numericAnswer: A, color,
    };
  }
  if (t === "trap-area") {
    const a = randInt(3, 8), b = randInt(6, 14), h = randInt(3, 10);
    const A = Math.round(0.5 * (a + b) * h * 10) / 10;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the area",
      frontSvg: { shape: "trapezoid", dimensions: { a, b, h, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `a is ${a}, b is ${b}, h is ${h}. Find the area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs","½(a + b)h")], reason: "Trapezoid area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`½(${a} + ${b}) × ${h}`)], svgMutation: { fillInterior: true }, reason: `Substitute a = ${a}, b = ${b}, h = ${h}` },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A}`, numericAnswer: A, color,
    };
  }
  // rect-reverse
  const w = randInt(3, 10);
  const A = randInt(4, 10) * w;
  const l = A / w;
  return {
    id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "reverse",
    frontPrompt: "Solve for length l",
    frontSvg: { shape: "rectangle", dimensions: { A, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "l" },
    frontSpeechText: `Area is ${A}, width is ${w}. Find the length.`,
    backSteps: [
      { equationTokens: [tok("lhs","A"), eq(), tok("rhs","l × w")], reason: "Rectangle area formula" },
      { equationTokens: [tok("lhs",`${A}`), eq(), tok("rhs",`l × ${w}`)], reason: `Substitute A = ${A}, w = ${w}` },
      { equationTokens: [tok("lhs","l"), eq(), tok("rhs",`${A} ÷ ${w}`)], reason: "Divide both sides by w" },
      { equationTokens: [tok("lhs","l"), eq(), tok("rhs",`${l}${u}`)], reason: "Evaluate" },
    ],
    backSpeechText: `l equals ${l}`, numericAnswer: l, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── CIRCLES ───────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function makeCirclesTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS.circles;
  return [
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "Circumference of a circle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the circumference of a circle is…?",
      backDefinition: "C = 2πr",
      backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "C = 2 × π × r" },
        { formulaLine: "C = 2πr (or C = πd)" },
      ],
      backSpeechText: "Circumference equals 2 pi r", color,
    },
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "Area of a circle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a circle is…?",
      backDefinition: "A = πr²",
      backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = π × r²" }],
      backSpeechText: "Area equals pi r squared", color,
    },
  ];
}

function makeCirclesCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS.circles;
  const u = uid(settings.measurementUnit);
  const t = pick(["circ", "area", "r-from-c", "r-from-a"] as const);

  if (t === "circ") {
    const r = randInt(2, 10);
    return {
      id: nextId(), topic: "circles", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the circumference",
      frontSvg: { shape: "circle", dimensions: { r, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "C" },
      frontSpeechText: `Radius is ${r}. Find the circumference.`,
      backSteps: [
        { equationTokens: [tok("lhs","C"), eq(), tok("rhs","2πr")], svgMutation: { traceStroke: "circumference" }, reason: "Circumference (C) formula" },
        { equationTokens: [tok("lhs","C"), eq(), tok("rhs",`2π × ${r}`)], reason: `Substitute r = ${r}` },
        { equationTokens: [tok("lhs","C"), eq(), tok("rhs",`${2 * r}π`)], reason: "Evaluate" },
      ],
      backSpeechText: `C equals ${2 * r} pi`, numericAnswer: 2 * r, color,
    };
  }
  if (t === "area") {
    const r = randInt(2, 12);
    return {
      id: nextId(), topic: "circles", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the area",
      frontSvg: { shape: "circle", dimensions: { r, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Radius is ${r}. Find the area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs","πr²")], reason: "Circle area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`π × ${r}²`)], svgMutation: { fillInterior: true }, reason: `Substitute r = ${r}` },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${r * r}π`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${r * r} pi`, numericAnswer: r * r, color,
    };
  }
  if (t === "r-from-c") {
    const r = randInt(2, 10);
    const cCoeff = 2 * r;
    return {
      id: nextId(), topic: "circles", cardType: "calculation", variant: "reverse",
      frontPrompt: "Solve for radius r",
      frontSvg: { shape: "circle", dimensions: { C: `${cCoeff}π`, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
      frontSpeechText: `C equals ${cCoeff} pi. Find the radius.`,
      backSteps: [
        { equationTokens: [tok("lhs","C"), eq(), tok("rhs","2πr")], reason: "Circumference (C) formula" },
        { equationTokens: [tok("lhs",`${cCoeff}π`), eq(), tok("rhs","2πr")], reason: `Substitute C = ${cCoeff}π` },
        { equationTokens: [tok("lhs","r"), eq(), tok("rhs",`${cCoeff}π ÷ 2π`)], reason: "Divide both sides by 2π" },
        { equationTokens: [tok("lhs","r"), eq(), tok("rhs",`${r}`)], reason: "Evaluate" },
      ],
      backSpeechText: `r equals ${r}`, numericAnswer: r, color,
    };
  }
  // r-from-a
  const rSq = pick([1, 4, 9, 16, 25, 36, 49] as const);
  const r = Math.sqrt(rSq);
  return {
    id: nextId(), topic: "circles", cardType: "calculation", variant: "reverse",
    frontPrompt: "Solve for radius r",
    frontSvg: { shape: "circle", dimensions: { A: `${rSq}π`, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
    frontSpeechText: `A equals ${rSq} pi. Find the radius.`,
    backSteps: [
      { equationTokens: [tok("lhs","A"), eq(), tok("rhs","πr²")], reason: "Circle area formula" },
      { equationTokens: [tok("lhs",`${rSq}π`), eq(), tok("rhs","πr²")], reason: `Substitute A = ${rSq}π` },
      { equationTokens: [tok("lhs","r²"), eq(), tok("rhs",`${rSq}`)], reason: "Divide both sides by π" },
      { equationTokens: [tok("lhs","r"), eq(), tok("rhs",`√${rSq} = ${r}`)], reason: "Take the square root" },
    ],
    backSpeechText: `r equals ${r}`, numericAnswer: r, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── POLYGONS ──────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function makePolygonsTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS.polygons;
  return [
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Regular polygons", frontPrompt: "are…?",
      frontSpeechText: "Regular polygons are…?",
      backDefinition: "All sides equal, all interior angles equal",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 5, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Equal sides + equal angles" }],
      backSpeechText: "Regular polygons have all sides equal and all interior angles equal", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Exterior angles of any convex polygon", frontPrompt: "are…?",
      frontSpeechText: "Exterior angles of any convex polygon are…?",
      backDefinition: "Always sum to 360°",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Sum of exterior angles = 360°" }, { formulaLine: "Always, for any convex polygon" }],
      backSpeechText: "Exterior angles of any convex polygon always sum to 360 degrees", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Polygon interior angle sum", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the interior angle sum of a polygon is…?",
      backDefinition: "Sum = (n − 2) × 180°",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "Sum = (n − 2) × 180°" },
        { formulaLine: "n = number of sides" },
      ],
      backSpeechText: "The interior angle sum equals n minus 2 times 180 degrees", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a regular polygon", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a regular polygon is…?",
      backDefinition: "P = n × s",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 5, s: "s", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = n × s (number of sides × side length)" }],
      backSpeechText: "Perimeter equals n times s", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Regular polygon interior angle", frontPrompt: "formula is…?",
      frontSpeechText: "Each interior angle of a regular polygon is…?",
      backDefinition: "Each = (n − 2) × 180° ÷ n",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "Sum = (n − 2) × 180°" },
        { formulaLine: "Each angle = Sum ÷ n" },
      ],
      backSpeechText: "Each interior angle equals n minus 2 times 180 degrees divided by n", color,
    },
  ];
}

function makePolygonsCalcCard(): GeometryCard {
  const color = TOPIC_COLORS.polygons;
  const t = pick(["perimeter", "angle-sum", "each-angle-hex", "each-angle-oct"] as const);

  if (t === "perimeter") {
    const n = pick([5, 6, 7, 8] as const), s = randInt(4, 12);
    const P = n * s;
    return {
      id: nextId(), topic: "polygons", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the perimeter",
      frontSvg: { shape: "polygon", dimensions: { n, s, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Regular polygon with ${n} sides of length ${s}. Find the perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs","n × s")], svgMutation: { traceStroke: "perimeter" }, reason: "Regular polygon perimeter" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${n} × ${s}`)], reason: `Substitute n = ${n}, s = ${s}` },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  if (t === "angle-sum") {
    const n = pick([5, 6, 7, 8, 9, 10] as const);
    const sum = (n - 2) * 180;
    return {
      id: nextId(), topic: "polygons", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the interior angle sum",
      frontSvg: { shape: "polygon", dimensions: { n, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "Sum" },
      frontSpeechText: `Regular polygon with ${n} sides. Find the interior angle sum.`,
      backSteps: [
        { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs","(n − 2) × 180°")], reason: "Interior angle sum formula" },
        { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs",`(${n} − 2) × 180°`)], reason: `Substitute n = ${n}` },
        { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs",`${n - 2} × 180°`)], reason: "Simplify bracket" },
        { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs",`${sum}°`)], reason: "Evaluate" },
      ],
      backSpeechText: `Interior angle sum equals ${sum} degrees`, numericAnswer: sum, color,
    };
  }
  // each-angle-hex or each-angle-oct
  const n = t === "each-angle-hex" ? 6 : 8;
  const sum = (n - 2) * 180;
  const each = sum / n;
  return {
    id: nextId(), topic: "polygons", cardType: "calculation", variant: "compute",
    frontPrompt: "Calculate each interior angle",
    frontSvg: { shape: "polygon", dimensions: { n, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "Each" },
    frontSpeechText: `Regular polygon with ${n} sides. Find each interior angle.`,
    backSteps: [
      { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs",`(n − 2) × 180°`)], reason: "Interior angle sum formula" },
      { equationTokens: [tok("lhs","Sum"), eq(), tok("rhs",`${sum}°`)], reason: `Evaluate for n = ${n}` },
      { equationTokens: [tok("lhs","Each"), eq(), tok("rhs",`${sum}° ÷ ${n}`)], reason: `Divide by ${n} sides` },
      { equationTokens: [tok("lhs","Each"), eq(), tok("rhs",`${each}°`)], reason: "Evaluate" },
    ],
    backSpeechText: `Each interior angle is ${each} degrees`, numericAnswer: each, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 3D SHAPES ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function make3DTermCards(): GeometryCard[] {
  const color = TOPIC_COLORS["3d-shapes"];
  return [
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "A face", frontPrompt: "is…?",
      frontSpeechText: "A face is…?",
      backDefinition: "A flat surface of a 3D shape",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Face = flat surface" }, { formulaLine: "A cube has 6 faces" }],
      backSpeechText: "A face is a flat surface of a 3D shape", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "An edge", frontPrompt: "is…?",
      frontSpeechText: "An edge is…?",
      backDefinition: "A line where two faces meet",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Edge = line where 2 faces meet" }, { formulaLine: "A cube has 12 edges" }],
      backSpeechText: "An edge is where two faces meet", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "A vertex", frontPrompt: "is…?",
      frontSpeechText: "A vertex is…?",
      backDefinition: "A corner point where edges meet",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Vertex = corner where edges meet" }, { formulaLine: "A cube has 8 vertices" }],
      backSpeechText: "A vertex is a corner point where edges meet", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Euler's formula", frontPrompt: "states…?",
      frontSpeechText: "Euler's formula states…?",
      backDefinition: "V − E + F = 2 for any convex polyhedron",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { formulaLine: "V − E + F = 2" },
        { formulaLine: "Cube: 8 − 12 + 6 = 2 ✓" },
      ],
      backSpeechText: "Euler's formula states V minus E plus F equals 2 for any convex polyhedron", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a rectangular prism", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a rectangular prism is…?",
      backDefinition: "V = l × w × h",
      backSvgExamples: [{ shape: "prism", dimensions: { l: "l", w: "w", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = length × width × height" }],
      backSpeechText: "Volume equals length times width times height", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a cylinder", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a cylinder is…?",
      backDefinition: "V = πr²h",
      backSvgExamples: [{ shape: "cylinder", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = (base area) × height = πr²h" }],
      backSpeechText: "Volume equals pi r squared h", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a cone", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a cone is…?",
      backDefinition: "V = ⅓πr²h",
      backSvgExamples: [{ shape: "cone", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = ⅓ × πr²h (⅓ of cylinder)" }],
      backSpeechText: "Volume equals one third pi r squared h", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a sphere", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a sphere is…?",
      backDefinition: "V = ⁴⁄₃πr³",
      backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = ⁴⁄₃ × π × r³" }],
      backSpeechText: "Volume equals four thirds pi r cubed", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Surface area of a sphere", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the surface area of a sphere is…?",
      backDefinition: "SA = 4πr²",
      backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "SA = 4 × π × r²" }],
      backSpeechText: "Surface area equals 4 pi r squared", color,
    },
  ];
}

function make3DCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS["3d-shapes"];
  const u = uid(settings.measurementUnit);
  const t = pick(["prism", "cylinder", "euler"] as const);

  if (t === "prism") {
    const l = randInt(2, 10), w = randInt(2, 8), h = randInt(2, 8);
    const V = l * w * h;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the volume",
      frontSvg: { shape: "prism", dimensions: { l, w, h, labelMode: "numeric", unknown: "V" }, labelMode: "numeric" },
      frontSpeechText: `l = ${l}, w = ${w}, h = ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs","l × w × h")], reason: "Rectangular prism volume" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${l} × ${w} × ${h}`)], reason: `Substitute l = ${l}, w = ${w}, h = ${h}` },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${V}${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${V}`, numericAnswer: V, color,
    };
  }
  if (t === "cylinder") {
    const r = randInt(2, 8), h = randInt(3, 10);
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Calculate the volume",
      frontSvg: { shape: "cylinder", dimensions: { r, h, labelMode: "numeric", unknown: "V" }, labelMode: "numeric" },
      frontSpeechText: `r = ${r}, h = ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs","πr²h")], reason: "Cylinder volume formula" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`π × ${r}² × ${h}`)], reason: `Substitute r = ${r}, h = ${h}` },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${r * r * h}π${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${r * r * h} pi`, numericAnswer: r * r * h, color,
    };
  }
  // Euler's formula: cube — find V
  return {
    id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
    frontPrompt: "Solve for vertices (V)",
    frontSvg: { shape: "prism", dimensions: { l: 2, w: 2, h: 2, labelMode: "numeric" }, labelMode: "numeric" },
    frontSpeechText: "A cube has 6 faces and 12 edges. How many vertices?",
    backSteps: [
      { equationTokens: [tok("lhs","V − E + F"), eq(), tok("rhs","2")], reason: "Euler's formula" },
      { equationTokens: [tok("lhs","V − 12 + 6"), eq(), tok("rhs","2")], reason: "Substitute E = 12, F = 6" },
      { equationTokens: [tok("lhs","V − 6"), eq(), tok("rhs","2")], reason: "Simplify" },
      { equationTokens: [tok("lhs","V"), eq(), tok("rhs","8 vertices")], reason: "Solve for V" },
    ],
    backSpeechText: "V minus E plus F equals 2. The cube has 8 vertices", numericAnswer: 8, color,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export function generateGeometryCard(settings: GeneratorSettings): GeometryCard {
  const topic: TopicType = pick(settings.activeTopics);
  const cardType: CardType = pick(settings.activeCardTypes);

  if (topic === "angles") {
    if (cardType === "calculation") return makeAnglesCalcCard();
    return pick(makeAnglesTermCards());
  }
  if (topic === "triangles") {
    if (cardType === "calculation") return makeTrianglesCalcCard(settings);
    return pick(makeTrianglesTermCards());
  }
  if (topic === "quadrilaterals") {
    if (cardType === "calculation") return makeQuadCalcCard(settings);
    return pick(makeQuadTermCards());
  }
  if (topic === "circles") {
    if (cardType === "calculation") return makeCirclesCalcCard(settings);
    return pick(makeCirclesTermCards());
  }
  if (topic === "polygons") {
    if (cardType === "calculation") return makePolygonsCalcCard();
    return pick(makePolygonsTermCards());
  }
  if (topic === "3d-shapes") {
    if (cardType === "calculation") return make3DCalcCard(settings);
    return pick(make3DTermCards());
  }

  // fallback
  return pick(makeAnglesTermCards());
}
