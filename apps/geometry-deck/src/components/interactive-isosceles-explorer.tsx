"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type InteractiveIsoscelesExplorerProps = {
  color?: string;
};

const LEG_LEN = 95;
const BASE_Y = 145;
const CX = 110;
const STROKE_W = 2.5;

export function InteractiveIsoscelesExplorer({ color }: InteractiveIsoscelesExplorerProps) {
  // Use even apex angles (30° to 120°, step 2) so base angles are always exact integers
  const [apexAngle, setApexAngle] = useState(50);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    ucRef.current = isUserControlling;
  }, [isUserControlling]);

  // Gentle auto-pulse loop when untouched
  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.25) + 1) / 2;
    // Step by 2 for integer base angles
    const rawDeg = 34 + t * (110 - 34);
    const evenDeg = Math.round(rawDeg / 2) * 2;
    setApexAngle(evenDeg);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, isUserControlling]);

  // Geometry calculations (exact even integer degrees)
  const displayApexAngle = Math.round(apexAngle / 2) * 2;
  const baseAngle = (180 - displayApexAngle) / 2;

  const halfApexRad = ((displayApexAngle / 2) * Math.PI) / 180;
  const hw = LEG_LEN * Math.sin(halfApexRad);
  const h = LEG_LEN * Math.cos(halfApexRad);

  const x1 = CX - hw;
  const x2 = CX + hw;
  const apexX = CX;
  const apexY = BASE_Y - h;

  // Midpoints for tick marks on equal legs
  const midLeftX = (x1 + apexX) / 2;
  const midLeftY = (BASE_Y + apexY) / 2;
  const midRightX = (x2 + apexX) / 2;
  const midRightY = (BASE_Y + apexY) / 2;

  // Tick mark angles (perpendicular to leg)
  const leftLegAngleDeg = (Math.atan2(BASE_Y - apexY, x1 - apexX) * 180) / Math.PI;
  const rightLegAngleDeg = (Math.atan2(BASE_Y - apexY, x2 - apexX) * 180) / Math.PI;

  // Base angle arcs strictly inside triangle polygon
  const arcR = 24;

  // Left base vertex arc: from (x1 + arcR, BASE_Y) along left leg
  const leftLegRad = Math.atan2(BASE_Y - apexY, apexX - x1); // angle above horizontal east
  const leftArcEnd = {
    x: x1 + arcR * Math.cos(leftLegRad),
    y: BASE_Y - arcR * Math.sin(leftLegRad),
  };
  const leftArcPath = `M ${x1 + arcR} ${BASE_Y} A ${arcR} ${arcR} 0 0 0 ${leftArcEnd.x} ${leftArcEnd.y}`;

  // Right base vertex arc: from (x2 - arcR, BASE_Y) along right leg
  const rightLegRad = Math.atan2(BASE_Y - apexY, x2 - apexX); // angle above horizontal west
  const rightArcEnd = {
    x: x2 - arcR * Math.cos(rightLegRad),
    y: BASE_Y - arcR * Math.sin(rightLegRad),
  };
  const rightArcPath = `M ${x2 - arcR} ${BASE_Y} A ${arcR} ${arcR} 0 0 1 ${rightArcEnd.x} ${rightArcEnd.y}`;

  // Apex arc path
  const apexArcR = 28;
  const leftLegDownRad = Math.atan2(BASE_Y - apexY, x1 - apexX);
  const rightLegDownRad = Math.atan2(BASE_Y - apexY, x2 - apexX);
  const apexArcLeft = {
    x: apexX + apexArcR * Math.cos(leftLegDownRad),
    y: apexY + apexArcR * Math.sin(leftLegDownRad),
  };
  const apexArcRight = {
    x: apexX + apexArcR * Math.cos(rightLegDownRad),
    y: apexY + apexArcR * Math.sin(rightLegDownRad),
  };
  const apexArcPath = `M ${apexArcLeft.x} ${apexArcLeft.y} A ${apexArcR} ${apexArcR} 0 0 0 ${apexArcRight.x} ${apexArcRight.y}`;

  // Pointer drag handling on Apex node
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserControlling(true);
    setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scY = 190 / rect.height;

    const onMove = (ev: PointerEvent) => {
      const py = (ev.clientY - rect.top) * scY;
      const clampedY = Math.max(20, Math.min(110, py));
      const targetH = BASE_Y - clampedY;
      const cosHalf = Math.max(0.1, Math.min(0.99, targetH / LEG_LEN));
      const calcHalfRad = Math.acos(cosHalf);
      const calcApexDeg = Math.round((calcHalfRad * 2 * 180) / Math.PI);
      const evenApex = Math.round(Math.max(30, Math.min(120, calcApexDeg)) / 2) * 2;
      setApexAngle(evenApex);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserControlling) {
      setIsUserControlling(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    const val = Number(e.target.value);
    setApexAngle(Math.round(val / 2) * 2);
  }, [isUserControlling]);

  const isoscelesTypeLabel =
    displayApexAngle === 60
      ? "Equilateral Triangle (All 60°)"
      : displayApexAngle === 90
      ? "Right Isosceles Triangle (90°, 45°, 45°)"
      : displayApexAngle > 90
      ? "Obtuse Isosceles Triangle"
      : "Acute Isosceles Triangle";

  return (
    <div className="w-full flex flex-col items-center select-none pb-3">
      {/* SVG Diagram */}
      <div className="relative w-full max-w-[340px] aspect-[22/19] flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 220 190"
          className="w-full h-full touch-none overflow-visible"
          aria-hidden
        >
          {/* Main Triangle Polygon */}
          <polygon
            points={`${x1},${BASE_Y} ${x2},${BASE_Y} ${apexX},${apexY}`}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
          />

          {/* Equal Legs Tick Marks */}
          <g stroke="rgba(255,255,255,0.95)" strokeWidth={2}>
            <line
              x1={midLeftX - 6 * Math.cos((leftLegAngleDeg * Math.PI) / 180)}
              y1={midLeftY + 6 * Math.sin((leftLegAngleDeg * Math.PI) / 180)}
              x2={midLeftX + 6 * Math.cos((leftLegAngleDeg * Math.PI) / 180)}
              y2={midLeftY - 6 * Math.sin((leftLegAngleDeg * Math.PI) / 180)}
            />
            <line
              x1={midRightX - 6 * Math.cos((rightLegAngleDeg * Math.PI) / 180)}
              y1={midRightY + 6 * Math.sin((rightLegAngleDeg * Math.PI) / 180)}
              x2={midRightX + 6 * Math.cos((rightLegAngleDeg * Math.PI) / 180)}
              y2={midRightY - 6 * Math.sin((rightLegAngleDeg * Math.PI) / 180)}
            />
          </g>

          {/* Base Angle Arcs (Cyan) */}
          <path
            d={leftArcPath}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path
            d={rightArcPath}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Apex Angle Arc (Gold) */}
          <path
            d={apexArcPath}
            fill="none"
            stroke="#ffd45e"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Base Angle Value Labels (Tucked in left & right corners, never overlap) */}
          <text
            x={x1 + 8}
            y={BASE_Y - 6}
            textAnchor="start"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
          >
            {baseAngle}°
          </text>
          <text
            x={x2 - 8}
            y={BASE_Y - 6}
            textAnchor="end"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
          >
            {baseAngle}°
          </text>

          {/* Apex Angle Value Label */}
          <text
            x={apexX}
            y={apexY + Math.min(36, h * 0.4)}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fill="#ffd45e"
            fontFamily="var(--font-heading, system-ui)"
          >
            {displayApexAngle}°
          </text>

          {/* Draggable Apex Handle */}
          <g
            className="cursor-grab active:cursor-grabbing transition-transform duration-100"
            onPointerDown={handlePointerDown}
          >
            <circle
              cx={apexX}
              cy={apexY}
              r={16}
              fill="rgba(255,212,94,0.25)"
              className="animate-pulse"
            />
            <circle
              cx={apexX}
              cy={apexY}
              r={7.5}
              fill="#ffd45e"
              stroke="#ffffff"
              strokeWidth={2}
              className={`transition-all ${isDragging ? "scale-125" : "hover:scale-110"}`}
            />
          </g>
        </svg>
      </div>

      {/* Legend / Status Badges */}
      <div className="flex flex-wrap justify-center items-center gap-2 my-2 text-xs font-mono">
        <span className="px-3 py-1 rounded-full bg-black/40 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm backdrop-blur">
          Base angles: <span className="text-cyan-200">{baseAngle}° & {baseAngle}°</span> (Always Equal)
        </span>
        <span className="px-3 py-1 rounded-full bg-black/40 text-amber-300 border border-amber-500/40 font-bold shadow-sm backdrop-blur">
          Apex: <span className="text-amber-200">{displayApexAngle}°</span>
        </span>
      </div>

      <p className="text-xs font-mono text-white/90 mb-2 font-bold drop-shadow-sm">
        {isoscelesTypeLabel}
      </p>

      {/* Range Slider Control */}
      <div className="w-full max-w-[280px] px-2 flex flex-col gap-1.5 items-center">
        <div className="w-full flex justify-between text-[11px] font-mono font-semibold text-white/80">
          <span>Tall (30°)</span>
          <span className="text-amber-300 font-bold text-xs">{displayApexAngle}°</span>
          <span>Wide (120°)</span>
        </div>
        <input
          type="range"
          min={30}
          max={120}
          step={2}
          value={displayApexAngle}
          onChange={handleSlider}
          className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none border border-white/20"
          aria-label="Apex angle slider"
        />
      </div>
    </div>
  );
}
