import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./use-local-storage";

describe("deck-core: useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("returns initial value when key does not exist in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default-val"));
    expect(result.current[0]).toBe("default-val");
  });

  it("reads stored value from localStorage on mount", () => {
    localStorage.setItem("stored-key", JSON.stringify({ theme: "dark", count: 42 }));
    const { result } = renderHook(() => useLocalStorage("stored-key", { theme: "light", count: 0 }));
    expect(result.current[0]).toEqual({ theme: "dark", count: 42 });
  });

  it("updates value and persists to localStorage with direct value", () => {
    const { result } = renderHook(() => useLocalStorage("count-key", 10));

    act(() => {
      result.current[1](25);
    });

    expect(result.current[0]).toBe(25);
    expect(JSON.parse(localStorage.getItem("count-key") || "")).toBe(25);
  });

  it("updates value and persists to localStorage with function updater", () => {
    const { result } = renderHook(() => useLocalStorage("count-key", 5));

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(15);
    expect(JSON.parse(localStorage.getItem("count-key") || "")).toBe(15);
  });

  it("gracefully catches JSON parse errors without crashing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("corrupted-key", "NOT_VALID_JSON{");

    const { result } = renderHook(() => useLocalStorage("corrupted-key", "fallback"));
    expect(result.current[0]).toBe("fallback");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("gracefully catches localStorage setItem errors", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useLocalStorage("failing-key", "init"));

    act(() => {
      result.current[1]("new-val");
    });

    expect(result.current[0]).toBe("new-val");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
