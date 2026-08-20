"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveConeVolumeProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_RADIUS = "#ffd45e"; // Warm Gold (r, r² / base radius)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (h / altitude)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveConeVolumeExplorer({ color }: InteractiveConeVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const BOT_CY = 162;
  const RX = 58;
  const RY = 17;

  const r = 3; // radius units
  const minH = 2;
  const maxH = 6;
  const [h, setH] = useState(4); // height [2..6]
  const [isDragging, setIsDragging] = useState(false);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseAreaCoeff = r * r; // 9
  const volCoeff = (baseAreaCoeff * h) / 3; // 3 * h (always an exact integer)
  const cylVolCoeff = baseAreaCoeff * h;    // 9 * h

  const pxPerH = 20;
  const hPx = h * pxPerH;
  const apexY = BOT_CY - hPx;

  const updateFromPointer = useCallback((clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.height <= 0) return;
    const scaleY = SVG_H / rect.height;
    const svgPointerY = (clientY - rect.top) * scaleY;
    const dy = BOT_CY - svgPointerY;
    const nextH = Math.max(minH, Math.min(maxH, Math.round(dy / pxPerH)));
    setH(nextH);
  }, [BOT_CY, pxPerH, minH, maxH]);

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    updateFromPointer(e.clientY);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pt-1 pb-1" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ns-resize"
      >
        {/* Ghost Equivalent Cylinder Outline (Showing 3x Volume Container) */}
        <g opacity={0.35}>
          <line x1={CX - RX} y1={BOT_CY} x2={CX - RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={CX + RX} y1={BOT_CY} x2={CX + RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <ellipse cx={CX} cy={apexY} rx={RX} ry={RY} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
        </g>

        {/* Base Ellipse Fill & Outline */}
        <ellipse cx={CX} cy={BOT_CY} rx={RX} ry={RY} fill="rgba(255, 212, 94, 0.12)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Cone Lateral Surface */}
        <path
          d={`M ${CX - RX} ${BOT_CY} L ${CX} ${apexY} L ${CX + RX} ${BOT_CY} A ${RX} ${RY} 0 0 1 ${CX - RX} ${BOT_CY} Z`}
          fill="rgba(94, 232, 255, 0.28)"
        />
        <line x1={CX - RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        <line x1={CX + RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Height line inside from apex to base center */}
        <line x1={CX} y1={apexY} x2={CX} y2={BOT_CY} stroke={COLOR_HEIGHT} strokeWidth={2} strokeDasharray="4 2" />
        <circle cx={CX} cy={BOT_CY} r={3} fill="#ffffff" />

        {/* Radius line on bottom base */}
        <line x1={CX} y1={BOT_CY} x2={CX + RX} y2={BOT_CY} stroke={COLOR_RADIUS} strokeWidth={2.2} strokeDasharray="4 2" />
        <circle cx={CX + RX} cy={BOT_CY} r={3.5} fill={COLOR_RADIUS} />

        {/* Apex Drag Handle Indicator */}
        <g className="pointer-events-none">
          <circle cx={CX} cy={apexY} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={CX} cy={apexY} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
          <circle cx={CX} cy={apexY} r={2.5} fill="#ffffff" />
        </g>

        {/* Radius Label */}
        <text
          x={CX + RX / 2}
          y={BOT_CY + 14}
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

        {/* Height Label */}
        <text
          x={CX - 14}
          y={(apexY + BOT_CY) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {h}
        </text>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none text-white">
          <span>V</span>
          <span className="text-white/50">=</span>
          <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
          <span className="text-white/80">· π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{r}²</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{h}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
