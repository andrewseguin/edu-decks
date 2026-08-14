"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FlashCardShell, CardRevealLayout } from "@decks/core";
import { renderShapeSvg } from "@/lib/svg-shapes";
import { EquationDisplay } from "./equation-display";
import { ProofRow } from "./proof-row";
import { StepNav } from "./step-nav";
import type {
  GeometryCard as GeometryCardType,
  AnimationStep,
  SvgMutation,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type GeometryCardProps = {
  card: GeometryCardType;
  isFlipped: boolean;
  slideDirection: "next" | "prev";
  onSpeak: (text: string) => void;
  onCardTap?: () => void;
  onTap?: () => void;
  /**
   * TEST-ONLY: when provided, bypasses the animation-timer sequencing and
   * immediately pins the card to this step index. The real app never passes
   * this prop; Playwright uses it to render deterministic step states.
   */
  forcedStepIndex?: number;
};

// Full "Find the …" labels for every unknown dimension
const FIND_LABELS: Record<string, string> = {
  A:    "Find the area (A)",
  P:    "Find the perimeter (P)",
  C:    "Find the circumference (C)",
  V:    "Find the volume (V)",
  SA:   "Find the surface area (SA)",
  r:    "Find the radius (r)",
  c:    "Find the hypotenuse (c)",
  a:    "Find side a",
  b:    "Find side b",
  l:    "Find the length (l)",
  w:    "Find the width (w)",
  h:    "Find the height (h)",
  Sum:  "Find the interior angle sum",
  Each: "Find each interior angle",
  B:    "Find angle B",
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout — uses CardRevealLayout (absolute-position top-transition):
//
//  Unrevealed                         Revealed
//  ┌─────────────────────────┐        ┌─────────────────────────┐
//  │                         │        │  [ primary ]  ← ~20-22% │
//  │      [ primary ]        │        │─────────────────────────│
//  │       (centered)        │        │  [ detail ]   ← ~42-44% │
//  │                         │        │  proof rows             │
//  └─────────────────────────┘        │  StepNav (pinned bottom)│
//                                     └─────────────────────────┘
//
// No height transitions, no flexbox reflows — only top-position transitions.
// ─────────────────────────────────────────────────────────────────────────────

export function GeometryCard({
  card,
  isFlipped,
  slideDirection,
  onSpeak,
  onCardTap,
  onTap,
  forcedStepIndex,
}: GeometryCardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [replayKey, setReplayKey] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    clearTimers();
    setCurrentStepIndex(-1);

    // TEST-ONLY: forcedStepIndex bypasses animation timers entirely.
    if (forcedStepIndex !== undefined) {
      setCurrentStepIndex(forcedStepIndex);
      return;
    }

    if (!isFlipped) return;

    const steps = card.backSteps ?? [];
    if (steps.length === 0) { setCurrentStepIndex(0); return; }

    steps.forEach((step: AnimationStep, i: number) => {
      const id = setTimeout(() => setCurrentStepIndex(i), step.delayMs + 200);
      timeoutsRef.current.push(id);
    });
    return clearTimers;
  }, [isFlipped, card.id, replayKey, forcedStepIndex, clearTimers]);

  const handleStepJump = useCallback((i: number) => {
    clearTimers();
    setCurrentStepIndex(i);
  }, [clearTimers]);

  const handleReplay = useCallback(() => {
    clearTimers();
    setCurrentStepIndex(-1);
    setReplayKey((k) => k + 1);
  }, [clearTimers]);

  const activeMutation: SvgMutation | undefined =
    isFlipped && card.backSteps && currentStepIndex >= 0
      ? card.backSteps[currentStepIndex]?.svgMutation
      : undefined;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(isFlipped ? card.backSpeechText : card.frontSpeechText);
  };

  const wrap = (tall: boolean, children: React.ReactNode) => (
    <FlashCardShell
      key={card.id}
      isFlipped={isFlipped}
      slideDirection={slideDirection}
      backgroundColor={card.color}
      className={cn(
        "w-[90vw] max-w-[700px] border-none transition-all duration-500 ease-in-out",
        // Standard compact resting height matching arithmetic deck
        "h-[55vw] max-h-[min(420px,68svh)] min-h-[220px]",
        "[@media(orientation:landscape)_and_(max-height:500px)]:h-[72vh]",
        "[@media(orientation:landscape)_and_(max-height:500px)]:max-h-[72vh]",
        // On mobile portrait, expand when there's a diagram to show
        tall && "max-sm:portrait:h-[88vw] max-sm:portrait:min-h-[340px] max-sm:portrait:max-h-[min(450px,76svh)]",
      )}
      onCardTap={onCardTap || onTap}
      onSpeak={handleSpeak}
      speakerAriaLabel="Listen to card"
      speakerSize="md"
    >
      {children}
    </FlashCardShell>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TERM CARDS
  // ─────────────────────────────────────────────────────────────────────────────
  if (card.cardType === "term") {
    const hasSvg = card.backSvgExamples && card.backSvgExamples.length > 0;
    const multiSvg = hasSvg && card.backSvgExamples!.length > 1;
    return (
      <FlashCardShell
        key={card.id}
        isFlipped={isFlipped}
        slideDirection={slideDirection}
        backgroundColor={card.color}
        className="w-[90vw] max-w-[700px] border-none"
        onCardTap={onCardTap || onTap}
        onSpeak={handleSpeak}
        speakerAriaLabel="Listen to card"
        speakerSize="md"
        frontContent={
          <div className="flex flex-col items-center justify-center px-6 gap-1">
            <span
              className={cn(
                "font-headline font-bold text-white text-center leading-tight",
                "transition-all duration-500 ease-in-out",
                isFlipped ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
              )}
            >
              {card.frontLabel}
            </span>
            <span
              className={cn(
                "italic text-white/60 text-center text-xl sm:text-2xl block overflow-hidden",
                "transition-all duration-500 ease-in-out",
                isFlipped ? "max-h-0 opacity-0" : "max-h-[60px] opacity-100"
              )}
            >
              {card.frontPrompt}
            </span>
          </div>
        }
        revealContent={
          <div className="min-h-0 overflow-y-auto flex flex-col gap-3 items-center px-5 py-2">
            {card.backDefinition && (
              <p className="text-white text-center font-semibold leading-snug text-base sm:text-lg shrink-0">
                {card.backDefinition}
              </p>
            )}

            {hasSvg && (
              <div
                className={cn(
                  "flex gap-3 justify-center w-full shrink-0",
                  multiSvg ? "flex-row items-center" : "flex-col items-center"
                )}
              >
                {card.backSvgExamples!.map((ex, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-[11/9]",
                      multiSvg ? "w-full max-w-[160px]" : "w-full max-w-[240px] sm:max-w-[280px]"
                    )}
                  >
                    {renderShapeSvg(ex, activeMutation)}
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CALCULATION + FORMULA CARDS
  // ─────────────────────────────────────────────────────────────────────────────
  const steps = card.backSteps ?? [];
  const findLabel = card.frontSvg?.unknownDimension
    ? (FIND_LABELS[card.frontSvg.unknownDimension] ?? `Find ${card.frontSvg.unknownDimension}`)
    : null;

  return (
    <FlashCardShell
      key={card.id}
      isFlipped={isFlipped}
      slideDirection={slideDirection}
      backgroundColor={card.color}
      className="w-[90vw] max-w-[700px] border-none"
      onCardTap={onCardTap || onTap}
      onSpeak={handleSpeak}
      speakerAriaLabel="Listen to card"
      speakerSize="md"
      frontContent={
        <div className="flex flex-col items-center justify-center gap-1.5 px-4">
          {card.frontSvg && (
            <div
              className={cn(
                "aspect-[11/9] transition-all duration-500 ease-in-out",
                isFlipped ? "w-[42%] max-w-[180px]" : "w-[56%] max-w-[240px]"
              )}
            >
              {renderShapeSvg(card.frontSvg, activeMutation)}
            </div>
          )}
          {!isFlipped && findLabel && (
            <p className="text-white/80 text-sm sm:text-base font-semibold text-center">
              {findLabel}
            </p>
          )}
        </div>
      }
      revealContent={
        <div className="flex-1 min-h-0 flex flex-col px-4">
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-1">
            {currentStepIndex >= 0 && (
              <div className="flex flex-col w-full">
                {steps.slice(0, currentStepIndex + 1).map((step, i) => {
                  const isAnswer = i === steps.length - 1 && i === currentStepIndex;
                  return (
                    <ProofRow
                      key={i}
                      tokens={step.equationTokens ?? null}
                      formulaLine={step.formulaLine ?? null}
                      reason={step.reason ?? ""}
                      isAnswer={isAnswer}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {isFlipped && steps.length > 1 && (
            <div className="shrink-0 pb-3 pt-1 flex justify-center">
              <StepNav
                count={steps.length}
                activeIndex={currentStepIndex}
                onStepClick={handleStepJump}
                onReplay={handleReplay}
              />
            </div>
          )}
        </div>
      }
    />
  );
}
