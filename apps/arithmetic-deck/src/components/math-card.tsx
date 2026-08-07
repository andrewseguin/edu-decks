"use client";

import { MathProblem, OPERATION_COLORS } from "@/lib/types";
import { VisualMath } from "./visual-math";
import { FractionDisplay } from "./fraction-display";
import { MathSymbol } from "./math-symbol";
import { FlashCardShell, FrostedBadge, CardCornerButton } from "@decks/core";
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
      className="w-[92vw] max-w-[660px] h-[72vh] max-h-[580px] min-h-[340px] sm:h-auto sm:aspect-[16/10] sm:max-h-[80vh] [@media(orientation:landscape)_and_(max-height:640px)]:min-h-[250px] [@media(orientation:landscape)_and_(max-height:640px)]:h-[78vh] [@media(orientation:landscape)_and_(max-height:640px)]:max-h-[78vh] [@media(orientation:landscape)_and_(max-height:640px)]:mt-4 [@media(orientation:landscape)_and_(max-height:640px)]:aspect-auto"
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
      frontContent={
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-transform duration-700 ease-in-out z-20 pointer-events-none p-2 sm:p-4",
            isDiagramVisible
              ? problem.hasConversion
                ? "-translate-y-[22%] sm:-translate-y-[27%] [@media(max-height:640px)]:-translate-y-[24%]"
                : "-translate-y-[24%] sm:-translate-y-[23%] [@media(max-height:640px)]:-translate-y-[20%]"
              : "translate-y-0"
          )}
        >
          {/* Main Equation Line */}
          <div
            className={cn(
              "relative flex items-center justify-center whitespace-nowrap text-center transition-all duration-700 ease-in-out origin-center",
              isDiagramVisible
                ? problem.isFraction
                  ? "scale-[0.92] sm:scale-[0.78] [@media(max-height:640px)]:scale-[0.64]"
                  : "scale-100 sm:scale-[0.85] [@media(max-height:640px)]:scale-[0.70]"
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
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl",
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
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] mx-2 sm:mx-3.5 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl"
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
                  "font-headline font-bold leading-none select-none transition-colors duration-500 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl",
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
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] ml-2 sm:ml-3.5 mr-2 sm:mr-3.5 text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl"
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
                    "font-headline font-bold leading-none select-none text-white transition-all text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl",
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

            {/* Subtitle Conversion Pill Badge - Absolute Overlay Never Affecting Layout */}
            {problem.hasConversion && problem.convertedFrac1 && problem.convertedFrac2 && (
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-2 sm:mt-2.5 [@media(max-height:640px)]:mt-1.5 px-3 sm:px-4 py-1 sm:py-1 rounded-full bg-black/25 border border-white/20 backdrop-blur-xs flex items-center justify-center gap-1.5 sm:gap-2 text-white/90 font-headline font-bold shadow-sm transition-all pointer-events-none shrink-0",
                  isDiagramVisible
                    ? "opacity-100 translate-y-0 scale-100 delay-200 duration-500 ease-out"
                    : "opacity-0 -translate-y-2 scale-75 delay-0 duration-300 ease-in"
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
        </div>
      }
      backContent={
        <div
          className={cn(
            "absolute inset-x-0 bottom-2 sm:bottom-3 flex items-center justify-center pointer-events-none z-10 transition-all p-1 sm:p-2",
            problem.hasConversion
              ? "top-[48%] sm:top-[45%] [@media(max-height:640px)]:top-[46%]"
              : "top-[44%] sm:top-[42%] [@media(max-height:640px)]:top-[44%]",
            isDiagramVisible
              ? "opacity-100 translate-y-0 scale-100 delay-300 duration-500 ease-out pointer-events-auto"
              : "opacity-0 translate-y-8 scale-95 delay-0 duration-300 ease-in pointer-events-none"
          )}
        >
          <VisualMath problem={problem} isFlipped={isDiagramVisible} />
        </div>
      }
    />
  );
}
