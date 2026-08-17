"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveRegularPolygonProps = {
  mode?: "regular" | "each-angle";
  color?: string;
};

const SVG_H = 155;
const R = 54;

const COLOR_GOLD = "#ffd45e";  // Warm Gold (Primary: Sides n, side ticks)
const COLOR_LILAC = "#d8b4fe"; // Neon Lilac / Lavender (Secondary: Interior angles, angle arcs)
const COLOR_WHITE = "#ffffff"; // Crisp White (Constants, labels)

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
  const CY = 75;

  const [n, setN] = useState(6); // Hexagon

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const sumAngle = (n - 2) * 180;
  const interiorAngle = Math.round((sumAngle / n) * 10) / 10;

  // Compute congruent interior angle arcs for all vertices (scaled gracefully up to n=12)
  const arcRadius = Math.max(6, Math.min(14, 60 / n));
  const angleArcs = vertices.map((v, i) => {
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

    return `M ${p1x} ${p1y} A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${p2x} ${p2y}`;
  });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full max-w-[420px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 135 }}
        className="w-full max-w-[320px] touch-none select-none overflow-visible"
      >
        {/* Polygon Interior Fill */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Congruent Lilac Angle Arcs at All Vertices */}
        {angleArcs.map((arcD, i) => (
          <path
            key={`arc-${i}`}
            d={arcD}
            fill="none"
            stroke={COLOR_LILAC}
            strokeWidth={n > 8 ? 1.5 : 2}
            strokeLinecap="round"
          />
        ))}

        {/* Vertex Corner Dots */}
        {vertices.map((v, i) => (
          <circle key={`v-${i}`} cx={v.x} cy={v.y} r={n > 8 ? 2.5 : 3} fill="#ffffff" />
        ))}

        {/* Side Hash Ticks for Equilateral Sides */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const mx = (v.x + nextV.x) / 2;
          const my = (v.y + nextV.y) / 2;
          const dx = nextV.x - v.x;
          const dy = nextV.y - v.y;
          const len = Math.hypot(dx, dy);
          const nx = -dy / len;
          const ny = dx / len;
          const tickLen = Math.max(2.5, 4 - (n - 6) * 0.25);
          return (
            <line
              key={`tick-${i}`}
              x1={mx - nx * tickLen}
              y1={my - ny * tickLen}
              x2={mx + nx * tickLen}
              y2={my + ny * tickLen}
              stroke={COLOR_GOLD}
              strokeWidth={n > 8 ? 1.5 : 2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Interior Angle Number (Only when mode === 'each-angle') */}
        {mode === "each-angle" && (
          <text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13.5}
            fontWeight="900"
            fill={COLOR_LILAC}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {interiorAngle}°
          </text>
        )}
      </svg>

      {/* Stepper Controls for n (Naming the shape up to n = 12 Dodecagon) */}
      <div className="flex items-center justify-between w-[230px] sm:w-[250px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Decrease sides"
        >
          −
        </button>
        <div className="flex-1 text-center px-1 text-xs sm:text-sm font-headline font-bold text-white whitespace-nowrap">
          {POLYGON_NAMES[n]} ({n} sides)
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

      {/* Live Typographic Banner */}
      <div className="flex justify-center mt-1">
        {mode === "each-angle" ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span className="text-white">Each angle</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">({n} − 2)·180° ÷ {n}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_LILAC }} className="font-bold">{interiorAngle}°</span>
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
