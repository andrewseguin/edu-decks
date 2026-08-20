"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCylinderVolumeProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_RADIUS = "#ffd45e"; // Warm Gold (r / base radius)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (h / height)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveCylinderVolumeExplorer({ color }: InteractiveCylinderVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const BOT_CY = 162;
  const RX = 58;
  const RY = 17;

  const r = 3; // radius units
  const maxDisks = 6;
  const [h, setH] = useState(3); // height/disks [1..6]
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const startHRef = useRef<number>(h);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseAreaCoeff = r * r;
  const volCoeff = baseAreaCoeff * h;

  const diskH = 20;
  const currentTotalH = h * diskH;
  const topCY = BOT_CY - currentTotalH;

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHRef.current = h;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = startYRef.current - e.clientY;
    const deltaH = Math.round(dy / diskH);
    const nextH = Math.max(1, Math.min(maxDisks, startHRef.current + deltaH));
    setH(nextH);
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
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ns-resize"
      >
        {/* Sliced circular disks stacked along height */}
        {Array.from({ length: h }, (_, k) => {
          const cy = BOT_CY - k * diskH;
          const isTop = k === h - 1;

          return (
            <g key={k}>
              {/* Lower half of disk ellipse rim */}
              <path
                d={`M ${CX - RX} ${cy} A ${RX} ${RY} 0 0 0 ${CX + RX} ${cy}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth={1.2}
                strokeDasharray="2 2"
              />
              {/* Upper half of bottom base is dashed */}
              {k === 0 && (
                <path
                  d={`M ${CX - RX} ${cy} A ${RX} ${RY} 0 0 1 ${CX + RX} ${cy}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              {/* If it's the topmost active disk, draw its full solid top ellipse */}
              {isTop && (
                <ellipse
                  cx={CX}
                  cy={topCY}
                  rx={RX}
                  ry={RY}
                  fill="rgba(94, 232, 255, 0.38)"
                  stroke="rgba(255, 255, 255, 0.95)"
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}

        {/* Cylinder Body Sides */}
        <line x1={CX - RX} y1={BOT_CY} x2={CX - RX} y2={topCY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        <line x1={CX + RX} y1={BOT_CY} x2={CX + RX} y2={topCY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Bottom base visible front curve */}
        <path
          d={`M ${CX - RX} ${BOT_CY} A ${RX} ${RY} 0 0 0 ${CX + RX} ${BOT_CY}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
        />

        {/* Top Base Radius line */}
        <line x1={CX} y1={topCY} x2={CX + RX} y2={topCY} stroke={COLOR_RADIUS} strokeWidth={2.2} strokeDasharray="4 2" />
        <circle cx={CX} cy={topCY} r={3} fill="#ffffff" />
        <circle cx={CX + RX} cy={topCY} r={3.5} fill={COLOR_RADIUS} />

        {/* Top Drag Handle Indicator */}
        <g className="pointer-events-none">
          <circle cx={CX} cy={topCY - RY} r={11} fill="none" stroke={COLOR_HEIGHT} strokeWidth={1.5} opacity={0.6} className="animate-pulse" />
          <circle cx={CX} cy={topCY - RY} r={7} fill="rgba(94, 232, 255, 0.45)" stroke={COLOR_HEIGHT} strokeWidth={2} />
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
          <span>V</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">π ·</span>
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
