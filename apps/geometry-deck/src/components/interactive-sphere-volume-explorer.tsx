"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveSphereVolumeProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r / radius)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveSphereVolumeExplorer({ color }: InteractiveSphereVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 95;

  const minR = 2;
  const maxR = 6;
  const [r, setR] = useState(3); // radius units [2..6]
  const [isDragging, setIsDragging] = useState(false);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const unitPx = 14;
  const cr = r * unitPx;
  const rCubed = r * r * r;
  const isIntegerVol = (4 * rCubed) % 3 === 0;
  const volCoeff = (4 * rCubed) / 3;

  const updateFromPointer = useCallback((clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const scaleX = SVG_W / rect.width;
    const svgPointerX = (clientX - rect.left) * scaleX;
    const distFromCenter = svgPointerX - CX;
    const nextR = Math.max(minR, Math.min(maxR, Math.round(distFromCenter / unitPx)));
    setR(nextR);
  }, [CX, SVG_W]);

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    updateFromPointer(e.clientX);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleX = CX + cr;
  const handleY = CY;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pt-1 pb-1" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ew-resize"
      >
        {/* Sphere Outer Boundary & Shading */}
        <circle cx={CX} cy={CY} r={cr} fill="rgba(94, 232, 255, 0.22)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />

        {/* Equator Ellipse */}
        <ellipse cx={CX} cy={CY} rx={cr} ry={cr * 0.3} fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Center Dot */}
        <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

        {/* Radius Horizontal Line along Equator */}
        <line x1={CX} y1={CY} x2={handleX} y2={handleY} stroke={COLOR_RADIUS} strokeWidth={2.2} strokeDasharray="4 2" />

        {/* Radius Drag Handle Indicator on Right Edge */}
        <g className="pointer-events-none">
          <circle cx={handleX} cy={handleY} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={handleX} cy={handleY} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
          <circle cx={handleX} cy={handleY} r={2.5} fill="#ffffff" />
        </g>

        {/* Radius Label */}
        <text
          x={CX + cr / 2}
          y={CY - 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_RADIUS}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {r}
        </text>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none text-white">
          <span>V</span>
          <span className="text-white/50">=</span>
          <div className="inline-flex items-center"><StackedFraction numerator="4" denominator="3" /></div>
          <span className="text-white/80">· π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{r}³</span>
          <span className="text-white/50">=</span>
          {isIntegerVol ? (
            <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
          ) : (
            <div className="inline-flex items-center text-white font-bold">
              <StackedFraction numerator={`${4 * rCubed}π`} denominator="3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
