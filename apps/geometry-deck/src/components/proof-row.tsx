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
              ? "text-white font-bold text-xs sm:text-base md:text-lg"
              : "text-white/90 font-semibold text-[11px] sm:text-sm md:text-base",
          )}
        >
          {tokens.map((t) => (
            <span
              key={t.id}
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
              ? "text-white font-bold text-xs sm:text-base md:text-lg"
              : "text-white/90 font-semibold text-[11px] sm:text-sm md:text-base",
          )}
        >
          <FormattedMathText text={formulaLine} />
        </span>
      );
    }
    return null;
  })();

  return (
    <div className="relative grid w-full items-center grid-cols-[minmax(0,0.85fr)_1px_minmax(0,1.15fr)] gap-x-0 py-1 sm:py-1.5 min-w-0">
      <div className="flex items-center justify-end pr-2 sm:pr-3.5 min-w-0">
        <ProofReasonTooltip
          reason={reason}
          className={cn(
            "leading-tight text-right italic text-[11px] sm:text-sm text-white",
            isAnswer ? "font-bold" : "font-medium",
          )}
        />
      </div>

      <div className="self-stretch bg-white/20 min-h-[18px]" />

      <div className="flex justify-start pl-2 sm:pl-3.5 min-w-0 overflow-hidden">
        {equationNode}
      </div>
    </div>
  );
}
