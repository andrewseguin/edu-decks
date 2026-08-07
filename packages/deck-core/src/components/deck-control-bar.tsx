"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { FullscreenToggle } from "./fullscreen-toggle";

export type DeckControlBarProps = {
  children?: React.ReactNode;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  className?: string;
  position?: "top-right" | "top-left" | "flow";
};

export function DeckControlBar({
  children,
  isFullscreen,
  onFullscreenToggle,
  className,
  position = "flow",
}: DeckControlBarProps) {
  const posClass =
    position === "top-right"
      ? "absolute top-2.5 right-2.5 sm:top-4 sm:right-4"
      : position === "top-left"
      ? "absolute top-2.5 left-2.5 sm:top-4 sm:left-4"
      : "";

  return (
    <div
      className={cn(
        posClass,
        "flex items-center gap-1.5 sm:gap-2 pointer-events-auto",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
      {isFullscreen !== undefined && onFullscreenToggle && (
        <FullscreenToggle isFullscreen={isFullscreen} onToggle={onFullscreenToggle} />
      )}
    </div>
  );
}
