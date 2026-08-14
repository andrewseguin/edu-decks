"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type InteractiveScaleneExplorerProps = {
  color?: string;
};

const BASE_Y = 145;
const X1 = 35;
const X2 = 185;
const BASE_LEN = X2 - X1; // 150px
const STROKE_W = 2.5;

export function InteractiveScaleneExplorer({ color }: InteractiveScaleneExplorerProps) {
  // skew parameter (0 to 100) shifts the apex off-center
  const [skew, setSkew] = useState(25);
  const [isUserControlling, setIsUserControlling] = useState(false);

  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => {
    ucRef.current = isUserControlling;
  }, [isUserControlling]);

  // Continuous auto-pulse oscillation across skew 10 to 90
  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.2) + 1) / 2;
    const currentSkew = 12 + t * (84 - 12);
    setSkew(Math.round(currentSkew));
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

  // Scalene geometry calculations
  // Map skew (0 to 100) to apex position (offset to left/right, keeping all 3 sides distinct)
  const apexX = X1 + 25 + (skew / 100) * 85; // 60 to 145 (never 110 exact center)
  const apexY = 52 + Math.sin((skew / 100) * Math.PI) * 18;

  // Side lengths (formatted to 1 decimal place so they are 100% distinct)
  const leftLegLen = Math.sqrt((apexX - X1) ** 2 + (BASE_Y - apexY) ** 2);
  const rightLegLen = Math.sqrt((X2 - apexX) ** 2 + (BASE_Y - apexY) ** 2);

  const sideB = (leftLegLen / 10).toFixed(1);
  const sideA = (rightLegLen / 10).toFixed(1);
  const sideC = (BASE_LEN / 10).toFixed(1);

  // Interior angles
  const radA = Math.atan2(BASE_Y - apexY, apexX - X1);
  const radB = Math.atan2(BASE_Y - apexY, X2 - apexX);

  const degA = Math.round((radA * 180) / Math.PI);
  const degB = Math.round((radB * 180) / Math.PI);
  const degC = 180 - degA - degB;

  // Midpoints for tick marks
  const midLeftX = (X1 + apexX) / 2;
  const midLeftY = (BASE_Y + apexY) / 2;

  const midRightX = (X2 + apexX) / 2;
  const midRightY = (BASE_Y + apexY) / 2;

  const midBaseX = (X1 + X2) / 2;

  // Normal vectors for orthogonal tick marks
  const tickLen = 6;

  // Left leg tick (1 tick mark |)
  const leftNormalX = -Math.sin(radA);
  const leftNormalY = Math.cos(radA);
  const tickLeft1 = { x: midLeftX - tickLen * leftNormalX, y: midLeftY - tickLen * leftNormalY };
  const tickLeft2 = { x: midLeftX + tickLen * leftNormalX, y: midLeftY + tickLen * leftNormalY };

  // Right leg ticks (2 tick marks ||) - parallel & orthogonal to right leg line
  const rRad = Math.atan2(BASE_Y - apexY, X2 - apexX);
  const rNx = -Math.sin(rRad);
  const rNy = Math.cos(rRad);
  const rAlongX = Math.cos(rRad);
  const rAlongY = Math.sin(rRad);
  const rSpacing = 3.5;

  const centerA = { x: midRightX - rSpacing * rAlongX, y: midRightY - rSpacing * rAlongY };
  const tickRightA1 = { x: centerA.x - tickLen * rNx, y: centerA.y - tickLen * rNy };
  const tickRightA2 = { x: centerA.x + tickLen * rNx, y: centerA.y + tickLen * rNy };

  const centerB = { x: midRightX + rSpacing * rAlongX, y: midRightY + rSpacing * rAlongY };
  const tickRightB1 = { x: centerB.x - tickLen * rNx, y: centerB.y - tickLen * rNy };
  const tickRightB2 = { x: centerB.x + tickLen * rNx, y: centerB.y + tickLen * rNy };

  // Base ticks (3 tick marks |||)
  const bGap = 4;
  const tickBaseA1 = { x: midBaseX - bGap, y: BASE_Y - tickLen };
  const tickBaseA2 = { x: midBaseX - bGap, y: BASE_Y + tickLen };

  const tickBaseB1 = { x: midBaseX, y: BASE_Y - tickLen };
  const tickBaseB2 = { x: midBaseX, y: BASE_Y + tickLen };

  const tickBaseC1 = { x: midBaseX + bGap, y: BASE_Y - tickLen };
  const tickBaseC2 = { x: midBaseX + bGap, y: BASE_Y + tickLen };

  // Angle Arcs
  // Left angle A (Cyan)
  const arcRA = Math.min(22, Math.max(12, (apexX - X1) * 0.35));
  const arcAEnd = {
    x: X1 + arcRA * Math.cos(radA),
    y: BASE_Y - arcRA * Math.sin(radA),
  };
  const arcAPath = `M ${X1 + arcRA} ${BASE_Y} A ${arcRA} ${arcRA} 0 0 0 ${arcAEnd.x} ${arcAEnd.y}`;

  // Right angle B (Rose)
  const arcRB = Math.min(22, Math.max(12, (X2 - apexX) * 0.35));
  const arcBEnd = {
    x: X2 - arcRB * Math.cos(radB),
    y: BASE_Y - arcRB * Math.sin(radB),
  };
  const arcBPath = `M ${X2 - arcRB} ${BASE_Y} A ${arcRB} ${arcRB} 0 0 1 ${arcBEnd.x} ${arcBEnd.y}`;

  // Apex angle C (Gold)
  const arcRC = 24;
  const radDownL = Math.atan2(BASE_Y - apexY, X1 - apexX);
  const radDownR = Math.atan2(BASE_Y - apexY, X2 - apexX);
  const arcCEndL = { x: apexX + arcRC * Math.cos(radDownL), y: apexY + arcRC * Math.sin(radDownL) };
  const arcCEndR = { x: apexX + arcRC * Math.cos(radDownR), y: apexY + arcRC * Math.sin(radDownR) };
  const arcCPath = `M ${arcCEndL.x} ${arcCEndL.y} A ${arcRC} ${arcRC} 0 0 0 ${arcCEndR.x} ${arcCEndR.y}`;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserControlling) {
      setIsUserControlling(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    setSkew(Number(e.target.value));
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
          {/* Main Scalene Triangle Polygon */}
          <polygon
            points={`${X1},${BASE_Y} ${X2},${BASE_Y} ${apexX},${apexY}`}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
          />

          {/* Side Tick Marks: Left Leg (1 tick |), Right Leg (2 ticks ||), Base (3 ticks |||) */}
          <g stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round">
            {/* Left Leg: 1 tick */}
            <line x1={tickLeft1.x} y1={tickLeft1.y} x2={tickLeft2.x} y2={tickLeft2.y} />
            {/* Right Leg: 2 ticks */}
            <line x1={tickRightA1.x} y1={tickRightA1.y} x2={tickRightA2.x} y2={tickRightA2.y} />
            <line x1={tickRightB1.x} y1={tickRightB1.y} x2={tickRightB2.x} y2={tickRightB2.y} />
            {/* Base: 3 ticks */}
            <line x1={tickBaseA1.x} y1={tickBaseA1.y} x2={tickBaseA2.x} y2={tickBaseA2.y} />
            <line x1={tickBaseB1.x} y1={tickBaseB1.y} x2={tickBaseB2.x} y2={tickBaseB2.y} />
            <line x1={tickBaseC1.x} y1={tickBaseC1.y} x2={tickBaseC2.x} y2={tickBaseC2.y} />
          </g>

          {/* Left Angle Arc A (Cyan) */}
          <path
            d={arcAPath}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Right Angle Arc B (Rose) */}
          <path
            d={arcBPath}
            fill="none"
            stroke="#ff6b8b"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Apex Angle Arc C (Gold) */}
          <path
            d={arcCPath}
            fill="none"
            stroke="#ffd45e"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Angle Value Labels Floating Outside Vertices */}
          <text
            x={X1 - 8}
            y={BASE_Y + 3}
            textAnchor="end"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
          >
            {degA}°
          </text>
          <text
            x={X2 + 8}
            y={BASE_Y + 3}
            textAnchor="start"
            fontSize={12}
            fontWeight="800"
            fill="#ff6b8b"
            fontFamily="var(--font-heading, system-ui)"
          >
            {degB}°
          </text>
          <text
            x={apexX}
            y={apexY - 10}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fill="#ffd45e"
            fontFamily="var(--font-heading, system-ui)"
          >
            {degC}°
          </text>
        </svg>
      </div>

      {/* Legend / Status Badges */}
      <div className="flex flex-wrap justify-center items-center gap-2 my-2 text-xs font-mono">
        <span className="px-3 py-1 rounded-full bg-black/40 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm backdrop-blur">
          Sides: <span className="text-emerald-200">{sideB} • {sideA} • {sideC}</span> (All Different)
        </span>
        <span className="px-3 py-1 rounded-full bg-black/40 text-purple-300 border border-purple-500/40 font-bold shadow-sm backdrop-blur">
          Angles: <span className="text-purple-200">{degA}° • {degB}° • {degC}°</span> (All Different)
        </span>
      </div>

      {/* Range Slider Control (No text labels) */}
      <div className="w-full max-w-[280px] px-2 flex flex-col gap-1.5 items-center mt-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={skew}
          onChange={handleSlider}
          className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none border border-white/20"
          aria-label="Scalene triangle skew slider"
        />
      </div>
    </div>
  );
}
