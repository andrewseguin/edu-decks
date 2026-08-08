import { describe, it, expect } from "vitest";
import {
  simplifyFraction,
  fractionToWords,
  formatFractionText,
  generateMathProblem,
} from "./math-generator";

describe("arithmetic-deck: math-generator", () => {
  describe("simplifyFraction", () => {
    it("simplifies common fractions correctly", () => {
      expect(simplifyFraction(2, 4)).toEqual({ n: 1, d: 2 });
      expect(simplifyFraction(4, 8)).toEqual({ n: 1, d: 2 });
      expect(simplifyFraction(6, 9)).toEqual({ n: 2, d: 3 });
      expect(simplifyFraction(8, 12)).toEqual({ n: 2, d: 3 });
      expect(simplifyFraction(5, 5)).toEqual({ n: 1, d: 1 });
    });

    it("handles already simplified fractions", () => {
      expect(simplifyFraction(1, 3)).toEqual({ n: 1, d: 3 });
      expect(simplifyFraction(3, 5)).toEqual({ n: 3, d: 5 });
      expect(simplifyFraction(7, 8)).toEqual({ n: 7, d: 8 });
    });

    it("handles 0 numerator and divide by 0 safeguard", () => {
      expect(simplifyFraction(0, 5)).toEqual({ n: 0, d: 1 });
      expect(simplifyFraction(5, 0)).toEqual({ n: 0, d: 1 });
    });

    it("handles negative numbers correctly", () => {
      expect(simplifyFraction(-2, 4)).toEqual({ n: -1, d: 2 });
      expect(simplifyFraction(2, -4)).toEqual({ n: -1, d: 2 });
      expect(simplifyFraction(-2, -4)).toEqual({ n: 1, d: 2 });
    });
  });

  describe("fractionToWords", () => {
    it("converts unit fractions (1/n) to singular words", () => {
      expect(fractionToWords({ n: 1, d: 2 })).toBe("one half");
      expect(fractionToWords({ n: 1, d: 3 })).toBe("one third");
      expect(fractionToWords({ n: 1, d: 4 })).toBe("one fourth");
      expect(fractionToWords({ n: 1, d: 8 })).toBe("one eighth");
    });

    it("converts multi-numerator fractions (n/d) to plural words", () => {
      expect(fractionToWords({ n: 2, d: 3 })).toBe("two thirds");
      expect(fractionToWords({ n: 3, d: 4 })).toBe("three fourths");
      expect(fractionToWords({ n: 5, d: 8 })).toBe("five eighths");
      expect(fractionToWords({ n: 7, d: 10 })).toBe("seven tenths");
    });

    it("handles whole number fractions (d = 1)", () => {
      expect(fractionToWords({ n: 2, d: 1 })).toBe("2");
      expect(fractionToWords({ n: 0, d: 1 })).toBe("0");
    });
  });

  describe("formatFractionText", () => {
    it("formats standard fractions and whole fractions", () => {
      expect(formatFractionText({ n: 3, d: 4 })).toBe("3/4");
      expect(formatFractionText({ n: 1, d: 2 })).toBe("1/2");
      expect(formatFractionText({ n: 5, d: 1 })).toBe("5");
    });
  });

  describe("generateMathProblem", () => {
    it("generates valid addition problems within range", () => {
      for (let i = 0; i < 25; i++) {
        const problem = generateMathProblem(["+"], 1, 10, true, false);
        expect(problem.operation).toBe("+");
        expect(problem.num1).toBeGreaterThanOrEqual(1);
        expect(problem.num1).toBeLessThanOrEqual(10);
        expect(problem.num2).toBeGreaterThanOrEqual(1);
        expect(problem.num2).toBeLessThanOrEqual(10);
        expect(problem.answer).toBe(problem.num1 + problem.num2);
        expect(problem.displayText).toBe(`${problem.num1} + ${problem.num2}`);
        expect(problem.fullSpeechText).toBe(
          `${problem.num1} plus ${problem.num2} equals ${problem.answer}`
        );
        expect(problem.isFraction).toBe(false);
      }
    });

    it("generates valid subtraction problems with non-negative answers", () => {
      for (let i = 0; i < 25; i++) {
        const problem = generateMathProblem(["-"], 1, 20, true, false);
        expect(problem.operation).toBe("-");
        expect(problem.num1).toBeGreaterThanOrEqual(problem.num2);
        expect(problem.answer).toBe(problem.num1 - problem.num2);
        expect(problem.answer).toBeGreaterThanOrEqual(0);
        expect(problem.displayText).toBe(`${problem.num1} - ${problem.num2}`);
      }
    });

    it("generates valid multiplication problems bounded to 12 max", () => {
      for (let i = 0; i < 25; i++) {
        const problem = generateMathProblem(["×"], 0, 12, true, false);
        expect(problem.operation).toBe("×");
        expect(problem.num1).toBeLessThanOrEqual(12);
        expect(problem.num2).toBeLessThanOrEqual(12);
        expect(problem.answer).toBe(problem.num1 * problem.num2);
        expect(problem.displayText).toBe(`${problem.num1} × ${problem.num2}`);
      }
    });

    it("generates valid division problems with clean integer quotients and no divide-by-zero", () => {
      for (let i = 0; i < 25; i++) {
        const problem = generateMathProblem(["÷"], 1, 12, true, false);
        expect(problem.operation).toBe("÷");
        expect(problem.num2).toBeGreaterThan(0);
        expect(problem.num1 % problem.num2).toBe(0);
        expect(problem.answer).toBe(problem.num1 / problem.num2);
        expect(problem.displayText).toBe(`${problem.num1} ÷ ${problem.num2}`);
      }
    });

    it("generates valid fraction problems when fractions are enabled", () => {
      for (let i = 0; i < 25; i++) {
        const problem = generateMathProblem(["+", "-", "×", "÷"], 1, 10, false, true);
        expect(problem.isFraction).toBe(true);
        expect(problem.frac1).toBeDefined();
        expect(problem.frac2).toBeDefined();
        expect(problem.fracAnswer).toBeDefined();
        expect(problem.frac1!.d).toBeGreaterThan(0);
        expect(problem.frac2!.d).toBeGreaterThan(0);
        expect(problem.fracAnswer!.d).toBeGreaterThan(0);
      }
    });
  });
});
