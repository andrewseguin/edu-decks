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
  "circle area": {
    title: "Circle Area Formula",
    explanation: "Multiply π by the square of the radius (r²).",
    formula: "A = πr²",
  },
  circumference: {
    title: "Circumference Formula",
    explanation: "The linear boundary distance all the way around the edge of a circle.",
    formula: "C = 2 × π × r",
  },
  euler: {
    title: "Euler's Polyhedral Formula",
    explanation: "For any convex 3D polyhedron: Vertices minus Edges plus Faces always equals 2.",
    formula: "V − E + F = 2",
  },
  "rectangle area": {
    title: "Rectangle Area Formula",
    explanation: "Multiply length (l) by width (w) to find the total number of enclosed square units.",
    formula: "A = l × w",
  },
  "rectangle perimeter": {
    title: "Rectangle Perimeter Formula",
    explanation: "Add all four sides or calculate 2 × (length + width) for the outer boundary distance.",
    formula: "P = 2(l + w)",
  },
  "parallelogram area": {
    title: "Parallelogram Area Formula",
    explanation: "Multiply the base (b) by the vertical perpendicular height (h).",
    formula: "A = b × h",
  },
  "trapezoid area": {
    title: "Trapezoid Area Formula",
    explanation: "Multiply half the sum of the parallel bases (a + b) by the vertical height (h).",
    formula: "A = ½(a + b)h",
  },
  "polygon interior sum": {
    title: "Polygon Interior Angle Sum Formula",
    explanation: "Any n-sided polygon can be split into (n − 2) non-overlapping triangles, each totaling 180°.",
    formula: "Sum = (n − 2) × 180°",
  },
  "polygon exterior sum": {
    title: "Polygon Exterior Angle Sum",
    explanation: "The sum of the exterior angles (one per vertex) of any convex polygon is always exactly 360°.",
    formula: "Sum = 360°",
  },
  "trapezoid perimeter": {
    title: "Trapezoid Perimeter Formula",
    explanation: "Add up the lengths of all 4 outer boundary sides (a, b, c, and d).",
    formula: "P = a + b + c + d",
  },
  "cone volume": {
    title: "Cone Volume Formula",
    explanation: "The volume of a cone is exactly ⅓ the volume of an equivalent cylinder with the same base and height.",
    formula: "V = ⅓πr²h",
  },
  "sphere volume": {
    title: "Sphere Volume Formula",
    explanation: "Multiply ⁴⁄₃ by π and the cube of the radius (r³).",
    formula: "V = ⁴⁄₃πr³",
  },
  "sphere surface area": {
    title: "Sphere Surface Area Formula",
    explanation: "The surface area of a sphere equals the area of exactly 4 great circles (4 × πr²).",
    formula: "SA = 4πr²",
  },
  "regular polygon angle": {
    title: "Regular Polygon Interior Angle",
    explanation: "Divide the total interior angle sum by the number of equal sides (n).",
    formula: "Each Angle = (n − 2) × 180° ÷ n",
  },
  "prism volume": {
    title: "Rectangular Prism Volume Formula",
    explanation: "Multiply base length by width by vertical height (l × w × h) or Base Area by height (B × h).",
    formula: "V = l × w × h",
  },
  "cube surface area": {
    title: "Cube Surface Area Formula",
    explanation: "A cube has 6 identical square faces, each of area s².",
    formula: "SA = 6s²",
  },
  "cylinder volume": {
    title: "Cylinder Volume Formula",
    explanation: "Multiply circular base area (πr²) by the vertical height (h).",
    formula: "V = πr²h",
  },
  "cylinder surface area": {
    title: "Cylinder Surface Area Formula",
    explanation: "Add the areas of the 2 circular bases (2 × πr²) to the unrolled lateral rectangle area (2πr × h).",
    formula: "SA = 2πr² + 2πrh",
  },
  "pyramid volume": {
    title: "Pyramid Volume Formula",
    explanation: "The volume of a pyramid is exactly ⅓ the base area (B) times the perpendicular height (h).",
    formula: "V = ⅓Bh",
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
  if (lower.includes("rectangle area")) return MATH_GLOSSARY["rectangle area"];
  if (lower.includes("rectangle perimeter")) return MATH_GLOSSARY["rectangle perimeter"];
  if (lower.includes("parallelogram area")) return MATH_GLOSSARY["parallelogram area"];
  if (lower.includes("trapezoid area")) return MATH_GLOSSARY["trapezoid area"];
  if (lower.includes("trapezoid perimeter") || lower.includes("sum of all 4") || lower.includes("sum of all sides")) return MATH_GLOSSARY["trapezoid perimeter"];
  if (lower.includes("triangle perimeter")) return MATH_GLOSSARY["triangle perimeter"];
  if (lower.includes("perimeter")) return MATH_GLOSSARY.perimeter;
  if (lower.includes("circle area")) return MATH_GLOSSARY["circle area"];
  if (lower.includes("triangle area")) return MATH_GLOSSARY["triangle area"];
  if (lower.includes("area")) return MATH_GLOSSARY.area;
  if (lower.includes("polygon interior") || lower.includes("interior angle sum")) return MATH_GLOSSARY["polygon interior sum"];
  if (lower.includes("exterior sum") || lower.includes("exterior angle sum")) return MATH_GLOSSARY["polygon exterior sum"];
  if (lower.includes("regular polygon angle") || lower.includes("regular polygon interior angle") || lower.includes("regular polygon")) return MATH_GLOSSARY["regular polygon angle"];
  if (lower.includes("circumference")) return MATH_GLOSSARY.circumference;
  if (lower.includes("cone volume") || lower.includes("volume of a cone")) return MATH_GLOSSARY["cone volume"];
  if (lower.includes("sphere volume") || lower.includes("volume of a sphere")) return MATH_GLOSSARY["sphere volume"];
  if (lower.includes("sphere surface area") || lower.includes("surface area of a sphere")) return MATH_GLOSSARY["sphere surface area"];
  if (lower.includes("prism volume") || lower.includes("volume of a prism")) return MATH_GLOSSARY["prism volume"];
  if (lower.includes("cube surface area") || lower.includes("surface area of a cube")) return MATH_GLOSSARY["cube surface area"];
  if (lower.includes("cylinder surface area") || lower.includes("surface area of a cylinder")) return MATH_GLOSSARY["cylinder surface area"];
  if (lower.includes("cylinder volume") || lower.includes("volume of a cylinder")) return MATH_GLOSSARY["cylinder volume"];
  if (lower.includes("pyramid volume") || lower.includes("volume of a pyramid") || lower.includes("pyramid")) return MATH_GLOSSARY["pyramid volume"];
  if (lower.includes("euler")) return MATH_GLOSSARY.euler;
  if (lower.includes("divide")) return MATH_GLOSSARY.divide;
  return null;
}
