"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type InteractiveCircleAreaProps = {
  color?: string;
};

const SVG_H = 165;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (Radius r & Height)
const COLOR_BASE = "#ffd45e";   // Warm Gold (Base πr)
const COLOR_AREA = "#ffffff";   // Crisp Bold White
const COLOR_SECTOR_A = "rgba(94, 232, 255, 0.45)"; // Electric Cyan Sector
const COLOR_SECTOR_B = "rgba(216, 180, 254, 0.45)"; // Radiant Lilac Sector

const MIN_RADIUS = 1;
const MAX_RADIUS = 5;

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));
  const CX = SVG_W / 2;

  const [radiusUnits, setRadiusUnits] = useState(3); // default r = 3
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1. Circle, 2. Unfold, 3. Parallelogram

  // Smooth animation progress between steps
  // 0 = Circle, 1 = Unfold, 2 = Interlocked Parallelogram
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const targetProgress = step === 1 ? 0 : step === 2 ? 1 : 2;

  // Smooth transition interpolation
  useEffect(() => {
    let start: number | null = null;
    const startP = animProgress;
    const targetP = targetProgress;
    if (Math.abs(startP - targetP) < 0.005) return;

    const duration = 500; // 500ms smooth morph

    const stepAnim = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic ease
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const currentP = startP + (targetP - startP) * ease;
      setAnimProgress(currentP);

      if (t < 1) {
        animRef.current = requestAnimationFrame(stepAnim);
      }
    };

    animRef.current = requestAnimationFrame(stepAnim);

    return () => cancelAnimationFrame(animRef.current);
  }, [step]);

  // Radius sizing
  const rPx = 36 + (radiusUnits - 1) * 3.5;
  const areaCoeff = radiusUnits * radiusUnits;
  const cApprox = Math.round(Math.PI * radiusUnits * 100) / 100;

  const changeRadius = (delta: number) => {
    const nextR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radiusUnits + delta));
    setRadiusUnits(nextR);
  };

  // 8 radial sectors
  const numSectors = 8;
  const halfSectors = numSectors / 2; // 4 pairs
  const sectorAngle = (2 * Math.PI) / numSectors;
  const sectorArcLen = (Math.PI * rPx) / halfSectors; // width of 1 wedge along arc
  const totalBaseW = Math.PI * rPx; // total length of unrolled half = πr

  // Vertical layout centers
  const circleCY = 72;
  const unfoldStartX = CX - totalBaseW / 2;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* STEP 1: Full Circle with 8 alternating slices */}
        {step === 1 && (
          <g transform={`translate(${CX}, ${circleCY})`}>
            {/* Outer circle boundary */}
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

            {/* 8 Radial Sectors */}
            {Array.from({ length: numSectors }, (_, i) => {
              const startA = i * sectorAngle - Math.PI / 2;
              const endA = (i + 1) * sectorAngle - Math.PI / 2;
              const x1 = rPx * Math.cos(startA);
              const y1 = rPx * Math.sin(startA);
              const x2 = rPx * Math.cos(endA);
              const y2 = rPx * Math.sin(endA);
              const d = `M 0 0 L ${x1} ${y1} A ${rPx} ${rPx} 0 0 1 ${x2} ${y2} Z`;

              return (
                <path
                  key={i}
                  d={d}
                  fill={i % 2 === 0 ? COLOR_SECTOR_A : COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth={1.2}
                />
              );
            })}

            {/* Center dot */}
            <circle cx={0} cy={0} r={3} fill="#ffffff" />

            {/* Radius Spoke */}
            <line x1={0} y1={0} x2={rPx} y2={0} stroke={COLOR_RADIUS} strokeWidth={2.5} strokeDasharray="3 2" />
            <circle cx={rPx} cy={0} r={4} fill={COLOR_RADIUS} />

            {/* Radius Label */}
            <text
              x={rPx / 2}
              y={-10}
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
        )}

        {/* STEP 2: Slices Unfold into Two Opposing Rows */}
        {step === 2 && (
          <g transform={`translate(${unfoldStartX}, 22)`}>
            {/* Top Row of Slices (Pointing Down, Arcs on Top = πr) */}
            <g transform="translate(0, 0)">
              {Array.from({ length: halfSectors }, (_, i) => {
                const sx = i * sectorArcLen;
                const midX = sx + sectorArcLen / 2;
                // Curved wedge pointing downward
                const d = `M ${sx} 0 A ${rPx * 1.5} ${rPx * 0.4} 0 0 1 ${sx + sectorArcLen} 0 L ${midX} ${rPx} Z`;
                return (
                  <path
                    key={`top-wedge-${i}`}
                    d={d}
                    fill={COLOR_SECTOR_A}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth={1.2}
                  />
                );
              })}
              {/* Top Arc Callout = πr */}
              <line x1={0} y1={-4} x2={totalBaseW} y2={-4} stroke={COLOR_BASE} strokeWidth={2} strokeLinecap="round" />
              <text
                x={totalBaseW / 2}
                y={-12}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight="800"
                fill={COLOR_BASE}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
              >
                Top Arcs = ½ Circumference = πr ({cApprox})
              </text>
            </g>

            {/* Bottom Row of Slices (Pointing Up, Arcs on Bottom = πr) */}
            <g transform={`translate(0, ${rPx + 14})`}>
              {Array.from({ length: halfSectors }, (_, i) => {
                const sx = i * sectorArcLen;
                const midX = sx + sectorArcLen / 2;
                // Curved wedge pointing upward
                const d = `M ${midX} 0 L ${sx + sectorArcLen} ${rPx} A ${rPx * 1.5} ${rPx * 0.4} 0 0 1 ${sx} ${rPx} Z`;
                return (
                  <path
                    key={`bot-wedge-${i}`}
                    d={d}
                    fill={COLOR_SECTOR_B}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth={1.2}
                  />
                );
              })}
              {/* Bottom Arc Callout = πr */}
              <line x1={0} y1={rPx + 6} x2={totalBaseW} y2={rPx + 6} stroke={COLOR_BASE} strokeWidth={2} strokeLinecap="round" />
              <text
                x={totalBaseW / 2}
                y={rPx + 18}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight="800"
                fill={COLOR_BASE}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
              >
                Bottom Arcs = ½ Circumference = πr ({cApprox})
              </text>
            </g>
          </g>
        )}

        {/* STEP 3: Slices Interlock to Form a Parallelogram */}
        {step === 3 && (
          <g transform={`translate(${unfoldStartX - 10}, 36)`}>
            {/* Top Slices (Fitted in alternating gaps) */}
            {Array.from({ length: halfSectors }, (_, i) => {
              const sx = i * sectorArcLen;
              const midX = sx + sectorArcLen / 2;
              const d = `M ${sx} 0 A ${rPx * 1.5} ${rPx * 0.35} 0 0 1 ${sx + sectorArcLen} 0 L ${midX} ${rPx} Z`;
              return (
                <path
                  key={`fit-top-${i}`}
                  d={d}
                  fill={COLOR_SECTOR_A}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.2}
                />
              );
            })}

            {/* Bottom Slices (Interlocked from bottom) */}
            {Array.from({ length: halfSectors }, (_, i) => {
              const sx = i * sectorArcLen + sectorArcLen / 2;
              const midX = sx + sectorArcLen / 2;
              const d = `M ${midX} 0 L ${sx + sectorArcLen} ${rPx} A ${rPx * 1.5} ${rPx * 0.35} 0 0 1 ${sx} ${rPx} Z`;
              return (
                <path
                  key={`fit-bot-${i}`}
                  d={d}
                  fill={COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.2}
                />
              );
            })}

            {/* Base Dimension Bracket Along Bottom (b = πr) */}
            <line x1={0} y1={rPx + 7} x2={totalBaseW} y2={rPx + 7} stroke={COLOR_BASE} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={0} y1={rPx + 3} x2={0} y2={rPx + 11} stroke={COLOR_BASE} strokeWidth={2} />
            <line x1={totalBaseW} y1={rPx + 3} x2={totalBaseW} y2={rPx + 11} stroke={COLOR_BASE} strokeWidth={2} />
            <text
              x={totalBaseW / 2}
              y={rPx + 22}
              textAnchor="middle"
              fontSize={12}
              fontWeight="900"
              fill={COLOR_BASE}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              base = π · r ({radiusUnits}π)
            </text>

            {/* Height Dimension Line (h = r) */}
            <line
              x1={totalBaseW + sectorArcLen / 2 + 10}
              y1={0}
              x2={totalBaseW + sectorArcLen / 2 + 10}
              y2={rPx}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray="3 2"
            />
            <circle cx={totalBaseW + sectorArcLen / 2 + 10} cy={0} r={2.5} fill={COLOR_RADIUS} />
            <circle cx={totalBaseW + sectorArcLen / 2 + 10} cy={rPx} r={2.5} fill={COLOR_RADIUS} />
            <text
              x={totalBaseW + sectorArcLen / 2 + 20}
              y={rPx / 2}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={12}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              h = r ({radiusUnits})
            </text>
          </g>
        )}
      </svg>

      {/* Frosted Multi-Step Navigation Tabs & Radius Stepper */}
      <div className="flex items-center gap-2 select-none">
        {/* [- r = N +] Radius Stepper */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => changeRadius(-1)}
            disabled={radiusUnits <= MIN_RADIUS}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-full text-white/90 transition-all border-none bg-transparent active:scale-95",
              radiusUnits <= MIN_RADIUS ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20 cursor-pointer"
            )}
            aria-label="Decrease radius"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <span
            style={{ color: COLOR_RADIUS }}
            className="px-1 text-xs font-headline font-black tracking-wide min-w-[34px] text-center"
          >
            r = {radiusUnits}
          </span>

          <button
            onClick={() => changeRadius(1)}
            disabled={radiusUnits >= MAX_RADIUS}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-full text-white/90 transition-all border-none bg-transparent active:scale-95",
              radiusUnits >= MAX_RADIUS ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20 cursor-pointer"
            )}
            aria-label="Increase radius"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Multi-Step Frosted Pills */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => setStep(1)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 1 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            1. Circle
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. Unfold
          </button>
          <button
            onClick={() => setStep(3)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 3 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            3. Parallelogram
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        {step === 1 && (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">A</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">π ·</span>
            <span style={{ color: COLOR_RADIUS }}>{radiusUnits}²</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_AREA }} className="font-bold">{areaCoeff}π</span>
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span className="text-white">Half Circumference</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">½(2πr)</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_BASE }} className="font-bold">π · {radiusUnits}</span>
          </div>
        )}

        {step === 3 && (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span className="text-white">A</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">base · height</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_BASE }} className="font-bold">(π · {radiusUnits})</span>
            <span className="text-white/50">·</span>
            <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_AREA }} className="font-bold">{areaCoeff}π</span>
          </div>
        )}
      </div>
    </div>
  );
}
