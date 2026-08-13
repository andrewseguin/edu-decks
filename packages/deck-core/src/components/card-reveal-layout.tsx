"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface CardRevealLayoutProps {
  /**
   * Always-visible primary content (equation, term label, shape diagram).
   * Starts vertically centered; slides upward smoothly when `isRevealed` becomes true.
   */
  primary: React.ReactNode;

  /**
   * Detail content hidden off-screen below; slides up into view when revealed.
   */
  detail?: React.ReactNode;

  /** Controls whether primary has slid up and detail is visible. */
  isRevealed: boolean;

  /**
   * Tailwind `top-*` class(es) for primary when revealed.
   * Supports responsive variants e.g. `"top-[30%] sm:top-[29%]"`.
   * Default: `"top-[30%]"`
   */
  primaryRevealedTopClass?: string;

  /**
   * Tailwind `top-*` class(es) for the detail container's top edge when revealed.
   * Default: `"top-[50%]"`
   */
  detailTopClass?: string;

  /** Extra classes for the primary wrapper div. */
  primaryClassName?: string;

  /** Extra classes for the detail wrapper div. */
  detailClassName?: string;
}

/**
 * A layout primitive inside any `relative overflow-hidden` container (e.g. FlashCardShell).
 *
 * - **Primary** content starts vertically centred and slides upward when revealed.
 * - **Detail** content starts below the card bottom and slides up into view.
 *
 * Both transitions are pure `top` CSS property changes via Tailwind class toggling
 * with `transition-all duration-500 ease-in-out` always present — no height changes,
 * no flexbox reflows, no layout jank.
 */
export function CardRevealLayout({
  primary,
  detail,
  isRevealed,
  primaryRevealedTopClass = "top-[30%]",
  detailTopClass = "top-[50%]",
  primaryClassName,
  detailClassName,
}: CardRevealLayoutProps) {
  return (
    <>
      {/* Primary — centered at rest, slides up on reveal */}
      <div
        className={cn(
          "absolute inset-x-0 flex flex-col items-center justify-center",
          "-translate-y-1/2 transition-all duration-500 ease-in-out",
          "z-10 pointer-events-none",
          isRevealed ? primaryRevealedTopClass : "top-1/2",
          primaryClassName,
        )}
      >
        {primary}
      </div>

      {/* Detail — hidden below card at rest, slides up on reveal */}
      {detail != null && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col overflow-hidden",
            "transition-all duration-500 ease-in-out",
            isRevealed
              ? cn("opacity-100 pointer-events-auto", detailTopClass)
              : "top-full opacity-0 pointer-events-none",
            detailClassName,
          )}
        >
          {detail}
        </div>
      )}
    </>
  );
}
