"use client";

import { useState } from "react";
import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { Volume2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
}: MathCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const opInfo = OPERATION_COLORS[problem.operation];

  const handleCardClick = (e: React.MouseEvent) => {
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
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* 3D Flip Card Wrapper */}
      <div
        className="w-[90vw] h-[45vw] max-w-[700px] max-h-[min(350px,55svh)] perspective-1000 cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 transform-style-3d transition-transform ease-out",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* FRONT OF CARD */}
          <Card
            className="absolute inset-0 w-full h-full border-none rounded-3xl select-none [-webkit-touch-callout:none] animate-fade-in-zoom overflow-hidden backface-hidden"
            style={{
              backgroundColor: opInfo.hex,
              boxShadow:
                "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <CardContent className="p-6 h-full flex flex-col justify-between items-center relative">
              {/* Operation Badge Tag */}
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-headline font-bold text-white/80 bg-white/10 uppercase tracking-wider">
                  {opInfo.name} ({problem.operation})
                </span>
              </div>

              {/* Front Equation Display */}
              <div className="my-auto flex items-center justify-center">
                <span className="font-headline font-bold leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-6xl sm:text-8xl md:text-[8.5rem]">
                  {problem.displayText}
                </span>
              </div>

              {/* Bottom Flip Indicator */}
              <div className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-widest">
                <RotateCw className="h-3.5 w-3.5" />
                <span>Tap to reveal answer</span>
              </div>

              {/* Speaker Audio Button in Bottom Right (matching First Read) */}
              <Button
                variant="ghost"
                className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
                onClick={handleSpeak}
                onPointerUp={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Speak equation"
              >
                <Volume2 className="h-8 w-8" />
              </Button>
            </CardContent>
          </Card>

          {/* BACK OF CARD */}
          <Card
            className="absolute inset-0 w-full h-full border-none rounded-3xl select-none [-webkit-touch-callout:none] animate-fade-in-zoom overflow-hidden backface-hidden rotate-y-180"
            style={{
              backgroundColor: opInfo.hex,
              boxShadow:
                "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <CardContent className="p-6 h-full flex flex-col justify-between items-center relative">
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-headline font-bold text-white/80 bg-white/10 uppercase tracking-wider">
                  Answer
                </span>
              </div>

              {/* Back Answer Display */}
              <div className="my-auto flex flex-col items-center justify-center gap-2">
                <span className="font-headline font-bold leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-7xl sm:text-9xl md:text-[9.5rem]">
                  {problem.answerText}
                </span>

                {/* Visual Block Representation */}
                <VisualMath problem={problem} />
              </div>

              {/* Bottom Flip Indicator */}
              <div className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-widest">
                <RotateCw className="h-3.5 w-3.5" />
                <span>Tap to flip back</span>
              </div>

              {/* Speaker Audio Button */}
              <Button
                variant="ghost"
                className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
                onClick={handleSpeak}
                onPointerUp={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Speak equation"
              >
                <Volume2 className="h-8 w-8" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
