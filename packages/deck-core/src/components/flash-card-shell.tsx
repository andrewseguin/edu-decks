"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { cn } from "../lib/utils";

export type CardCornerButtonProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  ariaLabel?: string;
  title?: string;
  isActive?: boolean;
};

export function CardCornerButton({
  position = "top-left",
  size = "lg",
  className,
  children,
  icon,
  onClick,
  onPointerDown,
  onPointerUp,
  ariaLabel,
  title,
  isActive = false,
}: CardCornerButtonProps) {
  const positionClasses = {
    "top-left": "absolute top-3 left-3 sm:top-4 sm:left-4 z-40",
    "top-right": "absolute top-3 right-3 sm:top-4 sm:right-4 z-40",
    "bottom-left": "absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-40",
    "bottom-right": "absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-40",
  }[position];

  const sizeClasses = {
    md: "h-8 w-8 sm:h-10 sm:w-10 text-sm",
    lg: "h-10 w-10 sm:h-12 sm:w-12 text-base",
  }[size];

  return (
    <button
      type="button"
      className={cn(
        positionClasses,
        sizeClasses,
        "inline-flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-95 outline-none pointer-events-auto drop-shadow-sm",
        isActive && "bg-white/25 text-white scale-110 shadow-lg",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUp?.(e);
      }}
      aria-label={ariaLabel}
      title={title}
    >
      {icon || children}
    </button>
  );
}

export type FlashCardShellProps = {
  children?: React.ReactNode;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
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
  speakerSize?: "md" | "lg";
};

export function FrostedBadge({
  isFlipped = false,
  className,
  textClassName,
  children = "?",
}: {
  isFlipped?: boolean;
  className?: string;
  textClassName?: string;
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
      <span
        className={cn(
          "font-headline font-bold text-white leading-none select-none flex items-center justify-center",
          textClassName || "text-3xl sm:text-5xl md:text-6xl [@media(max-height:640px)]:text-3xl [@media(orientation:landscape)_and_(max-height:640px)]:text-4xl"
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function FlashCardShell({
  children,
  frontContent,
  backContent,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
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
  speakerSize = "lg",
}: FlashCardShellProps) {
  const animClass = "animate-fade-in-zoom";

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
        {topLeft}
        {topRight}
        {bottomLeft}
        {frontContent || children}
        {backContent}
        {bottomRight ||
          (showSpeaker && onSpeak && (
            <button
              type="button"
              className={cn(
                "absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 inline-flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-transform active:scale-95 outline-none pointer-events-auto z-30",
                speakerSize === "lg" ? "w-10 h-10 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-10 sm:h-10",
                speakerClassName
              )}
              onClick={handleSpeak}
              aria-label={speakerAriaLabel}
            >
              <Volume2 className={cn(speakerSize === "lg" ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5")} />
            </button>
          ))}
      </div>
    </div>
  );
}
