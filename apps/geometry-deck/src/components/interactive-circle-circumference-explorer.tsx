"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_H = 155;
const CY = 75;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#d8b4fe"; // Neon Lilac
const COLOR_GOLD = "#ffd45e";   // Warm Gold

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = Math.min(80, Math.round(SVG_W * 0.22));

  const [radiusUnits, setRadiusUnits] = useState(4); // r in [2..6]
  const [isRolling, setIsRolling] = useState(false);
  const [rollProgress, setRollProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ambientAngle, setAmbientAngle] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const ambientRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  const pxPerUnit = SVG_W >= 380 ? 11 : 9.5;
  const rPx = radiusUnits * pxPerUnit; // radius in px
  const cCoeff = 2 * radiusUnits;

  // Gentle ambient rocking animation on initial reveal until user interacts
  useEffect(() => {
    if (hasInteracted || isRolling || isDragging) return;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const angle = Math.sin(elapsed / 800) * 18;
      setAmbientAngle(angle);
      ambientRef.current = requestAnimationFrame(animate);
    };
    ambientRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ambientRef.current);
  }, [hasInteracted, isRolling, isDragging]);

  // Handle dragging radius
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasInteracted(true);
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const rawR = Math.round((px - CX) / pxPerUnit);
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
  }, [CX, SVG_W, pxPerUnit]);

  const toggleRoll = () => {
    setHasInteracted(true);
    if (isRolling) {
      setIsRolling(false);
      setRollProgress(0);
      return;
    }
    setIsRolling(true);
    let start: number | null = null;
    const duration = 2000;

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

  const rollDistance = Math.min(SVG_W - CX - rPx - 20, 2 * Math.PI * rPx);
  const wheelX = CX + rollProgress * rollDistance;
  const rotationDeg = isRolling || rollProgress > 0 ? (rollProgress * rollDistance / rPx) * (180 / Math.PI) : ambientAngle;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Ground Ruler Line */}
        <line x1={CX} y1={CY + rPx} x2={SVG_W - 15} y2={CY + rPx} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={2} />

        {/* Unrolled Lilac Boundary Trace along Ground */}
        {rollProgress > 0 && (
          <line
            x1={CX}
            y1={CY + rPx}
            x2={CX + rollProgress * rollDistance}
            y2={CY + rPx}
            stroke={COLOR_CIRCUM}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}

        {/* Rolling Circle Wheel */}
        <g transform={`translate(${wheelX}, ${CY}) rotate(${rotationDeg})`}>
          <circle r={rPx} fill="rgba(255, 255, 255, 0.14)" stroke={COLOR_CIRCUM} strokeWidth={2.5} />
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
          y={CY - 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_RADIUS}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {radiusUnits}
        </text>

        {/* Drag Handle on Radius End */}
        {!isRolling && rollProgress === 0 && (
          <g
            transform={`translate(${wheelX + rPx * Math.cos((rotationDeg * Math.PI) / 180)}, ${CY + rPx * Math.sin((rotationDeg * Math.PI) / 180)})`}
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
          {rollProgress > 0 && !isRolling ? "↺ Reset wheel" : "Roll circumference along line (2πr)"}
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
