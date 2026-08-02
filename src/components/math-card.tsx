"use client";

import { useState } from "react";
import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { Volume2, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MathCardProps = {
  problem: MathProblem;
  onSpeak: (text: string) => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
};

export function MathCard({
  problem,
  onSpeak,
  onNext,
  onPrev,
  hasPrev,
}: MathCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const opInfo = OPERATION_COLORS[problem.operation];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flip if clicking audio speaker or navigation button
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-no-flip]")) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(problem.speechText);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg px-4 select-none">
      {/* 3D Card Container */}
      <div
        className="w-full aspect-[4/3] sm:aspect-[16/11] min-h-[340px] sm:min-h-[420px] perspective-1000 cursor-pointer group"
        onClick={handleCardClick}
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 transform-style-3d transition-transform ease-out",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* FRONT OF CARD */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border-4 p-6 sm:p-8 flex flex-col justify-between items-center shadow-2xl backface-hidden transition-all duration-300",
              opInfo.border,
              "hover:shadow-3xl hover:scale-[1.01]"
            )}
          >
            {/* Top Bar on Front */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <span
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border flex items-center gap-1.5",
                  opInfo.badgeBg
                )}
              >
                <span className="text-sm font-black">{problem.operation}</span>
                <span>{opInfo.name}</span>
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-11 w-11 hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                onClick={handleSpeak}
                aria-label="Listen to problem"
                title="Listen to problem"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Problem Display */}
            <div className="my-auto flex items-center justify-center gap-3 sm:gap-6 text-center">
              <span className="text-6xl sm:text-8xl font-black font-headline text-foreground tracking-tight">
                {problem.displayText}
              </span>
            </div>

            {/* Bottom Flip Indicator */}
            <div className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
              <RotateCw className="h-4 w-4 animate-spin-slow" />
              <span>Tap to reveal answer</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border-4 p-6 sm:p-8 flex flex-col justify-between items-center shadow-2xl backface-hidden rotate-y-180 transition-all duration-300",
              opInfo.border
            )}
          >
            {/* Top Bar on Back */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <span
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border flex items-center gap-1.5",
                  opInfo.badgeBg
                )}
              >
                <span>Answer</span>
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-11 w-11 hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                onClick={handleSpeak}
                aria-label="Listen to answer"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Answer Display */}
            <div className="my-auto flex flex-col items-center justify-center gap-3 text-center">
              <div
                className="text-7xl sm:text-9xl font-black font-headline tracking-tight animate-fade-in-zoom"
                style={{ color: opInfo.hex }}
              >
                {problem.answerText}
              </div>

              {/* Visual Helper Blocks */}
              <VisualMath problem={problem} />
            </div>

            {/* Bottom Flip Back Indicator */}
            <div className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
              <RotateCw className="h-4 w-4" />
              <span>Tap to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons below card */}
      <div className="flex items-center gap-4 mt-6 pointer-events-auto" data-no-flip="true">
        <Button
          variant="outline"
          size="lg"
          className="rounded-2xl h-14 px-6 border-2 font-bold gap-2 text-base shadow-sm hover:bg-card active:scale-95 disabled:opacity-30"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
            onPrev();
          }}
          disabled={!hasPrev}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-6 w-6" />
          <span>Prev</span>
        </Button>

        <Button
          variant="default"
          size="lg"
          className={cn(
            "rounded-2xl h-14 px-8 font-black gap-2 text-base shadow-md active:scale-95",
            opInfo.accent
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
            onNext();
          }}
          aria-label="Next card"
        >
          <span>Next</span>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
