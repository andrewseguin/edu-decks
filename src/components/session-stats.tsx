"use client";

import { Clock, Layers } from "lucide-react";

type SessionStatsProps = {
  cardCount: number;
  timeElapsed: number;
  showCardCount: boolean;
  showTimer: boolean;
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
  showCardCount,
  showTimer,
}: SessionStatsProps) {
  if (!showCardCount && !showTimer) return null;

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5 text-foreground/60 bg-card/70 backdrop-blur-md px-5 py-2 rounded-full border border-border/50 shadow-xs pointer-events-none z-20"
    >
      {showCardCount && (
        <div className="flex items-center gap-2 font-mono text-sm font-semibold">
          <Layers className="h-4 w-4 text-primary" />
          <span>Card {cardCount}</span>
        </div>
      )}
      {showCardCount && showTimer && (
        <div className="h-3 w-[1px] bg-border" />
      )}
      {showTimer && (
        <div className="flex items-center gap-2 font-mono text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      )}
    </div>
  );
}
