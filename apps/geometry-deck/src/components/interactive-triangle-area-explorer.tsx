"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveTriangleAreaExplorerProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const BASE_Y = 122;
const B1_X = 45;  // left base vertex
const B2_X = 195; // right base vertex
const BASE_LEN_PX = B2_X - B1_X; // 150 px
const PX_PER_UNIT = 15; // 15 px = 1 unit => base = 10 units
const BASE_UNITS = BASE_LEN_PX / PX_PER_UNIT; // 10

const COLOR_BASE = "#ffd45e";   // gold / yellow
const COLOR_HEIGHT = "#5ee8ff"; // cyan
const COLOR_AREA = "#34d399";   // emerald / green
const COLOR_BOX = "rgba(255, 255, 255, 0.4)";

/** Round to 4dp to avoid SSR/client floating-point hydration mismatches */
const rnd = (n: number) => Math.round(n * 10000) / 10000;

export function InteractiveTriangleAreaExplorer({ color }: InteractiveTriangleAreaExplorerProps) {
  // Apex position in SVG coordinates (starts at a natural scalene triangle with h=6)
  const [apex, setApex] = useState({ x: 105, y: 32 }); // h = (122 - 32)/15 = 6 units
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const clampApex = (x: number, y: number) => {
    // Restrict apex strictly within base segment [B1_X, B2_X] so the triangle is always inside the b x h box
    const cx = Math.max(B1_X, Math.min(B2_X, x));
    const cy = Math.max(20, Math.min(BASE_Y - 20, y));
    return { x: rnd(cx), y: rnd(cy) };
  };

  // Pointer drag handler on apex
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;
    const scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;
      setApex(clampApex(px, py));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const { x: apexX, y: apexY } = apex;

  // Exact integer numerical values
  const heightPx = BASE_Y - apexY;
  const heightUnits = Math.max(2, Math.min(7, Math.round(heightPx / PX_PER_UNIT)));
  const baseUnits = BASE_UNITS; // 10
  const areaUnits = (baseUnits * heightUnits) / 2; // Always integer (5 * h)

  // Right-angle square orientation
  const sq = 8;
  const sqDir = apexX > B2_X - sq ? -sq : sq;

  // Altitude label horizontal placement
  const altLabelX = apexX + (apexX > (B1_X + B2_X) / 2 ? -9 : 9);
  const altLabelAnchor = apexX > (B1_X + B2_X) / 2 ? "end" : "start";

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Unit Grid Lines inside the Bounding Box */}
        <g opacity={0.35}>
          {Array.from({ length: 9 }).map((_, i) => {
            const gx = B1_X + (i + 1) * PX_PER_UNIT;
            return (
              <line
                key={`vg-${i}`}
                x1={gx}
                y1={apexY}
                x2={gx}
                y2={BASE_Y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={0.75}
                strokeDasharray="2 2"
              />
            );
          })}
          {Array.from({ length: Math.max(0, heightUnits - 1) }).map((_, j) => {
            const gy = BASE_Y - (j + 1) * PX_PER_UNIT;
            if (gy <= apexY) return null;
            return (
              <line
                key={`hg-${j}`}
                x1={B1_X}
                y1={gy}
                x2={B2_X}
                y2={gy}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={0.75}
                strokeDasharray="2 2"
              />
            );
          })}
        </g>

        {/* 2. Bounding Box Border */}
        <rect
          x={B1_X}
          y={apexY}
          width={BASE_LEN_PX}
          height={heightPx}
          fill="none"
          stroke={COLOR_BOX}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          rx={1}
        />

        {/* 3. Triangle Luminous Fill */}
        <polygon
          points={`${B1_X},${BASE_Y} ${B2_X},${BASE_Y} ${apexX},${apexY}`}
          fill="rgba(255, 255, 255, 0.16)"
        />

        {/* 4. Altitude (height) vertical dashed line */}
        <line
          x1={apexX}
          y1={apexY}
          x2={apexX}
          y2={BASE_Y}
          stroke={COLOR_HEIGHT}
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {/* Right-angle square indicator at base of altitude */}
        <path
          d={`M ${apexX + sqDir} ${BASE_Y} L ${apexX + sqDir} ${BASE_Y - sq} L ${apexX} ${BASE_Y - sq}`}
          fill="none"
          stroke={COLOR_HEIGHT}
          strokeWidth={1.5}
          strokeOpacity={0.8}
        />

        {/* Triangle edges */}
        <line
          x1={B1_X}
          y1={BASE_Y}
          x2={apexX}
          y2={apexY}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={B2_X}
          y1={BASE_Y}
          x2={apexX}
          y2={apexY}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Highlighted Base line */}
        <line
          x1={B1_X}
          y1={BASE_Y}
          x2={B2_X}
          y2={BASE_Y}
          stroke={COLOR_BASE}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Base vertex dots */}
        <circle cx={B1_X} cy={BASE_Y} r={3.5} fill="white" />
        <circle cx={B2_X} cy={BASE_Y} r={3.5} fill="white" />

        {/* Height label 'h' */}
        <text
          x={altLabelX}
          y={apexY + heightPx / 2}
          textAnchor={altLabelAnchor}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={800}
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          h = {heightUnits}
        </text>

        {/* Base label 'b' */}
        <text
          x={(B1_X + B2_X) / 2}
          y={BASE_Y + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={800}
          fill={COLOR_BASE}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          b = {baseUnits}
        </text>

        {/* Draggable Apex handle */}
        <circle
          cx={apexX}
          cy={apexY}
          r={12}
          fill="rgba(255, 255, 255, 0.2)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown}
        />
        <circle cx={apexX} cy={apexY} r={4} fill="white" className="pointer-events-none" />
      </svg>

      {/* Live calculation formula display */}
      <div
        className="flex items-center gap-2 justify-center text-base sm:text-lg font-bold font-headline select-none mt-1"
        style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.4))" }}
      >
        <span className="text-white">A</span>
        <span className="text-white/50">=</span>
        <StackedFraction numerator="1" denominator="2" className="text-white" />
        <span className="text-white/50">·</span>
        <span style={{ color: COLOR_BASE }}>{baseUnits}</span>
        <span className="text-white/50">·</span>
        <span style={{ color: COLOR_HEIGHT }}>{heightUnits}</span>
        <span className="text-white/50">=</span>
        <span
          className="px-2.5 py-0.5 rounded-lg font-bold text-white shadow-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1.5px solid rgba(255, 255, 255, 0.65)",
          }}
        >
          {areaUnits}
        </span>
      </div>
    </div>
  );
}
