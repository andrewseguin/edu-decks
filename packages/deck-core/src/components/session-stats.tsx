"use client";

import * as React from "react";
import { Eye, Clock } from "lucide-react";
import { cn } from "../lib/utils";

export type SessionStatsProps = {
  cardCount: number;
  timeElapsed: number; // in seconds
  showCardCount?: boolean;
  showTimer?: boolean;
  position?: "top-left" | "bottom-center" | "top-right" | "flow";
  className?: string;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export function SessionStats({
  cardCount,
  timeElapsed,
  showCardCount = true,
  showTimer = true,
  position = "flow",
  className,
}: SessionStatsProps) {
  if (!showCardCount && !showTimer) return null;

  const positionClasses = {
    "top-left":
      "absolute top-2.5 left-2.5 sm:top-5 sm:left-6 z-30 flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold pointer-events-none text-xs sm:text-sm h-8 sm:h-10",
    "bottom-center":
      "flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold text-xs sm:text-sm h-8 sm:h-9",
    "top-right":
      "absolute top-2.5 right-2.5 sm:top-5 sm:right-6 z-30 flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold pointer-events-none text-xs sm:text-sm h-8 sm:h-10",
    "flow":
      "flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold text-xs sm:text-sm h-8 sm:h-9",
  }[position];

  return (
    <div className={cn(positionClasses, className)}>
      {showCardCount && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{cardCount}</span>
        </div>
      )}
      {showTimer && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      )}
    </div>
  );
}
