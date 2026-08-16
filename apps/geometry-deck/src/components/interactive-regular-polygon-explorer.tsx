"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveRegularPolygonProps = {
  mode?: "regular" | "each-angle";
  color?: string;
};

const SVG_H = 155;
const R = 54;

const COLOR_CYAN = "#5ee8ff"; // Interior angle
const COLOR_GOLD = "#ffd45e"; // Side length
const COLOR_WHITE = "#ffffff";

export function InteractiveRegularPolygonExplorer({ mode = "regular", color }: InteractiveRegularPolygonProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [n, setN] = useState(6); // Hexagon
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

  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2 + (ambientAngle * Math.PI) / 180;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const sumAngle = (n - 2) * 180;
  const interiorAngle = Math.round((sumAngle / n) * 10) / 10;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {/* Polygon Interior Fill */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.14)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Vertex Angle Arcs & Dots */}
        {vertices.map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3.5} fill="#ffffff" />
        ))}

        {/* Side Hash Marks for Equilateral/Equiangular */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const mx = (v.x + nextV.x) / 2;
          const my = (v.y + nextV.y) / 2;
          return <circle key={`tick-${i}`} cx={mx} cy={my} r={2} fill={COLOR_GOLD} />;
        })}

        {/* Interior Angle Label at Top Vertex */}
        <text
          x={vertices[0].x}
          y={vertices[0].y + 22}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_CYAN}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {interiorAngle}°
        </text>
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
          Regular {n}-gon (n = {n})
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
        {mode === "each-angle" || true ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span className="text-white">Each angle</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">({n} − 2)·180° ÷ {n}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_CYAN }} className="font-bold">{interiorAngle}°</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span style={{ color: COLOR_GOLD }}>{n} equal sides</span>
            <span className="text-white/40">·</span>
            <span style={{ color: COLOR_CYAN }}>{n} equal angles ({interiorAngle}°)</span>
          </div>
        )}
      </div>
    </div>
  );
}
