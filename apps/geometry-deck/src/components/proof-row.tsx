"use client";

import { cn } from "@/lib/utils";
import type { EquationToken } from "@/lib/types";

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
              ? "text-white font-bold text-base sm:text-lg"
              : "text-white/90 font-semibold text-sm sm:text-base",
          )}
        >
          {tokens.map((t) => (
            <span key={t.id} className={cn(t.dim ? "text-white/50" : undefined)}>
              {t.value}
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
              ? "text-white font-bold text-base sm:text-lg"
              : "text-white/90 font-semibold text-sm sm:text-base",
          )}
        >
          {formulaLine}
        </span>
      );
    }
    return null;
  })();

  return (
    <div className="grid w-full items-center grid-cols-[1fr_1px_1fr] gap-x-0 py-1">
      <div className="flex items-center justify-end pr-3">
        <span
          className={cn(
            "leading-tight italic text-right",
            isAnswer
              ? "text-white/80 text-xs sm:text-sm font-semibold not-italic"
              : "text-white/55 text-[11px] sm:text-xs",
          )}
        >
          {reason}
        </span>
      </div>

      <div className="self-stretch bg-white/15 min-h-[20px]" />

      <div className="flex justify-start pl-3">
        {equationNode}
      </div>
    </div>
  );
}
