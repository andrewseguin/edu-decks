"use client";

import * as React from "react";
import { QuizOverlayShell } from "./quiz-overlay-shell";
import { cn } from "../lib/utils";

export type DeckQuizManagerProps = {
  score: number;
  streak: number;
  onExit: () => void;
  onReplayAudio?: () => void;
  isPlayingSound?: boolean;
  replayLabel?: string;
  prompt: React.ReactNode;
  input: React.ReactNode;
  isCorrect?: boolean | null;
  showFeedbackBanner?: boolean;
  feedbackClassName?: string;
  className?: string;
  contentClassName?: string;
};

export function DeckQuizManager({
  score,
  streak,
  onExit,
  onReplayAudio,
  isPlayingSound = false,
  replayLabel = "Listen",
  prompt,
  input,
  isCorrect,
  showFeedbackBanner = false,
  feedbackClassName,
  className,
  contentClassName,
}: DeckQuizManagerProps) {
  return (
    <QuizOverlayShell
      score={score}
      streak={streak}
      onExit={onExit}
      onReplayAudio={onReplayAudio}
      isPlayingSound={isPlayingSound}
      replayLabel={replayLabel}
      contentClassName={contentClassName}
    >
      {/* Prompt Area */}
      {prompt ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 my-auto">
          {prompt}
        </div>
      ) : null}

      {/* Optional Shared Feedback Banner */}
      {showFeedbackBanner && isCorrect !== undefined && isCorrect !== null && (
        <div
          className={cn(
            "px-5 py-2 rounded-full font-bold font-headline text-sm animate-in fade-in zoom-in-95 duration-200",
            isCorrect
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20",
            feedbackClassName
          )}
        >
          {isCorrect ? "Correct!" : "Try again"}
        </div>
      )}

      {/* Input Area (Keypad or Multiple-Choice Options Grid) */}
      <div
        className={cn(
          "w-full flex flex-col",
          prompt ? "shrink-0" : "flex-1 min-h-0 my-auto justify-center"
        )}
      >
        {input}
      </div>
    </QuizOverlayShell>
  );
}
