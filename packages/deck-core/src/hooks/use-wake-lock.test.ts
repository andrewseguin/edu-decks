import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWakeLock } from "./use-wake-lock";

describe("deck-core: useWakeLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, "visibilityState", {
      writable: true,
      value: "visible",
    });
  });

  it("requests wake lock when enabled", async () => {
    renderHook(() => useWakeLock(true));
    expect(navigator.wakeLock.request).toHaveBeenCalledWith("screen");
  });

  it("does not request wake lock when disabled", async () => {
    renderHook(() => useWakeLock(false));
    expect(navigator.wakeLock.request).not.toHaveBeenCalled();
  });

  it("releases wake lock on unmount", async () => {
    const mockRelease = vi.fn().mockResolvedValue(undefined);
    (navigator.wakeLock.request as any).mockResolvedValueOnce({
      release: mockRelease,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { unmount } = renderHook(() => useWakeLock(true));
    // Allow microtasks to resolve
    await Promise.resolve();

    unmount();
    expect(mockRelease).toHaveBeenCalled();
  });

  it("re-requests wake lock on visibilitychange to visible", async () => {
    renderHook(() => useWakeLock(true));
    expect(navigator.wakeLock.request).toHaveBeenCalledTimes(1);

    // Simulate switching away and back
    document.dispatchEvent(new Event("visibilitychange"));
    expect(navigator.wakeLock.request).toHaveBeenCalledTimes(2);
  });
});
