import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReadingSettings } from "./use-reading-settings";

describe("reading-deck: useReadingSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default reading deck settings", () => {
    const { result } = renderHook(() => useReadingSettings());

    expect(result.current.letterCase).toBe("lower");
    expect(result.current.gameMode).toBe("letters");
    expect(result.current.selectedLetters).toEqual(["s", "a", "t", "p", "i", "n"]);
    expect(result.current.wordDifficulty).toBe("easy");
    expect(result.current.selectedWordLengths).toEqual([3, 4, 5]);
    expect(result.current.showCardCount).toBe(true);
    expect(result.current.showTimer).toBe(true);
    expect(result.current.enableRecordings).toBe(true);
    expect(result.current.enableTracing).toBe(true);
    expect(result.current.autoPlaySound).toBe(false);
    expect(result.current.keepScreenAwake).toBe(true);
    expect(result.current.quizOptionCount).toBe(4);
    expect(result.current.isLocked).toBe(false);
  });

  it("updates letter casing and game mode", () => {
    const { result } = renderHook(() => useReadingSettings());

    act(() => {
      result.current.setLetterCase("upper");
    });
    expect(result.current.letterCase).toBe("upper");

    act(() => {
      result.current.setGameMode("words");
    });
    expect(result.current.gameMode).toBe("words");
  });

  it("updates word lengths and difficulty", () => {
    const { result } = renderHook(() => useReadingSettings());

    act(() => {
      result.current.setSelectedWordLengths([3, 4]);
    });
    expect(result.current.selectedWordLengths).toEqual([3, 4]);

    act(() => {
      result.current.setWordDifficulty("hard");
    });
    expect(result.current.wordDifficulty).toBe("hard");
  });
});
