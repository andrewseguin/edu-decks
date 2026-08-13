"use client";

import { cn } from "@/lib/utils";
import type { EquationToken } from "@/lib/types";

type ProofRowProps = {
  /** Left column: structured equation tokens (preferred) */
  tokens: EquationToken[] | null;
  /** Left column: plain-text fallback */
  formulaLine: string | null;
  /** Right column: mathematical justification */
  reason: string;
  /** Whether this is the final answer row (rendered larger/brighter) */
  isAnswer: boolean;
};

/**
 * One row in the two-column proof layout.
 *
 *   A = πr²      │  Circle area formula
 *   25π = πr²    │  Substitute A = 25π
 *   r² = 25      │  Divide both sides by π
 *   r = 5        │  Take the square root    ← answer row (larger)
 *
 * Animates in via animate-fade-in when it first mounts (new step appears).
 * No per-token slot animation — the whole row fades in together, keeping the
 * proof feel clean and synchronised.
 */
export function ProofRow({ tokens, formulaLine, reason, isAnswer }: ProofRowProps) {
  // Render the equation as flat text (tokens joined) or plain formulaLine.
  // We intentionally do NOT use EquationDisplay here — the per-slot animation
  // would conflict with the row-level fade-in in a distracting way.
  const equationNode = (() => {
    if (tokens && tokens.length > 0) {
      return (
        <span
          className={cn(
            "font-mono leading-tight whitespace-nowrap",
            isAnswer
              ? "text-white font-bold text-sm sm:text-[15px]"
              : "text-white/85 font-semibold text-xs sm:text-[13px]",
          )}
        >
          {tokens.map((t) => (
            <span
              key={t.id}
              className={cn(t.dim ? "text-white/45" : undefined)}
            >
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
              ? "text-white font-bold text-sm sm:text-[15px]"
              : "text-white/85 font-semibold text-xs sm:text-[13px]",
          )}
        >
          {formulaLine}
        </span>
      );
    }
    return null;
  })();

  return (
    <div
      className={cn(
        "grid w-full items-center animate-fade-in",
        "grid-cols-[1fr_1px_1fr] gap-x-0",
      )}
    >
      {/* Left column — equation/work, right-aligned towards the divider */}
      <div className="flex justify-end pr-3 py-[3px]">
        {equationNode}
      </div>

      {/* Vertical divider */}
      <div className="self-stretch bg-white/25 min-h-[18px]" />

      {/* Right column — reason, left-aligned from the divider */}
      <div className="flex items-center pl-3 py-[3px]">
        <span
          className={cn(
            "leading-tight",
            isAnswer
              ? "text-white/85 text-xs sm:text-sm font-semibold"
              : "text-white/50 italic text-[11px] sm:text-xs",
          )}
        >
          {reason}
        </span>
      </div>
    </div>
  );
}
