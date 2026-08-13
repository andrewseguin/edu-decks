"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type StepNavProps = {
  /** Total number of steps */
  count: number;
  /** 0-based index of the currently visible step (-1 = none yet) */
  activeIndex: number;
  /** Called when user taps a step pill (0-based) */
  onStepClick: (index: number) => void;
  /** Called when user taps the replay button */
  onReplay: () => void;
};

/**
 * Pill navigation bar for stepping through a geometry card's working.
 * Mirrors the StepControls component in the arithmetic deck.
 *
 * Layout:  [1.] [2.] [3. Answer] | [↺]
 *
 * - All pills but the last are numbered steps ("1.", "2.", …)
 * - The last pill is always labeled "Answer" and gets a brighter highlight
 * - Tapping any pill jumps directly to that step
 * - Replay resets to the beginning and re-triggers the auto sequence
 */
export function StepNav({ count, activeIndex, onStepClick, onReplay }: StepNavProps) {
  if (count < 2) return null; // Single-step cards don't need navigation

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-black/30 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/20 shadow-sm pointer-events-auto z-30 select-none animate-fade-in">
      {Array.from({ length: count }).map((_, i) => {
        const isLast = i === count - 1;
        const isActive = activeIndex === i;
        const isReached = activeIndex >= i;

        return (
          <button
            key={`step-${i}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStepClick(i);
            }}
            className={cn(
              "px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-300 cursor-pointer border",
              isActive && isLast
                ? "bg-white text-black border-white/80"
                : isActive
                  ? "bg-white/90 text-black border-white/60"
                  : isReached
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/15"
            )}
            aria-label={isLast ? `Answer (step ${i + 1})` : `Step ${i + 1}`}
          >
            {isLast ? "Answer" : `${i + 1}.`}
          </button>
        );
      })}

      <div className="w-px h-3 bg-white/25 mx-0.5" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReplay();
        }}
        title="Replay steps"
        className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-transform active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
      </button>
    </div>
  );
}
