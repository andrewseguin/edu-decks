"use client";

import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MathCardProps = {
  problem: MathProblem;
  isFlipped: boolean;
  slideDirection: "next" | "prev";
  onCardTap: () => void;
  onSpeak: (text: string) => void;
};

export function MathCard({
  problem,
  isFlipped,
  slideDirection,
  onCardTap,
  onSpeak,
}: MathCardProps) {
  const opInfo = OPERATION_COLORS[problem.operation];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onCardTap();
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlipped) {
      onSpeak(problem.fullSpeechText);
    } else {
      onSpeak(problem.problemSpeechText);
    }
  };

  const animClass =
    slideDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <Card
      key={problem.id}
      className={cn(
        "relative select-none [-webkit-touch-callout:none] w-[90vw] h-[45vw] max-w-[720px] max-h-[min(360px,56svh)] border-none rounded-3xl overflow-hidden cursor-pointer transition-all duration-300",
        animClass
      )}
      style={{
        backgroundColor: opInfo.hex,
        boxShadow:
          "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
      }}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 h-full w-full relative flex items-center justify-center">
        {/* Inline Equation Completion - 100% Stationary Center Position */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {/* Equation Prefix (7 + 5 =) */}
            <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-6xl sm:text-8xl md:text-[8.5rem]">
              {problem.displayText} =
            </span>

            {/* Target Value: "?" when unrevealed, Answer "12" when revealed */}
            {!isFlipped ? (
              <span className="font-headline font-bold leading-none select-none text-white/70 bg-white/10 px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl border-2 border-dashed border-white/30 text-5xl sm:text-7xl md:text-[7.5rem] animate-pulse">
                ?
              </span>
            ) : (
              <span className="font-headline font-bold leading-none select-none text-white [text-shadow:0_0_12px_rgba(255,255,255,0.6),3px_3px_6px_rgba(0,0,0,0.2)] text-6xl sm:text-8xl md:text-[8.5rem] animate-fade-in-zoom">
                {problem.answerText}
              </span>
            )}
          </div>
        </div>

        {/* Visual Blocks Overlay - Absolute Bottom Layer (Does NOT shift equation) */}
        {isFlipped && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center animate-fade-in-zoom pointer-events-none z-10">
            <VisualMath problem={problem} />
          </div>
        )}

        {/* Speaker Button in Bottom Right */}
        <Button
          variant="ghost"
          className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full flex items-center justify-center z-20"
          onClick={handleSpeak}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Speak equation"
        >
          <Volume2 className="h-7 w-7 text-white/70 hover:text-white transition-colors" />
        </Button>
      </CardContent>
    </Card>
  );
}
