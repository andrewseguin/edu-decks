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
      backDefinition: "Two pairs of parallel sides",
      backDefinitionSubtitle: "Opposite sides & opposite angles are equal",
      backSvgExamples: [{ shape: "parallelogram", dimensions: { b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "Two pairs of parallel sides" }, { formulaLine: "Opposite sides & angles equal" }],
      backSpeechText: "Parallelograms have two pairs of parallel sides, with opposite sides and angles equal", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Rhombuses", frontPrompt: "are…?",
      frontSpeechText: "Rhombuses are…?",
      backDefinition: "All 4 sides are equal",
      backDefinitionSubtitle: "Diagonals bisect each other at 90°",
      backSvgExamples: [{ shape: "rhombus", dimensions: { b: "s", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "All 4 sides are equal" }, { formulaLine: "Diagonals bisect at 90°" }],
      backSpeechText: "Rhombuses have all four sides equal and diagonals bisecting at 90 degrees", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Trapezoids", frontPrompt: "are…?",
      frontSpeechText: "Trapezoids are…?",
      backDefinition: "One pair of parallel sides",
      backSvgExamples: [{ shape: "trapezoid", dimensions: { a: 4, b: 8, h: 5, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "One pair of parallel sides (bases a & b)" }],
      backSpeechText: "Trapezoids have one pair of parallel sides", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Area of a rectangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a rectangle is…?",
      backDefinition: "A = l · w",
      backDefinitionSubtitle: "Area = length · width",
      backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = length · width" }],
      backSpeechText: "Area equals length times width", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a rectangle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a rectangle is…?",
      backDefinition: "P = 2l + 2w",
      backDefinitionSubtitle: "Perimeter = 2 · length + 2 · width",
      backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = 2(l + w)" }],
      backSpeechText: "Perimeter equals 2 times length plus width", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Area of a parallelogram", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a parallelogram is…?",
      backDefinition: "A = b · h",
      backDefinitionSubtitle: "Area = base · height",
      backSvgExamples: [{ shape: "parallelogram", dimensions: { b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = base · perpendicular height" }],
      backSpeechText: "Area equals base times height", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a parallelogram", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a parallelogram is…?",
      backDefinition: "P = 2a + 2b",
      backDefinitionSubtitle: "Perimeter = 2 · side a + 2 · side b",
      backSvgExamples: [{ shape: "parallelogram", dimensions: { a: "a", b: "b", labelMode: "variable", unknownDimension: "P" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = 2(a + b)" }],
      backSpeechText: "Perimeter equals 2 times a plus 2 times b", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Area of a trapezoid", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a trapezoid is…?",
      backDefinition: "A = ½(a + b)h",
      backDefinitionSubtitle: "Area = ½ · (sum of parallel bases) · height",
      backSvgExamples: [{ shape: "trapezoid", dimensions: { a: "a", b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = ½ · (sum of parallel sides) · height" }],
      backSpeechText: "Area equals one half a plus b times height", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a trapezoid", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a trapezoid is…?",
      backDefinition: "P = a + b + c + d",
      backDefinitionSubtitle: "Perimeter = sum of all 4 outer boundary sides",
      backSvgExamples: [{ shape: "trapezoid", dimensions: { a: "a", b: "b", c: "c", d: "d", labelMode: "variable", unknownDimension: "P" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = a + b + c + d" }],
      backSpeechText: "Perimeter equals the sum of all four sides", color,
    },
    {
      id: nextId(), topic: "quadrilaterals", cardType: "term", variant: "definition",
      frontLabel: "Perimeter of a rhombus", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the perimeter of a rhombus is…?",
      backDefinition: "P = 4s",
      backDefinitionSubtitle: "Perimeter = 4 · side length (all 4 sides equal)",
      backSvgExamples: [{ shape: "rhombus", dimensions: { s: "s", labelMode: "variable", unknownDimension: "P" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "P = 4s" }],
      backSpeechText: "Perimeter equals 4 times side length", color,
    },
  ];
}

function makeQuadCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS.quadrilaterals;
  const u = uid(settings.measurementUnit);
  const t = pick(["rect-area", "rect-perim", "para-area", "para-perim", "trap-area", "trap-perim", "rhombus-perim", "rect-reverse"] as const);

  if (t === "rect-area") {
    const l = randInt(4, 15), w = randInt(3, 10);
    const A = l * w;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the rectangle area",
      frontSvg: { shape: "rectangle", dimensions: { l, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Length is ${l}, width is ${w}. Find the rectangle area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("l","l","#ffd45e"), op("·"), tok("w","w","#5ee8ff")], reason: "Rectangle area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("l",`${l}`,"#ffd45e"), op("·"), tok("w",`${w}`,"#5ee8ff")], svgMutation: { fillInterior: true }, reason: "Substitute known values" },
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
      frontPrompt: "Solve for the rectangle perimeter",
      frontSvg: { shape: "rectangle", dimensions: { l, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Length is ${l}, width is ${w}. Find the rectangle perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), dim("two","2"), tok("l","l","#ffd45e"), op("+"), dim("two2","2"), tok("w","w","#5ee8ff")], svgMutation: { traceStroke: "perimeter" }, reason: "Rectangle perimeter formula" },
        { equationTokens: [tok("lhs","P"), eq(), dim("two","2("), tok("l",`${l}`,"#ffd45e"), dim("cp",")"), op("+"), dim("two2","2("), tok("w",`${w}`,"#5ee8ff"), dim("cp2",")")], reason: "Substitute known values" },
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
      frontPrompt: "Solve for the parallelogram area",
      frontSvg: { shape: "parallelogram", dimensions: { b, h, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Base is ${b}, height is ${h}. Find the parallelogram area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("b","b","#ffd45e"), op("·"), tok("h","h","#5ee8ff")], reason: "Parallelogram area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("b",`${b}`,"#ffd45e"), op("·"), tok("h",`${h}`,"#5ee8ff")], svgMutation: { fillInterior: true }, reason: "Substitute known values" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A}`, numericAnswer: A, color,
    };
  }
  if (t === "para-perim") {
    const b = randInt(5, 14), a = randInt(3, 10);
    const P = 2 * (a + b);
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the parallelogram perimeter",
      frontSvg: { shape: "parallelogram", dimensions: { b, a, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Base is ${b}, side is ${a}. Find the parallelogram perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), dim("two1","2"), tok("a","a","#5ee8ff"), op("+"), dim("two2","2"), tok("b","b","#ffd45e")], svgMutation: { traceStroke: "perimeter" }, reason: "Parallelogram perimeter formula" },
        { equationTokens: [tok("lhs","P"), eq(), dim("two1","2("), tok("a",`${a}`,"#5ee8ff"), dim("cp1",")"), op("+"), dim("two2","2("), tok("b",`${b}`,"#ffd45e"), dim("cp2",")")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}${u}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  if (t === "trap-area") {
    const a = randInt(3, 8), b = randInt(6, 14), h = randInt(3, 10);
    const A = Math.round(0.5 * (a + b) * h * 10) / 10;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the trapezoid area",
      frontSvg: { shape: "trapezoid", dimensions: { a, b, h, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `a is ${a}, b is ${b}, h is ${h}. Find the trapezoid area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A"), eq(), tok("half","½"), dim("op","("), tok("a","a","#d8b4fe"), op("+"), tok("b","b","#ffd45e"), dim("cp",")·"), tok("h","h","#5ee8ff")], reason: "Trapezoid area formula" },
        { equationTokens: [tok("lhs","A"), eq(), tok("half","½"), dim("op","("), tok("a",`${a}`,"#d8b4fe"), op("+"), tok("b",`${b}`,"#ffd45e"), dim("cp",")·"), tok("h",`${h}`,"#5ee8ff")], svgMutation: { fillInterior: true }, reason: "Substitute known values" },
        { equationTokens: [tok("lhs","A"), eq(), tok("rhs",`${A}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${A}`, numericAnswer: A, color,
    };
  }
  if (t === "trap-perim") {
    const a = randInt(3, 8), b = randInt(7, 14), c = randInt(4, 9), d = randInt(4, 9);
    const P = a + b + c + d;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the trapezoid perimeter",
      frontSvg: { shape: "trapezoid", dimensions: { a, b, c, d, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Sides are ${a}, ${b}, ${c}, and ${d}. Find the trapezoid perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), tok("a","a","#d8b4fe"), op("+"), tok("b","b","#ffd45e"), op("+"), tok("c","c","#5ee8ff"), op("+"), tok("d","d","#5ee8ff")], svgMutation: { traceStroke: "perimeter" }, reason: "Sum of all 4 outer sides" },
        { equationTokens: [tok("lhs","P"), eq(), tok("a",`${a}`,"#d8b4fe"), op("+"), tok("b",`${b}`,"#ffd45e"), op("+"), tok("c",`${c}`,"#5ee8ff"), op("+"), tok("d",`${d}`,"#5ee8ff")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}${u}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  if (t === "rhombus-perim") {
    const s = randInt(4, 15);
    const P = 4 * s;
    return {
      id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the rhombus perimeter",
      frontSvg: { shape: "rhombus", dimensions: { s, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Side is ${s}. Find the rhombus perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), dim("four","4"), tok("s","s","#ffd45e")], svgMutation: { traceStroke: "perimeter" }, reason: "Rhombus perimeter formula (4 equal sides)" },
        { equationTokens: [tok("lhs","P"), eq(), dim("four","4("), tok("s",`${s}`,"#ffd45e"), dim("cp",")")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","P"), eq(), tok("rhs",`${P}${u}`)], reason: "Evaluate" },
      ],
      backSpeechText: `P equals ${P}`, numericAnswer: P, color,
    };
  }
  // rect-reverse
  const w = randInt(3, 10);
  const A = randInt(4, 10) * w;
  const l = A / w;
  return {
    id: nextId(), topic: "quadrilaterals", cardType: "calculation", variant: "reverse",
    frontPrompt: "Solve for length (l)",
    frontSvg: { shape: "rectangle", dimensions: { A, w, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "l" },
    frontSpeechText: `Area is ${A}, width is ${w}. Find the length.`,
    backSteps: [
      { equationTokens: [tok("lhs","A"), eq(), tok("l","l","#ffd45e"), op("·"), tok("w","w","#5ee8ff")], reason: "Rectangle area formula" },
      { equationTokens: [tok("lhs",`${A}`), eq(), tok("l","l","#ffd45e"), op("·"), tok("w",`${w}`,"#5ee8ff")], reason: "Substitute known values" },
      { equationTokens: [tok("l","l","#ffd45e"), eq(), tok("lhs",`${A}`), op("÷"), tok("w",`${w}`,"#5ee8ff")], reason: "Isolate the variable" },
      { equationTokens: [tok("l","l","#ffd45e"), eq(), tok("rhs",`${l}${u}`,"#ffd45e")], reason: "Evaluate" },
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
      backDefinitionSubtitle: "Circumference = 2 · π · radius",
      backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "C = 2 × π × r" },
        { formulaLine: "C = 2πr" },
      ],
      backSpeechText: "Circumference equals 2 pi r", color,
    },
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "Area of a circle", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the area of a circle is…?",
      backDefinition: "A = πr²",
      backDefinitionSubtitle: "Area = π · radius²",
      backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "A = π × r²" }],
      backSpeechText: "Area equals pi r squared", color,
    },
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "π (pi)", frontPrompt: "is…?",
      frontSpeechText: "Pi is…?",
      backDefinition: "π = C ÷ d ≈ 3.14159…",
      backDefinitionSubtitle: "Ratio of circumference to diameter for any circle",
      backSvgExamples: [{ shape: "circle", dimensions: { r: 5, showDiameter: 1, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { formulaLine: "π = C ÷ d" },
        { formulaLine: "π ≈ 3.14159…" },
      ],
      backSpeechText: "Pi is the ratio of circumference to diameter", color,
    },
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "The radius", frontPrompt: "is…?",
      frontSpeechText: "The radius is…?",
      backDefinition: "Distance from the center to the edge",
      backSvgExamples: [{ shape: "circle", dimensions: { r: 5, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "radius = distance from center to edge" }],
      backSpeechText: "The radius is the distance from the center to the edge", color,
    },
    {
      id: nextId(), topic: "circles", cardType: "term", variant: "definition",
      frontLabel: "The diameter", frontPrompt: "is…?",
      frontSpeechText: "The diameter is…?",
      backDefinition: "d = 2r",
      backDefinitionSubtitle: "Distance across a circle through the center",
      backSvgExamples: [{ shape: "circle", dimensions: { r: 5, showDiameter: 1, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { formulaLine: "d = 2r" },
        { formulaLine: "diameter = 2 × radius" },
      ],
      backSpeechText: "Diameter equals two times the radius", color,
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
      frontPrompt: "Solve for circumference (C)",
      frontSvg: { shape: "circle", dimensions: { r, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "C" },
      frontSpeechText: `Radius is ${r}. Find the circumference.`,
      backSteps: [
        { equationTokens: [tok("lhs","C","#ffd45e"), eq(), dim("two","2π·"), tok("r","r","#5ee8ff")], svgMutation: { traceStroke: "circumference" }, reason: "Circumference Formula" },
        { equationTokens: [tok("lhs","C","#ffd45e"), eq(), dim("two","2π·"), tok("r",`${r}`,"#5ee8ff")], reason: `Substitute r = ${r}` },
        { equationTokens: [tok("lhs","C","#ffd45e"), eq(), tok("rhs",`${2 * r}π${u}`,"#ffd45e")], reason: "Evaluate" },
      ],
      backSpeechText: `C equals ${2 * r} pi`, numericAnswer: 2 * r, color,
    };
  }
  if (t === "area") {
    const r = randInt(2, 12);
    return {
      id: nextId(), topic: "circles", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the circle area",
      frontSvg: { shape: "circle", dimensions: { r, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
      frontSpeechText: `Radius is ${r}. Find the circle area.`,
      backSteps: [
        { equationTokens: [tok("lhs","A","#ffd45e"), eq(), dim("pi","π·"), tok("r","r²","#5ee8ff")], reason: "Circle Area Formula" },
        { equationTokens: [tok("lhs","A","#ffd45e"), eq(), dim("pi","π·"), tok("r",`${r}²`,"#5ee8ff")], svgMutation: { fillInterior: true }, reason: `Substitute r = ${r}` },
        { equationTokens: [tok("lhs","A","#ffd45e"), eq(), tok("rhs",`${r * r}π${u}²`,"#ffd45e")], reason: "Evaluate" },
      ],
      backSpeechText: `A equals ${r * r} pi`, numericAnswer: r * r, color,
    };
  }
  if (t === "r-from-c") {
    const r = randInt(2, 10);
    const cCoeff = 2 * r;
    return {
      id: nextId(), topic: "circles", cardType: "calculation", variant: "reverse",
      frontPrompt: "Solve for radius (r)",
      frontSvg: { shape: "circle", dimensions: { C: `${cCoeff}π`, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
      frontSpeechText: `C equals ${cCoeff} pi. Find the radius.`,
      backSteps: [
        { equationTokens: [tok("lhs","C","#ffd45e"), eq(), dim("two","2π·"), tok("r","r","#5ee8ff")], reason: "Circumference Formula" },
        { equationTokens: [tok("lhs",`${cCoeff}π`,"#ffd45e"), eq(), dim("two","2π·"), tok("r","r","#5ee8ff")], reason: `Substitute C = ${cCoeff}π` },
        { equationTokens: [tok("r","r","#5ee8ff"), eq(), tok("lhs",`${cCoeff}π`,"#ffd45e"), op("÷"), dim("two","2π")], reason: "Isolate the variable" },
        { equationTokens: [tok("r","r","#5ee8ff"), eq(), tok("rhs",`${r}${u}`,"#5ee8ff")], reason: "Evaluate" },
      ],
      backSpeechText: `r equals ${r}`, numericAnswer: r, color,
    };
  }
  // r-from-a
  const rSq = pick([1, 4, 9, 16, 25, 36, 49] as const);
  const r = Math.sqrt(rSq);
  return {
    id: nextId(), topic: "circles", cardType: "calculation", variant: "reverse",
    frontPrompt: "Solve for radius (r)",
    frontSvg: { shape: "circle", dimensions: { A: `${rSq}π`, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
    frontSpeechText: `A equals ${rSq} pi. Find the radius.`,
    backSteps: [
      { equationTokens: [tok("lhs","A","#ffd45e"), eq(), dim("pi","π·"), tok("r","r²","#5ee8ff")], reason: "Circle Area Formula" },
      { equationTokens: [tok("lhs",`${rSq}π`,"#ffd45e"), eq(), dim("pi","π·"), tok("r","r²","#5ee8ff")], reason: `Substitute A = ${rSq}π` },
      { equationTokens: [tok("r","r²","#5ee8ff"), eq(), tok("rhs",`${rSq}`,"#5ee8ff")], reason: "Divide both sides by π" },
      { equationTokens: [tok("r","r","#5ee8ff"), eq(), tok("rhs",`${r}${u}`,"#5ee8ff")], reason: "Take the square root (√)" },
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
      frontLabel: "Polygon interior angle sum", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the interior angle sum of a polygon is…?",
      backDefinition: "∑θ = (n − 2) · 180°",
      backDefinitionSubtitle: "Interior angle sum = (number of sides − 2) · 180°",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [
        { formulaLine: "∑θ = (n − 2) × 180°" },
        { formulaLine: "n = number of sides" },
      ],
      backSpeechText: "The interior angle sum equals n minus 2 times 180 degrees", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Polygon exterior angle sum", frontPrompt: "is…?",
      frontSpeechText: "The exterior angle sum of any polygon is…?",
      backDefinition: "∑θ = 360°",
      backSvgExamples: [{ shape: "polygon", dimensions: { n: 5, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "∑θ = 360°" }],
      backSpeechText: "The exterior angle sum of any polygon is always 360 degrees", color,
    },
    {
      id: nextId(), topic: "polygons", cardType: "term", variant: "definition",
      frontLabel: "Regular polygon interior angle", frontPrompt: "formula is…?",
      frontSpeechText: "Each interior angle of a regular polygon is…?",
      backDefinition: "Interior angle = (n − 2) · 180° ÷ n",
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
      frontPrompt: "Solve for the polygon perimeter",
      frontSvg: { shape: "polygon", dimensions: { n, s, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
      frontSpeechText: `Regular polygon with ${n} sides of length ${s}. Find the perimeter.`,
      backSteps: [
        { equationTokens: [tok("lhs","P"), eq(), tok("n","n","#5ee8ff"), op("·"), tok("s","s","#ffd45e")], svgMutation: { traceStroke: "perimeter" }, reason: "Perimeter" },
        { equationTokens: [tok("lhs","P"), eq(), tok("n",`${n}`,"#5ee8ff"), op("·"), tok("s",`${s}`,"#ffd45e")], reason: `Substitute n = ${n}, s = ${s}` },
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
      frontPrompt: "Solve for the interior angle sum",
      frontSvg: { shape: "polygon", dimensions: { n, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "Sum" },
      frontSpeechText: `Regular polygon with ${n} sides. Find the interior angle sum.`,
      backSteps: [
        { equationTokens: [tok("lhs","Sum"), eq(), dim("op","("), tok("n","n","#ffd45e"), op("−"), dim("two","2)·180°")], reason: "Polygon Interior Angle Sum Formula" },
        { equationTokens: [tok("lhs","Sum"), eq(), dim("op","("), tok("n",`${n}`,"#ffd45e"), op("−"), dim("two","2)·180°")], reason: `Substitute n = ${n}` },
        { equationTokens: [tok("lhs","Sum"), eq(), tok("tri",`${n - 2}`), op("·"), tok("deg","180°")], reason: "Simplify expression" },
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
    frontPrompt: "Solve for each interior angle (θ)",
    frontSvg: { shape: "polygon", dimensions: { n, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "angle" },
    frontSpeechText: `Regular polygon with ${n} sides. Find each interior angle.`,
    backSteps: [
      { equationTokens: [tok("lhs","θ","#5ee8ff"), eq(), dim("op","("), tok("n","n","#ffd45e"), op("−"), dim("two","2)·180° ÷ "), tok("n","n","#ffd45e")], reason: "Regular Polygon Interior Angle" },
      { equationTokens: [tok("lhs","θ","#5ee8ff"), eq(), dim("op","("), tok("n",`${n}`,"#ffd45e"), op("−"), dim("two","2)·180° ÷ "), tok("n",`${n}`,"#ffd45e")], reason: `Substitute n = ${n}` },
      { equationTokens: [tok("lhs","θ","#5ee8ff"), eq(), tok("num",`${sum}°`), op("÷"), tok("n",`${n}`,"#ffd45e")], reason: "Simplify expression" },
      { equationTokens: [tok("lhs","θ","#5ee8ff"), eq(), tok("rhs",`${each}°`,"#5ee8ff")], reason: "Evaluate" },
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
      frontLabel: "Face", frontPrompt: "is…?",
      frontSpeechText: "A face is…?",
      backDefinition: "A 2D surface of a 3D solid",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Face = 2D surface forming the boundary of a 3D solid" }, { formulaLine: "Polyhedra have polygon faces; cylinders and cones have circular faces" }],
      backSpeechText: "A face is a two-dimensional surface of a three-dimensional shape", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Edge", frontPrompt: "is…?",
      frontSpeechText: "An edge is…?",
      backDefinition: "A line segment where two faces meet",
      backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [{ formulaLine: "Edge = straight line segment where 2 faces intersect" }, { formulaLine: "A rectangular prism has 12 edges" }],
      backSpeechText: "An edge is a line segment where two faces meet", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "A vertex", frontPrompt: "is…?",
      frontSpeechText: "A vertex is…?",
      backDefinition: "A corner point where 3 or more edges meet",
      backDefinitionSubtitle: "A square pyramid has 5 vertices (1 top apex + 4 base corners)",
      backSvgExamples: [{ shape: "pyramid", dimensions: { B: "B", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "Vertex = corner point where 3 or more edges meet" }, { formulaLine: "A square pyramid has 5 vertices (1 apex + 4 base corners)" }],
      backSpeechText: "A vertex is a corner point where 3 or more edges meet", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Euler's formula", frontPrompt: "states…?",
      frontSpeechText: "Euler's formula states…?",
      backDefinition: "V − E + F = 2",
      backDefinitionSubtitle: "Vertices − Edges + Faces = 2 for any convex 3D polyhedron",
      backSvgExamples: [{ shape: "prism", dimensions: { labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { formulaLine: "V − E + F = 2" },
        { formulaLine: "Cube: 8 − 12 + 6 = 2 ✓" },
      ],
      backSpeechText: "Euler's formula states V minus E plus F equals 2 for any convex polyhedron", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a prism", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a prism is…?",
      backDefinition: "V = l · w · h",
      backDefinitionSubtitle: "Volume = Base Area · height (l · w · h)",
      backSvgExamples: [{ shape: "prism", dimensions: { l: "l", w: "w", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = length × width × height" }],
      backSpeechText: "Volume equals length times width times height", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a cylinder", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a cylinder is…?",
      backDefinition: "V = πr²h",
      backDefinitionSubtitle: "Volume = Base Area (πr²) · height (h)",
      backSvgExamples: [{ shape: "cylinder", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = (base area) × height = πr²h" }],
      backSpeechText: "Volume equals pi r squared h", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a cone", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a cone is…?",
      backDefinition: "V = ⅓πr²h",
      backDefinitionSubtitle: "Volume is exactly ⅓ of an equivalent cylinder",
      backSvgExamples: [{ shape: "cone", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = ⅓ × πr²h (⅓ of cylinder)" }],
      backSpeechText: "Volume equals one third pi r squared h", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a sphere", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a sphere is…?",
      backDefinition: "V = ⁴⁄₃πr³",
      backDefinitionSubtitle: "Volume = ⁴⁄₃ · π · radius³",
      backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = ⁴⁄₃ × π × r³" }],
      backSpeechText: "Volume equals four thirds pi r cubed", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Surface area of a sphere", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the surface area of a sphere is…?",
      backDefinition: "SA = 4πr²",
      backDefinitionSubtitle: "Surface Area = 4 · π · radius² (four great circles)",
      backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "SA = 4 × π × r²" }],
      backSpeechText: "Surface area equals 4 pi r squared", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Surface area of a cylinder", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the surface area of a cylinder is…?",
      backDefinition: "SA = 2πr² + 2πrh",
      backDefinitionSubtitle: "Surface Area = 2 Bases (2πr²) + Lateral Rectangle (2πrh)",
      backSvgExamples: [{ shape: "cylinder", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "SA = 2πr² + 2πrh" }],
      backSpeechText: "Surface area equals 2 pi r squared plus 2 pi r h", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Surface area of a cube", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the surface area of a cube is…?",
      backDefinition: "SA = 6s²",
      backDefinitionSubtitle: "Surface Area = 6 · side² (six identical square faces)",
      backSvgExamples: [{ shape: "prism", dimensions: { s: "s", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "SA = 6 × s²" }],
      backSpeechText: "Surface area equals 6 s squared", color,
    },
    {
      id: nextId(), topic: "3d-shapes", cardType: "term", variant: "definition",
      frontLabel: "Volume of a rectangular pyramid", frontPrompt: "formula is…?",
      frontSpeechText: "The formula for the volume of a rectangular pyramid is…?",
      backDefinition: "V = ⅓ · l · w · h",
      backDefinitionSubtitle: "Volume = ⅓ · length · width · height (⅓ of equivalent prism)",
      backSvgExamples: [{ shape: "pyramid", dimensions: { l: "l", w: "w", h: "h", labelMode: "variable" }, labelMode: "variable" }],
      backSteps: [{ formulaLine: "V = ⅓ × length × width × height" }],
      backSpeechText: "Volume equals one third length times width times height", color,
    },
  ];
}

function make3DCalcCard(settings: GeneratorSettings): GeometryCard {
  const color = TOPIC_COLORS["3d-shapes"];
  const u = uid(settings.measurementUnit);
  const t = pick(["prism", "cylinder", "cylinder-sa", "cube-sa", "pyramid", "cone", "sphere-vol", "sphere-sa", "euler"] as const);

  if (t === "prism") {
    const l = randInt(2, 10), w = randInt(2, 8), h = randInt(2, 8);
    const V = l * w * h;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the prism volume",
      frontSvg: { shape: "prism", dimensions: { l, w, h, labelMode: "numeric", unknownDimension: "V" }, labelMode: "numeric" },
      frontSpeechText: `Length is ${l}, width is ${w}, height is ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), tok("l","l","#5ee8ff"), op("·"), tok("w","w","#d8b4fe"), op("·"), tok("h","h","#ffd45e")], reason: "Rectangular Prism Volume Formula" },
        { equationTokens: [tok("lhs","V"), eq(), tok("l",`${l}`,"#5ee8ff"), op("·"), tok("w",`${w}`,"#d8b4fe"), op("·"), tok("h",`${h}`,"#ffd45e")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${V}${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${V}`, numericAnswer: V, color,
    };
  }
  if (t === "cylinder") {
    const r = randInt(2, 8), h = randInt(3, 10);
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the cylinder volume",
      frontSvg: { shape: "cylinder", dimensions: { r, h, labelMode: "numeric", unknownDimension: "V" }, labelMode: "numeric" },
      frontSpeechText: `Radius is ${r}, height is ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), dim("pi","π·"), tok("r","r²","#5ee8ff"), op("·"), tok("h","h","#ffd45e")], reason: "Cylinder Volume Formula" },
        { equationTokens: [tok("lhs","V"), eq(), dim("pi","π·"), tok("r",`${r}²`,"#5ee8ff"), op("·"), tok("h",`${h}`,"#ffd45e")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${r * r * h}π${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${r * r * h} pi`, numericAnswer: r * r * h, color,
    };
  }
  if (t === "cylinder-sa") {
    const r = randInt(2, 5), h = randInt(3, 8);
    const twoBases = 2 * r * r;
    const lateral = 2 * r * h;
    const total = twoBases + lateral;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the cylinder surface area",
      frontSvg: { shape: "cylinder", dimensions: { r, h, labelMode: "numeric", unknownDimension: "SA" }, labelMode: "numeric" },
      frontSpeechText: `Radius is ${r}, height is ${h}. Find the surface area.`,
      backSteps: [
        { equationTokens: [tok("lhs","SA"), eq(), tok("two","2"), op("·"), dim("pi","π·"), tok("r","r²","#5ee8ff"), op("+"), tok("two2","2"), op("·"), dim("pi2","π·"), tok("r2","r","#5ee8ff"), op("·"), tok("h","h","#ffd45e")], reason: "Cylinder Surface Area Formula" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("two","2"), op("·"), dim("pi","π·"), tok("r",`${r}²`,"#5ee8ff"), op("+"), tok("two2","2"), op("·"), dim("pi2","π·"), tok("r2",`${r}`,"#5ee8ff"), op("·"), tok("h",`${h}`,"#ffd45e")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("b",`${twoBases}π`,"#5ee8ff"), op("+"), tok("l",`${lateral}π`,"#d8b4fe"), eq(), tok("rhs",`${total}π${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `Surface area equals ${total} pi`, numericAnswer: total, color,
    };
  }
  if (t === "cube-sa") {
    const s = randInt(2, 6);
    const sa = 6 * s * s;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the cube surface area",
      frontSvg: { shape: "prism", dimensions: { s, labelMode: "numeric", unknownDimension: "SA" }, labelMode: "numeric" },
      frontSpeechText: `Side is ${s}. Find the cube surface area.`,
      backSteps: [
        { equationTokens: [tok("lhs","SA"), eq(), tok("six","6"), op("·"), tok("s","s²","#5ee8ff")], reason: "Cube Surface Area Formula" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("six","6"), op("·"), tok("s",`${s}²`,"#5ee8ff")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("rhs",`${sa}${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `Surface area equals ${sa}`, numericAnswer: sa, color,
    };
  }
  if (t === "pyramid") {
    const l = randInt(2, 5);
    const w = randInt(2, 5);
    const h = randInt(1, 4) * 3;
    const vol = (l * w * h) / 3;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the pyramid volume",
      frontSvg: { shape: "pyramid", dimensions: { l, w, h, labelMode: "numeric", unknownDimension: "V" }, labelMode: "numeric" },
      frontSpeechText: `Length is ${l}, width is ${w}, height is ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), dim("third","⅓·"), tok("l","l","#ffd45e"), op("·"), tok("w","w","#d8b4fe"), op("·"), tok("h","h","#5ee8ff")], reason: "Pyramid Volume Formula" },
        { equationTokens: [tok("lhs","V"), eq(), dim("third","⅓·"), tok("l",`${l}`,"#ffd45e"), op("·"), tok("w",`${w}`,"#d8b4fe"), op("·"), tok("h",`${h}`,"#5ee8ff")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${vol}${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${vol}`, numericAnswer: vol, color,
    };
  }
  if (t === "cone") {
    const r = randInt(2, 6);
    const h = randInt(1, 4) * 3; // multiple of 3
    const vol = (r * r * h) / 3;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the cone volume",
      frontSvg: { shape: "cone", dimensions: { r, h, labelMode: "numeric", unknownDimension: "V" }, labelMode: "numeric" },
      frontSpeechText: `Radius is ${r}, height is ${h}. Find the volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), dim("third","⅓·"), dim("pi","π·"), tok("r","r²","#5ee8ff"), op("·"), tok("h","h","#ffd45e")], reason: "Cone Volume Formula" },
        { equationTokens: [tok("lhs","V"), eq(), dim("third","⅓·"), dim("pi","π·"), tok("r",`${r}²`,"#5ee8ff"), op("·"), tok("h",`${h}`,"#ffd45e")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",`${vol}π${u}³`)], reason: "Evaluate" },
      ],
      backSpeechText: `V equals ${vol} pi`, numericAnswer: vol, color,
    };
  }
  if (t === "sphere-vol") {
    const r = randInt(2, 6);
    const rCubed = r * r * r;
    const isInt = rCubed % 3 === 0;
    const vol = isInt ? `${(4 * rCubed) / 3}π${u}³` : `${4 * rCubed}⁄₃π${u}³`;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the sphere volume",
      frontSvg: { shape: "sphere", dimensions: { r, labelMode: "numeric", unknownDimension: "V" }, labelMode: "numeric" },
      frontSpeechText: `Radius is ${r}. Find the sphere volume.`,
      backSteps: [
        { equationTokens: [tok("lhs","V"), eq(), dim("four_thirds","⁴⁄₃·"), dim("pi","π·"), tok("r","r³","#5ee8ff")], reason: "Sphere Volume Formula" },
        { equationTokens: [tok("lhs","V"), eq(), dim("four_thirds","⁴⁄₃·"), dim("pi","π·"), tok("r",`${r}³`,"#5ee8ff")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","V"), eq(), tok("rhs",vol)], reason: "Evaluate" },
      ],
      backSpeechText: `Sphere volume equals ${vol}`, numericAnswer: Math.round((4 * rCubed) / 3), color,
    };
  }
  if (t === "sphere-sa") {
    const r = randInt(2, 6);
    const sa = 4 * r * r;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: "Solve for the sphere surface area",
      frontSvg: { shape: "sphere", dimensions: { r, labelMode: "numeric", unknownDimension: "SA" }, labelMode: "numeric" },
      frontSpeechText: `Radius is ${r}. Find the surface area.`,
      backSteps: [
        { equationTokens: [tok("lhs","SA"), eq(), tok("four","4"), op("·"), dim("pi","π·"), tok("r","r²","#5ee8ff")], reason: "Sphere Surface Area Formula" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("four","4"), op("·"), dim("pi","π·"), tok("r",`${r}²`,"#5ee8ff")], reason: "Substitute known values" },
        { equationTokens: [tok("lhs","SA"), eq(), tok("rhs",`${sa}π${u}²`)], reason: "Evaluate" },
      ],
      backSpeechText: `Surface area equals ${sa} pi`, numericAnswer: sa, color,
    };
  }
  // Euler's formula: polyhedron — find V, E, or F
  const polyhedra = [
    { name: "cube", V: 8, E: 12, F: 6, shape: "prism" as const },
    { name: "square pyramid", V: 5, E: 8, F: 5, shape: "pyramid" as const },
  ];
  const poly = pick(polyhedra);
  const target = pick(["vertices", "edges", "faces"] as const);

  if (target === "vertices") {
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: `${poly.F} faces, ${poly.E} edges, ? vertices`,
      revealedPrompt: `${poly.F} faces, ${poly.E} edges, ${poly.V} vertices`,
      frontSpeechText: `${poly.F} faces, ${poly.E} edges. How many vertices?`,
      backSvgExamples: [{ shape: poly.shape, dimensions: { labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { equationTokens: [tok("v","V","#d8b4fe"), op("−"), tok("e","E","#ffd45e"), op("+"), tok("f","F","#5ee8ff"), eq(), tok("two","2")], reason: "Euler's Polyhedral Formula" },
        { equationTokens: [tok("v","V","#d8b4fe"), op("−"), tok("e",`${poly.E}`,"#ffd45e"), op("+"), tok("f",`${poly.F}`,"#5ee8ff"), eq(), tok("two","2")], reason: "Substitute known values" },
        { equationTokens: [tok("v","V","#d8b4fe"), op("−"), tok("num",`${poly.E - poly.F}`), eq(), tok("two","2")], reason: "Simplify expression" },
        { equationTokens: [tok("v","V","#d8b4fe"), eq(), tok("rhs",`${poly.V}`,"#d8b4fe")], reason: "Evaluate" },
      ],
      backSpeechText: `${poly.V} vertices. Vertices minus edges plus faces equals 2`, numericAnswer: poly.V, color,
    };
  }

  if (target === "edges") {
    const sumVF = poly.V + poly.F;
    return {
      id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
      frontPrompt: `${poly.V} vertices, ${poly.F} faces, ? edges`,
      revealedPrompt: `${poly.V} vertices, ${poly.F} faces, ${poly.E} edges`,
      frontSpeechText: `${poly.V} vertices, ${poly.F} faces. How many edges?`,
      backSvgExamples: [{ shape: poly.shape, dimensions: { labelMode: "numeric" }, labelMode: "numeric" }],
      backSteps: [
        { equationTokens: [tok("v","V","#d8b4fe"), op("−"), tok("e","E","#ffd45e"), op("+"), tok("f","F","#5ee8ff"), eq(), tok("two","2")], reason: "Euler's Polyhedral Formula" },
        { equationTokens: [tok("v",`${poly.V}`,"#d8b4fe"), op("−"), tok("e","E","#ffd45e"), op("+"), tok("f",`${poly.F}`,"#5ee8ff"), eq(), tok("two","2")], reason: "Substitute known values" },
        { equationTokens: [tok("num",`${sumVF}`), op("−"), tok("e","E","#ffd45e"), eq(), tok("two","2")], reason: "Simplify expression" },
        { equationTokens: [tok("e","E","#ffd45e"), eq(), tok("rhs",`${poly.E}`,"#ffd45e")], reason: "Evaluate" },
      ],
      backSpeechText: `${poly.E} edges. Vertices minus edges plus faces equals 2`, numericAnswer: poly.E, color,
    };
  }

  // target === "faces"
  const diffVE = poly.V - poly.E;
  return {
    id: nextId(), topic: "3d-shapes", cardType: "calculation", variant: "compute",
    frontPrompt: `${poly.V} vertices, ${poly.E} edges, ? faces`,
    revealedPrompt: `${poly.V} vertices, ${poly.E} edges, ${poly.F} faces`,
    frontSpeechText: `${poly.V} vertices, ${poly.E} edges. How many faces?`,
    backSvgExamples: [{ shape: poly.shape, dimensions: { labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { equationTokens: [tok("v","V","#d8b4fe"), op("−"), tok("e","E","#ffd45e"), op("+"), tok("f","F","#5ee8ff"), eq(), tok("two","2")], reason: "Euler's Polyhedral Formula" },
      { equationTokens: [tok("v",`${poly.V}`,"#d8b4fe"), op("−"), tok("e",`${poly.E}`,"#ffd45e"), op("+"), tok("f","F","#5ee8ff"), eq(), tok("two","2")], reason: "Substitute known values" },
      { equationTokens: [tok("num",`${diffVE}`), op("+"), tok("f","F","#5ee8ff"), eq(), tok("two","2")], reason: "Simplify expression" },
      { equationTokens: [tok("f","F","#5ee8ff"), eq(), tok("rhs",`${poly.F}`,"#5ee8ff")], reason: "Evaluate" },
    ],
    backSpeechText: `${poly.F} faces. Vertices minus edges plus faces equals 2`, numericAnswer: poly.F, color,
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
