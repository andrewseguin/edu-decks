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
        "relative select-none [-webkit-touch-callout:none] w-[90vw] h-[52vw] max-w-[700px] max-h-[min(380px,58svh)] border-none rounded-3xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
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
      <CardContent className="p-6 h-full w-full flex flex-col items-center justify-between relative">
        {/* Top Header Badge */}
        <div className="w-full flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-headline font-bold text-white/80 bg-white/10 uppercase tracking-wider">
            {opInfo.name} ({problem.operation})
          </span>
        </div>

        {/* Center Display Area: Equation + Pulse Fade Answer */}
        <div className="my-auto flex flex-col items-center justify-center gap-2 sm:gap-3 text-center w-full">
          {/* Main Equation (Fixed Position) */}
          <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-6xl sm:text-8xl md:text-[8.5rem]">
            {problem.displayText}
          </span>

          {/* Pulse Fade Revealed Answer */}
          {isFlipped && (
            <div className="flex flex-col items-center gap-2 sm:gap-3 animate-fade-in-zoom w-full">
              <span className="font-headline font-bold text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-[6.5rem] leading-none">
                = {problem.answerText}
              </span>
              <VisualMath problem={problem} />
            </div>
          )}
        </div>

        {/* Speaker Button */}
        <Button
          variant="ghost"
          className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full flex items-center justify-center"
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
