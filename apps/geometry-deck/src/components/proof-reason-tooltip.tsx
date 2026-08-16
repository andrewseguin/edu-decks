"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@decks/core";
import { FormattedMathText } from "./ui/formatted-math-text";
import { lookupGlossary } from "@/lib/math-glossary";

interface ProofReasonTooltipProps {
  reason: string;
  className?: string;
}

export function ProofReasonTooltip({ reason, className }: ProofReasonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entry = lookupGlossary(reason);

  if (!entry) {
    return <span className={className}>{reason}</span>;
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={cn(
            "text-right cursor-help transition-all duration-150 inline-flex items-center gap-1",
            "border-0 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:outline-none no-focus-ring bg-transparent",
            "underline decoration-dotted decoration-white/50 underline-offset-4 hover:decoration-white/90",
            "-my-1 py-1 -mx-0.5 px-0.5 touch-manipulation",
            className,
          )}
          aria-label={`Learn more about ${reason}`}
        >
          <span>{reason}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          collisionPadding={16}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={cn(
            "z-[100] w-[calc(100vw-2rem)] max-w-xs p-3.5 rounded-xl text-left shadow-2xl animate-fade-in select-none pointer-events-auto no-focus-ring",
            "border-0 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0",
            "bg-slate-950/95 text-white",
          )}
        >
          {/* Tooltip Header */}
          <div className="flex items-start justify-between gap-2 pb-1">
            <h4 className="font-bold text-xs sm:text-sm text-cyan-300 tracking-wide leading-snug min-w-0 break-words">
              {reason}
            </h4>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-white/60 hover:text-white px-1 text-xs font-bold sm:hidden shrink-0"
              aria-label="Close glossary tooltip"
            >
              ✕
            </button>
          </div>

          {/* Explanation */}
          <p className="pt-1.5 text-xs text-white/90 leading-relaxed not-italic font-normal">
            {entry.explanation}
          </p>

          {/* Formula (if defined) */}
          {entry.formula && (
            <div className="mt-2.5 pt-1.5 flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider" style={{ color: "#ffd45e" }}>
                Formula:
              </span>
              <p className="font-mono text-white font-bold text-xs sm:text-sm leading-relaxed">
                <FormattedMathText text={entry.formula} />
              </p>
            </div>
          )}

          {/* Radix Popover Arrow */}
          <Popover.Arrow className="fill-slate-950/95" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
