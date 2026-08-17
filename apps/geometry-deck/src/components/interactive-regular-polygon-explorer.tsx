"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveRegularPolygonProps = {
  mode?: "regular" | "each-angle";
  color?: string;
};

const SVG_H = 175;
const R = 64;

const COLOR_GOLD = "#ffd45e";  // Warm Gold (Side ticks in 'regular' mode)
const COLOR_LILAC = "#d8b4fe"; // Lilac / Lavender (Interior angles)

const POLYGON_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Square",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
  11: "Hendecagon",
  12: "Dodecagon",
};

export function InteractiveRegularPolygonExplorer({ mode = "regular", color }: InteractiveRegularPolygonProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 82;

  const [n, setN] = useState(mode === "each-angle" ? 7 : 6);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const sumAngle = (n - 2) * 180;
  const interiorAngle = Math.round((sumAngle / n) * 10) / 10;

  // Compute congruent interior angle sector / arc paths
  const arcRadius = Math.max(12, Math.min(22, 110 / n));
  const angleSectors = vertices.map((v, i) => {
    const prevV = vertices[(i - 1 + n) % n];
    const nextV = vertices[(i + 1) % n];

    const d1x = prevV.x - v.x;
    const d1y = prevV.y - v.y;
    const len1 = Math.hypot(d1x, d1y);

    const d2x = nextV.x - v.x;
    const d2y = nextV.y - v.y;
    const len2 = Math.hypot(d2x, d2y);

    const u1x = d1x / len1;
    const u1y = d1y / len1;
    const u2x = d2x / len2;
    const u2y = d2y / len2;

    const p1x = v.x + arcRadius * u1x;
    const p1y = v.y + arcRadius * u1y;
    const p2x = v.x + arcRadius * u2x;
    const p2y = v.y + arcRadius * u2y;

    const cross = u1x * u2y - u1y * u2x;
    const sweep = cross > 0 ? 1 : 0;

    return {
      sectorD: `M ${v.x} ${v.y} L ${p1x} ${p1y} A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${p2x} ${p2y} Z`,
      arcD: `M ${p1x} ${p1y} A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${p2x} ${p2y}`,
    };
  });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[420px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      
      {/* Tier 2: Interactive SVG Canvas */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 170 }}
        className="w-full max-w-[340px] touch-none select-none overflow-visible"
      >
        {/* Base Polygon Interior Fill & Perimeter */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Interior Angle Arcs at All Vertices */}
        <g style={{ filter: "drop-shadow(0px 1px 4px rgba(216, 180, 254, 0.7))" }}>
          {angleSectors.map((s, i) => (
            <g key={`angle-${i}`}>
              <path
                d={s.sectorD}
                fill="rgba(216, 180, 254, 0.45)"
                stroke="none"
              />
              <path
                d={s.arcD}
                fill="none"
                stroke="#f5d0fe"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>

        {/* Side Hash Ticks for Regular Polygons (Only in 'regular' mode) */}
        {mode === "regular" && vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const mx = (v.x + nextV.x) / 2;
          const my = (v.y + nextV.y) / 2;
          const dx = nextV.x - v.x;
          const dy = nextV.y - v.y;
          const len = Math.hypot(dx, dy);
          const nx = -dy / len;
          const ny = dx / len;
          const tickLen = Math.max(3, 5 - (n - 6) * 0.3);
          return (
            <line
              key={`tick-${i}`}
              x1={mx - nx * tickLen}
              y1={my - ny * tickLen}
              x2={mx + nx * tickLen}
              y2={my + ny * tickLen}
              stroke={COLOR_GOLD}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Angle Value Positioned Directly Near Top Corner Arc (Only in 'each-angle' mode) */}
        {mode === "each-angle" && (
          <text
            x={CX}
            y={vertices[0].y + arcRadius + (n >= 8 ? 9 : 12)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={n >= 8 ? 12.5 : 14}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.8))" }}
          >
            {interiorAngle}°
          </text>
        )}
      </svg>

      {/* Tier 3: Stepper Pill Controls */}
      <div className="flex items-center justify-between w-[240px] sm:w-[260px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Decrease sides"
        >
          −
        </button>
        <div className="flex-1 text-center px-1 text-xs sm:text-sm font-headline font-bold text-white whitespace-nowrap">
          {POLYGON_NAMES[n]} (<span style={{ color: COLOR_GOLD }}>{n} sides</span>)
        </div>
        <button
          onClick={() => setN((prev) => Math.min(12, prev + 1))}
          disabled={n >= 12}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Increase sides"
        >
          +
        </button>
      </div>

      {/* Tier 4: Live Typographic Banner */}
      <div className="flex justify-center mt-0.5">
        {mode === "each-angle" ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span className="text-white">Interior angle</span>
            <span className="text-white/50">=</span>
            <span className="text-white/90">
              (<span style={{ color: COLOR_GOLD }}>{n}</span> − 2) · 180° ÷ <span style={{ color: COLOR_GOLD }}>{n}</span>
            </span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_LILAC }} className="font-bold text-sm sm:text-base">{interiorAngle}°</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span style={{ color: COLOR_GOLD }}>{n} equal sides</span>
            <span className="text-white/40">·</span>
            <span style={{ color: COLOR_LILAC }}>{n} equal angles</span>
          </div>
        )}
      </div>
    </div>
  );
}
