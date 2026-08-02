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
  onFlip: () => void;
  onSpeak: (text: string) => void;
};

export function MathCard({
  problem,
  isFlipped,
  onFlip,
  onSpeak,
}: MathCardProps) {
  const opInfo = OPERATION_COLORS[problem.operation];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onFlip();
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(problem.speechText);
  };

  return (
    <Card
      className={cn(
        "relative select-none [-webkit-touch-callout:none] animate-fade-in-zoom w-[90vw] h-[45vw] max-w-[700px] max-h-[min(350px,55svh)] border-none rounded-3xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
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
      <CardContent className="p-0 h-full w-full flex flex-col items-center justify-center relative">
        {!isFlipped ? (
          /* FRONT OF CARD - ONLY THE EQUATION */
          <div className="flex items-center justify-center w-full h-full animate-fade-in-zoom px-4">
            <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-7xl sm:text-9xl md:text-[11rem]">
              {problem.displayText}
            </span>
          </div>
        ) : (
          /* BACK OF CARD - ONLY THE ANSWER & VISUAL BLOCKS */
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full animate-fade-in-zoom px-4">
            <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-8xl sm:text-[10rem] md:text-[12rem]">
              {problem.answerText}
            </span>
            <VisualMath problem={problem} />
          </div>
        )}

        {/* Speaker Button in Bottom Right */}
        <Button
          variant="ghost"
          className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
          onClick={handleSpeak}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Speak equation"
        >
          <Volume2 className="h-12 w-12" />
        </Button>
      </CardContent>
    </Card>
  );
}
