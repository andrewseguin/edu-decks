import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckHistory } from "./use-deck-history";

describe("deck-core: useDeckHistory", () => {
  let counter = 0;
  const generateNext = vi.fn(() => ({ id: `card-${++counter}`, prompt: `Question ${counter}`, answer: `Answer ${counter}` }));

  beforeEach(() => {
    counter = 0;
    vi.clearAllMocks();
  });

  it("automatically generates initial card on mount when hydrated", () => {
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, hydrated: true })
    );

    expect(result.current.history.length).toBe(1);
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.currentItem?.id).toBe("card-1");
    expect(result.current.cardCount).toBe(1);
    expect(result.current.isFlipped).toBe(false);
  });

  it("does not generate card when hydrated is false", () => {
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, hydrated: false })
    );

    expect(result.current.history.length).toBe(0);
    expect(result.current.historyIndex).toBe(-1);
    expect(result.current.currentItem).toBeNull();
  });

  it("advances to next card on handleNextCard and pushes to history", () => {
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, hydrated: true })
    );

    act(() => {
      result.current.handleNextCard();
    });

    expect(result.current.history.length).toBe(2);
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.currentItem?.id).toBe("card-2");
    expect(result.current.cardCount).toBe(2);
    expect(result.current.slideDirection).toBe("next");
  });

  it("navigates back with handlePrevCard without generating new cards", () => {
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, hydrated: true })
    );

    // Advance twice -> cards 1, 2, 3
    act(() => {
      result.current.handleNextCard();
      result.current.handleNextCard();
    });

    expect(result.current.historyIndex).toBe(2);
    expect(result.current.currentItem?.id).toBe("card-3");

    // Go back once -> card 2
    act(() => {
      result.current.handlePrevCard();
    });

    expect(result.current.historyIndex).toBe(1);
    expect(result.current.currentItem?.id).toBe("card-2");
    expect(result.current.slideDirection).toBe("prev");

    // Advance forward in history -> card 3 without generating card 4
    act(() => {
      result.current.handleNextCard();
    });

    expect(result.current.historyIndex).toBe(2);
    expect(result.current.currentItem?.id).toBe("card-3");
    expect(result.current.history.length).toBe(3);
  });

  it("flips card on first tap, and advances on second tap", () => {
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, hydrated: true })
    );

    expect(result.current.isFlipped).toBe(false);

    // Tap 1: Flip
    act(() => {
      result.current.handleCardTap();
    });

    expect(result.current.isFlipped).toBe(true);
    expect(result.current.historyIndex).toBe(0);

    // Tap 2: Advance to next card
    act(() => {
      result.current.handleCardTap();
    });

    expect(result.current.isFlipped).toBe(false);
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.currentItem?.id).toBe("card-2");
  });

  it("triggers speak when autoPlayAudio is true", () => {
    const speak = vi.fn();
    const { result } = renderHook(() =>
      useDeckHistory({ generateNext, autoPlayAudio: true, speak, hydrated: true })
    );

    // Initial mount card speech
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ id: "card-1" }), false);

    // Flip card speech
    act(() => {
      result.current.handleCardTap();
    });

    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ id: "card-1" }), true);
  });

  it("triggers new card when current item becomes invalid due to validationKey change", () => {
    let allowedType = "addition";
    const customGenerate = vi.fn(() => ({
      id: `card-${++counter}`,
      type: allowedType,
    }));

    const { result, rerender } = renderHook(
      ({ type }) =>
        useDeckHistory({
          generateNext: customGenerate,
          hydrated: true,
          isItemValid: (item: any) => item.type === type,
          validationKey: type,
        }),
      { initialProps: { type: "addition" } }
    );

    expect(result.current.currentItem?.type).toBe("addition");

    // Change type to multiplication
    allowedType = "multiplication";
    rerender({ type: "multiplication" });

    expect(result.current.currentItem?.type).toBe("multiplication");
  });
});
