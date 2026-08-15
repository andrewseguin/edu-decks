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
    <div className="relative inline-flex items-center justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={cn(
          "text-left cursor-help transition-all duration-150 inline-flex items-center gap-1",
          "underline decoration-dotted decoration-white/40 underline-offset-4 hover:decoration-white focus:outline-none",
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
          className={cn(
            "absolute z-50 bottom-full mb-2.5 right-0 w-64 sm:w-72 p-3.5 rounded-xl text-left shadow-2xl animate-fade-in",
            "bg-slate-950/95 backdrop-blur-xl border border-white/20 text-white select-none pointer-events-auto",
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
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono shrink-0">
              Glossary
            </span>
          </div>

          {/* Explanation */}
          <p className="pt-2 text-xs text-white/90 leading-relaxed not-italic font-normal">
            {entry.explanation}
          </p>

          {/* Example (if provided) */}
          {entry.example && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-mono text-gold-300 font-semibold tracking-wider" style={{ color: "#ffd45e" }}>
                Example:
              </span>
              <code className="text-[11px] font-mono text-white/80 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 not-italic">
                {entry.example}
              </code>
            </div>
          )}

          {/* Subtle Pointer Arrow */}
          <div
            className="absolute top-full right-4 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950/95"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
