"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveConeVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_HEIGHT = "#ffd45e"; // Warm Gold (h)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveConeVolumeExplorer({ color }: InteractiveConeVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const BOT_CY = 125;
  const RX = 50;
  const RY = 14;

  const r = 3; // radius units
  const [h, setH] = useState(6); // height units [3, 6, 9]

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseAreaCoeff = r * r; // 9
  const volCoeff = (baseAreaCoeff * h) / 3; // exact integer when h is multiple of 3

  const hPx = Math.min(95, h * 12);
  const apexY = BOT_CY - hPx;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {/* Ghost Equivalent Cylinder Outline */}
        <g opacity={0.35}>
          <line x1={CX - RX} y1={BOT_CY} x2={CX - RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={CX + RX} y1={BOT_CY} x2={CX + RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <ellipse cx={CX} cy={apexY} rx={RX} ry={RY} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
        </g>

        {/* Base Ellipse */}
        <ellipse cx={CX} cy={BOT_CY} rx={RX} ry={RY} fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Cone Lateral Surface */}
        <path
          d={`M ${CX - RX} ${BOT_CY} L ${CX} ${apexY} L ${CX + RX} ${BOT_CY} A ${RX} ${RY} 0 0 1 ${CX - RX} ${BOT_CY} Z`}
          fill="rgba(94, 232, 255, 0.25)"
        />
        <line x1={CX - RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        <line x1={CX + RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Apex Point Dot */}
        <circle cx={CX} cy={apexY} r={3.5} fill="#ffffff" />

        {/* Height line inside from apex to base center */}
        <circle cx={CX} cy={BOT_CY} r={3} fill="#ffffff" />
        <line x1={CX} y1={apexY} x2={CX} y2={BOT_CY} stroke={COLOR_HEIGHT} strokeWidth={1.5} strokeDasharray="3 2" />

        {/* Radius line on bottom base */}
        <line x1={CX} y1={BOT_CY} x2={CX + RX} y2={BOT_CY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
        <circle cx={CX + RX} cy={BOT_CY} r={3} fill={COLOR_RADIUS} />

        {/* Radius Label */}
        <text
          x={CX + RX / 2}
          y={BOT_CY + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_RADIUS}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {r}
        </text>

        {/* Height Label */}
        <text
          x={CX - 12}
          y={(apexY + BOT_CY) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {h}
        </text>
      </svg>

      {/* Stepper Controls for Height in Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setH((p) => Math.max(3, p - 3))}
          disabled={h <= 3}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          −
        </button>
        <div className="flex items-center px-2 py-0.5 text-xs sm:text-sm font-headline font-bold text-white">
          Height h = {h} (Exactly ⅓ of cylinder)
        </div>
        <button
          onClick={() => setH((p) => Math.min(9, p + 3))}
          disabled={h >= 9}
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
