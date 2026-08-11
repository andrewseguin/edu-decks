"use client";

import * as React from "react";

export type HapticPattern = "light" | "medium" | "selection" | "success" | "warning";

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 22,
  selection: 8,
  success: [15, 30, 15],
  warning: [35, 40, 35],
};

export function triggerHaptic(pattern: HapticPattern = "light", enabled: boolean = true): boolean {
  if (!enabled || typeof window === "undefined" || !("vibrate" in navigator)) {
    return false;
  }

  try {
    const sequence = HAPTIC_PATTERNS[pattern] ?? HAPTIC_PATTERNS.light;
    return navigator.vibrate(sequence);
  } catch {
    return false;
  }
}

export function useHaptic(enabled: boolean = true) {
  const trigger = React.useCallback(
    (pattern: HapticPattern = "light") => {
      return triggerHaptic(pattern, enabled);
    },
    [enabled]
  );

  return { trigger };
}
