"use client";

import React, { useState, useCallback } from "react";

type InteractiveRegularPolygonProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;
const R = 54;

const COLOR_CYAN = "#5ee8ff"; // Interior angle
const COLOR_GOLD = "#ffd45e"; // Side length

export function InteractiveRegularPolygonExplorer({ color }: InteractiveRegularPolygonProps) {
  const [n, setN] = useState(6); // Hexagon
  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const interiorAngle = ((n - 2) * 180) / n;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible">
        {/* Polygon Interior Fill */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Vertex Angle Arcs & Dots */}
        {vertices.map((v, i) => {
          const prevV = vertices[(i - 1 + n) % n];
          const nextV = vertices[(i + 1) % n];
          return (
            <g key={i}>
              <circle cx={v.x} cy={v.y} r={3.5} fill="#ffffff" />
            </g>
          );
        })}

        {/* Side Hash Marks for Equilateral/Equiangular */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const mx = (v.x + nextV.x) / 2;
          const my = (v.y + nextV.y) / 2;
          return <circle key={`tick-${i}`} cx={mx} cy={my} r={2} fill={COLOR_GOLD} />;
        })}

        {/* Interior Angle Label at Apex */}
        <text
          x={CX}
          y={CY - R + 22}
          textAnchor="middle"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_CYAN}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {interiorAngle}°
        </text>
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
          <span className="text-sm font-extrabold text-white">Regular {n}-gon</span>
          <span className="text-xs font-semibold text-white/70">All {n} sides & angles equal</span>
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
          <span className="text-white">Each Angle</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">({n} − 2)·180° ÷ {n}</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_CYAN }} className="font-extrabold">{interiorAngle}°</span>
        </div>
      </div>
    </div>
  );
}
