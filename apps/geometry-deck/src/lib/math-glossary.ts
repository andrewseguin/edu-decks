export interface GlossaryEntry {
  title: string;
  explanation: string;
  example?: string;
}

export const MATH_GLOSSARY: Record<string, GlossaryEntry> = {
  isolate: {
    title: "Get the Letter Alone",
    explanation: "Move all the other numbers to the other side of the = sign so our mystery letter sits all by itself.",
    example: "A + B + C = 180°  →  C = 180° − A − B",
  },
  substitute: {
    title: "Plug in the Numbers",
    explanation: "Swap out the letter names for the real numbers we already know.",
    example: "Swap A with 40° and B with 65°.",
  },
  evaluate: {
    title: "Do the Math",
    explanation: "Calculate the final answer by adding, subtracting, or multiplying the numbers.",
    example: "180° − 40° − 65° = 75°",
  },
  simplify: {
    title: "Clean It Up",
    explanation: "Do the easy math first (like inside parentheses) to make the equation shorter and simpler.",
    example: "(6 − 2) × 180° becomes 4 × 180°",
  },
  "square root": {
    title: "Find the Root (√)",
    explanation: "Ask: 'What number multiplied by itself gives this number?'",
    example: "5 × 5 = 25, so √25 = 5.",
  },
  "square both": {
    title: "Multiply by Itself (x²)",
    explanation: "Multiply a number by itself once.",
    example: "3² means 3 × 3 = 9, and 4² means 4 × 4 = 16.",
  },
  "triangle angle sum": {
    title: "3 Corners Make 180°",
    explanation: "If you add up all 3 inside corners of any flat triangle, they always make 180°.",
    example: "Corner A + Corner B + Corner C = 180°",
  },
  "pythagorean theorem": {
    title: "Pythagorean Rule",
    explanation: "In a triangle with a square corner, the two short sides squared add up to the long diagonal side squared.",
    example: "a² + b² = c²",
  },
  supplementary: {
    title: "Straight Line (180°)",
    explanation: "Two angles that sit together on a flat straight line always add up to 180°.",
    example: "Angle A + Angle B = 180°",
  },
  complementary: {
    title: "Square Corner (90°)",
    explanation: "Two angles that fit together into a square 90° corner always add up to 90°.",
    example: "Angle A + Angle B = 90°",
  },
  "vertically opposite": {
    title: "Crossed Lines Match",
    explanation: "When two straight lines cross like an 'X', the angles directly opposite each other are identical twins (same size).",
  },
  perimeter: {
    title: "Walk Around the Outside",
    explanation: "The total distance you would walk if you walked all the way around the outside edges of the shape.",
  },
  area: {
    title: "Tiles Covering the Inside",
    explanation: "How many 1×1 square tiles you need to completely cover the flat inside of the shape.",
  },
  circumference: {
    title: "Around the Circle",
    explanation: "The total distance all the way around the outer rim of a round circle.",
    example: "Circumference = 2 × π × radius",
  },
  euler: {
    title: "Euler's 3D Block Rule",
    explanation: "For solid 3D shapes: Corners minus Edges plus Flat Faces always equals 2.",
    example: "Corners − Edges + Faces = 2",
  },
  divide: {
    title: "Divide Both Sides",
    explanation: "Divide both sides by the same number to undo multiplication and get the letter alone.",
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
