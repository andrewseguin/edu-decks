"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_LILAC = "#d8b4fe"; // Neon Lilac for exterior angles
const COLOR_GOLD = "#ffd45e";
const COLOR_WHITE = "#ffffff";

export function InteractivePolygonExteriorSumExplorer({ color }: InteractivePolygonExteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [shrinkProgress, setShrinkProgress] = useState(0); // 0 (full polygon) to 1 (shrunk to center)
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number>(0);
  const n = 5; // Pentagon

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const R = 50 * (1 - shrinkProgress * 0.92);

  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const toggleAnimate = () => {
    if (isAnimating) {
      setIsAnimating(false);
      setShrinkProgress(0);
      return;
    }
    setIsAnimating(true);
    let start: number | null = null;
    const duration = 2200;

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const prog = Math.min(1, elapsed / duration);
      setShrinkProgress(prog);
      if (prog < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {/* Exterior Angle Extended Arms */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const dx = nextV.x - v.x;
          const dy = nextV.y - v.y;
          const extLen = 24 * (1 - shrinkProgress * 0.4);
          const extX = nextV.x + (dx !== 0 ? (dx / Math.hypot(dx, dy)) * extLen : 0);
          const extY = nextV.y + (dy !== 0 ? (dy / Math.hypot(dx, dy)) * extLen : 0);

          return (
            <g key={i}>
              <line x1={v.x} y1={v.y} x2={extX} y2={extY} stroke={COLOR_LILAC} strokeWidth={2} strokeDasharray="3 2" />
              {shrinkProgress < 0.8 && (
                <circle cx={nextV.x} cy={nextV.y} r={3.5} fill={COLOR_LILAC} />
              )}
            </g>
          );
        })}

        {/* Outer boundary polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.14)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 360 circle highlight when shrunk */}
        {shrinkProgress > 0.8 && (
          <circle cx={CX} cy={CY} r={20} fill="rgba(216, 180, 254, 0.25)" stroke={COLOR_LILAC} strokeWidth={2.5} />
        )}
      </svg>

      {/* Animation Action Button in Frosted White Glass */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={toggleAnimate}
          className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95 select-none"
        >
          {shrinkProgress > 0 && !isAnimating ? "↺ Reset polygon" : "Shrink polygon to vertex point (360°)"}
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_LILAC }}>Exterior angle sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold text-base">360°</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80">Constant for all polygons</span>
        </div>
      </div>
    </div>
  );
}
