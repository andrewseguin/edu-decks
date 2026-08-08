import { describe, it, expect } from "vitest";
import { EASY_WORDS, HARD_WORDS } from "./words";

describe("reading-deck: words", () => {
  it("contains extensive easy word pool with non-empty strings", () => {
    expect(EASY_WORDS.length).toBeGreaterThan(100);
    for (const word of EASY_WORDS) {
      expect(typeof word).toBe("string");
      expect(word.length).toBeGreaterThan(0);
      expect(word).toBe(word.toLowerCase());
    }
  });

  it("contains hard words pool with non-empty strings", () => {
    expect(HARD_WORDS.length).toBeGreaterThan(100);
    for (const word of HARD_WORDS) {
      expect(typeof word).toBe("string");
      expect(word.length).toBeGreaterThan(0);
      expect(word).toBe(word.toLowerCase());
    }
  });
});
