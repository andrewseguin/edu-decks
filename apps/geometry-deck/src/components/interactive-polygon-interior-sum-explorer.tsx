"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePolygonInteriorSumProps = {
  color?: string;
};

const SVG_H = 155;
const R = 54;

const POLY_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
};

const TRI_COLORS = [
  "rgba(94, 232, 255, 0.28)",
  "rgba(255, 212, 94, 0.28)",
  "rgba(216, 180, 254, 0.28)",
  "rgba(244, 114, 182, 0.28)",
  "rgba(52, 211, 153, 0.28)",
  "rgba(251, 146, 60, 0.28)",
];

const COLOR_GOLD = "#ffd45e";
const COLOR_CYAN = "#5ee8ff";
const COLOR_WHITE = "#ffffff";

export function InteractivePolygonInteriorSumExplorer({ color }: InteractivePolygonInteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [n, setN] = useState(5); // n in [3..8]
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ambientAngle, setAmbientAngle] = useState(0);

  const ambientRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  // Gentle ambient rotation on initial reveal
  useEffect(() => {
    if (hasInteracted) return;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const ang = Math.sin(elapsed / 900) * 8;
      setAmbientAngle(ang);
      ambientRef.current = requestAnimationFrame(animate);
    };
    ambientRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ambientRef.current);
  }, [hasInteracted]);

  // Compute vertices
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2 + (ambientAngle * Math.PI) / 180;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const numTriangles = n - 2;
  const totalSum = numTriangles * 180;
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
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
              <text
                x={triCenter.x}
                y={triCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10.5}
                fontWeight="800"
                fill="rgba(255,255,255,0.95)"
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.8))" }}
              >
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

      {/* Stepper Controls for n in Standard Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => {
            setHasInteracted(true);
            setN((prev) => Math.max(3, prev - 1));
          }}
          disabled={n <= 3}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          −
        </button>
        <div className="flex items-center px-2 py-0.5 text-xs sm:text-sm font-headline font-bold text-white">
          {polyName} ({n} sides · {numTriangles} triangles)
        </div>
        <button
          onClick={() => {
            setHasInteracted(true);
            setN((prev) => Math.min(8, prev + 1));
          }}
          disabled={n >= 8}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          +
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">Sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">(</span>
          <span style={{ color: COLOR_GOLD }}>{n}</span>
          <span className="text-white/80">− 2) · 180°</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_CYAN }}>{numTriangles} · 180°</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_WHITE }} className="font-bold">{totalSum}°</span>
        </div>
      </div>
    </div>
  );
}
