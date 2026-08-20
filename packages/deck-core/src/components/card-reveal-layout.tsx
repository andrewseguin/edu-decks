"use client";

import * as React from "react";
import { cn, isDevSite } from "../lib/utils";
import { useDevSettings } from "../hooks/use-dev-settings";

export interface CardRevealLayoutProps {
  /**
   * Always-visible prompt content (equation, term label, shape diagram).
   * Starts vertically centered; slides upward smoothly when `isRevealed` becomes true.
   */
  primary: React.ReactNode;

  /**
   * Detail content hidden off-screen below; slides up into view when revealed.
   */
  detail?: React.ReactNode;

  /** Controls whether primary has slid up and detail is visible. */
  isRevealed: boolean;

  /** Top safe zone inset in px (space reserved for corner buttons). 0 if no top corner buttons. */
  topInset?: number;

  /** Bottom safe zone inset in px (space reserved for corner buttons). 0 if no bottom corner buttons. */
  bottomInset?: number;

  /** Extra classes for the primary wrapper div. */
  primaryClassName?: string;

  /** Extra classes for the detail wrapper div. */
  detailClassName?: string;

  /** Callback when layout calculates required card container height to preserve minimum padding. */
  onHeightChange?: (requiredHeight: number | null) => void;

  /** Optional developer debug outlines for card front and reveal content boundaries. */
  showDebugOutlines?: boolean;
}



/**
 * Layout engine for flash card reveal transitions.
 *
 * Place inside any `relative overflow-hidden` container (e.g. FlashCardShell).
 * - Unrevealed: Primary is vertically centered in the safe zone between corner icon insets.
 * - Revealed: 3-way equal padding: P = (available - promptH - detailH) / 3.
 *   If content exceeds baseline height, requests container expansion via `onHeightChange`.
 */
export function CardRevealLayout({
  primary,
  detail,
  isRevealed,
  topInset = 0,
  bottomInset = 0,
  primaryClassName,
  detailClassName,
  onHeightChange,
  showDebugOutlines,
}: CardRevealLayoutProps) {
  const devSettings = useDevSettings();
  const shouldShowDebug = showDebugOutlines !== undefined ? showDebugOutlines : devSettings.showDebugOutlines;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const primaryRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);

  // Stable ref to avoid re-creating calculateLayout when callback identity changes.
  const onHeightChangeRef = React.useRef(onHeightChange);
  React.useEffect(() => {
    onHeightChangeRef.current = onHeightChange;
  }, [onHeightChange]);

  // Record the un-expanded baseline height so expansion calculations don't feed back
  // into themselves. Only captured when unrevealed and no inline height override exists.
  const baselineHeightRef = React.useRef<number>(0);

  const [primaryStyle, setPrimaryStyle] = React.useState<React.CSSProperties>({});
  const [detailStyle, setDetailStyle] = React.useState<React.CSSProperties>({
    top: "100%",
    opacity: 0,
    pointerEvents: "none",
  });

  const calculateLayout = React.useCallback((overridePrimaryH?: number, overrideDetailH?: number) => {
    const containerEl = containerRef.current;
    const primaryEl = primaryRef.current;
    const detailEl = detailRef.current;
    if (!containerEl || !primaryEl) return;

    // Record baseline when unrevealed and container hasn't been expanded with an inline height.
    if (!isRevealed) {
      const currentH = containerEl.offsetHeight;
      if (currentH > 0) {
        baselineHeightRef.current = currentH;
      }
    }

    const baseH = baselineHeightRef.current || containerEl.offsetHeight;

    const primaryH = overridePrimaryH ?? primaryEl.offsetHeight;
    const detailH = overrideDetailH ?? detailEl?.offsetHeight ?? 0;

    if (!isRevealed) {
      // Center prompt in the full card height (insets only matter when revealed).
      const top = Math.max(0, Math.round((baseH - primaryH) / 2));
      setPrimaryStyle({ top: `${top}px` });
      setDetailStyle({
        top: `${top + primaryH}px`,
        opacity: 0,
        transform: "translateY(12px)",
        pointerEvents: "none",
      });
      onHeightChangeRef.current?.(null);
      return;
    }

    // Hybrid layout:
    // - Fits: 3-way equal padding for a balanced, centered look.
    // - Doesn't fit: enforce minimum padding above prompt and between prompt & reveal, expand the card.
    const minPadding = 16;
    const effectiveTop = Math.max(topInset, minPadding);
    const effectiveBottom = Math.max(bottomInset, minPadding);
    const contentZone = baseH - effectiveTop - effectiveBottom;
    const slack = contentZone - primaryH - detailH;
    let primaryTop: number;
    let detailTop: number;
    let requiredHeight: number | null = null;

    if (slack >= minPadding) {
      // Content fits — distribute space as 3-way equal padding.
      const P = Math.round(slack / 3);
      primaryTop = effectiveTop + P;
      detailTop = primaryTop + primaryH + P;
    } else {
      // Content overflows — enforce minPadding between prompt and reveal, request expansion.
      primaryTop = effectiveTop;
      detailTop = primaryTop + primaryH + minPadding;
      requiredHeight = Math.round(effectiveTop + primaryH + minPadding + detailH + effectiveBottom);
    }

    if (isDevSite()) {
      console.log(`[CardRevealLayout] baseH=${baseH}px (contentZone=${contentZone}px, insets=${topInset}/${bottomInset}px) | primaryH=${primaryH}px, detailH=${detailH}px | slack=${slack}px -> requiredHeight=${requiredHeight ? `${requiredHeight}px` : "null (fits)"}`);
    }

    setPrimaryStyle({ top: `${primaryTop}px` });
    setDetailStyle({
      top: `${detailTop}px`,
      opacity: 1,
      transform: "translateY(0)",
      pointerEvents: "auto",
    });
    onHeightChangeRef.current?.(requiredHeight);
  }, [isRevealed, topInset, bottomInset]);

  /**
   * Measure the FINAL post-transition height of a content element by cloning it,
   * disabling transitions on the clone, and reading its offsetHeight.
   * The original element is untouched — its transitions play normally.
   */
  const measureFinalHeight = React.useCallback((el: HTMLElement): number => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${el.offsetWidth}px;`;
    clone.style.transition = "none";
    clone.querySelectorAll("*").forEach((child) => {
      (child as HTMLElement).style.transition = "none";
    });
    el.parentElement!.appendChild(clone);
    const h = clone.offsetHeight;
    clone.remove();
    return h;
  }, []);

  // Compute layout positions. For the revealed state, use clone-based measurement
  // to get the FINAL content heights so positions are correct from the start,
  // even when content has CSS transitions that change its height.
  React.useLayoutEffect(() => {
    const primaryEl = primaryRef.current;
    const detailEl = detailRef.current;
    if (!primaryEl) return;

    if (isRevealed) {
      const finalPrimaryH = measureFinalHeight(primaryEl);
      const finalDetailH = detailEl ? measureFinalHeight(detailEl) : 0;
      calculateLayout(finalPrimaryH, finalDetailH);
    } else {
      calculateLayout();
    }
  }, [calculateLayout, measureFinalHeight, primary, detail, isRevealed]);

  // ResizeObserver for dynamic content changes (e.g. accordion expand, image load, list add/remove).
  // Suppressed during the first 600ms after isRevealed changes to avoid mid-transition noise.
  const isTransitioningRef = React.useRef(false);
  React.useEffect(() => {
    isTransitioningRef.current = true;
    const timer = setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [isRevealed]);

  React.useEffect(() => {
    const primaryEl = primaryRef.current;
    const detailEl = detailRef.current;
    if (typeof ResizeObserver === "undefined") return;

    let rafId: number | null = null;
    const debouncedRecalc = () => {
      if (isTransitioningRef.current) return;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        calculateLayout();
      });
    };

    const observer = new ResizeObserver(debouncedRecalc);
    if (primaryEl) observer.observe(primaryEl);
    if (detailEl) observer.observe(detailEl);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [calculateLayout]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Primary (prompt) — centered when unrevealed, 3-way top when revealed */}
      <div
        ref={primaryRef}
        data-card-section="primary"
        style={primaryStyle}
        className={cn(
          "absolute inset-x-0 flex flex-col items-center justify-center",
          "transition-[top,transform,opacity] duration-500 ease-in-out z-10 pointer-events-none",
          shouldShowDebug && "outline-2 outline-dashed outline-cyan-400/80 rounded-lg",
          primaryClassName
        )}
      >
        {shouldShowDebug && (
          <span
            data-card-debug-badge="true"
            className="absolute top-1 left-2 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500 rounded z-30 shadow-sm pointer-events-none select-none"
          >
            PROMPT CONTAINER
          </span>
        )}
        {primary}
      </div>

      {/* Detail — hidden below card when unrevealed, animated into view when revealed */}
      {detail != null && (
        <div
          ref={detailRef}
          data-card-section="detail"
          style={detailStyle}
          className={cn(
            "absolute inset-x-0 flex flex-col h-fit",
            "transition-[top,transform,opacity] duration-500 ease-in-out z-10",
            shouldShowDebug && "outline-2 outline-dashed outline-emerald-400/80 rounded-lg",
            detailClassName
          )}
        >
          {shouldShowDebug && (
            <span
              data-card-debug-badge="true"
              className="absolute top-1 left-2 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 rounded z-30 shadow-sm pointer-events-none select-none"
            >
              REVEAL CONTAINER
            </span>
          )}
          {detail}
        </div>
      )}
    </div>
  );
}
