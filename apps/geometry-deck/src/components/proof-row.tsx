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
      {/* ── Wide Container (Two-Column Proof Table: >= 480px) ─────────────── */}
      <div className="proof-row-desktop relative w-full items-center grid-cols-[1fr_1px_1fr] gap-x-0 py-1.5 min-w-0">
        <div className="flex items-center justify-end pr-4 min-w-0">
          <ProofReasonTooltip
            reason={reason}
            className={cn(
              "leading-tight text-right italic text-xs sm:text-sm text-white",
              isAnswer ? "font-bold" : "font-medium",
            )}
          />
        </div>

        <div className="self-stretch bg-white/20 min-h-[20px]" />

        <div className="flex justify-start pl-4 min-w-0">
          {equationNode}
        </div>
      </div>

      {/* ── Narrow Container (Stacked Step Layout: < 480px) ───────────────── */}
      <div className="proof-row-mobile relative flex-col items-center justify-center w-full py-1.5 px-2 text-center min-w-0 gap-0.5">
        <div className="flex items-center justify-center min-w-0 max-w-full">
          <ProofReasonTooltip
            reason={reason}
            className={cn(
              "leading-tight text-center italic text-xs text-white/85",
              isAnswer ? "font-bold text-white" : "font-medium",
            )}
          />
        </div>
        <div className="flex items-center justify-center min-w-0 w-full overflow-x-auto no-scrollbar py-0.5">
          {equationNode}
        </div>
      </div>
    </div>
  );
}
