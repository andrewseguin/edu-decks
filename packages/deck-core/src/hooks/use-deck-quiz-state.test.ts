import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckQuizState } from "./use-deck-quiz-state";

describe("deck-core: useDeckQuizState", () => {
  it("initializes with score 0 and streak 0", () => {
    const { result } = renderHook(() => useDeckQuizState());

    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.isCorrect).toBeNull();
  });

  it("increments score and streak on correct answer", () => {
    const { result } = renderHook(() => useDeckQuizState());

    act(() => {
      result.current.recordAnswer(true);
    });

    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
    expect(result.current.isCorrect).toBe(true);

    act(() => {
      result.current.recordAnswer(true);
    });

    expect(result.current.score).toBe(2);
    expect(result.current.streak).toBe(2);
  });

  it("resets streak to 0 on incorrect answer without changing score", () => {
    const { result } = renderHook(() => useDeckQuizState(3, 3));

    act(() => {
      result.current.recordAnswer(false);
    });

    expect(result.current.score).toBe(3);
    expect(result.current.streak).toBe(0);
    expect(result.current.isCorrect).toBe(false);
  });

  it("resets score and streak on resetScore", () => {
    const { result } = renderHook(() => useDeckQuizState(5, 4));

    act(() => {
      result.current.resetScore();
    });

    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.isCorrect).toBeNull();
  });
});
