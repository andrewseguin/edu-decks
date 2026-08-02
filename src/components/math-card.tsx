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

  const handleSpeakFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(problem.problemSpeechText);
  };

  const handleSpeakBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(problem.fullSpeechText);
  };

  const animClass =
    slideDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div
      key={problem.id}
      className={cn(
        "w-[90vw] h-[45vw] max-w-[700px] max-h-[min(350px,55svh)] perspective-1000 cursor-pointer select-none",
        animClass
      )}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          "relative w-full h-full duration-500 transform-style-3d transition-transform ease-out",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* FRONT FACE OF CARD (Displays Equation) */}
        <Card
          className="absolute inset-0 w-full h-full border-none rounded-3xl overflow-hidden backface-hidden flex flex-col items-center justify-center"
          style={{
            backgroundColor: opInfo.hex,
            boxShadow:
              "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <CardContent className="p-0 h-full w-full flex items-center justify-center relative">
            <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-7xl sm:text-9xl md:text-[11rem]">
              {problem.displayText}
            </span>

            {/* Speaker Button on Front */}
            <Button
              variant="ghost"
              className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full flex items-center justify-center"
              onClick={handleSpeakFront}
              onPointerUp={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Speak equation prompt"
            >
              <Volume2 className="h-7 w-7 text-white/70 hover:text-white transition-colors" />
            </Button>
          </CardContent>
        </Card>

        {/* BACK FACE OF CARD (Displays Answer & Visual Blocks) */}
        <Card
          className="absolute inset-0 w-full h-full border-none rounded-3xl overflow-hidden backface-hidden rotate-y-180 flex flex-col items-center justify-center"
          style={{
            backgroundColor: opInfo.hex,
            boxShadow:
              "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <CardContent className="p-0 h-full w-full flex flex-col items-center justify-center relative gap-3">
            <span className="font-headline font-normal leading-none select-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-8xl sm:text-[10rem] md:text-[12rem]">
              {problem.answerText}
            </span>
            <VisualMath problem={problem} />

            {/* Speaker Button on Back */}
            <Button
              variant="ghost"
              className="absolute bottom-4 right-4 h-12 w-12 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full flex items-center justify-center"
              onClick={handleSpeakBack}
              onPointerUp={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Speak full equation and answer"
            >
              <Volume2 className="h-7 w-7 text-white/70 hover:text-white transition-colors" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
