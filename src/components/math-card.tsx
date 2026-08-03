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
      <CardContent className="p-0 h-full w-full relative flex items-center justify-center">
        {/* Full Color-Coded Equation Area: Continuous Fluid Glide from Center to Top */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center p-4 transition-transform duration-500 ease-out pointer-events-none z-20",
            isFlipped ? "-translate-y-16 sm:-translate-y-20 md:-translate-y-24" : "translate-y-0"
          )}
        >
          <div className="flex items-center justify-center whitespace-nowrap text-center">
            {/* First Number (Cyan when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-colors duration-500",
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
                "font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] mx-2.5 sm:mx-4 transition-all duration-500",
                isFlipped ? "text-4xl sm:text-6xl md:text-7xl" : "text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              {problem.operation}
            </span>

            {/* Second Number (Orange/Amber when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-colors duration-500",
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
                "font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] ml-2.5 sm:ml-4 mr-2.5 sm:mr-4 transition-all duration-500",
                isFlipped ? "text-4xl sm:text-6xl md:text-7xl" : "text-5xl sm:text-7xl md:text-8xl"
              )}
            >
              =
            </span>

            {/* Answer Digit / Frosted Question Mark Badge */}
            <div className="relative inline-flex items-center justify-center px-1">
              <span
                className={cn(
                  "font-headline font-bold leading-none select-none text-white transition-all duration-500",
                  isFlipped
                    ? "[text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] opacity-100 scale-100 text-4xl sm:text-6xl md:text-7xl"
                    : "opacity-0 scale-90 text-5xl sm:text-7xl md:text-8xl"
                )}
              >
                {problem.answerText}
              </span>

              {/* Obscuring Frosted Glass Pill Badge when Unrevealed */}
              {!isFlipped && (
                <div className="absolute inset-y-[-4px] inset-x-[-6px] flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm transition-all duration-300">
                  <span className="font-headline font-bold text-white text-3xl sm:text-5xl md:text-6xl">
                    ?
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Blocks Container: Anchored in Lower Half */}
        {isFlipped && (
          <div className="absolute bottom-3 inset-x-0 top-[140px] sm:top-[165px] flex items-center justify-center pointer-events-none z-10 px-4 transition-opacity duration-500 ease-out">
            <VisualMath problem={problem} />
          </div>
        )}

        {/* Speaker Button in Bottom Right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-transform active:scale-95 outline-none pointer-events-auto z-30"
          onClick={handleSpeak}
          aria-label="Listen to equation"
        >
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
