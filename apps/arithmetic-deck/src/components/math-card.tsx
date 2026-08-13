"use client";

import React from "react";
import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { FractionDisplay } from "./fraction-display";
import { MathSymbol } from "./math-symbol";
import { FlashCardShell, FrostedBadge, CardCornerButton, CardRevealLayout } from "@decks/core";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type MathCardProps = {
  problem: MathProblem;
  isFlipped: boolean;
  showHint?: boolean;
  onToggleHint?: () => void;
  slideDirection: "next" | "prev";
  onCardTap?: () => void;
  onSpeak: (text: string) => void;
};

export function MathCard({
  problem,
  isFlipped,
  showHint = false,
  onToggleHint,
  slideDirection,
  onCardTap,
  onSpeak,
}: MathCardProps) {
  const opInfo = OPERATION_COLORS[problem.operation];
  const isDiagramVisible = isFlipped || showHint;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlipped) {
      onSpeak(problem.answerSpeechText);
    } else {
      onSpeak(problem.problemSpeechText);
    }
  };

  return (
    <FlashCardShell
      key={problem.id}
      isFlipped={isFlipped}
      slideDirection={slideDirection}
      backgroundColor={opInfo.hex}
      className={cn(
        "border-none",
      )}
      tall={isDiagramVisible}
      onCardTap={onCardTap}
      onSpeak={handleSpeak}
      speakerAriaLabel="Listen to equation"
      topLeft={
        !isFlipped && onToggleHint ? (
          <CardCornerButton
            position="top-left"
            onClick={onToggleHint}
            isActive={showHint}
            ariaLabel={showHint ? "Hide hint diagram" : "Show hint diagram"}
            title={showHint ? "Hide hint diagram" : "Show hint diagram"}
            icon={<Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />}
          />
        ) : undefined
      }
    >
      <CardRevealLayout
        isRevealed={isDiagramVisible}
        primaryRevealedTopClass={
          problem.hasConversion
            ? "top-[24%] sm:top-[23%]"
            : "top-[30%] sm:top-[29%] md:top-[28%]"
        }
        detailTopClass={
          problem.hasConversion
            ? "top-[52%] sm:top-[50%] [@media(max-height:640px)]:top-[50%]"
            : "top-[44%] sm:top-[42%] [@media(max-height:640px)]:top-[44%]"
        }
        primaryClassName="p-2 sm:p-4"
        detailClassName="p-1 sm:p-2 items-center justify-center"
        primary={
          /* Main Equation Line */
          <div
            className={cn(
              "relative flex items-center justify-center whitespace-nowrap text-center transition-all duration-500 ease-in-out origin-center",
              isDiagramVisible
                ? problem.isFraction
                  ? "scale-[0.88] sm:scale-[0.85] [@media(max-height:640px)]:scale-[0.80] [@media(orientation:landscape)_and_(max-height:640px)]:scale-[0.88]"
                  : "scale-[0.92] sm:scale-[0.90] [@media(max-height:640px)]:scale-[0.82] [@media(orientation:landscape)_and_(max-height:640px)]:scale-[0.92]"
                : "scale-100"
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
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl sm:[@media(max-height:640px)]:text-6xl [@media(orientation:landscape)_and_(max-height:640px)]:text-6xl",
                  isFlipped
                    ? "text-cyan-300 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]"
                    : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
                )}
              >
                {problem.num1}
              </span>
            )}

            {/* Operator (+, -, ×, ÷) */}
            <MathSymbol
              symbol={problem.operation}
              isFraction={problem.isFraction}
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] mx-2 sm:mx-3.5 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl sm:[@media(max-height:640px)]:text-6xl [@media(orientation:landscape)_and_(max-height:640px)]:text-6xl"
            />

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
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl sm:[@media(max-height:640px)]:text-6xl [@media(orientation:landscape)_and_(max-height:640px)]:text-6xl",
                  isFlipped
                    ? "text-amber-300 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]"
                    : "text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
                )}
              >
                {problem.num2}
              </span>
            )}

            {/* Equals Symbol */}
            <MathSymbol
              symbol="="
              isFraction={problem.isFraction}
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] ml-2 sm:ml-3.5 mr-2 sm:mr-3.5 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl sm:[@media(max-height:640px)]:text-6xl [@media(orientation:landscape)_and_(max-height:640px)]:text-6xl"
            />

            {/* Answer Digit / Fraction / Frosted Question Mark Badge */}
            <div className="relative inline-flex items-center justify-center px-1">
              {problem.isFraction && problem.fracAnswer ? (
                <div
                  className={cn(
                    "transition-all",
                    isFlipped ? "opacity-100 scale-100 delay-200 duration-500 ease-out" : "opacity-0 scale-75 delay-0 duration-300 ease-in"
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
                    "font-headline font-bold leading-none select-none text-white transition-all text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl sm:[@media(max-height:640px)]:text-6xl [@media(orientation:landscape)_and_(max-height:640px)]:text-6xl",
                    isFlipped
                      ? "[text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] opacity-100 scale-100 delay-200 duration-500 ease-out"
                      : "opacity-0 scale-75 delay-0 duration-300 ease-in"
                  )}
                >
                  {problem.answerText}
                </span>
              )}

              {/* Obscuring Frosted Glass Pill Badge when Unrevealed */}
              <FrostedBadge isFlipped={isFlipped} />
            </div>

            {/* Subtitle Conversion Pill Badge */}
            {problem.hasConversion && problem.convertedFrac1 && problem.convertedFrac2 && (
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-1 sm:mt-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-black/25 border border-white/20 backdrop-blur-xs flex items-center justify-center gap-1.5 text-white/90 font-headline font-bold shadow-sm transition-all pointer-events-none shrink-0",
                  isDiagramVisible
                    ? "opacity-100 translate-y-0 scale-100 delay-200 duration-500 ease-out"
                    : "opacity-0 -translate-y-2 scale-75 delay-0 duration-300 ease-in pointer-events-none"
                )}
              >
                <FractionDisplay fraction={problem.convertedFrac1} colorClass="text-cyan-300" size="pill" />
                <MathSymbol symbol={problem.operation} isFraction={true} className="text-lg sm:text-xl font-normal mx-0.5" />
                <FractionDisplay fraction={problem.convertedFrac2} colorClass="text-amber-300" size="pill" />
                <MathSymbol symbol="=" isFraction={true} className="text-lg sm:text-xl font-normal mx-0.5" />
                <div className="relative inline-flex items-center justify-center min-w-[1.2rem] h-[1.6rem] px-0.5">
                  <div
                    className={cn(
                      "transition-all flex items-center justify-center",
                      isFlipped
                        ? "opacity-100 scale-100 delay-200 duration-500 ease-out"
                        : "opacity-0 scale-75 delay-0 duration-300 ease-in"
                    )}
                  >
                    <FractionDisplay
                      fraction={{
                        n: problem.convertedFrac1.n + (problem.operation === '+' ? problem.convertedFrac2.n : -problem.convertedFrac2.n),
                        d: problem.convertedFrac1.d,
                      }}
                      colorClass="text-white"
                      size="pill"
                    />
                  </div>
                  <FrostedBadge
                    isFlipped={isFlipped}
                    className="inset-0 rounded-md border border-white/40 p-0"
                    textClassName="text-sm font-bold leading-none"
                  >
                    ?
                  </FrostedBadge>
                </div>
              </div>
            )}
          </div>
        }
        detail={
          <div className="flex-1 flex items-center justify-center p-1 sm:p-2">
            <VisualMath problem={problem} isFlipped={isDiagramVisible} />
          </div>
        }
      />
    </FlashCardShell>
  );
}
