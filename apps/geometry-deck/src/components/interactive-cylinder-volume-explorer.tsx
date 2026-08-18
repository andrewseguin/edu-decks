"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCylinderVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_HEIGHT = "#ffd45e"; // Warm Gold (h)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveCylinderVolumeExplorer({ color }: InteractiveCylinderVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const BOT_CY = 120;
  const RX = 48;
  const RY = 14;

  const r = 3; // radius units
  const maxDisks = 4;
  const [h, setH] = useState(4); // height/disks [1..4]
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const startHRef = useRef<number>(h);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseAreaCoeff = r * r;
  const volCoeff = baseAreaCoeff * h;

  const diskH = 18;
  const currentTotalH = h * diskH;
  const topCY = BOT_CY - currentTotalH;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHRef.current = h;
    (e.target as Element).setPointerCapture(e.pointerId);
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
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
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
        <line x1={CX} y1={topCY} x2={CX + RX} y2={topCY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
        <circle cx={CX} cy={topCY} r={3} fill="#ffffff" />
        <circle cx={CX + RX} cy={topCY} r={3} fill={COLOR_RADIUS} />

        {/* Top Drag Handle */}
        <g
          className="cursor-ns-resize"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <circle cx={CX} cy={topCY - RY} r={14} fill="transparent" />
          <circle cx={CX} cy={topCY - RY} r={6} fill="rgba(255, 212, 94, 0.35)" stroke={COLOR_HEIGHT} strokeWidth={1.5} />
          <circle cx={CX} cy={topCY - RY} r={2.5} fill="#ffffff" />
        </g>

        {/* Radius Label */}
        <text
          x={CX + RX / 2}
          y={topCY - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_RADIUS}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {r}
        </text>

        {/* Height Label */}
        <text
          x={CX - RX - 12}
          y={(BOT_CY + topCY) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {h}
        </text>
      </svg>

      {/* Stepper Controls for Height / Disks in Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setH((p) => Math.max(1, p - 1))}
          disabled={h <= 1}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          −
        </button>
        <div className="flex items-center px-2 py-0.5 text-xs sm:text-sm font-headline font-bold text-white">
          {h} of {maxDisks} Disk Layers (Base Area = {baseAreaCoeff}π)
        </div>
        <button
          onClick={() => setH((p) => Math.min(maxDisks, p + 1))}
          disabled={h >= maxDisks}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          +
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">V</span>
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
