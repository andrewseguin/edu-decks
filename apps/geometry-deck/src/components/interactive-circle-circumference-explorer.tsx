"use client";

import React, { useState, useCallback, useRef } from "react";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 65;
const CY = 75;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#d8b4fe"; // Neon Lilac
const COLOR_GOLD = "#ffd45e";   // Warm Gold

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const [radiusUnits, setRadiusUnits] = useState(4); // r in [2..6]
  const [isRolling, setIsRolling] = useState(false);
  const [rollProgress, setRollProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const rPx = radiusUnits * 9; // radius in px [18..54]
  const cCoeff = 2 * radiusUnits;
  const lineLenPx = 2 * Math.PI * rPx;

  // Handle dragging radius
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const rawR = Math.round((px - CX) / 9);
      const clampedR = Math.max(2, Math.min(6, rawR));
      setRadiusUnits(clampedR);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const toggleRoll = () => {
    if (isRolling) {
      setIsRolling(false);
      setRollProgress(0);
      return;
    }
    setIsRolling(true);
    let start: number | null = null;
    const duration = 1800; // 1.8s

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const prog = Math.min(1, elapsed / duration);
      setRollProgress(prog);
      if (prog < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRolling(false);
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  const wheelX = CX + rollProgress * (SVG_W - CX - rPx - 20);
  const rotationDeg = rollProgress * 360;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Ground Ruler Line */}
        <line x1={CX} y1={CY + rPx} x2={SVG_W - 15} y2={CY + rPx} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={2} />
        {/* Unrolled Lilac Boundary Trace along Ground */}
        {rollProgress > 0 && (
          <line
            x1={CX}
            y1={CY + rPx}
            x2={CX + rollProgress * (SVG_W - CX - rPx - 20)}
            y2={CY + rPx}
            stroke={COLOR_CIRCUM}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}

        {/* Rolling Circle Wheel */}
        <g transform={`translate(${wheelX}, ${CY}) rotate(${rotationDeg})`}>
          <circle r={rPx} fill="rgba(255, 255, 255, 0.12)" stroke={COLOR_CIRCUM} strokeWidth={2.5} />
          {/* Radial Spokes */}
          <line x1={0} y1={0} x2={rPx} y2={0} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
          <line x1={0} y1={0} x2={0} y2={rPx} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
          <circle cx={0} cy={0} r={3} fill="#ffffff" />
          {/* Outer Marker Dot on Wheel Rim */}
          <circle cx={rPx} cy={0} r={3.5} fill={COLOR_GOLD} />
        </g>

        {/* Radius Label */}
        <text
          x={wheelX + rPx / 2}
          y={CY - 8}
          textAnchor="middle"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_RADIUS}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          r = {radiusUnits}
        </text>

        {/* Drag Handle on Radius End */}
        {!isRolling && (
          <g
            transform={`translate(${wheelX + rPx}, ${CY})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          >
            <circle r={24} fill="transparent" />
            <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
            <circle r={4.5} fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* Unroll Action Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={toggleRoll}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {rollProgress > 0 && !isRolling ? "↺ Reset wheel" : "Roll circumference along ruler (2πr)"}
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">C</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">2 · π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{radiusUnits}</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_CIRCUM }} className="font-extrabold">{cCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
