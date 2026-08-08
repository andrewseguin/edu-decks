import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio } from "./use-audio";

describe("deck-core: useAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not speak if enabled is false", () => {
    const { result } = renderHook(() => useAudio());
    const onEnd = vi.fn();

    act(() => {
      result.current.speak("Hello", false, onEnd);
    });

    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("uses speech synthesis when enabled", () => {
    const { result } = renderHook(() => useAudio());
    const onEnd = vi.fn();

    act(() => {
      result.current.speak("Card Prompt", true, onEnd);
    });

    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("uses custom speak function when provided via options object", () => {
    const customSpeak = vi.fn((text, enabled, onEnd) => onEnd?.());
    const { result } = renderHook(() => useAudio({ customSpeak }));
    const onEnd = vi.fn();

    act(() => {
      result.current.speak("Custom Text", true, onEnd);
    });

    expect(customSpeak).toHaveBeenCalledWith("Custom Text", true, onEnd);
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
  });

  it("uses custom speak function when passed directly as function argument", () => {
    const customSpeak = vi.fn((text, enabled, onEnd) => onEnd?.());
    const { result } = renderHook(() => useAudio(customSpeak));
    const onEnd = vi.fn();

    act(() => {
      result.current.speak("Direct Function Text", true, onEnd);
    });

    expect(customSpeak).toHaveBeenCalledWith("Direct Function Text", true, onEnd);
    expect(onEnd).toHaveBeenCalled();
  });

  it("plays correct chime for success (true)", () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playChime(true);
    });
  });

  it("plays try-again chime for failure (false)", () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playChime(false);
    });
  });
});
