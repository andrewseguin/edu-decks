"use client";

import { cn } from "@/lib/utils";
import type { EquationToken } from "@/lib/types";

type EquationDisplayProps = {
  /** Structured tokens — if present, renders as a morphing equation row */
  tokens: EquationToken[] | null;
  /** Plain-text fallback used when tokens is null */
  formulaLine: string | null;
  /** Whether this is the final (answer) step — renders larger */
  isFinal: boolean;
};

/**
 * Renders a single equation line that morphs in place between steps.
 *
 * Architecture:
 * - The parent passes `key={idSequence}` when creating this component.
 *   When the token ID sequence changes (structural rearrangement), React
 *   remounts the component → the container gets `animate-fade-in` (crossfade).
 * - Within a stable structure (same ID sequence), only the VALUE of each
 *   token slot can change. Each value span uses `key={id + value}`, so
 *   React remounts only that span → `animate-slot-in` plays on the new value
 *   (slides up from below with a spring bounce), while unchanged tokens are
 *   perfectly still.
 *
 * This mirrors the arithmetic deck's VisualMath step animation philosophy:
 * individual components of the equation animate independently.
 */
export function EquationDisplay({ tokens, formulaLine, isFinal }: EquationDisplayProps) {
  // ── Structured token display ──────────────────────────────────────────────
  if (tokens && tokens.length > 0) {
    return (
      <div
        className={cn(
          "flex items-baseline gap-1.5 justify-center flex-wrap animate-fade-in",
          "transition-transform duration-300",
          isFinal && "scale-110",
        )}
      >
        {tokens.map((token) => (
          // Outer span: stable position in the layout (keyed by id, stays mounted)
          <span key={token.id} className="inline-block">
            {/* Inner span: remounts when value changes, triggering slot animation */}
            <span
              key={`${token.id}-${token.value}`}
              className={cn(
                "inline-block animate-slot-in font-mono whitespace-nowrap",
                token.dim
                  ? cn(
                      "text-white/55",
                      isFinal ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                    )
                  : cn(
                      "font-semibold text-white",
                      isFinal
                        ? "text-2xl sm:text-3xl [text-shadow:0_2px_14px_rgba(0,0,0,0.35)]"
                        : "text-lg sm:text-xl",
                    ),
              )}
            >
              {token.value}
            </span>
          </span>
        ))}
      </div>
    );
  }

  // ── Plain-text fallback ───────────────────────────────────────────────────
  if (formulaLine) {
    return (
      <p
        className={cn(
          "text-center animate-fade-in font-mono",
          isFinal
            ? "font-bold text-white text-xl sm:text-2xl [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]"
            : "text-white/75 text-sm sm:text-base",
        )}
      >
        {formulaLine}
      </p>
    );
  }

  return null;
}
