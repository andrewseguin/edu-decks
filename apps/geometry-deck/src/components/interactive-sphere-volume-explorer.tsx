"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveSphereVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveSphereVolumeExplorer({ color }: InteractiveSphereVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [r, setR] = useState(3); // radius units [2, 3, 6]
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ambientAngle, setAmbientAngle] = useState(0);

  const ambientRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  // Gentle ambient equator tilt on initial reveal
  useEffect(() => {
    if (hasInteracted) return;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const ang = Math.sin(elapsed / 900) * 10;
      setAmbientAngle(ang);
      ambientRef.current = requestAnimationFrame(animate);
    };
    ambientRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ambientRef.current);
  }, [hasInteracted]);

  const cr = 54;
  const rCubed = r * r * r;
  // If r=3: 4/3 * 27 = 36. If r=6: 4/3 * 216 = 288. If r=2: 4/3 * 8 = 32/3
  const isIntegerVol = rCubed % 3 === 0;
  const volCoeff = (4 * rCubed) / 3;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {/* Sphere Outer Boundary & Shading */}
        <circle cx={CX} cy={CY} r={cr} fill="rgba(94, 232, 255, 0.20)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />

        {/* Equator Ellipse */}
        <g transform={`rotate(${ambientAngle}, ${CX}, ${CY})`}>
          <ellipse cx={CX} cy={CY} rx={cr} ry={16} fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} strokeDasharray="4 3" />
        </g>

        {/* Center Dot */}
        <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

        {/* Radius 3D ray */}
        <line x1={CX} y1={CY} x2={CX + cr * 0.707} y2={CY - cr * 0.707} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
        <circle cx={CX + cr * 0.707} cy={CY - cr * 0.707} r={3} fill={COLOR_RADIUS} />

        {/* Radius Label */}
        <text
          x={CX + cr * 0.45}
          y={CY - cr * 0.45 - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_RADIUS}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {r}
        </text>
      </svg>

      {/* Stepper Controls for Radius in Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => {
            setHasInteracted(true);
            setR((prev) => (prev === 6 ? 3 : 2));
          }}
          disabled={r <= 2}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          −
        </button>
        <div className="flex items-center px-2 py-0.5 text-xs sm:text-sm font-headline font-bold text-white">
          Radius r = {r} (r³ = {rCubed})
        </div>
        <button
          onClick={() => {
            setHasInteracted(true);
            setR((prev) => (prev === 2 ? 3 : 6));
          }}
          disabled={r >= 6}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          +
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">V</span>
          <span className="text-white/50">=</span>
          <div className="inline-flex items-center"><StackedFraction numerator="4" denominator="3" /></div>
          <span className="text-white/80">· π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{r}³</span>
          <span className="text-white/50">=</span>
          {isIntegerVol ? (
            <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
          ) : (
            <div className="inline-flex items-center text-white font-bold">
              <StackedFraction numerator={`${4 * rCubed}π`} denominator="3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
