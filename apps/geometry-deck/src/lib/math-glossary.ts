export interface GlossaryEntry {
  title: string;
  explanation: string;
  example?: string;
}

export const MATH_GLOSSARY: Record<string, GlossaryEntry> = {
  isolate: {
    title: "Isolate a Variable",
    explanation: "Rearrange the equation using inverse operations (like subtraction or division) so the unknown letter sits completely alone on one side of the equals sign.",
    example: "A + B + C = 180°  →  C = 180° − A − B",
  },
  substitute: {
    title: "Substitution",
    explanation: "Replace variable letters in a formula with their known numerical values.",
    example: "In A + B + C = 180°, replace A with 40° and B with 65°.",
  },
  evaluate: {
    title: "Evaluate",
    explanation: "Perform the arithmetic calculations (addition, subtraction, multiplication) to compute the final numerical result.",
    example: "180° − 40° − 65° = 75°",
  },
  simplify: {
    title: "Simplify",
    explanation: "Combine terms or perform intermediate arithmetic inside brackets to make the equation simpler.",
    example: "(6 − 2) × 180°  →  4 × 180°",
  },
  "square root": {
    title: "Take the Square Root (√)",
    explanation: "The inverse of squaring: find the positive number that, when multiplied by itself, equals the given value.",
    example: "If c² = 25, then c = √25 = 5.",
  },
  "square both": {
    title: "Square (x²)",
    explanation: "Multiply a number by itself.",
    example: "3² = 3 × 3 = 9, and 4² = 4 × 4 = 16.",
  },
  "triangle angle sum": {
    title: "Triangle Angle Sum Theorem",
    explanation: "The interior angles of any triangle on a flat surface always add up to exactly 180°.",
    example: "A + B + C = 180°",
  },
  "pythagorean theorem": {
    title: "Pythagorean Theorem",
    explanation: "In any right-angled triangle, the square of the hypotenuse (c) equals the sum of the squares of both legs (a and b).",
    example: "a² + b² = c²",
  },
  supplementary: {
    title: "Supplementary Angles",
    explanation: "Two angles that lie along a straight line and sum to exactly 180°.",
    example: "A + B = 180°",
  },
  complementary: {
    title: "Complementary Angles",
    explanation: "Two angles that form a right angle (90°) and sum to exactly 90°.",
    example: "A + B = 90°",
  },
  "vertically opposite": {
    title: "Vertically Opposite Angles",
    explanation: "Angles directly opposite each other at an intersection of two straight lines. They are always equal.",
  },
  perimeter: {
    title: "Perimeter (P)",
    explanation: "The total continuous distance around the outside boundary of a 2D shape.",
  },
  area: {
    title: "Area (A)",
    explanation: "The total 2D surface space enclosed within the boundary lines of a shape, measured in square units.",
  },
  circumference: {
    title: "Circumference (C)",
    explanation: "The boundary distance around the edge of a circle.",
    example: "C = 2πr",
  },
  euler: {
    title: "Euler's Polyhedron Formula",
    explanation: "A theorem for 3D polyhedra: Vertices minus Edges plus Faces always equals 2.",
    example: "V − E + F = 2",
  },
  divide: {
    title: "Inverse Operation (Division)",
    explanation: "Divide both sides of an equation by the same non-zero number to isolate the variable.",
  },
};

export function lookupGlossary(reason: string): GlossaryEntry | null {
  const lower = reason.toLowerCase();
  if (lower.startsWith("isolate")) return MATH_GLOSSARY.isolate;
  if (lower.startsWith("substitute")) return MATH_GLOSSARY.substitute;
  if (lower.startsWith("evaluate")) return MATH_GLOSSARY.evaluate;
  if (lower.includes("simplify")) return MATH_GLOSSARY.simplify;
  if (lower.includes("square root")) return MATH_GLOSSARY["square root"];
  if (lower.includes("square both") || lower.includes("square the")) return MATH_GLOSSARY["square both"];
  if (lower.includes("triangle angle sum") || lower.includes("angle sum")) return MATH_GLOSSARY["triangle angle sum"];
  if (lower.includes("pythagorean")) return MATH_GLOSSARY["pythagorean theorem"];
  if (lower.includes("supplementary")) return MATH_GLOSSARY.supplementary;
  if (lower.includes("complementary")) return MATH_GLOSSARY.complementary;
  if (lower.includes("vertically opposite")) return MATH_GLOSSARY["vertically opposite"];
  if (lower.includes("perimeter")) return MATH_GLOSSARY.perimeter;
  if (lower.includes("area")) return MATH_GLOSSARY.area;
  if (lower.includes("circumference")) return MATH_GLOSSARY.circumference;
  if (lower.includes("euler")) return MATH_GLOSSARY.euler;
  if (lower.includes("divide")) return MATH_GLOSSARY.divide;
  return null;
}
