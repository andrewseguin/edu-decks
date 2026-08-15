"use client";

import React, { useState, useCallback } from "react";

type InteractivePolygonInteriorSumProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;
const R = 54;

const POLY_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
};

const TRI_COLORS = [
  "rgba(94, 232, 255, 0.25)",
  "rgba(255, 212, 94, 0.25)",
  "rgba(216, 180, 254, 0.25)",
  "rgba(244, 114, 182, 0.25)",
  "rgba(52, 211, 153, 0.25)",
  "rgba(251, 146, 60, 0.25)",
  "rgba(167, 139, 250, 0.25)",
  "rgba(129, 140, 248, 0.25)",
];

const COLOR_GOLD = "#ffd45e";
const COLOR_CYAN = "#5ee8ff";

export function InteractivePolygonInteriorSumExplorer({ color }: InteractivePolygonInteriorSumProps) {
  const [n, setN] = useState(5); // n in [3..8]

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute vertices
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const numTriangles = n - 2;
  const totalSum = numTriangles * 180;
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible">
        {/* Render internal triangulated fan triangles */}
        {Array.from({ length: numTriangles }, (_, i) => {
          const v0 = vertices[0];
          const v1 = vertices[i + 1];
          const v2 = vertices[i + 2];
          const pathD = `M ${v0.x} ${v0.y} L ${v1.x} ${v1.y} L ${v2.x} ${v2.y} Z`;
          const triCenter = {
            x: (v0.x + v1.x + v2.x) / 3,
            y: (v0.y + v1.y + v2.y) / 3,
          };
          return (
            <g key={i}>
              <path d={pathD} fill={TRI_COLORS[i % TRI_COLORS.length]} stroke={COLOR_CYAN} strokeWidth={1.5} strokeDasharray="3 2" />
              <text x={triCenter.x} y={triCenter.y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="800" fill="rgba(255,255,255,0.9)">
                180°
              </text>
            </g>
          );
        })}

        {/* Outer boundary polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Vertices Dots */}
        {vertices.map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={i === 0 ? COLOR_GOLD : "#ffffff"} />
        ))}
      </svg>

      {/* Stepper Controls for n */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-all border bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          −
        </button>
        <div className="flex flex-col items-center min-w-[130px]">
          <span className="text-sm font-extrabold text-white">{polyName}</span>
          <span className="text-xs font-semibold text-white/70">n = {n} sides · {numTriangles} triangles</span>
        </div>
        <button
          onClick={() => setN((prev) => Math.min(8, prev + 1))}
          disabled={n >= 8}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-all border bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          +
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">Sum</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">(</span>
          <span style={{ color: COLOR_GOLD }}>{n}</span>
          <span className="text-white/80">− 2) · 180°</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_CYAN }}>{numTriangles} · 180°</span>
          <span className="text-white/60">=</span>
          <span className="text-white font-extrabold">{totalSum}°</span>
        </div>
      </div>
    </div>
  );
}
