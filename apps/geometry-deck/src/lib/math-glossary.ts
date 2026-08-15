export interface GlossaryEntry {
  title: string;
  explanation: string;
  formula?: string;
}

export const MATH_GLOSSARY: Record<string, GlossaryEntry> = {
  isolate: {
    title: "Isolate the Variable",
    explanation: "Move all other numbers and terms to the opposite side of the = sign so the target variable letter sits by itself.",
  },
  substitute: {
    title: "Substitute Known Values",
    explanation: "Replace the variable letters with the known numeric values from the diagram.",
  },
  evaluate: {
    title: "Evaluate Calculation",
    explanation: "Perform the arithmetic operations to calculate the final numerical value.",
  },
  simplify: {
    title: "Simplify Expression",
    explanation: "Perform the basic operations (such as inside parentheses) to make the equation shorter and cleaner.",
  },
  "square root": {
    title: "Take the Square Root (√)",
    explanation: "Find the positive number that multiplies by itself to produce the value.",
  },
  "square both": {
    title: "Square Both Sides (x²)",
    explanation: "Multiply each side of the equation by itself.",
  },
  "triangle angle sum": {
    title: "Triangle Angle Sum (180°)",
    explanation: "The three interior angles of any planar triangle always add up to exactly 180°.",
    formula: "A + B + C = 180°",
  },
  "pythagorean theorem": {
    title: "Pythagorean Theorem",
    explanation: "In any right-angled triangle, the sum of the squares of the two legs equals the square of the hypotenuse.",
    formula: "a² + b² = c²",
  },
  supplementary: {
    title: "Supplementary Angles (180°)",
    explanation: "Angles along a straight line add up to 180°.",
    formula: "A + B = 180°",
  },
  complementary: {
    title: "Complementary Angles (90°)",
    explanation: "Angles that form a right angle add up to 90°.",
    formula: "A + B = 90°",
  },
  "vertically opposite": {
    title: "Vertical Angles",
    explanation: "Opposite angles formed by two intersecting straight lines are always equal.",
  },
  "triangle perimeter": {
    title: "Triangle Perimeter Formula",
    explanation: "Add up the lengths of all three sides (a, b, and c) to find the total outer boundary distance.",
    formula: "P = a + b + c",
  },
  perimeter: {
    title: "Perimeter",
    explanation: "The total continuous distance around the outer boundary of a shape.",
    formula: "P = sum of all sides",
  },
  "triangle area": {
    title: "Triangle Area Formula",
    explanation: "Multiply half the base (b) by the vertical height (h) to find the enclosed surface area.",
    formula: "Area = ½ × base × height",
  },
  area: {
    title: "Area",
    explanation: "The total number of unit square tiles needed to completely cover the interior surface of a shape.",
  },
  circumference: {
    title: "Circumference",
    explanation: "The linear boundary distance all the way around the edge of a circle.",
    formula: "C = 2 × π × r",
  },
  euler: {
    title: "Euler's Polyhedral Formula",
    explanation: "For any convex 3D polyhedron: Vertices minus Edges plus Faces always equals 2.",
    formula: "V − E + F = 2",
  },
  divide: {
    title: "Divide Both Sides",
    explanation: "Divide both sides of the equation by the same number to isolate the variable.",
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
  if (lower.includes("triangle perimeter")) return MATH_GLOSSARY["triangle perimeter"];
  if (lower.includes("perimeter")) return MATH_GLOSSARY.perimeter;
  if (lower.includes("triangle area")) return MATH_GLOSSARY["triangle area"];
  if (lower.includes("area")) return MATH_GLOSSARY.area;
  if (lower.includes("circumference")) return MATH_GLOSSARY.circumference;
  if (lower.includes("euler")) return MATH_GLOSSARY.euler;
  if (lower.includes("divide")) return MATH_GLOSSARY.divide;
  return null;
}
