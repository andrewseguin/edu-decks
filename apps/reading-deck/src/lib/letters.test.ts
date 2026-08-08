import { describe, it, expect } from "vitest";
import { DECK_COLORS } from "@decks/core";
import {
  LETTER_LEVELS,
  ALL_LETTERS,
  DEFAULT_LETTERS,
  getLetterInfo,
} from "./letters";

describe("reading-deck: letters", () => {
  it("contains 6 levels of progressive phonics and letter levels", () => {
    expect(LETTER_LEVELS.length).toBe(6);
  });

  it("contains unique letters in ALL_LETTERS", () => {
    const unique = new Set(ALL_LETTERS);
    expect(unique.size).toBe(ALL_LETTERS.length);
  });

  it("contains default letters matching Level 1", () => {
    expect(DEFAULT_LETTERS).toEqual(["s", "a", "t", "p", "i", "n"]);
  });

  it("looks up letter information with getLetterInfo", () => {
    const sInfo = getLetterInfo("s");
    expect(sInfo).toBeDefined();
    expect(sInfo?.char).toBe("s");
    expect(sInfo?.color).toBe(DECK_COLORS.emerald.hex);

    const shInfo = getLetterInfo("sh");
    expect(shInfo).toBeDefined();
    expect(shInfo?.char).toBe("sh");
    expect(shInfo?.color).toBe(DECK_COLORS.orange.hex);

    expect(getLetterInfo("nonexistent")).toBeUndefined();
  });
});
