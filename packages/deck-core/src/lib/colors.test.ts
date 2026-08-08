import { describe, it, expect } from "vitest";
import { DECK_COLORS, CANVAS_COLORS } from "./colors";

describe("deck-core: colors", () => {
  it("defines standard brand hues with matching hex, bg, text, border, and badge tokens", () => {
    expect(DECK_COLORS.emerald.hex).toBe("#059669");
    expect(DECK_COLORS.amber.hex).toBe("#d97706");
    expect(DECK_COLORS.sky.hex).toBe("#0284c7");
    expect(DECK_COLORS.indigo.hex).toBe("#4f46e5");
    expect(DECK_COLORS.purple.hex).toBe("#9333ea");
    expect(DECK_COLORS.rose.hex).toBe("#e11d48");
    expect(DECK_COLORS.orange.hex).toBe("#ea580c");
  });

  it("defines warm light and dark canvas colors", () => {
    expect(CANVAS_COLORS.cream).toBe("#fbf7ee");
    expect(CANVAS_COLORS.charcoal).toBe("#151311");
  });
});
