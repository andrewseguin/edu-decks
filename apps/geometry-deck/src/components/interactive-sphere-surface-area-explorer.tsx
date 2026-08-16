"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveSphereSurfaceAreaProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_SA = "#ffffff";     // Bold Crisp White
const COLOR_CIRCLES = "rgba(94, 232, 255, 0.35)";

export function InteractiveSphereSurfaceAreaExplorer({ color }: InteractiveSphereSurfaceAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [r, setR] = useState(3); // radius units
  const [step, setStep] = useState<1 | 2>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ambientAngle, setAmbientAngle] = useState(0);

  const ambientRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  // Gentle ambient equator tilt on initial reveal
  useEffect(() => {
    if (hasInteracted || step === 2) return;
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
  }, [hasInteracted, step]);

  const cr = 54;
  const rSq = r * r;
  const saCoeff = 4 * rSq;

  // 4 Great circles layout in 2x2 grid
  const smallCr = 25;
  const gridOffX = 40;
  const gridOffY = 32;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: 3D Sphere with shaded surface */
          <g>
            <circle cx={CX} cy={CY} r={cr} fill="rgba(94, 232, 255, 0.22)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />

            {/* Equator Ellipse */}
            <g transform={`rotate(${ambientAngle}, ${CX}, ${CY})`}>
              <ellipse cx={CX} cy={CY} rx={cr} ry={16} fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} strokeDasharray="4 3" />
            </g>

            {/* Center Dot */}
            <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

            {/* Radius line */}
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
          </g>
        ) : (
          /* Step 2: 4 Great Circles (each πr²) */
          <g>
            {[
              { x: CX - gridOffX, y: CY - gridOffY, label: "1" },
              { x: CX + gridOffX, y: CY - gridOffY, label: "2" },
              { x: CX - gridOffX, y: CY + gridOffY, label: "3" },
              { x: CX + gridOffX, y: CY + gridOffY, label: "4" },
            ].map((gc, i) => (
              <g key={i}>
                <circle cx={gc.x} cy={gc.y} r={smallCr} fill={COLOR_CIRCLES} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={1.8} />
                <circle cx={gc.x} cy={gc.y} r={2.5} fill="#ffffff" />
                <line x1={gc.x} y1={gc.y} x2={gc.x + smallCr} y2={gc.y} stroke={COLOR_RADIUS} strokeWidth={1.5} strokeDasharray="2 2" />
                <text
                  x={gc.x}
                  y={gc.y + smallCr + 11}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight="bold"
                  fill="rgba(255, 255, 255, 0.85)"
                  fontFamily="var(--font-heading, system-ui)"
                >
                  π · {r}² ({rSq}π)
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Step Navigation Pills in Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none">
        <button
          onClick={() => {
            setHasInteracted(true);
            setStep(1);
          }}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            step === 1 ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          1. Sphere
        </button>
        <button
          onClick={() => {
            setHasInteracted(true);
            setStep(2);
          }}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            step === 2 ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          2. 4 Great Circles Proof
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        {step === 1 ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">SA</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">4 · π ·</span>
            <span style={{ color: COLOR_RADIUS }}>{r}²</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_SA }} className="font-bold">{saCoeff}π</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span className="text-white">SA</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">4 × (πr²)</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_RADIUS }}>4 × {rSq}π</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_SA }} className="font-bold">{saCoeff}π</span>
          </div>
        )}
      </div>
    </div>
  );
}
