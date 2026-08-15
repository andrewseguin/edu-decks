/**
 * test-card-catalogue.ts
 *
 * A deterministic catalogue of every meaningful geometry card permutation.
 * Uses fixed numbers — never calls Math.random() — so Playwright screenshots
 * are pixel-stable across runs.
 *
 * IDs are stable strings (never timestamp-based) so the Playwright spec can
 * reference them by name.
 */

import type { GeometryCard, EquationToken } from "./types";
import { TOPIC_COLORS } from "./colors";

// ── Local token helpers (mirrors the private helpers in card-generator) ───────
const t = (id: string, value: string, color?: string): EquationToken => ({ id, value, color });
const d = (id: string, value: string): EquationToken => ({ id, value, dim: true });
const eq = (id = "eq"): EquationToken => d(id, " = ");
const op = (value: string): EquationToken => d("op", ` ${value} `);

// ── Catalogue ─────────────────────────────────────────────────────────────────

export const TEST_CARDS: Record<string, GeometryCard> = {

  // ──────────────────────────────────────────────────────────────────────────
  // ANGLES — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-angle-acute": {
    id: "term-angle-acute", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Acute angles", frontPrompt: "are…?",
    frontSpeechText: "Acute angles are…?",
    backDefinition: "Greater than 0°, less than 90°",
    backDefinitionSubtitle: "Smaller and sharper than a right angle",
    backSvgExamples: [{ shape: "angle-single", dimensions: { angle: 30 }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "0° < acute < 90°" }],
    backSpeechText: "Greater than 0 degrees, less than 90 degrees",
  },

  "term-angle-obtuse": {
    id: "term-angle-obtuse", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Obtuse angles", frontPrompt: "are…?",
    frontSpeechText: "Obtuse angles are…?",
    backDefinition: "Greater than 90°, less than 180°",
    backDefinitionSubtitle: "Between a right angle and a straight line",
    backSvgExamples: [{ shape: "angle-single", dimensions: { angle: 135 }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "90° < obtuse < 180°" }],
    backSpeechText: "Greater than 90 degrees, less than 180 degrees",
  },

  "term-angle-reflex": {
    id: "term-angle-reflex", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Reflex angles", frontPrompt: "are…?",
    frontSpeechText: "Reflex angles are…?",
    backDefinition: "Greater than 180°, less than 360°",
    backDefinitionSubtitle: "Larger than a straight line (the outside angle)",
    backSvgExamples: [{ shape: "angle-single", dimensions: { angle: 225 }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "180° < reflex < 360°" }],
    backSpeechText: "Greater than 180 degrees, less than 360 degrees",
  },

  "term-angle-complementary": {
    id: "term-angle-complementary", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Complementary angles", frontPrompt: "sum to…?",
    frontSpeechText: "Complementary angles sum to…?",
    backDefinition: "Two angles that sum to 90°",
    backDefinitionSubtitle: "Together they make a right angle (A + B = 90°)",
    backSvgExamples: [{ shape: "angle-complementary", dimensions: { A: 40, B: 50 }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "A + B = 90°" }],
    backSpeechText: "Complementary angles sum to 90 degrees",
  },

  "term-angle-supplementary": {
    id: "term-angle-supplementary", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Supplementary angles", frontPrompt: "sum to…?",
    frontSpeechText: "Supplementary angles sum to…?",
    backDefinition: "Two angles that sum to 180°",
    backDefinitionSubtitle: "Together they form a straight line (A + B = 180°)",
    backSvgExamples: [{ shape: "angle-supplementary", dimensions: { A: 65, B: 115 }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "A + B = 180°" },
      { formulaLine: "e.g. 120° + 60° = 180°" },
    ],
    backSpeechText: "Two angles that sum to 180 degrees",
  },

  "term-angle-vertically-opp": {
    id: "term-angle-vertically-opp", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Vertically opposite angles", frontPrompt: "are…?",
    frontSpeechText: "Vertically opposite angles are…?",
    backDefinition: "Vertically opposite angles are equal",
    backDefinitionSubtitle: "Formed opposite each other where two lines intersect",
    backSvgExamples: [{ shape: "angle-vertically-opposite", dimensions: { A: 42 }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "A = C,   B = D" },
      { formulaLine: "A + B = 180° (supplementary)" },
    ],
    backSpeechText: "Vertically opposite angles are equal",
  },

  "term-angle-alternate": {
    id: "term-angle-alternate", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Alternate angles", frontPrompt: "are…?",
    frontSpeechText: "Alternate angles are…?",
    backDefinition: "Alternate angles are equal",
    backDefinitionSubtitle: "Opposite sides of a transversal between parallel lines",
    backSvgExamples: [{ shape: "angle-parallel-alternate", dimensions: { angle: 55 }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "alternate angles are equal" },
    ],
    backSpeechText: "Alternate angles are equal when lines are parallel",
  },

  "term-angle-cointerior": {
    id: "term-angle-cointerior", topic: "angles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.angles,
    frontLabel: "Co-interior angles", frontPrompt: "are…?",
    frontSpeechText: "Co-interior angles are…?",
    backDefinition: "Co-interior angles sum to 180°",
    backDefinitionSubtitle: "Same side of a transversal between parallel lines",
    backSvgExamples: [{ shape: "angle-parallel-cointerior", dimensions: { A: 110 }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "A + B = 180°" },
    ],
    backSpeechText: "Co-interior angles sum to 180 degrees",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ANGLES — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-angle-supplementary": {
    id: "calc-angle-supplementary", topic: "angles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.angles,
    frontPrompt: "Solve for angle B",
    frontSvg: { shape: "angle-supplementary", dimensions: { A: 65, unknown: "B" }, labelMode: "numeric", unknownDimension: "B" },
    frontSpeechText: "One angle is 65 degrees. Find the unknown supplementary angle B.",
    backSteps: [
      { equationTokens: [t("lhs","A","#5ee8ff"), op("+"), t("mid","B","#d8b4fe"), eq(), t("sum","180°")], reason: "Supplementary angles sum to 180°" },
      { equationTokens: [t("lhs","65°","#5ee8ff"), op("+"), t("mid","B","#d8b4fe"), eq(), t("sum","180°")], reason: "Substitute A = 65°" },
      { equationTokens: [t("lhs","B","#d8b4fe"), eq(), t("rhs1","180°"), op("−"), t("rhs2","65°","#5ee8ff")], reason: "Isolate B" },
      { equationTokens: [t("lhs","B","#d8b4fe"), eq(), t("rhs","115°","#d8b4fe")], reason: "Evaluate" },
    ],
    backSpeechText: "B equals 115 degrees", numericAnswer: 115,
  },

  "calc-angle-complementary": {
    id: "calc-angle-complementary", topic: "angles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.angles,
    frontPrompt: "Solve for angle B",
    frontSvg: { shape: "angle-complementary", dimensions: { A: 35, unknown: "B" }, labelMode: "numeric", unknownDimension: "B" },
    frontSpeechText: "One angle is 35 degrees. Find the unknown complementary angle B.",
    backSteps: [
      { equationTokens: [t("lhs","A","#5ee8ff"), op("+"), t("mid","B","#d8b4fe"), eq(), t("sum","90°")], reason: "Complementary angles sum to 90°" },
      { equationTokens: [t("lhs","35°","#5ee8ff"), op("+"), t("mid","B","#d8b4fe"), eq(), t("sum","90°")], reason: "Substitute A = 35°" },
      { equationTokens: [t("lhs","B","#d8b4fe"), eq(), t("rhs1","90°"), op("−"), t("rhs2","35°","#5ee8ff")], reason: "Isolate B" },
      { equationTokens: [t("lhs","B","#d8b4fe"), eq(), t("rhs","55°","#d8b4fe")], reason: "Evaluate" },
    ],
    backSpeechText: "B equals 55 degrees", numericAnswer: 55,
  },

  "calc-angle-vertically-opp": {
    id: "calc-angle-vertically-opp", topic: "angles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.angles,
    frontPrompt: "Solve for angle C",
    frontSvg: { shape: "angle-vertically-opposite", dimensions: { A: 75, unknown: "C" }, labelMode: "numeric", unknownDimension: "C" },
    frontSpeechText: "One angle is 75 degrees. Find vertically opposite angle C.",
    backSteps: [
      { equationTokens: [t("lhs","C","#5ee8ff"), eq(), t("rhs","A","#5ee8ff")], reason: "Vertically opposite angles are equal" },
      { equationTokens: [t("lhs","C","#5ee8ff"), eq(), t("rhs","75°","#5ee8ff")], reason: "Substitute A = 75°" },
    ],
    backSpeechText: "C equals 75 degrees", numericAnswer: 75,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TRIANGLES — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-tri-equilateral": {
    id: "term-tri-equilateral", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Equilateral triangles", frontPrompt: "are…?",
    frontSpeechText: "Equilateral triangles are…?",
    backDefinition: "3 equal sides, 3 equal angles (60° each)",
    backSvgExamples: [{ shape: "triangle", dimensions: { style: "equilateral", labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "All sides equal, all angles = 60°" }],
    backSpeechText: "Equilateral triangles have 3 equal sides and 3 equal angles of 60 degrees each",
  },

  "term-tri-isosceles": {
    id: "term-tri-isosceles", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Isosceles triangles", frontPrompt: "are…?",
    frontSpeechText: "Isosceles triangles are…?",
    backDefinition: "2 equal sides, 2 equal base angles",
    backSvgExamples: [{ shape: "triangle", dimensions: { style: "isosceles", labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "2 equal sides → 2 equal base angles" }],
    backSpeechText: "Isosceles triangles have 2 equal sides and 2 equal base angles",
  },

  "term-tri-scalene": {
    id: "term-tri-scalene", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Scalene triangles", frontPrompt: "are…?",
    frontSpeechText: "Scalene triangles are…?",
    backDefinition: "No equal sides, no equal angles",
    backSvgExamples: [{ shape: "triangle", dimensions: { style: "scalene", labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "All sides different, all angles different" }],
    backSpeechText: "Scalene triangles have no equal sides and no equal angles",
  },

  "term-tri-right": {
    id: "term-tri-right", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Right triangles", frontPrompt: "are…?",
    frontSpeechText: "Right triangles are…?",
    backDefinition: "One angle is exactly 90°",
    backSvgExamples: [{ shape: "right-triangle", dimensions: { a: 3, b: 4, c: 5, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "One angle = 90° (right angle)" }],
    backSpeechText: "Right triangles have one angle of exactly 90 degrees",
  },

  "term-tri-angle-sum": {
    id: "term-tri-angle-sum", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "The triangle angle sum", frontPrompt: "is…?",
    frontSpeechText: "The triangle angle sum is…?",
    backDefinition: "A + B + C = 180°",
    backDefinitionSubtitle: "Interior angles always sum to 180°",
    backSvgExamples: [{ shape: "triangle", dimensions: { angA: 60, angB: 70, unknown: "C", style: "scalene", labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "A + B + C = 180°" },
      { formulaLine: "Interior angles always sum to 180°" },
    ],
    backSpeechText: "The triangle angle sum is A plus B plus C equals 180 degrees",
  },

  "term-tri-pythag": {
    id: "term-tri-pythag", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
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
    backSpeechText: "The Pythagorean theorem states a squared plus b squared equals c squared",
  },

  "term-tri-area": {
    id: "term-tri-area", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Area of a triangle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the area of a triangle is…?",
    backDefinition: "A = ½ · b · h",
    backDefinitionSubtitle: "Area = ½ · base · height",
    backSvgExamples: [{ shape: "triangle", dimensions: { b: "b", h: "h", style: "scalene", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "A = ½ · b · h" },
      { formulaLine: "Area = ½ · base · height" },
    ],
    backSpeechText: "Area equals one half base times height",
  },

  "term-tri-perim": {
    id: "term-tri-perim", topic: "triangles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.triangles,
    frontLabel: "Perimeter of a triangle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the perimeter of a triangle is…?",
    backDefinition: "P = a + b + c",
    backDefinitionSubtitle: "Perimeter = sum of all 3 sides",
    backSvgExamples: [{ shape: "triangle", dimensions: { a: "a", b: "b", c: "c", style: "scalene", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "P = a + b + c" },
      { formulaLine: "Perimeter = sum of all 3 sides" },
    ],
    backSpeechText: "Perimeter equals a plus b plus c",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TRIANGLES — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-tri-angle-sum": {
    id: "calc-tri-angle-sum", topic: "triangles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.triangles,
    frontPrompt: "Solve for angle C",
    frontSvg: { shape: "triangle", dimensions: { angA: 40, angB: 65, unknown: "C", style: "scalene", labelMode: "numeric" }, labelMode: "numeric" },
    frontSpeechText: "A is 40 degrees, B is 65 degrees. Find C.",
    backSteps: [
      { equationTokens: [t("A","A","#5ee8ff"), d("p1"," + "), t("B","B","#ffd45e"), d("p2"," + "), t("C","C","#d8b4fe"), eq(), t("sum","180°")], reason: "Triangle angle sum theorem" },
      { equationTokens: [t("A","40°","#5ee8ff"), d("p1"," + "), t("B","65°","#ffd45e"), d("p2"," + "), t("C","C","#d8b4fe"), eq(), t("sum","180°")], reason: "Substitute known values" },
      { equationTokens: [t("lhs","C","#d8b4fe"), eq(), t("r1","180°"), op("−"), t("r2","40°","#5ee8ff"), op("−"), t("r3","65°","#ffd45e")], reason: "Isolate C" },
      { equationTokens: [t("lhs","C","#d8b4fe"), eq(), t("rhs","75°","#d8b4fe")], reason: "Evaluate" },
    ],
    backSpeechText: "C equals 75 degrees", numericAnswer: 75,
  },

  "calc-tri-area": {
    id: "calc-tri-area", topic: "triangles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.triangles,
    frontPrompt: "Solve for the triangle area",
    frontSvg: { shape: "triangle", dimensions: { b: 8, h: 5, style: "scalene", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
    frontSpeechText: "Base is 8, height is 5. Find the triangle area.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("half","½"), op("×"), t("b","b","#ffd45e"), op("×"), t("h","h","#5ee8ff")], reason: "Triangle area formula" },
      { equationTokens: [t("lhs","A"), eq(), t("half","½"), op("×"), t("b","8","#ffd45e"), op("×"), t("h","5","#5ee8ff")], svgMutation: { fillInterior: true }, reason: "Substitute known values" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","20")], reason: "Evaluate" },
    ],
    backSpeechText: "A equals 20", numericAnswer: 20,
  },

  "calc-tri-perimeter": {
    id: "calc-tri-perimeter", topic: "triangles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.triangles,
    frontPrompt: "Solve for the triangle perimeter",
    frontSvg: { shape: "triangle", dimensions: { a: 5, b: 7, c: 9, style: "scalene", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
    frontSpeechText: "Sides are 5, 7, and 9. Find the triangle perimeter.",
    backSteps: [
      { equationTokens: [t("lhs","P"), eq(), t("a","a","#5ee8ff"), op("+"), t("b","b","#ffd45e"), op("+"), t("c","c","#d8b4fe")], svgMutation: { traceStroke: "perimeter" }, reason: "Triangle perimeter formula" },
      { equationTokens: [t("lhs","P"), eq(), t("a","5","#5ee8ff"), op("+"), t("b","7","#ffd45e"), op("+"), t("c","9","#d8b4fe")], reason: "Substitute known values" },
      { equationTokens: [t("lhs","P"), eq(), t("rhs","21")], reason: "Evaluate" },
    ],
    backSpeechText: "P equals 21", numericAnswer: 21,
  },

  "calc-tri-pyth-c": {
    id: "calc-tri-pyth-c", topic: "triangles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.triangles,
    frontPrompt: "Solve for hypotenuse (c)",
    frontSvg: { shape: "right-triangle", dimensions: { a: 3, b: 4, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "c" },
    frontSpeechText: "a is 3, b is 4. Find c.",
    backSteps: [
      { equationTokens: [t("a","a²","#5ee8ff"), op("+"), t("b","b²","#ffd45e"), eq(), t("c","c²","#d8b4fe")], reason: "Pythagorean theorem" },
      { equationTokens: [t("a","3²","#5ee8ff"), op("+"), t("b","4²","#ffd45e"), eq(), t("c","c²","#d8b4fe")], reason: "Substitute known values" },
      { equationTokens: [t("a","9","#5ee8ff"), op("+"), t("b","16","#ffd45e"), eq(), t("c","25","#d8b4fe")], svgMutation: { traceStroke: "hypotenuse" }, reason: "Square both values" },
      { equationTokens: [t("c","c","#d8b4fe"), eq(), t("rhs","5","#d8b4fe")], reason: "Take the square root" },
    ],
    backSpeechText: "c equals 5", numericAnswer: 5,
  },

  "calc-tri-pyth-b": {
    id: "calc-tri-pyth-b", topic: "triangles", cardType: "calculation", variant: "reverse",
    color: TOPIC_COLORS.triangles,
    frontPrompt: "Solve for leg (a)",
    frontSvg: { shape: "right-triangle", dimensions: { b: 5, c: 13, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "a" },
    frontSpeechText: "b is 5, c is 13. Find a.",
    backSteps: [
      { equationTokens: [t("a","a²","#5ee8ff"), op("+"), t("b","b²","#ffd45e"), eq(), t("c","c²","#d8b4fe")], reason: "Pythagorean theorem" },
      { equationTokens: [t("a","a²","#5ee8ff"), op("+"), t("b","5²","#ffd45e"), eq(), t("c","13²","#d8b4fe")], reason: "Substitute known values" },
      { equationTokens: [t("a","a²","#5ee8ff"), eq(), t("c","169","#d8b4fe"), op("−"), t("b","25","#ffd45e"), eq(), t("ans","144","#5ee8ff")], reason: "Isolate a²" },
      { equationTokens: [t("a","a","#5ee8ff"), eq(), t("rhs","12","#5ee8ff")], svgMutation: { traceStroke: "hypotenuse" }, reason: "Take the square root" },
    ],
    backSpeechText: "a equals 12", numericAnswer: 12,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // QUADRILATERALS — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-quad-parallelogram": {
    id: "term-quad-parallelogram", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Parallelograms", frontPrompt: "are…?",
    frontSpeechText: "Parallelograms are…?",
    backDefinition: "Opposite sides equal and parallel, opposite angles equal",
    backSvgExamples: [{ shape: "parallelogram", dimensions: { b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "Opposite sides ∥ and equal" },
      { formulaLine: "Opposite angles equal" },
    ],
    backSpeechText: "Parallelograms have opposite sides equal and parallel, and opposite angles equal",
  },

  "term-quad-rhombus": {
    id: "term-quad-rhombus", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Rhombuses", frontPrompt: "are…?",
    frontSpeechText: "Rhombuses are…?",
    backDefinition: "4 equal sides, opposite angles equal, NOT necessarily 90°",
    backSvgExamples: [{ shape: "parallelogram", dimensions: { b: 6, h: 4, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "All 4 sides equal" },
      { formulaLine: "Angles NOT necessarily 90°" },
    ],
    backSpeechText: "Rhombuses have 4 equal sides",
  },

  "term-quad-trapezoid": {
    id: "term-quad-trapezoid", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Trapezoids", frontPrompt: "are…?",
    frontSpeechText: "Trapezoids are…?",
    backDefinition: "Exactly one pair of parallel sides",
    backSvgExamples: [{ shape: "trapezoid", dimensions: { a: 5, b: 9, h: 4, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "Exactly 1 pair of parallel sides" }],
    backSpeechText: "Trapezoids have exactly one pair of parallel sides",
  },

  "term-quad-rect-area": {
    id: "term-quad-rect-area", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Area of a rectangle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the area of a rectangle is…?",
    backDefinition: "A = l × w",
    backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "A = length × width" }],
    backSpeechText: "Area equals length times width",
  },

  "term-quad-rect-perim": {
    id: "term-quad-rect-perim", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Perimeter of a rectangle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the perimeter of a rectangle is…?",
    backDefinition: "P = 2(l + w)",
    backSvgExamples: [{ shape: "rectangle", dimensions: { l: "l", w: "w", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "P = 2l + 2w" },
      { formulaLine: "P = 2(l + w)" },
    ],
    backSpeechText: "Perimeter equals 2 times length plus width",
  },

  "term-quad-para-area": {
    id: "term-quad-para-area", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Area of a parallelogram", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the area of a parallelogram is…?",
    backDefinition: "A = b × h",
    backSvgExamples: [{ shape: "parallelogram", dimensions: { b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "A = base × perpendicular height" }],
    backSpeechText: "Area equals base times height",
  },

  "term-quad-trap-area": {
    id: "term-quad-trap-area", topic: "quadrilaterals", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.quadrilaterals,
    frontLabel: "Area of a trapezoid", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the area of a trapezoid is…?",
    backDefinition: "A = ½(a + b)h",
    backSvgExamples: [{ shape: "trapezoid", dimensions: { a: "a", b: "b", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "A = ½ × (sum of parallel sides) × height" }],
    backSpeechText: "Area equals one half a plus b times height",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // QUADRILATERALS — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-quad-rect-area": {
    id: "calc-quad-rect-area", topic: "quadrilaterals", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.quadrilaterals,
    frontPrompt: "Calculate the area",
    frontSvg: { shape: "rectangle", dimensions: { l: 7, w: 4, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
    frontSpeechText: "Length is 7, width is 4. Find the area.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","l × w")], reason: "Rectangle area formula" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","7 × 4")], svgMutation: { fillInterior: true }, reason: "Substitute l = 7, w = 4" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","28")], reason: "Evaluate" },
    ],
    backSpeechText: "A equals 28", numericAnswer: 28,
  },

  "calc-quad-rect-perim": {
    id: "calc-quad-rect-perim", topic: "quadrilaterals", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.quadrilaterals,
    frontPrompt: "Calculate the perimeter",
    frontSvg: { shape: "rectangle", dimensions: { l: 7, w: 4, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
    frontSpeechText: "Length is 7, width is 4. Find the perimeter.",
    backSteps: [
      { equationTokens: [t("lhs","P"), eq(), t("rhs","2(l + w)")], svgMutation: { traceStroke: "perimeter" }, reason: "Rectangle perimeter formula" },
      { equationTokens: [t("lhs","P"), eq(), t("rhs","2(7 + 4)")], reason: "Substitute l = 7, w = 4" },
      { equationTokens: [t("lhs","P"), eq(), t("rhs","22")], reason: "Evaluate" },
    ],
    backSpeechText: "P equals 22", numericAnswer: 22,
  },

  "calc-quad-para-area": {
    id: "calc-quad-para-area", topic: "quadrilaterals", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.quadrilaterals,
    frontPrompt: "Calculate the area",
    frontSvg: { shape: "parallelogram", dimensions: { b: 8, h: 5, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
    frontSpeechText: "Base is 8, height is 5. Find the area.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","b × h")], reason: "Parallelogram area formula" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","8 × 5")], svgMutation: { fillInterior: true }, reason: "Substitute b = 8, h = 5" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","40")], reason: "Evaluate" },
    ],
    backSpeechText: "A equals 40", numericAnswer: 40,
  },

  "calc-quad-trap-area": {
    id: "calc-quad-trap-area", topic: "quadrilaterals", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.quadrilaterals,
    frontPrompt: "Calculate the area",
    frontSvg: { shape: "trapezoid", dimensions: { a: 4, b: 10, h: 5, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
    frontSpeechText: "a is 4, b is 10, h is 5. Find the area.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","½(a + b)h")], reason: "Trapezoid area formula" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","½(4 + 10) × 5")], svgMutation: { fillInterior: true }, reason: "Substitute a = 4, b = 10, h = 5" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","35")], reason: "Evaluate" },
    ],
    backSpeechText: "A equals 35", numericAnswer: 35,
  },

  "calc-quad-rect-reverse": {
    id: "calc-quad-rect-reverse", topic: "quadrilaterals", cardType: "calculation", variant: "reverse",
    color: TOPIC_COLORS.quadrilaterals,
    frontPrompt: "Solve for length l",
    frontSvg: { shape: "rectangle", dimensions: { A: 24, w: 4, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "l" },
    frontSpeechText: "Area is 24, width is 4. Find the length.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","l × w")], reason: "Rectangle area formula" },
      { equationTokens: [t("lhs","24"), eq(), t("rhs","l × 4")], reason: "Substitute A = 24, w = 4" },
      { equationTokens: [t("lhs","l"), eq(), t("rhs","24 ÷ 4")], reason: "Divide both sides by w" },
      { equationTokens: [t("lhs","l"), eq(), t("rhs","6")], reason: "Evaluate" },
    ],
    backSpeechText: "l equals 6", numericAnswer: 6,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CIRCLES — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-circle-circumference": {
    id: "term-circle-circumference", topic: "circles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.circles,
    frontLabel: "Circumference of a circle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the circumference of a circle is…?",
    backDefinition: "C = 2πr",
    backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "C = 2 × π × r" },
      { formulaLine: "C = 2πr (or C = πd)" },
    ],
    backSpeechText: "Circumference equals 2 pi r",
  },

  "term-circle-area": {
    id: "term-circle-area", topic: "circles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.circles,
    frontLabel: "Area of a circle", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the area of a circle is…?",
    backDefinition: "A = πr²",
    backSvgExamples: [{ shape: "circle", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "A = π × r²" },
      { formulaLine: "A = πr²" },
    ],
    backSpeechText: "Area equals pi r squared",
  },

  "term-circle-pi": {
    id: "term-circle-pi", topic: "circles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.circles,
    frontLabel: "π (pi)", frontPrompt: "is…?",
    frontSpeechText: "Pi is…?",
    backDefinition: "The ratio of circumference to diameter ≈ 3.14159…",
    backSvgExamples: [{ shape: "circle", dimensions: { r: 5, showDiameter: 1, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "π = C ÷ d" },
      { formulaLine: "π ≈ 3.14159…" },
    ],
    backSpeechText: "Pi is the ratio of circumference to diameter",
  },

  "term-circle-radius": {
    id: "term-circle-radius", topic: "circles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.circles,
    frontLabel: "The radius", frontPrompt: "is…?",
    frontSpeechText: "The radius is…?",
    backDefinition: "The distance from the centre to any point on the edge",
    backSvgExamples: [{ shape: "circle", dimensions: { r: 5, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "radius = centre to edge" }],
    backSpeechText: "The radius is the distance from the center to any point on the edge",
  },

  "term-circle-diameter": {
    id: "term-circle-diameter", topic: "circles", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.circles,
    frontLabel: "The diameter", frontPrompt: "is…?",
    frontSpeechText: "The diameter is…?",
    backDefinition: "Twice the radius: d = 2r",
    backSvgExamples: [{ shape: "circle", dimensions: { r: 5, showDiameter: 1, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "d = 2r" },
      { formulaLine: "diameter = 2 × radius" },
    ],
    backSpeechText: "The diameter is twice the radius",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CIRCLES — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-circle-circ": {
    id: "calc-circle-circ", topic: "circles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.circles,
    frontPrompt: "Calculate the circumference",
    frontSvg: { shape: "circle", dimensions: { r: 4, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "C" },
    frontSpeechText: "Radius is 4. Find the circumference.",
    backSteps: [
      { equationTokens: [t("lhs","C"), eq(), t("rhs","2πr")], svgMutation: { traceStroke: "circumference" }, reason: "Circumference (C) formula" },
      { equationTokens: [t("lhs","C"), eq(), t("rhs","2π × 4")], reason: "Substitute r = 4" },
      { equationTokens: [t("lhs","C"), eq(), t("rhs","8π")], reason: "Evaluate" },
    ],
    backSpeechText: "C equals 8 pi", numericAnswer: 8,
  },

  "calc-circle-area": {
    id: "calc-circle-area", topic: "circles", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.circles,
    frontPrompt: "Calculate the area",
    frontSvg: { shape: "circle", dimensions: { r: 5, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "A" },
    frontSpeechText: "Radius is 5. Find the area.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","πr²")], reason: "Circle area formula" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","π × 5²")], svgMutation: { fillInterior: true }, reason: "Substitute r = 5" },
      { equationTokens: [t("lhs","A"), eq(), t("rhs","25π")], reason: "Evaluate" },
    ],
    backSpeechText: "A equals 25 pi", numericAnswer: 25,
  },

  "calc-circle-r-from-c": {
    id: "calc-circle-r-from-c", topic: "circles", cardType: "calculation", variant: "reverse",
    color: TOPIC_COLORS.circles,
    frontPrompt: "Solve for radius r",
    frontSvg: { shape: "circle", dimensions: { C: "6π", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
    frontSpeechText: "C equals 6 pi. Find the radius.",
    backSteps: [
      { equationTokens: [t("lhs","C"), eq(), t("rhs","2πr")], reason: "Circumference (C) formula" },
      { equationTokens: [t("lhs","6π"), eq(), t("rhs","2πr")], reason: "Substitute C = 6π" },
      { equationTokens: [t("lhs","r"), eq(), t("rhs","6π ÷ 2π")], reason: "Divide both sides by 2π" },
      { equationTokens: [t("lhs","r"), eq(), t("rhs","3")], reason: "Evaluate" },
    ],
    backSpeechText: "r equals 3", numericAnswer: 3,
  },

  "calc-circle-r-from-a": {
    id: "calc-circle-r-from-a", topic: "circles", cardType: "calculation", variant: "reverse",
    color: TOPIC_COLORS.circles,
    frontPrompt: "Solve for radius r",
    frontSvg: { shape: "circle", dimensions: { A: "9π", labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "r" },
    frontSpeechText: "A equals 9 pi. Find the radius.",
    backSteps: [
      { equationTokens: [t("lhs","A"), eq(), t("rhs","πr²")], reason: "Circle area formula" },
      { equationTokens: [t("lhs","9π"), eq(), t("rhs","πr²")], reason: "Substitute A = 9π" },
      { equationTokens: [t("lhs","r²"), eq(), t("rhs","9")], reason: "Divide both sides by π" },
      { equationTokens: [t("lhs","r"), eq(), t("rhs","√9 = 3")], reason: "Take the square root" },
    ],
    backSpeechText: "r equals 3", numericAnswer: 3,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // POLYGONS — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-poly-regular": {
    id: "term-poly-regular", topic: "polygons", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.polygons,
    frontLabel: "Regular polygons", frontPrompt: "are…?",
    frontSpeechText: "Regular polygons are…?",
    backDefinition: "All sides equal, all interior angles equal",
    backSvgExamples: [{ shape: "polygon", dimensions: { n: 5, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [{ formulaLine: "Equal sides + equal angles" }],
    backSpeechText: "Regular polygons have all sides equal and all interior angles equal",
  },

  "term-poly-interior-sum": {
    id: "term-poly-interior-sum", topic: "polygons", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.polygons,
    frontLabel: "Polygon interior angle sum", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the interior angle sum of a polygon is…?",
    backDefinition: "Sum = (n − 2) × 180°",
    backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "Sum = (n − 2) × 180°" },
      { formulaLine: "n = number of sides" },
    ],
    backSpeechText: "The interior angle sum equals n minus 2 times 180 degrees",
  },

  "term-poly-perim": {
    id: "term-poly-perim", topic: "polygons", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.polygons,
    frontLabel: "Perimeter of a regular polygon", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the perimeter of a regular polygon is…?",
    backDefinition: "P = n × s",
    backSvgExamples: [{ shape: "polygon", dimensions: { n: 5, s: "s", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "P = n × s (number of sides × side length)" }],
    backSpeechText: "Perimeter equals n times s",
  },

  "term-poly-each-angle": {
    id: "term-poly-each-angle", topic: "polygons", cardType: "term", variant: "definition",
    color: TOPIC_COLORS.polygons,
    frontLabel: "Regular polygon interior angle", frontPrompt: "formula is…?",
    frontSpeechText: "Each interior angle of a regular polygon is…?",
    backDefinition: "Each = (n − 2) × 180° ÷ n",
    backSvgExamples: [{ shape: "polygon", dimensions: { n: 6, labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [
      { formulaLine: "Sum = (n − 2) × 180°" },
      { formulaLine: "Each angle = Sum ÷ n" },
    ],
    backSpeechText: "Each interior angle equals n minus 2 times 180 degrees divided by n",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // POLYGONS — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-poly-perimeter": {
    id: "calc-poly-perimeter", topic: "polygons", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.polygons,
    frontPrompt: "Calculate the perimeter",
    frontSvg: { shape: "polygon", dimensions: { n: 6, s: 8, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "P" },
    frontSpeechText: "Regular polygon with 6 sides of length 8. Find the perimeter.",
    backSteps: [
      { equationTokens: [t("lhs","P"), eq(), t("rhs","n × s")], svgMutation: { traceStroke: "perimeter" }, reason: "Regular polygon perimeter" },
      { equationTokens: [t("lhs","P"), eq(), t("rhs","6 × 8")], reason: "Substitute n = 6, s = 8" },
      { equationTokens: [t("lhs","P"), eq(), t("rhs","48")], reason: "Evaluate" },
    ],
    backSpeechText: "P equals 48", numericAnswer: 48,
  },

  "calc-poly-angle-sum": {
    id: "calc-poly-angle-sum", topic: "polygons", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.polygons,
    frontPrompt: "Calculate the interior angle sum",
    frontSvg: { shape: "polygon", dimensions: { n: 7, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "Sum" },
    frontSpeechText: "Regular polygon with 7 sides. Find the interior angle sum.",
    backSteps: [
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","(n − 2) × 180°")], reason: "Interior angle sum formula" },
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","(7 − 2) × 180°")], reason: "Substitute n = 7" },
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","5 × 180°")], reason: "Simplify bracket" },
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","900°")], reason: "Evaluate" },
    ],
    backSpeechText: "Interior angle sum equals 900 degrees", numericAnswer: 900,
  },

  "calc-poly-each-angle-hex": {
    id: "calc-poly-each-angle-hex", topic: "polygons", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS.polygons,
    frontPrompt: "Calculate each interior angle",
    frontSvg: { shape: "polygon", dimensions: { n: 6, labelMode: "numeric" }, labelMode: "numeric", unknownDimension: "Each" },
    frontSpeechText: "Regular hexagon with 6 sides. Find each interior angle.",
    backSteps: [
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","(n − 2) × 180°")], reason: "Interior angle sum formula" },
      { equationTokens: [t("lhs","Sum"), eq(), t("rhs","720°")], reason: "Evaluate for n = 6" },
      { equationTokens: [t("lhs","Each"), eq(), t("rhs","720° ÷ 6")], reason: "Divide by 6 sides" },
      { equationTokens: [t("lhs","Each"), eq(), t("rhs","120°")], reason: "Evaluate" },
    ],
    backSpeechText: "Each interior angle is 120 degrees", numericAnswer: 120,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3D SHAPES — TERM CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "term-3d-face": {
    id: "term-3d-face", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "A face", frontPrompt: "is…?",
    frontSpeechText: "A face is…?",
    backDefinition: "A flat surface of a 3D shape",
    backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "Face = flat surface" },
      { formulaLine: "A cube has 6 faces" },
    ],
    backSpeechText: "A face is a flat surface of a 3D shape",
  },

  "term-3d-edge": {
    id: "term-3d-edge", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "An edge", frontPrompt: "is…?",
    frontSpeechText: "An edge is…?",
    backDefinition: "A line where two faces meet",
    backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "Edge = line where 2 faces meet" },
      { formulaLine: "A cube has 12 edges" },
    ],
    backSpeechText: "An edge is where two faces meet",
  },

  "term-3d-vertex": {
    id: "term-3d-vertex", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "A vertex", frontPrompt: "is…?",
    frontSpeechText: "A vertex is…?",
    backDefinition: "A corner where edges meet",
    backSvgExamples: [{ shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "Vertex = corner where edges meet" },
      { formulaLine: "A cube has 8 vertices" },
    ],
    backSpeechText: "A vertex is a corner where edges meet",
  },

  "term-3d-euler": {
    id: "term-3d-euler", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Euler's formula", frontPrompt: "states…?",
    frontSpeechText: "Euler's formula states…?",
    backDefinition: "V − E + F = 2",
    backSvgExamples: [{ shape: "prism", dimensions: { l: 2, w: 2, h: 2, labelMode: "numeric" }, labelMode: "numeric" }],
    backSteps: [
      { formulaLine: "V − E + F = 2" },
      { formulaLine: "V = vertices, E = edges, F = faces" },
    ],
    backSpeechText: "Euler's formula states V minus E plus F equals 2",
  },

  "term-3d-prism-vol": {
    id: "term-3d-prism-vol", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Volume of a rectangular prism", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the volume of a rectangular prism is…?",
    backDefinition: "V = l × w × h",
    backSvgExamples: [{ shape: "prism", dimensions: { l: "l", w: "w", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "V = length × width × height" }],
    backSpeechText: "Volume equals length times width times height",
  },

  "term-3d-cyl-vol": {
    id: "term-3d-cyl-vol", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Volume of a cylinder", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the volume of a cylinder is…?",
    backDefinition: "V = πr²h",
    backSvgExamples: [{ shape: "cylinder", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "V = (base area) × height = πr²h" }],
    backSpeechText: "Volume equals pi r squared h",
  },

  "term-3d-cone-vol": {
    id: "term-3d-cone-vol", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Volume of a cone", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the volume of a cone is…?",
    backDefinition: "V = ⅓πr²h",
    backSvgExamples: [{ shape: "cone", dimensions: { r: "r", h: "h", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "V = ⅓ × πr²h (⅓ of cylinder)" }],
    backSpeechText: "Volume equals one third pi r squared h",
  },

  "term-3d-sphere-vol": {
    id: "term-3d-sphere-vol", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Volume of a sphere", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the volume of a sphere is…?",
    backDefinition: "V = ⁴⁄₃πr³",
    backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "V = ⁴⁄₃ × π × r³" }],
    backSpeechText: "Volume equals four thirds pi r cubed",
  },

  "term-3d-sphere-sa": {
    id: "term-3d-sphere-sa", topic: "3d-shapes", cardType: "term", variant: "definition",
    color: TOPIC_COLORS["3d-shapes"],
    frontLabel: "Surface area of a sphere", frontPrompt: "formula is…?",
    frontSpeechText: "The formula for the surface area of a sphere is…?",
    backDefinition: "SA = 4πr²",
    backSvgExamples: [{ shape: "sphere", dimensions: { r: "r", labelMode: "variable" }, labelMode: "variable" }],
    backSteps: [{ formulaLine: "SA = 4 × π × r²" }],
    backSpeechText: "Surface area equals 4 pi r squared",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3D SHAPES — CALC CARDS
  // ──────────────────────────────────────────────────────────────────────────

  "calc-3d-prism": {
    id: "calc-3d-prism", topic: "3d-shapes", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS["3d-shapes"],
    frontPrompt: "Calculate the volume",
    frontSvg: { shape: "prism", dimensions: { l: 4, w: 3, h: 2, labelMode: "numeric", unknown: "V" }, labelMode: "numeric" },
    frontSpeechText: "l = 4, w = 3, h = 2. Find the volume.",
    backSteps: [
      { equationTokens: [t("lhs","V"), eq(), t("rhs","l × w × h")], reason: "Rectangular prism volume" },
      { equationTokens: [t("lhs","V"), eq(), t("rhs","4 × 3 × 2")], reason: "Substitute l = 4, w = 3, h = 2" },
      { equationTokens: [t("lhs","V"), eq(), t("rhs","24")], reason: "Evaluate" },
    ],
    backSpeechText: "V equals 24", numericAnswer: 24,
  },

  "calc-3d-cylinder": {
    id: "calc-3d-cylinder", topic: "3d-shapes", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS["3d-shapes"],
    frontPrompt: "Calculate the volume",
    frontSvg: { shape: "cylinder", dimensions: { r: 3, h: 4, labelMode: "numeric", unknown: "V" }, labelMode: "numeric" },
    frontSpeechText: "r = 3, h = 4. Find the volume.",
    backSteps: [
      { equationTokens: [t("lhs","V"), eq(), t("rhs","πr²h")], reason: "Cylinder volume formula" },
      { equationTokens: [t("lhs","V"), eq(), t("rhs","π × 3² × 4")], reason: "Substitute r = 3, h = 4" },
      { equationTokens: [t("lhs","V"), eq(), t("rhs","36π")], reason: "Evaluate" },
    ],
    backSpeechText: "V equals 36 pi", numericAnswer: 36,
  },

  "calc-3d-euler": {
    id: "calc-3d-euler", topic: "3d-shapes", cardType: "calculation", variant: "compute",
    color: TOPIC_COLORS["3d-shapes"],
    frontPrompt: "Solve for vertices (V)",
    frontSvg: { shape: "prism", dimensions: { l: 2, w: 2, h: 2, labelMode: "numeric" }, labelMode: "numeric" },
    frontSpeechText: "A cube has 6 faces and 12 edges. How many vertices?",
    backSteps: [
      { equationTokens: [t("lhs","V − E + F"), eq(), t("rhs","2")], reason: "Euler's formula" },
      { equationTokens: [t("lhs","V − 12 + 6"), eq(), t("rhs","2")], reason: "Substitute E = 12, F = 6" },
      { equationTokens: [t("lhs","V − 6"), eq(), t("rhs","2")], reason: "Simplify" },
      { equationTokens: [t("lhs","V"), eq(), t("rhs","8 vertices")], reason: "Solve for V" },
    ],
    backSpeechText: "The cube has 8 vertices", numericAnswer: 8,
  },
};

/** All catalogue IDs in a stable order for Playwright iteration */
export const TEST_CARD_IDS = Object.keys(TEST_CARDS);
