import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckController } from "./use-deck-controller";

describe("deck-core: useDeckController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cycles forward with nextCard", () => {
    const onNext = vi.fn();
    const { result } = renderHook(() =>
      useDeckController({ itemCount: 3, onNext })
    );

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.nextCard();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.slideDirection).toBe("next");
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.nextCard();
    });

    expect(result.current.currentIndex).toBe(2);

    // Cycles back to 0
    act(() => {
      result.current.nextCard();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("cycles backward with prevCard", () => {
    const onPrev = vi.fn();
    const { result } = renderHook(() =>
      useDeckController({ itemCount: 3, onPrev })
    );

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.prevCard();
    });

    expect(result.current.currentIndex).toBe(2);
    expect(result.current.slideDirection).toBe("prev");
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("toggles card flip state and invokes onFlip", () => {
    const onFlip = vi.fn();
    const { result } = renderHook(() =>
      useDeckController({ itemCount: 3, onFlip })
    );

    expect(result.current.isFlipped).toBe(false);

    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(true);
    expect(onFlip).toHaveBeenCalledWith(true);

    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(false);
    expect(onFlip).toHaveBeenCalledWith(false);
  });

  it("handles keyboard shortcuts (ArrowRight, ArrowLeft, Space, Q)", () => {
    const onToggleQuiz = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onFlip = vi.fn();

    renderHook(() =>
      useDeckController({
        itemCount: 5,
        onNext,
        onPrev,
        onFlip,
        onToggleQuiz,
        enableShortcuts: true,
      })
    );

    // Space -> Flip
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    });
    expect(onFlip).toHaveBeenCalled();

    // ArrowRight -> Next
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(onNext).toHaveBeenCalled();

    // ArrowLeft -> Prev
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    });
    expect(onPrev).toHaveBeenCalled();

    // Q -> Toggle Quiz
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
    });
    expect(onToggleQuiz).toHaveBeenCalled();
  });

  it("detects touch swipe navigation", () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const { result } = renderHook(() =>
      useDeckController({ itemCount: 5, onNext, onPrev })
    );

    // Swipe Left (Diff < -50) -> nextCard
    act(() => {
      result.current.handleTouchStart({
        touches: [{ clientX: 200 } as any],
      } as any);
      result.current.handleTouchEnd({
        changedTouches: [{ clientX: 100 } as any],
      } as any);
    });

    expect(onNext).toHaveBeenCalled();

    // Swipe Right (Diff > 50) -> prevCard
    act(() => {
      result.current.handleTouchStart({
        touches: [{ clientX: 100 } as any],
      } as any);
      result.current.handleTouchEnd({
        changedTouches: [{ clientX: 200 } as any],
      } as any);
    });

    expect(onPrev).toHaveBeenCalled();
  });
});
