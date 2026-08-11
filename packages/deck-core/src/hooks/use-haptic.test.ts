import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHaptic, triggerHaptic } from "./use-haptic";

describe("deck-core: useHaptic", () => {
  const originalVibrate = navigator.vibrate;
  const mockVibrate = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockVibrate.mockReset();
    Object.defineProperty(navigator, "vibrate", {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "vibrate", {
      value: originalVibrate,
      writable: true,
      configurable: true,
    });
  });

  it("triggers vibration pattern when enabled and supported", () => {
    mockVibrate.mockReturnValue(true);

    const { result } = renderHook(() => useHaptic(true));
    result.current.trigger("light");

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it("supports success and warning vibration sequences", () => {
    mockVibrate.mockReturnValue(true);

    const { result } = renderHook(() => useHaptic(true));
    result.current.trigger("success");
    expect(mockVibrate).toHaveBeenCalledWith([15, 30, 15]);

    result.current.trigger("warning");
    expect(mockVibrate).toHaveBeenCalledWith([35, 40, 35]);
  });

  it("does not trigger vibration when disabled", () => {
    const { result } = renderHook(() => useHaptic(false));
    result.current.trigger("light");

    expect(mockVibrate).not.toHaveBeenCalled();
  });

  it("returns false gracefully if navigator.vibrate fails or is missing", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const success = triggerHaptic("light", true);
    expect(success).toBe(false);
  });
});
