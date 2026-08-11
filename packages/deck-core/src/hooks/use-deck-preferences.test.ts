import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckPreferences } from "./use-deck-preferences";

describe("deck-core: useDeckPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default preferences", () => {
    const { result } = renderHook(() => useDeckPreferences());

    expect(result.current.showCardCount).toBe(true);
    expect(result.current.showTimer).toBe(true);
    expect(result.current.autoPlaySound).toBe(false);
    expect(result.current.keepScreenAwake).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });

  it("accepts custom default options and keyPrefix", () => {
    const { result } = renderHook(() =>
      useDeckPreferences({
        keyPrefix: "math-deck",
        defaultShowCardCount: false,
        defaultAutoPlaySound: true,
      })
    );

    expect(result.current.showCardCount).toBe(false);
    expect(result.current.autoPlaySound).toBe(true);
  });

  it("updates individual preferences and reflects state changes", () => {
    const { result } = renderHook(() => useDeckPreferences({ keyPrefix: "test" }));

    act(() => {
      result.current.setShowCardCount(false);
      result.current.setShowTimer(false);
      result.current.setAutoPlaySound(true);
      result.current.setKeepScreenAwake(false);
      result.current.setIsLocked(true);
    });

    expect(result.current.showCardCount).toBe(false);
    expect(result.current.showTimer).toBe(false);
    expect(result.current.autoPlaySound).toBe(true);
    expect(result.current.keepScreenAwake).toBe(false);
    expect(result.current.isLocked).toBe(true);
  });
});
