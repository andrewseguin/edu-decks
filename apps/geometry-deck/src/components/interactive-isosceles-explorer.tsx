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
  // Even apex angles (30° to 120°, step 2) so base angles are always exact integers
  const [apexAngle, setApexAngle] = useState(50);
  const [isUserControlling, setIsUserControlling] = useState(false);

  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => {
    ucRef.current = isUserControlling;
  }, [isUserControlling]);

  // Smooth continuous auto-pulse loop across 12° to 158°
  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.2) + 1) / 2;
    const rawDeg = 12 + t * (158 - 12);
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

  // Geometry calculations (even integer apex angles guarantee baseAngle is an exact whole integer and apex + 2*base = 180° exactly)
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

  // Exact normal vectors (100% perpendicular to leg line at all angles)
  const tickHalfLen = 7;
  const leftLegRad = Math.atan2(BASE_Y - apexY, x1 - apexX);
  const leftNormalX = -Math.sin(leftLegRad);
  const leftNormalY = Math.cos(leftLegRad);
  const tickLeft1 = { x: midLeftX - tickHalfLen * leftNormalX, y: midLeftY - tickHalfLen * leftNormalY };
  const tickLeft2 = { x: midLeftX + tickHalfLen * leftNormalX, y: midLeftY + tickHalfLen * leftNormalY };

  const rightLegRad = Math.atan2(BASE_Y - apexY, x2 - apexX);
  const rightNormalX = -Math.sin(rightLegRad);
  const rightNormalY = Math.cos(rightLegRad);
  const tickRight1 = { x: midRightX - tickHalfLen * rightNormalX, y: midRightY - tickHalfLen * rightNormalY };
  const tickRight2 = { x: midRightX + tickHalfLen * rightNormalX, y: midRightY + tickHalfLen * rightNormalY };

  // Base angle arcs strictly inside triangle polygon
  const arcR = Math.min(24, Math.max(10, hw * 0.4));
  const leftArcEnd = {
    x: x1 + arcR * Math.cos(Math.atan2(BASE_Y - apexY, apexX - x1)),
    y: BASE_Y - arcR * Math.sin(Math.atan2(BASE_Y - apexY, apexX - x1)),
  };
  const leftArcPath = `M ${x1 + arcR} ${BASE_Y} A ${arcR} ${arcR} 0 0 0 ${leftArcEnd.x} ${leftArcEnd.y}`;

  const rightArcEnd = {
    x: x2 - arcR * Math.cos(Math.atan2(BASE_Y - apexY, x2 - apexX)),
    y: BASE_Y - arcR * Math.sin(Math.atan2(BASE_Y - apexY, x2 - apexX)),
  };
  const rightArcPath = `M ${x2 - arcR} ${BASE_Y} A ${arcR} ${arcR} 0 0 1 ${rightArcEnd.x} ${rightArcEnd.y}`;

  // Apex arc path
  const apexArcR = Math.min(26, Math.max(12, h * 0.4));
  const apexArcLeft = {
    x: apexX + apexArcR * Math.cos(leftLegRad),
    y: apexY + apexArcR * Math.sin(leftLegRad),
  };
  const apexArcRight = {
    x: apexX + apexArcR * Math.cos(rightLegRad),
    y: apexY + apexArcR * Math.sin(rightLegRad),
  };
  const apexArcPath = `M ${apexArcLeft.x} ${apexArcLeft.y} A ${apexArcR} ${apexArcR} 0 0 0 ${apexArcRight.x} ${apexArcRight.y}`;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserControlling) {
      setIsUserControlling(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    const val = Number(e.target.value);
    setApexAngle(Math.round(val / 2) * 2);
  }, [isUserControlling]);

  return (
    <div className="w-full flex flex-col items-center select-none pb-1">
      {/* SVG Diagram */}
      <div className="relative w-full max-w-[340px] aspect-[22/13.5] flex items-center justify-center">
        <svg
          viewBox="0 25 220 135"
          className="w-full h-full overflow-visible"
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

          {/* Equal Legs Tick Marks (Strictly Orthogonal to leg at every angle) */}
          <g stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round">
            <line x1={tickLeft1.x} y1={tickLeft1.y} x2={tickLeft2.x} y2={tickLeft2.y} />
            <line x1={tickRight1.x} y1={tickRight1.y} x2={tickRight2.x} y2={tickRight2.y} />
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

          {/* Base Angle Value Labels (Positioned outside left & right corners with generous 10px offset) */}
          <text
            x={x1 - 10}
            y={BASE_Y + 3}
            textAnchor="end"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
          >
            {baseAngle}°
          </text>
          <text
            x={x2 + 10}
            y={BASE_Y + 3}
            textAnchor="start"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
          >
            {baseAngle}°
          </text>

          {/* Apex Angle Value Label (Floating OUTSIDE above apex vertex) */}
          <text
            x={apexX}
            y={apexY - 10}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fill="#ffd45e"
            fontFamily="var(--font-heading, system-ui)"
          >
            {displayApexAngle}°
          </text>
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

      {/* Range Slider Control (Capped 10° to 160° to avoid degenerate straight line triangles) */}
      <div className="w-full max-w-[280px] px-2 flex flex-col gap-1.5 items-center mt-1">
        <input
          type="range"
          min={10}
          max={160}
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
