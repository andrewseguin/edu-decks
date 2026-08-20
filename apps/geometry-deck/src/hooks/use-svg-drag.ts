"use client";

import { useCallback, useRef } from "react";

export interface SvgDragPoint {
  x: number;
  y: number;
}

export interface UseSvgDragOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewBoxWidth: number;
  viewBoxHeight: number;
  onDragStart?: (pt: SvgDragPoint, e: React.PointerEvent) => void;
  onDragMove: (pt: SvgDragPoint, e: PointerEvent | TouchEvent) => void;
  onDragEnd?: () => void;
}

export function useSvgDrag({
  svgRef,
  viewBoxWidth,
  viewBoxHeight,
  onDragStart,
  onDragMove,
  onDragEnd,
}: UseSvgDragOptions) {
  const isDraggingRef = useRef(false);

  const getSvgPoint = useCallback(
    (clientX: number, clientY: number): SvgDragPoint => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const scX = viewBoxWidth / (rect.width || 1);
      const scY = viewBoxHeight / (rect.height || 1);
      return {
        x: (clientX - rect.left) * scX,
        y: (clientY - rect.top) * scY,
      };
    },
    [svgRef, viewBoxWidth, viewBoxHeight]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        (e.currentTarget as Element)?.setPointerCapture?.(e.pointerId);
      } catch {}

      isDraggingRef.current = true;
      const initialPt = getSvgPoint(e.clientX, e.clientY);
      onDragStart?.(initialPt, e);

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current) return;
        ev.preventDefault();
        const pt = getSvgPoint(ev.clientX, ev.clientY);
        onDragMove(pt, ev);
      };

      const onTouchMove = (ev: TouchEvent) => {
        if (!isDraggingRef.current || ev.touches.length === 0) return;
        ev.preventDefault();
        const t = ev.touches[0];
        const pt = getSvgPoint(t.clientX, t.clientY);
        onDragMove(pt, ev);
      };

      const onEnd = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        try {
          (e.currentTarget as Element)?.releasePointerCapture?.(e.pointerId);
        } catch {}

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onEnd);
        window.removeEventListener("touchcancel", onEnd);

        onDragEnd?.();
      };

      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onEnd);
      window.addEventListener("touchcancel", onEnd);
    },
    [getSvgPoint, onDragStart, onDragMove, onDragEnd]
  );

  return {
    handlePointerDown,
    getSvgPoint,
    isDraggingRef,
  };
}
