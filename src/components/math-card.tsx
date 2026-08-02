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
        "relative select-none [-webkit-touch-callout:none] w-[90vw] h-[45vw] max-w-[700px] max-h-[min(350px,55svh)] border-none rounded-3xl overflow-hidden cursor-pointer transition-all duration-300",
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
        {/* Full Equation Always Centered */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex items-center justify-center whitespace-nowrap text-center">
            {/* First Number (Cyan when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-colors duration-300 text-5xl sm:text-7xl md:text-8xl",
                isFlipped
                  ? "text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
              )}
            >
              {problem.num1}
            </span>

            {/* Operator (+, -, ×, ÷) */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl mx-2 sm:mx-3">
              {problem.operation}
            </span>

            {/* Second Number (Orange/Amber when revealed, White when unrevealed) */}
            <span
              className={cn(
                "font-headline font-bold leading-none select-none transition-colors duration-300 text-5xl sm:text-7xl md:text-8xl",
                isFlipped
                  ? "text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
              )}
            >
              {problem.num2}
            </span>

            {/* Equals Symbol */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl ml-2 sm:ml-3 mr-2 sm:mr-3">
              =
            </span>

            {/* Answer Digit (Always rendered in exact position) */}
            <div className="relative inline-flex items-center justify-center px-1">
              <span
                className={cn(
                  "font-headline font-bold leading-none select-none text-white transition-all duration-300 text-5xl sm:text-7xl md:text-8xl",
                  isFlipped
                    ? "[text-shadow:0_0_16px_rgba(255,255,255,0.8),3px_3px_6px_rgba(0,0,0,0.2)] opacity-100 scale-100"
                    : "opacity-0 scale-90"
                )}
              >
                {problem.answerText}
              </span>

              {/* Obscuring Frosted Glass Pill Badge when Un-revealed */}
              {!isFlipped && (
                <div className="absolute inset-y-[-4px] inset-x-[-6px] flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm animate-pulse">
                  <span className="font-headline font-bold text-white text-3xl sm:text-5xl md:text-6xl">
                    ?
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Blocks Overlay - Absolute Bottom Layer */}
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
