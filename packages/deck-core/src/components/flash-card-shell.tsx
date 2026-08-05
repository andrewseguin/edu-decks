"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { cn } from "../lib/utils";

export type FlashCardShellProps = {
  children?: React.ReactNode;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  isFlipped?: boolean;
  slideDirection?: "next" | "prev";
  backgroundColor?: string;
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  onCardTap?: () => void;
  onSpeak?: (e: React.MouseEvent) => void;
  showSpeaker?: boolean;
  speakerClassName?: string;
  speakerAriaLabel?: string;
};

export function FrostedBadge({
  isFlipped = false,
  className,
  children = "?",
}: {
  isFlipped?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-y-[-4px] inset-x-[-6px] flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm transition-all",
        isFlipped
          ? "opacity-0 scale-75 delay-0 duration-300 ease-in pointer-events-none"
          : "opacity-100 scale-100 delay-0 duration-300 ease-out",
        className
      )}
    >
      <span className="font-headline font-bold text-white text-3xl sm:text-5xl md:text-6xl [@media(max-height:640px)]:text-3xl">
        {children}
      </span>
    </div>
  );
}

export function FlashCardShell({
  children,
  frontContent,
  backContent,
  isFlipped = false,
  slideDirection,
  backgroundColor,
  className,
  contentClassName,
  style,
  onCardTap,
  onSpeak,
  showSpeaker = true,
  speakerClassName,
  speakerAriaLabel = "Listen to card",
}: FlashCardShellProps) {
  const animClass =
    slideDirection === "next"
      ? "animate-slide-in-right"
      : slideDirection === "prev"
      ? "animate-slide-in-left"
      : "";

  const defaultStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || "#000000",
    boxShadow:
      "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    ...style,
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak?.(e);
  };

  return (
    <div
      className={cn(
        "relative select-none [-webkit-touch-callout:none] border-none rounded-3xl overflow-hidden cursor-pointer transition-all duration-300",
        animClass,
        className
      )}
      style={defaultStyle}
      onClick={onCardTap}
    >
      <div className={cn("p-3 sm:p-5 md:p-6 h-full w-full relative overflow-hidden", contentClassName)}>
        {frontContent || children}
        {backContent}
        {showSpeaker && onSpeak && (
          <button
            type="button"
            className={cn(
              "absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 inline-flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 transition-transform active:scale-95 outline-none pointer-events-auto z-30",
              speakerClassName
            )}
            onClick={handleSpeak}
            aria-label={speakerAriaLabel}
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
