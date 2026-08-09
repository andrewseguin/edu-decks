"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredRevealHeight, setMeasuredRevealHeight] = useState<number | null>(null);

  // Invisible measurement of the full revealed content to calculate exact card height required
  useEffect(() => {
    const measure = () => {
      if (measureRef.current) {
        const measured = measureRef.current.offsetHeight;
        if (measured > 0) {
          // Add breathing room for header controls & speaker button
          const extraPadding = problem.hasConversion ? 48 : 36;
          setMeasuredRevealHeight(measured + extraPadding);
        }
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (measureRef.current) {
      ro.observe(measureRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [problem]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlipped) {
      onSpeak(problem.answerSpeechText);
    } else {
      onSpeak(problem.problemSpeechText);
    }
  };

  return (
    <>
      {/* Hidden measurement container rendered offscreen with the exact same width constraints */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="invisible pointer-events-none fixed -top-[10000px] -left-[10000px] w-[90vw] max-w-[700px] p-3 sm:p-5 md:p-6 flex flex-col items-center justify-center gap-3 z-[-1]"
        style={{ visibility: "hidden" }}
      >
        {/* Equation line preview */}
        <div
          className={cn(
            "flex items-center justify-center whitespace-nowrap text-center origin-center",
            problem.isFraction
              ? "scale-[0.88] sm:scale-[0.85] [@media(max-height:640px)]:scale-[0.80]"
              : "scale-[0.92] sm:scale-[0.90] [@media(max-height:640px)]:scale-[0.82]"
          )}
        >
          {problem.isFraction && problem.frac1 ? (
            <FractionDisplay fraction={problem.frac1} size="lg" />
          ) : (
            <span className="font-headline font-bold text-5xl sm:text-7xl md:text-8xl">{problem.num1}</span>
          )}
          <MathSymbol symbol={problem.operation} isFraction={problem.isFraction} className="mx-2 sm:mx-3.5 text-5xl sm:text-7xl md:text-8xl" />
          {problem.isFraction && problem.frac2 ? (
            <FractionDisplay fraction={problem.frac2} size="lg" />
          ) : (
            <span className="font-headline font-bold text-5xl sm:text-7xl md:text-8xl">{problem.num2}</span>
          )}
          <MathSymbol symbol="=" isFraction={problem.isFraction} className="ml-2 sm:ml-3.5 mr-2 sm:mr-3.5 text-5xl sm:text-7xl md:text-8xl" />
          {problem.isFraction && problem.fracAnswer ? (
            <FractionDisplay fraction={problem.fracAnswer} size="lg" />
          ) : (
            <span className="font-headline font-bold text-5xl sm:text-7xl md:text-8xl">{problem.answerText}</span>
          )}
        </div>

        {problem.hasConversion && problem.convertedFrac1 && problem.convertedFrac2 && (
          <div className="px-3.5 py-1 rounded-full bg-black/25 flex items-center justify-center gap-1.5 text-sm font-bold">
            <FractionDisplay fraction={problem.convertedFrac1} size="pill" />
            <MathSymbol symbol={problem.operation} isFraction={true} className="text-lg font-normal" />
            <FractionDisplay fraction={problem.convertedFrac2} size="pill" />
            <MathSymbol symbol="=" isFraction={true} className="text-lg font-normal" />
            <FractionDisplay
              fraction={{
                n: problem.convertedFrac1.n + (problem.operation === '+' ? problem.convertedFrac2.n : -problem.convertedFrac2.n),
                d: problem.convertedFrac1.d,
              }}
              size="pill"
            />
          </div>
        )}

        {/* Visual math diagram preview */}
        <div className="w-full flex items-center justify-center pt-2">
          <VisualMath problem={problem} isFlipped={true} />
        </div>
      </div>

      <FlashCardShell
        key={problem.id}
        isFlipped={isFlipped}
        slideDirection={slideDirection}
        backgroundColor={opInfo.hex}
        className={cn(
          "w-[90vw] max-w-[700px] border-none transition-all duration-500 ease-in-out",
          !isDiagramVisible && "h-[55vw] max-h-[min(420px,68svh)] min-h-[220px] [@media(orientation:landscape)_and_(max-height:500px)]:h-[72vh] [@media(orientation:landscape)_and_(max-height:500px)]:max-h-[72vh]"
        )}
        contentClassName="p-3 sm:p-5 md:p-6 h-full w-full"
        style={
          isDiagramVisible && measuredRevealHeight
            ? {
                height: `${measuredRevealHeight}px`,
                maxHeight: "min(580px, 86svh)",
                minHeight: "min(320px, 65svh)",
              }
            : undefined
        }
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
        <div className="w-full h-full flex flex-col items-center justify-between overflow-hidden">
          {/* Top / Center Section: Main Equation and Subtitle Conversion */}
          <div
            className={cn(
              "w-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out",
              isDiagramVisible ? "pt-1 sm:pt-2 shrink-0" : "my-auto"
            )}
          >
            {/* Main Equation Line */}
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
            </div>

            {/* Subtitle Conversion Pill Badge */}
            {problem.hasConversion && problem.convertedFrac1 && problem.convertedFrac2 && (
              <div
                className={cn(
                  "mt-2 sm:mt-2.5 px-3 sm:px-4 py-1 rounded-full bg-black/25 border border-white/20 backdrop-blur-xs flex items-center justify-center gap-1.5 sm:gap-2 text-white/90 font-headline font-bold shadow-sm transition-all pointer-events-none shrink-0",
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

          {/* Diagram and Step Controls */}
          {isDiagramVisible && (
            <div
              className={cn(
                "w-full flex-1 min-h-0 flex items-center justify-center pt-2 sm:pt-3 pb-1 transition-all duration-500 ease-out animate-fade-in pointer-events-auto"
              )}
            >
              <VisualMath problem={problem} isFlipped={isDiagramVisible} />
            </div>
          )}
        </div>
      </FlashCardShell>
    </>
  );
}
