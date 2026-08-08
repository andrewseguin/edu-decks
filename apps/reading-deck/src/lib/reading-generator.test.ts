import { describe, it, expect } from "vitest";
import {
  shuffle,
  canFormWord,
  getPossibleWords,
  getHighestLevelInfoForWord,
  createLetterCard,
  createWordCard,
  createInitialLetterCard,
} from "./reading-generator";

describe("reading-deck: reading-generator", () => {
  describe("shuffle", () => {
    it("preserves array length and elements", () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.length).toBe(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });
  });

  describe("canFormWord", () => {
    it("returns true if all letters/digraphs are in available set", () => {
      expect(canFormWord("cat", ["c", "a", "t"])).toBe(true);
      expect(canFormWord("ship", ["sh", "i", "p"])).toBe(true);
      expect(canFormWord("cat", ["c", "a"])).toBe(false);
    });
  });

  describe("getPossibleWords", () => {
    it("filters word bank by available letters and allowed word lengths", () => {
      const words = getPossibleWords(["s", "a", "t", "p", "i", "n"], "easy", [3]);
      expect(words.length).toBeGreaterThan(0);
      for (const w of words) {
        expect(w.length).toBe(3);
        expect(canFormWord(w, ["s", "a", "t", "p", "i", "n"])).toBe(true);
      }
    });
  });

  describe("getHighestLevelInfoForWord", () => {
    it("returns color and textColor corresponding to highest level segment", () => {
      const info = getHighestLevelInfoForWord("sat");
      expect(info.color).toBeDefined();
      expect(info.textColor).toBeDefined();
    });
  });

  describe("card creators", () => {
    it("creates initial letter card", () => {
      const card = createInitialLetterCard(["s", "a", "t"]);
      expect(card.type).toBe("letter");
      expect(card.value).toBe("s");
    });

    it("creates letter card with color metadata", () => {
      const card = createLetterCard("m", "test-key");
      expect(card.key).toBe("test-key");
      expect(card.type).toBe("letter");
      expect(card.value).toBe("m");
      expect(card.color).toBeDefined();
    });

    it("creates word card with hard word flag if in HARD_WORDS", () => {
      const card = createWordCard("cat");
      expect(card.type).toBe("word");
      expect(card.value).toBe("cat");
      expect(card.isHardWord).toBe(false);
    });
  });
});
