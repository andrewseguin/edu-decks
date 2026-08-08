"use client";

import * as React from "react";

export type UseDeckGesturesOptions = {
  onNext?: () => void;
  onPrev?: () => void;
  onTap?: () => void;
  isMenuOpen?: boolean;
  swipeThreshold?: number;
  tapThreshold?: number;
  menuCloseCooldownMs?: number;
  enableKeyboard?: boolean;
};

export function useDeckGestures({
  onNext,
  onPrev,
  onTap,
  isMenuOpen = false,
  swipeThreshold = 50,
  tapThreshold = 12,
  menuCloseCooldownMs = 300,
  enableKeyboard = true,
}: UseDeckGesturesOptions) {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const lastMenuCloseTimeRef = React.useRef<number>(0);

  const notifyMenuClosed = React.useCallback(() => {
    lastMenuCloseTimeRef.current = Date.now();
  }, []);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (isMenuOpen) return;
      if (Date.now() - lastMenuCloseTimeRef.current < menuCloseCooldownMs) return;
      touchStartRef.current = { x: e.clientX, y: e.clientY };
    },
    [isMenuOpen, menuCloseCooldownMs]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!touchStartRef.current) return;
      if (isMenuOpen || Date.now() - lastMenuCloseTimeRef.current < menuCloseCooldownMs) {
        touchStartRef.current = null;
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[data-interactive='true']")
      ) {
        touchStartRef.current = null;
        return;
      }

      const deltaX = e.clientX - touchStartRef.current.x;
      const deltaY = e.clientY - touchStartRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      touchStartRef.current = null;

      // Check horizontal swipe
      if (absDeltaX > swipeThreshold && absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          onPrev?.();
        } else {
          onNext?.();
        }
      } else if (absDeltaX <= tapThreshold && absDeltaY <= tapThreshold) {
        onTap?.();
      }
    },
    [isMenuOpen, menuCloseCooldownMs, swipeThreshold, tapThreshold, onNext, onPrev, onTap]
  );

  React.useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const isRight = e.key === "ArrowRight" || e.code === "ArrowRight";
      const isLeft = e.key === "ArrowLeft" || e.code === "ArrowLeft";
      const isDown = e.key === "ArrowDown" || e.code === "ArrowDown";
      const isSpace = e.key === " " || e.code === "Space" || e.key === "Spacebar";
      const isEnter = e.key === "Enter" || e.code === "Enter";
      const actsLikeTap = isRight || isDown || isSpace || isEnter;

      // If user is focused on an interactive button and presses Space/Enter, let native click handler work
      if (
        (isSpace || isEnter) &&
        typeof (e.target as HTMLElement)?.closest === "function" &&
        (e.target as HTMLElement).closest("button")
      ) {
        return;
      }

      if (actsLikeTap) {
        e.preventDefault();
        if (onTap) {
          onTap();
        } else if (onNext) {
          onNext();
        }
      } else if (isLeft) {
        e.preventDefault();
        onPrev?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, enableKeyboard, onNext, onPrev, onTap]);

  return {
    handlePointerDown,
    handlePointerUp,
    notifyMenuClosed,
  };
}
