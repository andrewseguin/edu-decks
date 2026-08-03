"use client";

import { useState, useEffect } from "react";
import { MathProblem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { FractionDisplay } from "@/components/fraction-display";
import { VisualMath } from "@/components/visual-math";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MathCardProps = {
  problem: MathProblem;
  showAnswer?: boolean;
  isFlipped?: boolean;
  slideDirection?: "next" | "prev";
  onCardClick?: () => void;
  onCardTap?: () => void;
  onSpeak?: (text: string) => void;
  className?: string;
  autoPlayAudio?: boolean;
};

export function MathCard({
  problem,
  showAnswer = false,
  isFlipped,
  slideDirection,
  onCardClick,
  onCardTap,
  onSpeak,
  className,
  autoPlayAudio = true,
}: MathCardProps) {
  const [isRevealed, setIsRevealed] = useState(isFlipped ?? showAnswer);

  useEffect(() => {
    setIsRevealed(isFlipped ?? showAnswer);
  }, [showAnswer, isFlipped]);

  const handleClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      if (onSpeak) {
        onSpeak(problem.spokenText);
      } else if (autoPlayAudio) {
        speakText(problem.spokenText);
      }
    } else {
      if (onCardTap) {
        onCardTap();
      } else if (onCardClick) {
        onCardClick();
      }
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "relative w-full max-w-sm sm:max-w-md h-[460px] sm:h-[490px] cursor-pointer select-none",
        "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
        "border-2 border-white/20 shadow-2xl backdrop-blur-md",
        "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "flex flex-col justify-between items-center overflow-hidden",
        className
      )}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-400/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <CardContent className="relative z-10 w-full h-full p-4 sm:p-6 flex flex-col justify-between items-center text-white">
        
        {/* Top Header / Equation Area */}
        <div className="w-full flex flex-col items-center justify-center pt-2 sm:pt-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {problem.isFraction && problem.frac1 && problem.frac2 && problem.fracAnswer ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <FractionDisplay fraction={problem.frac1} colorClass="text-cyan-300" />
                <span className="text-3xl sm:text-5xl md:text-6xl font-bold font-headline drop-shadow-sm text-white/90">
                  {problem.operation}
                </span>
                <FractionDisplay fraction={problem.frac2} colorClass="text-amber-300" />
                <span className="text-3xl sm:text-5xl md:text-6xl font-bold font-headline drop-shadow-sm text-white/90">
                  =
                </span>
                {isRevealed ? (
                  <FractionDisplay fraction={problem.fracAnswer} colorClass="text-white" />
                ) : (
                  <span className="text-4xl sm:text-6xl md:text-7xl font-bold font-headline text-yellow-300 animate-pulse">
                    ?
                  </span>
                )}
              </div>
            ) : (
              <>
                <span className="text-5xl sm:text-7xl md:text-8xl font-headline font-black text-cyan-300 drop-shadow-md">
                  {problem.num1}
                </span>
                <span className="text-4xl sm:text-6xl md:text-7xl font-headline font-bold text-white/90 drop-shadow-sm">
                  {problem.operation}
                </span>
                <span className="text-5xl sm:text-7xl md:text-8xl font-headline font-black text-amber-300 drop-shadow-md">
                  {problem.num2}
                </span>
                <span className="text-4xl sm:text-6xl md:text-7xl font-headline font-bold text-white/90 drop-shadow-sm">
                  =
                </span>
                {isRevealed ? (
                  <span className="text-5xl sm:text-7xl md:text-8xl font-headline font-black text-white drop-shadow-lg animate-fade-in">
                    {problem.answer}
                  </span>
                ) : (
                  <span className="text-5xl sm:text-7xl md:text-8xl font-headline font-black text-yellow-300 animate-pulse">
                    ?
                  </span>
                )}
              </>
            )}
          </div>

          {/* Subtitle conversion / unsimplified intermediate step badge when revealed */}
          {isRevealed && problem.isFraction && problem.hasConversion && (
            <div className="mt-3 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md shadow-xs animate-fade-in flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider">
                Step:
              </span>
              
              {/* For Addition/Subtraction: Common denominator step (e.g. 2/4 + 1/4 = 3/4) */}
              {(problem.operation === '+' || problem.operation === '-') && problem.convertedFrac1 && problem.convertedFrac2 && (
                <div className="flex items-center gap-1.5">
                  <FractionDisplay fraction={problem.convertedFrac1} colorClass="text-cyan-300" size="sm" />
                  <span className="text-sm font-bold text-white/90">{problem.operation}</span>
                  <FractionDisplay fraction={problem.convertedFrac2} colorClass="text-amber-300" size="sm" />
                  <span className="text-sm font-bold text-white/90">=</span>
                  <FractionDisplay fraction={problem.fracAnswer!} colorClass="text-white" size="sm" />
                </div>
              )}

              {/* For Multiplication/Division: Unsimplified raw product step (e.g. 2/4 x 1/2 = 2/8 = 1/4) */}
              {(problem.operation === '×' || problem.operation === '÷') && problem.rawFracAnswer && (
                <div className="flex items-center gap-1.5">
                  <FractionDisplay fraction={problem.frac1!} colorClass="text-cyan-300" size="sm" />
                  <span className="text-sm font-bold text-white/90">{problem.operation}</span>
                  <FractionDisplay fraction={problem.frac2!} colorClass="text-amber-300" size="sm" />
                  <span className="text-sm font-bold text-white/90">=</span>
                  <FractionDisplay fraction={problem.rawFracAnswer} colorClass="text-amber-300" size="sm" />
                  <span className="text-sm font-bold text-white/90">=</span>
                  <FractionDisplay fraction={problem.fracAnswer!} colorClass="text-white" size="sm" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Visual Area (Ten-Frame, Array Grid, or Fraction Slices) */}
        <div className="w-full flex flex-col items-center justify-center pb-2">
          <VisualMath problem={problem} />
        </div>

        {/* Tap Prompt Footer */}
        <div className="w-full flex justify-center items-center pb-1">
          {!isRevealed ? (
            <span className="text-xs font-semibold text-white/70 tracking-wide uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" /> Tap to reveal answer
            </span>
          ) : (
            <span className="text-xs font-medium text-white/50 tracking-wide uppercase">
              Tap for next card
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
