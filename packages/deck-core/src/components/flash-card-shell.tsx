"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { cn } from "../lib/utils";
import { CardRevealLayout } from "./card-reveal-layout";

export interface CardCornerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  title?: string;
  isActive?: boolean;
}

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
  ...props
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
        "inline-flex items-center justify-center rounded-full text-white opacity-80 hover:opacity-100 hover:bg-white/20 transition-all active:scale-95 outline-none pointer-events-auto",
        isActive && "bg-white/20 text-white opacity-100 scale-110 shadow-lg",
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
      aria-label={ariaLabel || props["aria-label"]}
      title={title}
      {...props}
    >
      {icon || children}
    </button>
  );
}

export type FlashCardShellProps = {
  children?: React.ReactNode;
  /** Primary front content shown initially vertically centered on the card. */
  front?: React.ReactNode;
  frontContent?: React.ReactNode;
  /** Revealed detail content shown when card is flipped/revealed. */
  reveal?: React.ReactNode;
  revealContent?: React.ReactNode;
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
  speakerPosition?: "top-right" | "bottom-right";
  speakerClassName?: string;
  speakerAriaLabel?: string;
  speakerSize?: "md" | "lg";
  /**
   * @deprecated Optional override flag for tall cards; container height now auto-adjusts dynamically.
   */
  tall?: boolean;
  /**
   * @deprecated Optional override flag; height expansion now happens automatically as needed.
   */
  autoTallOnReveal?: boolean;
  /**
   * When true (default), automatically watches internal content height changes and balances layout.
   */
  autoMeasureHeight?: boolean;
  /**
   * Optional developer debug outlines for card front and reveal content boundaries.
   */
  showDebugOutlines?: boolean;
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
  front,
  frontContent,
  reveal,
  revealContent,
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
  speakerPosition = "top-right",
  speakerClassName,
  speakerAriaLabel = "Listen to card",
  speakerSize = "lg",
  tall = false,
  autoTallOnReveal = false,
  autoMeasureHeight = true,
  showDebugOutlines,
}: FlashCardShellProps) {
  const animClass = "animate-fade-in-zoom";
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(null);

  const primaryNode = frontContent || front;
  const detailNode = revealContent || reveal || backContent;

  // Compute safe zone insets based on which corners actually have buttons.
  // Derived from the shell's responsive inner padding + button size:
  //   Mobile:  p-3 (12px) + w-10 (40px) = 52px
  //   sm+:     p-5 (20px) + w-12 (48px) = 68px
  const BUTTON_SIZE_MOBILE = 40;
  const BUTTON_SIZE_SM = 48;
  const [cornerInset, setCornerInset] = React.useState(52); // mobile default
  React.useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const padding = parseFloat(getComputedStyle(inner).paddingTop);
    const buttonSize = padding >= 20 ? BUTTON_SIZE_SM : BUTTON_SIZE_MOBILE;
    setCornerInset(Math.round(padding + buttonSize));
  }, []);

  const hasSpeaker = showSpeaker && !!onSpeak;
  const hasTopCorner = Boolean(topLeft || topRight || (hasSpeaker && speakerPosition === "top-right"));
  const hasBottomCorner = Boolean(bottomLeft || bottomRight || (hasSpeaker && speakerPosition === "bottom-right"));
  const topInset = hasTopCorner ? cornerInset : 0;
  const bottomInset = hasBottomCorner ? cornerInset : 0;

  const handleHeightChange = React.useCallback((reqHeight: number | null) => {
    setMeasuredHeight((prev) => (prev === reqHeight ? prev : reqHeight));
  }, []);

  // Clear expansion when card is unflipped so height transition starts immediately.
  React.useEffect(() => {
    if (!isFlipped) setMeasuredHeight(null);
  }, [isFlipped]);

  const applyHeight = autoMeasureHeight && isFlipped && measuredHeight;

  const defaultStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || "#000000",
    boxShadow:
      "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
    ...(applyHeight
      ? { height: `${measuredHeight}px` }
      : {}),
    ...style,
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak?.(e);
  };

  const speakerButton =
    showSpeaker && onSpeak ? (
      <button
        type="button"
        data-card-corner={speakerPosition === "top-right" ? "top" : "bottom"}
        className={cn(
          "absolute z-40 inline-flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all active:scale-95 outline-none pointer-events-auto",
          speakerPosition === "top-right"
            ? "top-3 right-3 sm:top-4 sm:right-4"
            : "bottom-2.5 right-2.5 sm:bottom-3 sm:right-3",
          speakerSize === "lg" ? "w-10 h-10 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-10 sm:h-10",
          speakerClassName
        )}
        onClick={handleSpeak}
        aria-label={speakerAriaLabel}
      >
        <Volume2 className={cn(speakerSize === "lg" ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5")} />
      </button>
    ) : null;

  return (
    <div
      className={cn(
        "relative select-none [-webkit-touch-callout:none] border-none rounded-3xl overflow-hidden cursor-pointer",
        // Standard shared size — all decks use this baseline
        "w-[90vw] max-w-[700px]",
        "transition-[height] duration-500 ease-in-out",
        // Card height: single computed value = rendered value (no max-height cap).
        // This prevents CSS transition from animating from the uncapped h-[55vw] value
        // when an inline height override is applied for card expansion.
        "h-[min(55vw,420px,68svh)] min-h-[220px]",
        "[@media(orientation:landscape)_and_(max-height:500px)]:h-[72vh]",
        animClass,
        className
      )}
      style={defaultStyle}
      onClick={onCardTap}
    >
      <div ref={innerRef} className={cn("p-3 sm:p-5 md:p-6 h-full w-full relative overflow-hidden", contentClassName)}>
        {topLeft && <div data-card-corner="top">{topLeft}</div>}
        {topRight ? (
          <div data-card-corner="top">{topRight}</div>
        ) : speakerPosition === "top-right" ? (
          speakerButton
        ) : null}
        {bottomLeft && <div data-card-corner="bottom">{bottomLeft}</div>}
        {children ? (
          children
        ) : (
          <CardRevealLayout
            primary={primaryNode}
            detail={detailNode}
            isRevealed={isFlipped}
            topInset={topInset}
            bottomInset={bottomInset}
            onHeightChange={handleHeightChange}
            showDebugOutlines={showDebugOutlines}
          />
        )}
        {bottomRight ? (
          <div data-card-corner="bottom">{bottomRight}</div>
        ) : speakerPosition === "bottom-right" ? (
          speakerButton
        ) : null}
      </div>
    </div>
  );
}
