import { describe, it, expect } from "vitest";
import { gcd, lcm, getRoundedRectPath } from "./visual-utils";

describe("arithmetic-deck: visual-utils", () => {
  describe("gcd & lcm", () => {
    it("calculates greatest common divisor", () => {
      expect(gcd(12, 18)).toBe(6);
      expect(gcd(7, 13)).toBe(1);
      expect(gcd(24, 60)).toBe(12);
    });

    it("calculates least common multiple", () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(3, 5)).toBe(15);
      expect(lcm(2, 8)).toBe(8);
    });
  });

  describe("getRoundedRectPath", () => {
    it("generates valid SVG path data string", () => {
      const path = getRoundedRectPath(0, 0, 100, 50, 4, 4, 4, 4);
      expect(path).toContain("M");
      expect(path).toContain("A");
      expect(path).toContain("Z");
    });
  });
});
