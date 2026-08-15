"use client";

import React, { useState, useCallback, useRef } from "react";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;

const COLOR_LILAC = "#d8b4fe"; // Neon Lilac for exterior angles
const COLOR_GOLD = "#ffd45e";

export function InteractivePolygonExteriorSumExplorer({ color }: InteractivePolygonExteriorSumProps) {
  const [shrinkProgress, setShrinkProgress] = useState(0); // 0 (full polygon) to 1 (shrunk to center)
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number>(0);
  const n = 5; // Pentagon

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const R = 50 * (1 - shrinkProgress * 0.95);
  const extAngleDeg = 360 / n; // 72 deg

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
    const duration = 2000;

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
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible">
        {/* Exterior Angle Extended Arms */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const dx = nextV.x - v.x;
          const dy = nextV.y - v.y;
          const extLen = 22 * (1 - shrinkProgress * 0.5);
          const extX = nextV.x + (dx !== 0 ? (dx / Math.hypot(dx, dy)) * extLen : 0);
          const extY = nextV.y + (dy !== 0 ? (dy / Math.hypot(dx, dy)) * extLen : 0);

          return (
            <g key={i}>
              <line x1={v.x} y1={v.y} x2={extX} y2={extY} stroke={COLOR_LILAC} strokeWidth={1.8} strokeDasharray="3 2" />
              {shrinkProgress < 0.8 && (
                <circle cx={nextV.x} cy={nextV.y} r={3} fill={COLOR_LILAC} />
              )}
            </g>
          );
        })}

        {/* Outer boundary polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 360 circle highlight when shrunk */}
        {shrinkProgress > 0.8 && (
          <circle cx={CX} cy={CY} r={18} fill="rgba(216, 180, 254, 0.25)" stroke={COLOR_LILAC} strokeWidth={2} />
        )}
      </svg>

      {/* Animation Action Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={toggleAnimate}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {shrinkProgress > 0 && !isAnimating ? "↺ Reset polygon" : "Shrink polygon to vertex point (360°)"}
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_LILAC }}>Exterior angle sum</span>
          <span className="text-white/60">=</span>
          <span className="text-white font-extrabold">360°</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80">Always 360° for any n-gon</span>
        </div>
      </div>
    </div>
  );
}
