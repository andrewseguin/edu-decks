"use client";

import * as React from "react";
import { DeckControlBar } from "./deck-control-bar";
import { LockSnackbar } from "./app-settings-modal";
import { cn } from "../lib/utils";

export type DeckAppShellProps = {
  children: React.ReactNode;
  isLocked?: boolean;
  onUnlock?: () => void;
  topRightControls?: React.ReactNode;
  bottomStats?: React.ReactNode;
  stats?: React.ReactNode;
  quizOverlay?: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function DeckAppShell({
  children,
  isLocked = false,
  onUnlock,
  topRightControls,
  bottomStats,
  stats,
  quizOverlay,
  onPointerDown,
  onPointerUp,
  className,
  headerClassName,
  contentClassName,
}: DeckAppShellProps) {
  const activeStats = stats || bottomStats;

  return (
    <main
      className={cn(
        "flex flex-col h-svh w-screen bg-background overflow-hidden relative focus:outline-none touch-none select-none",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      tabIndex={-1}
    >
      {/* Flow-based Header */}
      <header
        className={cn(
          "w-full px-3 sm:px-6 pt-2 sm:pt-4 pb-1 shrink-0 flex items-center justify-between pointer-events-none z-30 min-h-[44px] sm:min-h-[52px]",
          headerClassName
        )}
      >
        {/* Left Side: Stats Counter / Timer */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {activeStats}
        </div>

        {/* Right Side: Header Controls */}
        {!isLocked && topRightControls ? (
          <DeckControlBar>
            {topRightControls}
          </DeckControlBar>
        ) : (
          <div />
        )}
      </header>

      {/* Main Flashcard Playground */}
      <div
        className={cn(
          "flex-1 min-h-0 min-w-0 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden relative",
          contentClassName
        )}
      >
        {children}
      </div>

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
