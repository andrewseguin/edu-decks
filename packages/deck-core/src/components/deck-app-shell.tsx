"use client";

import * as React from "react";
import { DeckControlBar } from "./deck-control-bar";
import { LockSnackbar } from "./app-settings-modal";
import { cn } from "../lib/utils";

export type DeckAppShellProps = {
  children: React.ReactNode;
  isLocked?: boolean;
  onUnlock?: () => void;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  topRightControls?: React.ReactNode;
  bottomStats?: React.ReactNode;
  quizOverlay?: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  className?: string;
};

export function DeckAppShell({
  children,
  isLocked = false,
  onUnlock,
  isFullscreen,
  onFullscreenToggle,
  topRightControls,
  bottomStats,
  quizOverlay,
  onPointerDown,
  onPointerUp,
  className,
}: DeckAppShellProps) {
  return (
    <main
      className={cn(
        "flex h-svh w-screen items-center justify-center bg-background overflow-hidden relative focus:outline-none touch-none select-none",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      tabIndex={-1}
    >
      {children}

      {!isLocked && (topRightControls || (isFullscreen !== undefined && onFullscreenToggle)) && (
        <DeckControlBar
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
        >
          {topRightControls}
        </DeckControlBar>
      )}

      {bottomStats}

      {onUnlock && (
        <LockSnackbar
          isLocked={isLocked}
          onUnlock={onUnlock}
        />
      )}

      {quizOverlay}
    </main>
  );
}
