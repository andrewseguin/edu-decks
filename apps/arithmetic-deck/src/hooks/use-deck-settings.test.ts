import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckSettings } from "./use-deck-settings";

describe("arithmetic-deck: useDeckSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default operations and range", () => {
    const { result } = renderHook(() => useDeckSettings());

    expect(result.current.activeOperations).toEqual(["+", "-"]);
    expect(result.current.minRange).toBe(1);
    expect(result.current.maxRange).toBe(10);
    expect(result.current.numberType).toBe("whole");
    expect(result.current.showWholeNumbers).toBe(true);
    expect(result.current.showFractions).toBe(false);
  });

  it("toggles operations without allowing deselecting all operations", () => {
    const { result } = renderHook(() => useDeckSettings());

    // Add '×'
    act(() => {
      result.current.handleOperationToggle("×");
    });
    expect(result.current.activeOperations).toEqual(["+", "-", "×"]);

    // Remove '+' then '-'
    act(() => {
      result.current.handleOperationToggle("+");
    });
    act(() => {
      result.current.handleOperationToggle("-");
    });
    expect(result.current.activeOperations).toEqual(["×"]);

    // Try removing the last operation ('×') -> Should NOT remove
    act(() => {
      result.current.handleOperationToggle("×");
    });
    expect(result.current.activeOperations).toEqual(["×"]);
  });

  it("selects exclusive operation with handleOperationSelectExclusive", () => {
    const { result } = renderHook(() => useDeckSettings());

    act(() => {
      result.current.handleOperationSelectExclusive("÷");
    });

    expect(result.current.activeOperations).toEqual(["÷"]);
  });

  it("updates range limits with handleRangeChange", () => {
    const { result } = renderHook(() => useDeckSettings());

    act(() => {
      result.current.handleRangeChange(5, 25);
    });

    expect(result.current.minRange).toBe(5);
    expect(result.current.maxRange).toBe(25);
  });

  it("switches numberType between whole and fractions", () => {
    const { result } = renderHook(() => useDeckSettings());

    act(() => {
      result.current.setShowFractions(true);
    });

    expect(result.current.numberType).toBe("fractions");
    expect(result.current.showFractions).toBe(true);
    expect(result.current.showWholeNumbers).toBe(false);
  });

  it("manages fraction denominator mode and max denominator settings", () => {
    const { result } = renderHook(() => useDeckSettings());

    expect(result.current.fractionDenominatorMode).toBe("all");
    expect(result.current.fractionMaxDenominator).toBe(8);

    act(() => {
      result.current.setFractionDenominatorMode("same");
      result.current.setFractionMaxDenominator(4);
    });

    expect(result.current.fractionDenominatorMode).toBe("same");
    expect(result.current.fractionMaxDenominator).toBe(4);
  });
});
