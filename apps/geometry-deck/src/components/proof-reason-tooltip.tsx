"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { lookupGlossary } from "@/lib/math-glossary";

interface ProofReasonTooltipProps {
  reason: string;
  className?: string;
}

export function ProofReasonTooltip({ reason, className }: ProofReasonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entry = lookupGlossary(reason);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click/tap
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  if (!entry) {
    return <span className={className}>{reason}</span>;
  }

  return (
    <>
      {/* Mobile touch backdrop to dismiss without accidentally flipping the card */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative inline-flex items-center justify-end">
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={cn(
            "text-right cursor-help transition-all duration-150 inline-flex items-center gap-1",
            "underline decoration-dotted decoration-white/40 underline-offset-4 hover:decoration-white focus:outline-none",
            "-my-1.5 py-1.5 -mx-1 px-1 touch-manipulation", // Generous touch target for fingers
            className,
          )}
          aria-label={`Learn more about ${entry.title}`}
        >
          <span>{reason}</span>
        </button>

        {/* Frosted Floating Glossary Tooltip */}
        {isOpen && (
          <div
            ref={tooltipRef}
            role="tooltip"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={cn(
              "z-50 p-3.5 rounded-xl text-left shadow-2xl animate-fade-in select-none pointer-events-auto",
              "bg-slate-950/95 backdrop-blur-xl border border-white/20 text-white",
              // Mobile: centered bottom popup | Desktop: anchored above reason
              "fixed inset-x-4 bottom-6 sm:static sm:absolute sm:inset-auto sm:bottom-full sm:mb-2.5 sm:right-0 sm:w-72",
            )}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/15">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm text-cyan-300 tracking-wide truncate">
                  {entry.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                  Glossary
                </span>
                {/* Mobile tap close button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="sm:hidden text-white/60 hover:text-white px-1 text-xs font-bold"
                  aria-label="Close glossary"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Explanation */}
            <p className="pt-2 text-xs text-white/90 leading-relaxed not-italic font-normal">
              {entry.explanation}
            </p>

            {/* Example (if provided) */}
            {entry.example && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider" style={{ color: "#ffd45e" }}>
                  Example:
                </span>
                <p className="font-mono text-white/90 not-italic text-[11px] sm:text-xs leading-relaxed">
                  {entry.example}
                </p>
              </div>
            )}

            {/* Desktop Subtle Pointer Arrow */}
            <div
              className="hidden sm:block absolute top-full right-4 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950/95"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </>
  );
}
