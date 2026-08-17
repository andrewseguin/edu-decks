"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePolygonInteriorSumProps = {
  color?: string;
};

const SVG_H = 175;
const R = 68;

const POLY_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
  11: "Hendecagon",
  12: "Dodecagon",
};

const TRI_THEMES = [
  { fill: "rgba(216, 180, 254, 0.28)", stroke: "#d8b4fe" }, // Lilac
  { fill: "rgba(251, 146, 60, 0.28)",  stroke: "#fb923c" }, // Amber Orange
  { fill: "rgba(52, 211, 153, 0.28)",  stroke: "#34d399" }, // Emerald Mint
  { fill: "rgba(244, 114, 182, 0.28)", stroke: "#f472b6" }, // Pink
  { fill: "rgba(94, 232, 255, 0.28)",  stroke: "#5ee8ff" }, // Cyan
  { fill: "rgba(250, 204, 21, 0.28)",  stroke: "#facc15" }, // Gold
  { fill: "rgba(167, 139, 250, 0.28)", stroke: "#a78bfa" }, // Purple
  { fill: "rgba(56, 189, 248, 0.28)",  stroke: "#38bdf8" }, // Sky
  { fill: "rgba(248, 113, 113, 0.28)", stroke: "#f87171" }, // Red-Coral
  { fill: "rgba(74, 222, 128, 0.28)",  stroke: "#4ade80" }, // Green
];

const COLOR_GOLD = "#ffd45e";
const COLOR_WHITE = "#ffffff";

export function InteractivePolygonInteriorSumExplorer({ color }: InteractivePolygonInteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 84;

  const [n, setN] = useState(5); // n in [3..12]

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Compute vertices (upright with apex hub at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const numTriangles = n - 2;
  const totalSum = numTriangles * 180;
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  const hubV = vertices[0];
  const rightFlankV = vertices[1];
  const leftFlankV = vertices[n - 1];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible"
      >
        {/* Render internal triangulated fan triangles with matching fills */}
        {Array.from({ length: numTriangles }, (_, i) => {
          const v0 = hubV;
          const v1 = vertices[i + 1];
          const v2 = vertices[i + 2];
          const pathD = `M ${v0.x} ${v0.y} L ${v1.x} ${v1.y} L ${v2.x} ${v2.y} Z`;
          const triTheme = TRI_THEMES[i % TRI_THEMES.length];
          const triCenter = {
            x: (v0.x + v1.x + v2.x) / 3,
            y: (v0.y + v1.y + v2.y) / 3,
          };
          return (
            <g key={`tri-${i}`}>
              <path
                d={pathD}
                fill={triTheme.fill}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={triCenter.x}
                y={triCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={n >= 9 ? 9 : 11.5}
                fontWeight="900"
                fill="rgba(255,255,255,0.95)"
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.85))" }}
              >
                180°
              </text>
            </g>
          );
        })}

        {/* 2 Hub Flank Outer Edges (The -2 non-base sides connected to the hub) */}
        <line
          x1={hubV.x}
          y1={hubV.y}
          x2={rightFlankV.x}
          y2={rightFlankV.y}
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={leftFlankV.x}
          y1={leftFlankV.y}
          x2={hubV.x}
          y2={hubV.y}
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* The (n - 2) Outer Base Edges, Color-Coded to Each Triangle */}
        {Array.from({ length: numTriangles }, (_, i) => {
          const v1 = vertices[i + 1];
          const v2 = vertices[i + 2];
          const triTheme = TRI_THEMES[i % TRI_THEMES.length];
          return (
            <line
              key={`edge-${i}`}
              x1={v1.x}
              y1={v1.y}
              x2={v2.x}
              y2={v2.y}
              stroke={triTheme.stroke}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Non-hub Vertex Corner Dots */}
        {vertices.slice(1).map((v, i) => (
          <circle key={`v-${i + 1}`} cx={v.x} cy={v.y} r={n > 8 ? 2.5 : 3.5} fill="#ffffff" />
        ))}

        {/* Golden Hub Apex Vertex with Ring */}
        <circle cx={hubV.x} cy={hubV.y} r={n > 8 ? 5 : 6} fill={COLOR_GOLD} stroke="#ffffff" strokeWidth={2} />
      </svg>

      {/* Stepper Controls for n with Fixed Width to prevent +/- button jumping */}
      <div className="flex items-center justify-between w-[310px] sm:w-[330px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Decrease sides"
        >
          −
        </button>
        <div className="flex-1 text-center px-1 text-xs sm:text-sm font-headline font-bold text-white whitespace-nowrap">
          {polyName} ({n} sides · {numTriangles} triangles)
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

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">Sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white/90">
            (<span style={{ color: COLOR_GOLD }}>{n}</span> − 2) · 180°
          </span>
          <span className="text-white/50">=</span>
          <span className="text-white/90">{numTriangles} · 180°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{totalSum}°</span>
        </div>
      </div>
    </div>
  );
}
