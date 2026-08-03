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
        "relative select-none [-webkit-touch-callout:none] w-[92vw] max-w-[660px] aspect-[16/10] max-h-[75vh] sm:max-h-[82vh] border-none rounded-3xl overflow-hidden cursor-pointer transition-all duration-300",
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
      <CardContent className="p-4 sm:p-6 h-full w-full relative flex flex-col justify-between items-center">
        {/* Full Color-Coded Equation Area */}
        <div
          className={cn(
            "w-full flex items-center justify-center transition-all duration-300",
            isFlipped ? "pt-3 sm:pt-6 shrink-0" : "my-auto"
          )}
        >
          <div className="flex items-center justify-center whitespace-nowrap text-center">
            {/* First Number (Cyan when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-all duration-300",
                isFlipped
                  ? "text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-4xl sm:text-6xl md:text-7xl"
                  : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              {problem.num1}
            </span>

            {/* Operator (+, -, ×, ÷) */}
            <span
              className={cn(
                "font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] mx-2 sm:mx-3.5 transition-all duration-300",
                isFlipped ? "text-4xl sm:text-6xl md:text-7xl" : "text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              {problem.operation}
            </span>

            {/* Second Number (Orange/Amber when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-all duration-300",
                isFlipped
                  ? "text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-4xl sm:text-6xl md:text-7xl"
                  : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              {problem.num2}
            </span>

            {/* Equals Symbol */}
            <span
              className={cn(
                "font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] ml-2 sm:ml-3.5 mr-2 sm:mr-3.5 transition-all duration-300",
                isFlipped ? "text-4xl sm:text-6xl md:text-7xl" : "text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              =
            </span>

            {/* Answer Digit */}
            <div className="relative inline-flex items-center justify-center px-1">
              <span
                className={cn(
                  "font-headline font-bold leading-none select-none text-white transition-all duration-300",
                  isFlipped
                    ? "[text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] opacity-100 scale-100 text-4xl sm:text-6xl md:text-7xl"
                    : "opacity-0 scale-90 text-5xl sm:text-7xl md:text-8xl"
                )}
              >
                {problem.answerText}
              </span>

              {/* Obscuring Frosted Glass Pill Badge when Unrevealed */}
              {!isFlipped && (
                <div className="absolute inset-y-[-4px] inset-x-[-6px] flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm">
                  <span className="font-headline font-bold text-white text-3xl sm:text-5xl md:text-6xl">
                    ?
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Blocks Overlay - Centered in Lower Region */}
        {isFlipped && (
          <div className="w-full flex-1 flex items-center justify-center min-h-0 pointer-events-none z-10 py-2 sm:py-3">
            <VisualMath problem={problem} />
          </div>
        )}

        {/* Speaker Button in Bottom Right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-transform active:scale-95 outline-none pointer-events-auto z-20"
          onClick={handleSpeak}
          aria-label="Listen to equation"
        >
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
