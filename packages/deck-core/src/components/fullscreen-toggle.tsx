"use client";

import * as React from "react";
import { Maximize, Minimize } from "lucide-react";
import { cn } from "../lib/utils";

export type FullscreenToggleProps = {
  isFullscreen: boolean;
  onToggle: () => void;
  className?: string;
};

export function FullscreenToggle({ isFullscreen, onToggle, className }: FullscreenToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 text-foreground/50 hover:text-foreground active:scale-95 transition-transform",
        className
      )}
      onClick={onToggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
    </button>
  );
}
