import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useQuizSession,
  parseFractionValue,
  stringToFraction,
} from "./use-quiz-session";

describe("arithmetic-deck: useQuizSession", () => {
  const onSpeak = vi.fn((text, onEnd) => onEnd?.());
  const onPlayChime = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseFractionValue & stringToFraction", () => {
    it("parses whole numbers and fractions into numeric values", () => {
      expect(parseFractionValue("5")).toBe(5);
      expect(parseFractionValue("1/2")).toBe(0.5);
      expect(parseFractionValue("3/4")).toBe(0.75);
      expect(parseFractionValue("invalid")).toBeNull();
      expect(parseFractionValue("5/0")).toBeNull();
    });

    it("parses fraction string into Fraction object", () => {
      expect(stringToFraction("3/4")).toEqual({ n: 3, d: 4 });
      expect(stringToFraction("5")).toBeNull();
      expect(stringToFraction("invalid/4")).toBeNull();
    });
  });

  describe("quiz session state and answering", () => {
    it("initializes with first question and zero score", () => {
      const { result } = renderHook(() =>
        useQuizSession({
          activeOperations: ["+"],
          minRange: 1,
          maxRange: 10,
          autoPlayAudio: false,
          onSpeak,
          onPlayChime,
        })
      );

      expect(result.current.currentProblem).toBeDefined();
      expect(result.current.score).toBe(0);
      expect(result.current.streak).toBe(0);
      expect(result.current.inputVal).toBe("");
    });

    it("accepts keypad digits and evaluates correct answer", () => {
      const { result } = renderHook(() =>
        useQuizSession({
          activeOperations: ["+"],
          minRange: 1,
          maxRange: 5,
          autoPlayAudio: false,
          onSpeak,
          onPlayChime,
        })
      );

      const expectedAnswer = result.current.currentProblem!.answerText;

      act(() => {
        result.current.handleSubmitInput(expectedAnswer);
      });

      expect(result.current.isCorrect).toBe(true);
      expect(result.current.score).toBe(1);
      expect(result.current.streak).toBe(1);
      expect(onPlayChime).toHaveBeenCalledWith(true);
    });

    it("resets streak on incorrect answer and plays try-again chime", () => {
      const { result } = renderHook(() =>
        useQuizSession({
          activeOperations: ["+"],
          minRange: 1,
          maxRange: 5,
          autoPlayAudio: false,
          onSpeak,
          onPlayChime,
        })
      );

      act(() => {
        result.current.handleSubmitInput("9999");
      });

      expect(result.current.isCorrect).toBe(false);
      expect(result.current.streak).toBe(0);
      expect(onPlayChime).toHaveBeenCalledWith(false);
    });

    it("handles backspace delete key", () => {
      const { result } = renderHook(() =>
        useQuizSession({
          activeOperations: ["+"],
          minRange: 10,
          maxRange: 50,
          autoPlayAudio: false,
          onSpeak,
          onPlayChime,
        })
      );

      // In range 10..50, the answer is at least 20.
      // Typing "1" will never equal the answer.
      act(() => {
        result.current.handleKeyPress("1");
      });
      expect(result.current.inputVal).toBe("1");

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.inputVal).toBe("");
    });
  });
});
