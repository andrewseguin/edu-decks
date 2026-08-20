"use client";

import * as React from "react";
import { useLocalStorage } from "./use-local-storage";
import { isDevSite } from "../lib/utils";

export type DevSettings = {
  isDev: boolean;
  showDebugOutlines: boolean;
  setShowDebugOutlines: (val: boolean | ((val: boolean) => boolean)) => void;
  toggleDebugOutlines: () => void;
  slowAnimations: boolean;
  setSlowAnimations: (val: boolean | ((val: boolean) => boolean)) => void;
  toggleSlowAnimations: () => void;
};

export function useDevSettings(): DevSettings {
  const [isDev, setIsDev] = React.useState(false);
  const [showDebugOutlines, setShowDebugOutlines] = useLocalStorage<boolean>(
    "deck-dev-show-outlines",
    false
  );
  const [slowAnimations, setSlowAnimations] = useLocalStorage<boolean>(
    "deck-dev-slow-animations",
    false
  );

  React.useEffect(() => {
    setIsDev(isDevSite());
  }, []);

  const toggleDebugOutlines = React.useCallback(() => {
    setShowDebugOutlines((prev) => !prev);
  }, [setShowDebugOutlines]);

  const toggleSlowAnimations = React.useCallback(() => {
    setSlowAnimations((prev) => !prev);
  }, [setSlowAnimations]);

  // Inject or remove slow-motion CSS when active
  React.useEffect(() => {
    if (!isDev || typeof document === "undefined") return;

    const STYLE_ID = "deck-dev-slow-animations-style";
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (slowAnimations) {
      document.documentElement.classList.add("deck-slow-animations");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
          html.deck-slow-animations *,
          html.deck-slow-animations *::before,
          html.deck-slow-animations *::after {
            transition-duration: 3.5s !important;
            animation-duration: 3.5s !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    } else {
      document.documentElement.classList.remove("deck-slow-animations");
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, [isDev, slowAnimations]);

  // Global 'D' (debug outlines) and 'S' (slow animations) shortcuts
  React.useEffect(() => {
    if (!isDev) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          toggleDebugOutlines();
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          toggleSlowAnimations();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDev, toggleDebugOutlines, toggleSlowAnimations]);

  return {
    isDev,
    showDebugOutlines: isDev ? showDebugOutlines : false,
    setShowDebugOutlines,
    toggleDebugOutlines,
    slowAnimations: isDev ? slowAnimations : false,
    setSlowAnimations,
    toggleSlowAnimations,
  };
}
