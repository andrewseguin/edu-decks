import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDevSettings } from "./use-dev-settings";

describe("deck-core: useDevSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with showDebugOutlines false and toggles correctly", () => {
    const { result } = renderHook(() => useDevSettings());

    expect(result.current.showDebugOutlines).toBe(false);

    act(() => {
      result.current.toggleDebugOutlines();
    });

    expect(result.current.showDebugOutlines).toBe(true);
    expect(localStorage.getItem("deck-dev-show-outlines")).toBe("true");

    act(() => {
      result.current.toggleDebugOutlines();
    });

    expect(result.current.showDebugOutlines).toBe(false);
    expect(localStorage.getItem("deck-dev-show-outlines")).toBe("false");
  });

  it("handles D keydown event to toggle outlines", () => {
    const { result } = renderHook(() => useDevSettings());

    expect(result.current.showDebugOutlines).toBe(false);

    // Simulate pressing 'd'
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
    });

    expect(result.current.showDebugOutlines).toBe(true);

    // Press 'D' again
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "D" }));
    });

    expect(result.current.showDebugOutlines).toBe(false);
  });

  it("handles S keydown event to toggle slowAnimations", () => {
    const { result } = renderHook(() => useDevSettings());

    expect(result.current.slowAnimations).toBe(false);

    // Simulate pressing 's'
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
    });

    expect(result.current.slowAnimations).toBe(true);

    // Press 'S' again
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "S" }));
    });

    expect(result.current.slowAnimations).toBe(false);
  });
});
