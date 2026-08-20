"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCylinderSurfaceAreaProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_RADIUS = "#ffd45e"; // Warm Gold (r, 2πr² bases)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (h, altitude)
const COLOR_SA = "#ffffff";     // Bold Crisp White

export function InteractiveCylinderSurfaceAreaExplorer({ color }: InteractiveCylinderSurfaceAreaProps) {
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
  const [h, setH] = useState(4); // height units [2..6]
  const [isDragging, setIsDragging] = useState(false);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseDiskArea = r * r; // 9
  const twoBasesArea = 2 * baseDiskArea; // 18
  const lateralArea = 2 * r * h; // 6 * h
  const totalSA = twoBasesArea + lateralArea;

  const pxPerH = 20;
  const hPx = h * pxPerH;
  const topCY = BOT_CY - hPx;

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
        {/* Bottom Base Ellipse */}
        <ellipse cx={CX} cy={BOT_CY} rx={RX} ry={RY} fill="rgba(255, 212, 94, 0.22)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Lateral Surface Body */}
        <path
          d={`M ${CX - RX} ${topCY} L ${CX - RX} ${BOT_CY} A ${RX} ${RY} 0 0 0 ${CX + RX} ${BOT_CY} L ${CX + RX} ${topCY} Z`}
          fill="rgba(216, 180, 254, 0.18)"
        />
        <line x1={CX - RX} y1={topCY} x2={CX - RX} y2={BOT_CY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        <line x1={CX + RX} y1={topCY} x2={CX + RX} y2={BOT_CY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Top Base Ellipse */}
        <ellipse cx={CX} cy={topCY} rx={RX} ry={RY} fill="rgba(255, 212, 94, 0.38)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Radius Line on Top Base */}
        <line x1={CX} y1={topCY} x2={CX + RX} y2={topCY} stroke={COLOR_RADIUS} strokeWidth={2.2} strokeDasharray="4 2" />
        <circle cx={CX} cy={topCY} r={3} fill="#ffffff" />
        <circle cx={CX + RX} cy={topCY} r={3.5} fill={COLOR_RADIUS} />

        {/* Top Drag Handle Indicator */}
        <g className="pointer-events-none">
          <circle cx={CX} cy={topCY - RY} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={CX} cy={topCY - RY} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
          <circle cx={CX} cy={topCY - RY} r={2.5} fill="#ffffff" />
        </g>

        {/* Radius Label */}
        <text
          x={CX + RX / 2}
          y={topCY - 10}
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
          x={CX - RX - 12}
          y={(BOT_CY + topCY) / 2}
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
          <span>SA</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">2π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{r}²</span>
          <span className="text-white/60">+</span>
          <span className="text-white/80">2π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{r}</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{h}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_SA }} className="font-bold">{totalSA}π</span>
        </div>
      </div>
    </div>
  );
}
