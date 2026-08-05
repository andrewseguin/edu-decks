"use client";

import * as React from "react";
import { Volume2, X, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export type QuizOverlayShellProps = {
  score: number;
  streak: number;
  onExit: () => void;
  onReplayAudio?: () => void;
  isPlayingSound?: boolean;
  replayLabel?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  exitButtonLabel?: string;
};

export function QuizOverlayShell({
  score,
  streak,
  onExit,
  onReplayAudio,
  isPlayingSound = false,
  replayLabel = "Listen",
  children,
  className,
  headerClassName,
  contentClassName,
  exitButtonLabel = "Exit quiz",
}: QuizOverlayShellProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden animate-in fade-in duration-300",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Quiz Top Header Bar */}
      <div
        className={cn(
          "flex items-center justify-between w-full max-w-4xl mx-auto gap-2 shrink-0 h-10",
          headerClassName
        )}
      >
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full gap-1.5 px-3.5 py-1.5 text-muted-foreground hover:text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground shrink-0 font-headline font-bold h-8 text-xs sm:text-sm transition-colors outline-none cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          aria-label={exitButtonLabel}
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Exit Quiz</span>
        </button>

        {/* Center Audio Replay Button */}
        {onReplayAudio && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full gap-1.5 px-4 py-1.5 font-headline font-bold text-xs sm:text-sm transition-transform active:scale-95 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground h-8 outline-none cursor-pointer",
              isPlayingSound ? "animate-pulse scale-105 text-primary border-primary" : ""
            )}
            onClick={(e) => {
              e.stopPropagation();
              onReplayAudio();
            }}
            aria-label="Replay sound"
          >
            <Volume2 className="w-4 h-4" />
            <span>{replayLabel}</span>
          </button>
        )}

        {/* Score & Streak Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm shrink-0 font-headline h-8">
          <Sparkles className="w-4 h-4" />
          <span>{score}</span>
          {streak > 1 && (
            <span className="text-[10px] sm:text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-black">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Main Quiz Content Area */}
      <div
        className={cn(
          "w-full max-w-md sm:max-w-2xl md:max-w-3xl mx-auto flex-1 flex flex-col items-center justify-between gap-4 sm:gap-6 min-h-0 py-2 sm:py-4",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
