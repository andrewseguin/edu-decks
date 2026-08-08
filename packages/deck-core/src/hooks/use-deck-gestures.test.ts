import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckGestures } from "./use-deck-gestures";

describe("deck-core: useDeckGestures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("triggers onTap on tap gesture with minimal movement", () => {
    const onTap = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();

    const { result } = renderHook(() =>
      useDeckGestures({ onTap, onNext, onPrev })
    );

    const div = document.createElement("div");
    document.body.appendChild(div);

    act(() => {
      result.current.handlePointerDown({ clientX: 100, clientY: 100, target: div } as any);
      result.current.handlePointerUp({ clientX: 105, clientY: 102, target: div } as any);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("triggers onNext on swipe left", () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();

    const { result } = renderHook(() =>
      useDeckGestures({ onNext, onPrev, swipeThreshold: 50 })
    );

    const div = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({ clientX: 200, clientY: 100, target: div } as any);
      result.current.handlePointerUp({ clientX: 120, clientY: 105, target: div } as any);
    });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it("triggers onPrev on swipe right", () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();

    const { result } = renderHook(() =>
      useDeckGestures({ onNext, onPrev, swipeThreshold: 50 })
    );

    const div = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({ clientX: 100, clientY: 100, target: div } as any);
      result.current.handlePointerUp({ clientX: 180, clientY: 105, target: div } as any);
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("ignores gestures on button elements or interactive targets", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useDeckGestures({ onTap }));

    const button = document.createElement("button");

    act(() => {
      result.current.handlePointerDown({ clientX: 100, clientY: 100, target: button } as any);
      result.current.handlePointerUp({ clientX: 100, clientY: 100, target: button } as any);
    });

    expect(onTap).not.toHaveBeenCalled();
  });

  it("blocks gestures when isMenuOpen is true", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() =>
      useDeckGestures({ onTap, isMenuOpen: true })
    );

    const div = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({ clientX: 100, clientY: 100, target: div } as any);
      result.current.handlePointerUp({ clientX: 100, clientY: 100, target: div } as any);
    });

    expect(onTap).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation (ArrowRight, ArrowLeft, Space)", () => {
    const onTap = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useDeckGestures({ onTap, onPrev, enableKeyboard: true })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(onTap).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onTap).toHaveBeenCalledTimes(2);
  });
});
