import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReadingDeck } from "./use-reading-deck";
import { ReadingDeckSettings } from "@/lib/types";

describe("reading-deck: useReadingDeck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockSettings: ReadingDeckSettings = {
    letterCase: "lower",
    setLetterCase: () => {},
    selectedLetters: ["s", "a", "t"],
    setSelectedLetters: () => {},
    gameMode: "letters",
    setGameMode: () => {},
    wordDifficulty: "easy",
    setWordDifficulty: () => {},
    selectedWordLengths: [3],
    setSelectedWordLengths: () => {},
    showCardCount: true,
    setShowCardCount: () => {},
    showTimer: true,
    setShowTimer: () => {},
    enableRecordings: true,
    setEnableRecordings: () => {},
    quizOptionCount: 4,
    setQuizOptionCount: () => {},
    isLocked: false,
    setIsLocked: () => {},
    enableTracing: true,
    setEnableTracing: () => {},
    autoPlaySound: false,
    setAutoPlaySound: () => {},
    keepScreenAwake: true,
    setKeepScreenAwake: () => {},
  };

  it("initializes with letter content and handles next card and prev card", () => {
    const { result } = renderHook(() =>
      useReadingDeck({ settings: mockSettings, isMenuOpen: false })
    );

    expect(result.current.displayContent).toBeDefined();
    expect(result.current.displayContent.type).toBe("letter");

    // Advance next card
    act(() => {
      result.current.handleNextCard();
    });

    expect(result.current.cardCount).toBe(1);

    // Go back
    act(() => {
      result.current.handlePrevCard();
    });
  });

  it("handles empty letters selection with a helpful message", () => {
    const emptySettings: ReadingDeckSettings = {
      ...mockSettings,
      selectedLetters: [],
    };

    const { result } = renderHook(() =>
      useReadingDeck({ settings: emptySettings, isMenuOpen: false })
    );

    expect(result.current.displayContent.type).toBe("message");
  });
});
