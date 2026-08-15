"use client";

import React, { useState, useEffect } from "react";
import { FlashCardShell } from "@decks/core";
import { renderShapeSvg } from "@/lib/svg-shapes";
import { ProofRow } from "./proof-row";
import { InteractiveAngleExplorer } from "./interactive-angle-explorer";
import { InteractiveAnglePair } from "./interactive-angle-pair";
import { InteractiveVerticalAngles } from "./interactive-vertical-angles";
import { InteractiveParallelAngles } from "./interactive-parallel-angles";
import { InteractiveIsoscelesExplorer } from "./interactive-isosceles-explorer";
import { InteractiveScaleneExplorer } from "./interactive-scalene-explorer";
import { InteractiveRightTriangleExplorer } from "./interactive-right-triangle-explorer";
import { InteractiveEquilateralExplorer } from "./interactive-equilateral-explorer";
import { InteractiveAngleSumExplorer } from "./interactive-angle-sum-explorer";
import { InteractivePythagorasExplorer } from "./interactive-pythagoras-explorer";
import { InteractiveTriangleAreaExplorer } from "./interactive-triangle-area-explorer";
import { InteractiveTrianglePerimeterExplorer } from "./interactive-triangle-perimeter-explorer";
import { FormattedMathText } from "./ui/formatted-math-text";
import type {
  GeometryCard as GeometryCardType,
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
  className?: string;
  showDebugOutlines?: boolean;
};

// ── Interactive angle range configs for term cards ──────────────────────────
// Maps the card's frontLabel to the angle explorer props.
const ANGLE_RANGE_TERMS: Record<string, { minAngle: number; maxAngle: number; label: string }> = {
  "Acute angles": { minAngle: 0, maxAngle: 90, label: "acute" },
  "Obtuse angles": { minAngle: 90, maxAngle: 180, label: "obtuse" },
  "Reflex angles": { minAngle: 180, maxAngle: 360, label: "reflex" },
};

// Maps relational angle term cards to their interactive component config.
const RELATIONAL_ANGLE_TERMS: Record<string,
  | { type: "pair"; targetSum: 90 | 180 }
  | { type: "vertical" }
  | { type: "parallel"; mode: "alternate" | "co-interior" }
> = {
  "Complementary angles": { type: "pair", targetSum: 90 },
  "Supplementary angles": { type: "pair", targetSum: 180 },
  "Vertically opposite angles": { type: "vertical" },
  "Alternate angles": { type: "parallel", mode: "alternate" },
  "Co-interior angles": { type: "parallel", mode: "co-interior" },
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
//  └─────────────────────────┘        └─────────────────────────┘
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
  className,
  showDebugOutlines,
}: GeometryCardProps) {

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(isFlipped ? card.backSpeechText : card.frontSpeechText);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TERM CARDS
  // ─────────────────────────────────────────────────────────────────────────────
  if (card.cardType === "term") {
    const hasSvg = card.backSvgExamples && card.backSvgExamples.length > 0;
    const multiSvg = hasSvg && card.backSvgExamples!.length > 1;
    const angleRange = card.frontLabel ? ANGLE_RANGE_TERMS[card.frontLabel] : undefined;
    const relational = card.frontLabel ? RELATIONAL_ANGLE_TERMS[card.frontLabel] : undefined;

    // Render the interactive visual for the reveal content
    const renderInteractive = () => {
      if (angleRange) {
        return <InteractiveAngleExplorer minAngle={angleRange.minAngle} maxAngle={angleRange.maxAngle} label={angleRange.label} color={card.color} />;
      }
      if (relational) {
        if (relational.type === "pair") {
          return <InteractiveAnglePair targetSum={relational.targetSum} label={card.frontLabel!} color={card.color} />;
        }
        if (relational.type === "vertical") {
          return <InteractiveVerticalAngles color={card.color} />;
        }
        if (relational.type === "parallel") {
          return <InteractiveParallelAngles mode={relational.mode} color={card.color} />;
        }
      }
      if (card.frontLabel === "Equilateral triangles") {
        return <InteractiveEquilateralExplorer color={card.color} />;
      }
      if (card.frontLabel === "Isosceles triangles") {
        return <InteractiveIsoscelesExplorer color={card.color} />;
      }
      if (card.frontLabel === "Scalene triangles") {
        return <InteractiveScaleneExplorer color={card.color} />;
      }
      if (card.frontLabel === "The triangle angle sum") {
        return <InteractiveAngleSumExplorer color={card.color} />;
      }
      if (card.frontLabel === "Right triangles") {
        return <InteractiveRightTriangleExplorer color={card.color} />;
      }
      if (card.frontLabel === "The Pythagorean theorem") {
        return <InteractivePythagorasExplorer color={card.color} />;
      }
      if (card.frontLabel === "Area of a triangle") {
        return <InteractiveTriangleAreaExplorer color={card.color} />;
      }
      if (card.frontLabel === "Perimeter of a triangle") {
        return <InteractiveTrianglePerimeterExplorer color={card.color} />;
      }
      if (hasSvg) {
        return (
          <div className={cn("flex gap-3 justify-center w-full shrink-0", multiSvg ? "flex-row items-center" : "flex-col items-center")}>
            {card.backSvgExamples!.map((ex, i) => (
              <div key={i} className={cn("aspect-[11/9]", multiSvg ? "w-full max-w-[160px]" : "w-full max-w-[240px] sm:max-w-[280px]")}>
                {renderShapeSvg(ex, undefined)}
              </div>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <FlashCardShell
        key={card.id}
        isFlipped={isFlipped}
        slideDirection={slideDirection}
        backgroundColor={card.color}
        className={cn("w-[90vw] max-w-[700px] border-none", className)}
        showDebugOutlines={showDebugOutlines}
        onCardTap={onCardTap || onTap}
        frontContent={
          <div className="flex flex-col items-center justify-center px-6 py-4 gap-1">
            <span
              className={cn(
                "font-headline font-bold text-white text-center leading-tight text-3xl sm:text-4xl",
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
          <div className="min-h-0 overflow-y-auto flex flex-col gap-2 items-center w-full pt-1 pb-6">
            {card.backDefinition && (
              <div className="w-[calc(100%+1.5rem)] -mx-3 sm:w-[calc(100%+2.5rem)] sm:-mx-5 md:w-[calc(100%+3rem)] md:-mx-6 px-4 py-2.5 my-1 bg-black/35 border-y border-white/20 flex flex-col items-center justify-center gap-1">
                <p className="text-white text-center font-bold leading-tight text-xl sm:text-2xl md:text-3xl shrink-0 tracking-wide">
                  <FormattedMathText text={card.backDefinition} />
                </p>
                {card.backDefinitionSubtitle && (
                  <p className="text-white/80 text-center font-medium text-xs sm:text-sm tracking-wide leading-tight pt-0.5">
                    <FormattedMathText text={card.backDefinitionSubtitle} />
                  </p>
                )}
              </div>
            )}
            {renderInteractive()}
          </div>
        }
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CALCULATION CARDS
  // ─────────────────────────────────────────────────────────────────────────────
  const steps = card.backSteps ?? [];

  // Delay the answer reveal on the diagram for a nice transition
  const [showDiagramAnswer, setShowDiagramAnswer] = useState(false);
  useEffect(() => {
    if (isFlipped && card.numericAnswer != null) {
      const timer = setTimeout(() => setShowDiagramAnswer(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowDiagramAnswer(false);
    }
  }, [isFlipped, card.numericAnswer]);

  const activeMutation: SvgMutation | undefined = showDiagramAnswer
    ? { revealAnswer: card.numericAnswer }
    : undefined;

  return (
    <FlashCardShell
      key={card.id}
      isFlipped={isFlipped}
      slideDirection={slideDirection}
      backgroundColor={card.color}
      className={cn("w-[90vw] max-w-[700px] border-none", className)}
      showDebugOutlines={showDebugOutlines}
      onCardTap={onCardTap || onTap}
      frontContent={
        <div className="flex flex-col items-center justify-center px-4 gap-4 sm:gap-6 py-2">
          {card.frontPrompt && (
            <p
              className={cn(
                "font-bold text-white text-center leading-tight text-xl sm:text-2xl md:text-3xl tracking-wide transition-all duration-300 pb-1 sm:pb-2",
                isFlipped ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[80px] opacity-100"
              )}
            >
              {card.frontPrompt}
            </p>
          )}
          {card.frontSvg && (
            <div className="w-full max-w-[480px]">
              {renderShapeSvg(card.frontSvg, activeMutation)}
            </div>
          )}
        </div>
      }
      revealContent={
        <div className="proof-table-container w-[calc(100%+1.5rem)] -mx-3 sm:w-[calc(100%+2.5rem)] sm:-mx-5 md:w-[calc(100%+3rem)] md:-mx-6 flex-1 min-h-0 flex flex-col items-center justify-center">
          {isFlipped && (
            <div className="proof-table-banner w-full bg-black/35 border-y border-white/20 px-4 sm:px-6 py-2 divide-y divide-white/10">
              {steps.map((step, i) => (
                <ProofRow
                  key={i}
                  tokens={step.equationTokens ?? null}
                  formulaLine={step.formulaLine ?? null}
                  reason={step.reason ?? ""}
                  isAnswer={i === steps.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
