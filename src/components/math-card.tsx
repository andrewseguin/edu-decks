"use client";

import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { FractionDisplay } from "./fraction-display";
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
      <CardContent className="p-4 sm:p-6 h-full w-full relative overflow-hidden">
        {/* Main Equation Container */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out z-20 pointer-events-none p-4 sm:p-6",
            isFlipped
              ? "-translate-y-[22%] sm:-translate-y-[26%]"
              : "translate-y-0"
          )}
        >
          {/* Main Equation Line */}
          <div
            className={cn(
              "flex items-center justify-center whitespace-nowrap text-center transition-all duration-500 ease-out origin-top",
              isFlipped ? "scale-[0.82] sm:scale-[0.88]" : "scale-100"
            )}
          >
            {/* First Number / Fraction */}
            {problem.isFraction && problem.frac1 ? (
              <FractionDisplay
                fraction={problem.frac1}
                colorClass={cn(
                  "transition-colors duration-500",
                  isFlipped ? "text-cyan-300" : "text-white"
                )}
                size="lg"
              />
            ) : (
              <span
                className={cn(
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl",
                  isFlipped
                    ? "text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
                )}
              >
                {problem.num1}
              </span>
            )}

            {/* Operator (+, -, ×, ÷) */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] mx-2.5 sm:mx-4 text-5xl sm:text-7xl md:text-8xl">
              {problem.operation}
            </span>

            {/* Second Number / Fraction */}
            {problem.isFraction && problem.frac2 ? (
              <FractionDisplay
                fraction={problem.frac2}
                colorClass={cn(
                  "transition-colors duration-500",
                  isFlipped ? "text-amber-300" : "text-white"
                )}
                size="lg"
              />
            ) : (
              <span
                className={cn(
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl",
                  isFlipped
                    ? "text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
                )}
              >
                {problem.num2}
              </span>
            )}

            {/* Equals Symbol */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] ml-2.5 sm:ml-4 mr-2.5 sm:mr-4 text-5xl sm:text-7xl md:text-8xl">
              =
            </span>

            {/* Answer Digit / Fraction / Frosted Question Mark Badge */}
            <div className="relative inline-flex items-center justify-center px-1">
              {problem.isFraction && problem.fracAnswer ? (
                <div
                  className={cn(
                    "transition-all duration-500 ease-out",
                    isFlipped ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  )}
                >
                  <FractionDisplay
                    fraction={problem.fracAnswer}
                    colorClass="text-white"
                    size="lg"
                  />
                </div>
              ) : (
                <span
                  className={cn(
                    "font-headline font-bold leading-none select-none text-white transition-all duration-500 ease-out text-5xl sm:text-7xl md:text-8xl",
                    isFlipped
                      ? "[text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] opacity-100 scale-100"
                      : "opacity-0 scale-75"
                  )}
                >
                  {problem.answerText}
                </span>
              )}

              {/* Obscuring Frosted Glass Pill Badge when Unrevealed */}
              <div
                className={cn(
                  "absolute inset-y-[-4px] inset-x-[-6px] flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm transition-all duration-500 ease-out",
                  isFlipped ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
                )}
              >
                <span className="font-headline font-bold text-white text-3xl sm:text-5xl md:text-6xl">
                  ?
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle Conversion Pill Badge with Stacked Fractions when revealed */}
          {problem.hasConversion && problem.convertedFrac1 && problem.convertedFrac2 && (
            <div
              className={cn(
                "mt-2 sm:mt-3 px-4 py-1.5 rounded-full bg-black/25 border border-white/20 backdrop-blur-xs flex items-center gap-2 text-white/90 font-headline font-bold shadow-sm transition-all duration-500 ease-out",
                isFlipped ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-90 pointer-events-none"
              )}
            >
              <FractionDisplay fraction={problem.convertedFrac1} colorClass="text-cyan-300" size="sm" />
              <span className="text-sm sm:text-base font-normal">{problem.operation}</span>
              <FractionDisplay fraction={problem.convertedFrac2} colorClass="text-amber-300" size="sm" />
              <span className="text-sm sm:text-base font-normal">=</span>
              <FractionDisplay
                fraction={{
                  n: problem.convertedFrac1.n + (problem.operation === '+' ? problem.convertedFrac2.n : -problem.convertedFrac2.n),
                  d: problem.convertedFrac1.d,
                }}
                colorClass="text-white"
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Visual Blocks Overlay - Lower Half when revealed */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-2 sm:bottom-3 top-[48%] flex items-center justify-center pointer-events-none z-10 transition-all duration-500 ease-out p-2 sm:p-4",
            isFlipped
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          )}
        >
          <VisualMath problem={problem} isFlipped={isFlipped} />
        </div>

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
