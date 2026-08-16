"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_H = 160;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#d8b4fe"; // Neon Lilac
const COLOR_GOLD = "#ffd45e";   // Warm Gold

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(500, rawW - 24));

  // Radius units [2, 3, 4, 5]
  const [radiusUnits, setRadiusUnits] = useState(3);
  const [isRolling, setIsRolling] = useState(false);
  const [rollProgress, setRollProgress] = useState(0); // 0 (start) to 1 (1 full revolution: 2πr)
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Scale pxPerUnit so 1 full circumference 2π * rPx fits comfortably centered on canvas
  const pxPerUnit = Math.max(5.5, Math.min(8.5, (SVG_W - 80) / (2 * Math.PI * 4.5)));
  const rPx = radiusUnits * pxPerUnit; // e.g. 3 * 7.5 = 22.5px
  const fullRollDist = 2 * Math.PI * rPx; // exact distance for 1 full revolution

  // Symmetrically center the entire roll path [startX -> endX]
  const startX = Math.round((SVG_W - fullRollDist) / 2);
  const endX = Math.round(startX + fullRollDist);
  const groundY = 118;
  const centerY = groundY - rPx;
  const cCoeff = 2 * radiusUnits;

  // Handle radius dragging on the start circle
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
      const rawR = Math.round((px - startX) / pxPerUnit);
      const clampedR = Math.max(2, Math.min(5, rawR));
      setRadiusUnits(clampedR);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [SVG_W, pxPerUnit, startX]);

  const toggleRoll = () => {
    if (isRolling) {
      setIsRolling(false);
      setRollProgress(0);
      return;
    }
    setIsRolling(true);
    let start: number | null = null;
    const duration = 2200; // 2.2s smooth full rotation

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

  const currentWheelX = startX + rollProgress * fullRollDist;
  const rotationDeg = rollProgress * 360;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Ground Ruler Line — spans strictly from startX to endX (1 full circumference) */}
        <line x1={startX} y1={groundY} x2={endX} y2={groundY} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={2} />

        {/* Start Tick (0) */}
        <line x1={startX} y1={groundY - 5} x2={startX} y2={groundY + 5} stroke="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
        <text
          x={startX}
          y={groundY + 16}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight="bold"
          fill="rgba(255, 255, 255, 0.6)"
          fontFamily="var(--font-heading, system-ui)"
        >
          0
        </text>

        {/* Finish Tick (1 Full Turn = 2πr) */}
        <line x1={endX} y1={groundY - 5} x2={endX} y2={groundY + 5} stroke={COLOR_CIRCUM} strokeWidth={2} />
        <text
          x={endX}
          y={groundY + 16}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight="bold"
          fill={COLOR_CIRCUM}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {cCoeff}π (1 full turn)
        </text>

        {/* Ghost Starting Circle outline when rolled */}
        {rollProgress > 0 && (
          <circle cx={startX} cy={centerY} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
        )}

        {/* Unrolled Lilac Boundary Ribbon along the ground */}
        {rollProgress > 0 && (
          <line
            x1={startX}
            y1={groundY}
            x2={currentWheelX}
            y2={groundY}
            stroke={COLOR_CIRCUM}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}

        {/* Rolling Wheel Group */}
        <g transform={`translate(${currentWheelX}, ${centerY})`}>
          {/* Wheel Body Fill & Stroke */}
          <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.12)" stroke={COLOR_CIRCUM} strokeWidth={2.5} />

          {/* Rotating Spoke and Rim Dot */}
          <g transform={`rotate(${rotationDeg})`}>
            {/* Radius line to 6 o'clock initial ground contact point */}
            <line x1={0} y1={0} x2={0} y2={rPx} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <line x1={0} y1={0} x2={rPx} y2={0} stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1} />
            <circle cx={0} cy={0} r={3} fill="#ffffff" />
            {/* Ground Contact Rim Marker Dot */}
            <circle cx={0} cy={rPx} r={4} fill={COLOR_GOLD} stroke="#000" strokeWidth={0.5} />
          </g>

          {/* Radius label (upright above center) */}
          <text
            x={rPx / 2 + 3}
            y={-8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight="800"
            fill={COLOR_RADIUS}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            r = {radiusUnits}
          </text>
        </g>

        {/* Interactive Drag Handle to change radius at start */}
        {!isRolling && rollProgress === 0 && (
          <g
            transform={`translate(${startX + rPx}, ${centerY})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          >
            <circle r={24} fill="transparent" />
            <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
            <circle r={4.5} fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* Standard Frosted Unroll Action Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={toggleRoll}
          className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95 select-none"
        >
          {rollProgress > 0 && !isRolling ? "↺ Reset wheel" : "Roll 1 full turn (2πr)"}
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">C</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">2 · π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{radiusUnits}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_CIRCUM }} className="font-bold">{cCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
