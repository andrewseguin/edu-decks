"use client";

import * as React from "react";
import { Eye, Clock } from "lucide-react";
import { cn } from "../lib/utils";

export type SessionStatsProps = {
  cardCount: number;
  timeElapsed: number; // in seconds
  showCardCount?: boolean;
  showTimer?: boolean;
  position?: "top-left" | "bottom-center" | "top-right";
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
  position = "top-left",
  className,
}: SessionStatsProps) {
  if (!showCardCount && !showTimer) return null;

  const positionClasses = {
    "top-left":
      "absolute top-2.5 left-2.5 sm:top-5 sm:left-6 z-30 flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold pointer-events-none text-xs sm:text-sm h-8 sm:h-10",
    "bottom-center":
      "absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 text-foreground/50 font-headline font-semibold pointer-events-none text-xs sm:text-sm",
    "top-right":
      "absolute top-2.5 right-2.5 sm:top-5 sm:right-6 z-30 flex items-center gap-2.5 sm:gap-4 text-foreground/60 font-headline font-semibold pointer-events-none text-xs sm:text-sm h-8 sm:h-10",
  }[position];

  return (
    <div className={cn(positionClasses, className)}>
      {showCardCount && (
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <span>{cardCount}</span>
        </div>
      )}
      {showTimer && (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      )}
    </div>
  );
}
