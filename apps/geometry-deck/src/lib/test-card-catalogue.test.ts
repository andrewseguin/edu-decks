import { describe, it, expect } from "vitest";
import { TEST_CARDS, TEST_CARD_IDS } from "./test-card-catalogue";

describe("Geometry Deck — Test Card Catalogue", () => {
  it("should contain valid card IDs and non-empty card objects", () => {
    expect(TEST_CARD_IDS.length).toBeGreaterThan(0);
    expect(Object.keys(TEST_CARDS).length).toEqual(TEST_CARD_IDS.length);
  });

  it("should ensure every card has valid topic, cardType, and speech text", () => {
    for (const id of TEST_CARD_IDS) {
      const card = TEST_CARDS[id];
      expect(card).toBeDefined();
      expect(card.id).toBe(id);
      expect(card.topic).toBeDefined();
      expect(card.cardType).toBeDefined();
      expect(card.frontSpeechText).toBeTruthy();
      expect(card.backSpeechText).toBeTruthy();
    }
  });

  it("should ensure calculation cards have non-empty proof/solution steps", () => {
    for (const id of TEST_CARD_IDS) {
      const card = TEST_CARDS[id];
      if (card.cardType === "calculation") {
        expect(card.backSteps).toBeDefined();
        expect(card.backSteps!.length).toBeGreaterThan(0);
      }
    }
  });
});
