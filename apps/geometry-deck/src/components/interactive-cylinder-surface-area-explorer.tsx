"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveCylinderSurfaceAreaProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r, base circles)
const COLOR_CIRCUM = "#d8b4fe"; // Soft Lilac (2πr lateral width)
const COLOR_HEIGHT = "#ffd45e"; // Warm Gold (h)
const COLOR_SA = "#ffffff";     // Bold Crisp White

export function InteractiveCylinderSurfaceAreaExplorer({ color }: InteractiveCylinderSurfaceAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [r, setR] = useState(3);
  const [h, setH] = useState(4);
  const [step, setStep] = useState<1 | 2>(1);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseDiskArea = r * r; // πr²
  const twoBasesArea = 2 * baseDiskArea; // 2πr²
  const lateralArea = 2 * r * h; // 2πrh
  const totalSA = twoBasesArea + lateralArea;

  // Step 1: 3D Cylinder Geometry
  const BOT_CY = 120;
  const RX = 46;
  const RY = 13;
  const cylH = 65;
  const topCY = BOT_CY - cylH;

  // Step 2: 2D Net layout
  // Center rectangle: width 110, height 55 centered at CX, 75
  const rectW = 114;
  const rectH = 52;
  const rectX = CX - rectW / 2;
  const rectY = 75 - rectH / 2;
  const diskR = 19;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: 3D Cylinder with Base & Lateral Highlights */
          <g>
            {/* Bottom Base Ellipse */}
            <ellipse cx={CX} cy={BOT_CY} rx={RX} ry={RY} fill="rgba(94, 232, 255, 0.25)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Lateral Surface Body */}
            <path
              d={`M ${CX - RX} ${topCY} L ${CX - RX} ${BOT_CY} A ${RX} ${RY} 0 0 0 ${CX + RX} ${BOT_CY} L ${CX + RX} ${topCY} Z`}
              fill="rgba(216, 180, 254, 0.16)"
            />
            <line x1={CX - RX} y1={topCY} x2={CX - RX} y2={BOT_CY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
            <line x1={CX + RX} y1={topCY} x2={CX + RX} y2={BOT_CY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Top Base Ellipse */}
            <ellipse cx={CX} cy={topCY} rx={RX} ry={RY} fill="rgba(94, 232, 255, 0.40)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Radius Line on Top Base */}
            <line x1={CX} y1={topCY} x2={CX + RX} y2={topCY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={CX} cy={topCY} r={3} fill="#ffffff" />
            <circle cx={CX + RX} cy={topCY} r={3} fill={COLOR_RADIUS} />

            {/* Height Line on Side */}
            <line x1={CX + RX + 12} y1={topCY} x2={CX + RX + 12} y2={BOT_CY} stroke={COLOR_HEIGHT} strokeWidth={1.5} strokeDasharray="2 2" />
            <circle cx={CX + RX + 12} cy={topCY} r={2.5} fill={COLOR_HEIGHT} />
            <circle cx={CX + RX + 12} cy={BOT_CY} r={2.5} fill={COLOR_HEIGHT} />

            {/* Labels */}
            <text x={CX + RX / 2} y={topCY - 11} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="800" fill={COLOR_RADIUS} fontFamily="var(--font-heading, system-ui)">
              r = {r}
            </text>
            <text x={CX + RX + 24} y={(topCY + BOT_CY) / 2} textAnchor="start" dominantBaseline="central" fontSize={12} fontWeight="800" fill={COLOR_HEIGHT} fontFamily="var(--font-heading, system-ui)">
              h = {h}
            </text>
            <text x={CX} y={topCY + 18} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold" fill="rgba(255, 255, 255, 0.8)">
              Top Disk: πr² ({baseDiskArea}π)
            </text>
            <text x={CX} y={(topCY + BOT_CY) / 2 + 10} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight="bold" fill={COLOR_CIRCUM}>
              Lateral Wall: 2πrh ({lateralArea}π)
            </text>
          </g>
        ) : (
          /* Step 2: Unrolled 2D Net (Top Circle + Rectangle + Bottom Circle) */
          <g>
            {/* Top Disk */}
            <circle cx={CX} cy={rectY - diskR - 2} r={diskR} fill="rgba(94, 232, 255, 0.35)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={1.6} />
            <circle cx={CX} cy={rectY - diskR - 2} r={2.5} fill="#ffffff" />
            <line x1={CX} y1={rectY - diskR - 2} x2={CX + diskR} y2={rectY - diskR - 2} stroke={COLOR_RADIUS} strokeWidth={1.5} strokeDasharray="2 2" />
            <text x={CX} y={rectY - diskR - 2} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight="800" fill="#ffffff">
              πr² ({baseDiskArea}π)
            </text>

            {/* Lateral Rectangle */}
            <rect x={rectX} y={rectY} width={rectW} height={rectH} fill="rgba(216, 180, 254, 0.22)" stroke={COLOR_CIRCUM} strokeWidth={2} />
            <text x={CX} y={rectY + rectH / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="800" fill={COLOR_CIRCUM} fontFamily="var(--font-heading, system-ui)">
              Lateral Area = (2πr) · h = {lateralArea}π
            </text>

            {/* Width (Circumference) Label on top of rectangle */}
            <text x={CX} y={rectY - 6} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="800" fill={COLOR_CIRCUM}>
              Circumference = 2πr ({2 * r}π)
            </text>

            {/* Height Label on left of rectangle */}
            <text x={rectX - 8} y={rectY + rectH / 2} textAnchor="end" dominantBaseline="central" fontSize={10.5} fontWeight="800" fill={COLOR_HEIGHT}>
              h = {h}
            </text>

            {/* Bottom Disk */}
            <circle cx={CX} cy={rectY + rectH + diskR + 2} r={diskR} fill="rgba(94, 232, 255, 0.35)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={1.6} />
            <circle cx={CX} cy={rectY + rectH + diskR + 2} r={2.5} fill="#ffffff" />
            <line x1={CX} y1={rectY + rectH + diskR + 2} x2={CX + diskR} y2={rectY + rectH + diskR + 2} stroke={COLOR_RADIUS} strokeWidth={1.5} strokeDasharray="2 2" />
            <text x={CX} y={rectY + rectH + diskR + 2} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight="800" fill="#ffffff">
              πr² ({baseDiskArea}π)
            </text>
          </g>
        )}
      </svg>

      {/* Step Navigation & Dimension Steppers in Frosted Capsules */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-30 select-none">
        {/* Step Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setStep(1)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 1 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            1. 3D Cylinder
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. Unroll Net Proof
          </button>
        </div>

        {/* Radius Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setR((p) => Math.max(2, p - 1))}
            disabled={r <= 2}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">r = {r}</span>
          <button
            onClick={() => setR((p) => Math.min(5, p + 1))}
            disabled={r >= 5}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>

        {/* Height Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setH((p) => Math.max(2, p - 1))}
            disabled={h <= 2}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">h = {h}</span>
          <button
            onClick={() => setH((p) => Math.min(6, p + 1))}
            disabled={h >= 6}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-4 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">SA</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_RADIUS }}>2π({r}²)</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_CIRCUM }}>2π({r})({h})</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_RADIUS }}>{twoBasesArea}π</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_CIRCUM }}>{lateralArea}π</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_SA }} className="font-bold text-sm sm:text-base">{totalSA}π</span>
        </div>
      </div>
    </div>
  );
}
