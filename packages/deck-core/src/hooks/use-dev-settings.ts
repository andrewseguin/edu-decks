"use client";

import * as React from "react";
import { useLocalStorage } from "./use-local-storage";
import { isDevSite } from "../lib/utils";

export type DevSettings = {
  isDev: boolean;
  showDebugOutlines: boolean;
  setShowDebugOutlines: (val: boolean | ((val: boolean) => boolean)) => void;
  toggleDebugOutlines: () => void;
};

export function useDevSettings(): DevSettings {
  const [isDev, setIsDev] = React.useState(false);
  const [showDebugOutlines, setShowDebugOutlines] = useLocalStorage<boolean>(
    "deck-dev-show-outlines",
    false
  );

  React.useEffect(() => {
    setIsDev(isDevSite());
  }, []);

  const toggleDebugOutlines = React.useCallback(() => {
    setShowDebugOutlines((prev) => !prev);
  }, [setShowDebugOutlines]);

  // Global 'D' key shortcut when on dev site and not typing in an input
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

      if (e.key === "d" || e.key === "D") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          toggleDebugOutlines();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDev, toggleDebugOutlines]);

  return {
    isDev,
    showDebugOutlines: isDev ? showDebugOutlines : false,
    setShowDebugOutlines,
    toggleDebugOutlines,
  };
}
