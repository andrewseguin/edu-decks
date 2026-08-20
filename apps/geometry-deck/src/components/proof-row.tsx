"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { EquationToken } from "@/lib/types";
import { FormattedMathText } from "./ui/formatted-math-text";
import { ProofReasonTooltip } from "./proof-reason-tooltip";

type ProofRowProps = {
  tokens: EquationToken[] | null;
  formulaLine: string | null;
  reason: string;
  isAnswer: boolean;
};

export function ProofRow({ tokens, formulaLine, reason, isAnswer }: ProofRowProps) {
  const equationNode = (() => {
    if (tokens && tokens.length > 0) {
      return (
        <span
          className={cn(
            "font-mono leading-tight whitespace-nowrap",
            isAnswer
              ? "text-white font-bold text-sm sm:text-base md:text-lg"
              : "text-white/90 font-semibold text-xs sm:text-sm md:text-base",
          )}
        >
          {tokens.map((t, idx) => (
            <span
              key={`${t.id}-${idx}`}
              className={cn(t.dim ? "text-white/70" : undefined)}
              style={t.color ? { color: t.color } : undefined}
            >
              {t.color || t.dim ? t.value : <FormattedMathText text={t.value} />}
            </span>
          ))}
        </span>
      );
    }
    if (formulaLine) {
      return (
        <span
          className={cn(
            "font-mono leading-tight",
            isAnswer
              ? "text-white font-bold text-sm sm:text-base md:text-lg"
              : "text-white/90 font-semibold text-xs sm:text-sm md:text-base",
          )}
        >
          <FormattedMathText text={formulaLine} />
        </span>
      );
    }
    return null;
  })();

  return (
    <div className="proof-row-item w-full min-w-0">
      <div className="relative w-full items-center grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr] gap-y-1 sm:gap-y-0 gap-x-0 py-1 sm:py-1.5 min-w-0">
        <div className="flex items-center justify-center sm:justify-end sm:pr-4 min-w-0">
          <ProofReasonTooltip
            reason={reason}
            className={cn(
              "leading-tight text-center sm:text-right italic text-xs sm:text-sm text-white/90",
              isAnswer ? "font-bold text-white" : "font-medium",
            )}
          />
        </div>

        <div className="hidden sm:block self-stretch bg-white/20 min-h-[20px]" />

        <div className="flex items-center justify-center sm:justify-start sm:pl-4 min-w-0">
          {equationNode}
        </div>
      </div>
    </div>
  );
}
