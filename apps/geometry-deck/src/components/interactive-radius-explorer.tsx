"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveRadiusExplorerProps = {
  mode?: "radius" | "diameter";
  color?: string;
};

const SVG_H = 220;
const GRID_STEP = 12; // 12px per grid unit

const MIN_R = 1;
const MAX_R = 8;

const COLOR_RADIUS = "#5ee8ff";   // Electric Cyan

export function InteractiveRadiusExplorer({ mode = "radius", color }: InteractiveRadiusExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(360);
  const containerW = Math.max(340, Math.min(650, rawW - 16));
  const SVG_W = containerW;
  const CX = SVG_W / 2;
  const CY = SVG_H / 2;

  // Integer Radius units (1 .. 8)
  const [radiusUnits, setRadiusUnits] = useState(5);
  const [angleDeg, setAngleDeg] = useState(35);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const CR = radiusUnits * GRID_STEP;

  const rad = (angleDeg * Math.PI) / 180;
  const pX = CX + CR * Math.cos(rad);
  const pY = CY - CR * Math.sin(rad);

  const oppX = CX - CR * Math.cos(rad);
  const oppY = CY + CR * Math.sin(rad);

  // Direct 2D dragging: dragging inward/outward changes radius (1..6), dragging around rotates angle
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

      const dx = px - CX;
      const dy = CY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Snap radius units safely within bounds [MIN_R, MAX_R]
      const units = Math.max(MIN_R, Math.min(MAX_R, Math.round(dist / GRID_STEP)));
      setRadiusUnits(units);

      // Angle
      const ang = Math.atan2(dy, dx) * (180 / Math.PI);
      setAngleDeg(Math.round((ang + 360) % 360));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, CY, SVG_W]);

  const isDiameter = mode === "diameter";
  const diameterUnits = radiusUnits * 2;

  // Grid bounds for Cartesian plane
  const gridXCount = 12;
  const gridYCount = 8;

  const xGridLines: number[] = [];
  for (let i = -gridXCount; i <= gridXCount; i++) {
    xGridLines.push(CX + i * GRID_STEP);
  }

  const yGridLines: number[] = [];
  for (let j = -gridYCount; j <= gridYCount; j++) {
    yGridLines.push(CY + j * GRID_STEP);
  }

  // Midpoint of radius line (handle side)
  const midX = (CX + pX) / 2;
  const midY = (CY + pY) / 2;

  // Midpoint of opposite radius line (opposite side)
  const midOppX = (CX + oppX) / 2;
  const midOppY = (CY + oppY) / 2;

  // Perpendicular normal offset vector
  const normX = Math.sin(rad);
  const normY = Math.cos(rad);

  // Adaptive offset based on angle
  const offsetR = 14 + 5 * Math.abs(Math.sin(rad));

  // Radius label positions
  const r1LabelX = midX - offsetR * normX;
  const r1LabelY = midY - offsetR * normY;
  const r2LabelX = midOppX - offsetR * normX;
  const r2LabelY = midOppY - offsetR * normY;

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full max-w-[650px] mx-auto select-none py-1" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default", maxHeight: 200 }}
      >
        {/* Subtle Cartesian Unit Grid Background */}
        <g opacity={0.3}>
          {xGridLines.map((gx) => (
            <line
              key={`gx-${gx}`}
              x1={gx}
              y1={CY - gridYCount * GRID_STEP}
              x2={gx}
              y2={CY + gridYCount * GRID_STEP}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          ))}
          {yGridLines.map((gy) => (
            <line
              key={`gy-${gy}`}
              x1={CX - gridXCount * GRID_STEP}
              y1={gy}
              x2={CX + gridXCount * GRID_STEP}
              y2={gy}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          ))}
        </g>

        {/* Dynamic Circle Disc Fill & Boundary */}
        <circle
          cx={CX}
          cy={CY}
          r={CR}
          fill="rgba(255, 255, 255, 0.10)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.4}
        />

        {/* Major Cartesian Center Axes (X & Y) */}
        <g opacity={0.65}>
          {/* X Axis */}
          <line
            x1={CX - gridXCount * GRID_STEP - 4}
            y1={CY}
            x2={CX + gridXCount * GRID_STEP + 4}
            y2={CY}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth={1.5}
          />
          {/* Y Axis */}
          <line
            x1={CX}
            y1={CY - gridYCount * GRID_STEP - 4}
            x2={CX}
            y2={CY + gridYCount * GRID_STEP + 4}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth={1.5}
          />

          {/* Subtle axis tick marks along X-Axis */}
          {[-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8].map((u) => (
            <line
              key={`xtick-${u}`}
              x1={CX + u * GRID_STEP}
              y1={CY - 2.5}
              x2={CX + u * GRID_STEP}
              y2={CY + 2.5}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth={1.2}
            />
          ))}
        </g>

        {/* Diameter Line or Radius Line */}
        {isDiameter ? (
          <>
            {/* Two Cyan Radius Halves (Center -> Handle and Center -> Opposite) */}
            <line x1={CX} y1={CY} x2={pX} y2={pY} stroke={COLOR_RADIUS} strokeWidth={2.8} strokeDasharray="4 3" strokeLinecap="round" />
            <line x1={CX} y1={CY} x2={oppX} y2={oppY} stroke={COLOR_RADIUS} strokeWidth={2.8} strokeDasharray="4 3" strokeLinecap="round" />
            
            <circle cx={oppX} cy={oppY} r={3.5} fill={COLOR_RADIUS} />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_RADIUS} />

            {/* Labels on both radius halves */}
            <text
              x={r1LabelX}
              y={r1LabelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              r = {radiusUnits}
            </text>
            <text
              x={r2LabelX}
              y={r2LabelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              r = {radiusUnits}
            </text>
          </>
        ) : (
          <>
            {/* Radius Segment */}
            <line x1={CX} y1={CY} x2={pX} y2={pY} stroke={COLOR_RADIUS} strokeWidth={3.0} strokeDasharray="4 3" strokeLinecap="round" />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_RADIUS} />
            {/* Perpendicularly offset label */}
            <text
              x={r1LabelX}
              y={r1LabelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              r = {radiusUnits}
            </text>
          </>
        )}

        {/* Center Origin Point Dot */}
        <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

        {/* Interactive Drag Handle on circumference */}
        <g transform={`translate(${pX}, ${pY})`} className="cursor-grab active:cursor-grabbing" onPointerDown={handlePointerDown}>
          <circle r={24} fill="transparent" />
          <circle
            r={10}
            fill="rgba(255, 255, 255, 0.25)"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth={1.8}
            className={cn("transition-transform", isDragging && "scale-110")}
          />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        {isDiameter ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-5 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">d</span>
            <span className="text-white/50">=</span>
            <span className="text-white font-bold">2 ·</span>
            <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}</span>
            <span className="text-white/50">=</span>
            <span className="text-white font-bold">{diameterUnits}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 px-5 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">radius</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_RADIUS }} className="font-bold">r</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}</span>
          </div>
        )}
      </div>
    </div>
  );
}
