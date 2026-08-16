"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Play, Pause, Minus, Plus } from "lucide-react";

type InteractiveCircleAreaProps = {
  color?: string;
};

const SVG_H = 165;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (Radius r & Height)
const COLOR_BASE = "#ffd45e";   // Warm Gold (Base πr & Circumference)
const COLOR_AREA = "#ffffff";   // Crisp Bold White
const COLOR_SECTOR_A = "rgba(94, 232, 255, 0.55)"; // Electric Cyan Sector (Base teeth)
const COLOR_SECTOR_B = "rgba(216, 180, 254, 0.55)"; // Radiant Lilac Sector (Flipping teeth)

const MIN_RADIUS = 1;
const MAX_RADIUS = 5;
const NUM_SECTORS = 8;

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(3);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1. Circle, 2. Unroll, 3. Parallelogram
  const [isPlaying, setIsPlaying] = useState(false);

  // Smooth continuous animation progress:
  // 0.0 = Circle (Step 1)
  // 1.0 = All 8 unrolled in a line of length 2πr (Step 2)
  // 2.0 = Half flipped into parallelogram of length πr (Step 3)
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const targetProgress = step === 1 ? 0 : step === 2 ? 1 : 2;

  // Smooth step animation interpolation
  useEffect(() => {
    let start: number | null = null;
    const startP = animProgress;
    const targetP = targetProgress;
    if (Math.abs(startP - targetP) < 0.005) return;

    const duration = 800; // 800ms smooth physical transition

    const stepAnim = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic ease in-out
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

  // Autoplay loop across steps 1 -> 2 -> 3 -> 1
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      return;
    }

    playTimerRef.current = setTimeout(() => {
      setStep((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
    }, 2800);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, step]);

  // Radius sizing
  const startX = 46;
  const availableW = SVG_W - 92;
  const maxLineW = availableW;
  const rPx = Math.min(34, Math.max(22, maxLineW / (2 * Math.PI))); // visual radius
  const fullCircumW = 2 * Math.PI * rPx; // 2πr length
  const halfCircumW = Math.PI * rPx; // πr length
  const singleToothW = fullCircumW / NUM_SECTORS; // width of 1 wedge along arc
  const halfW = singleToothW / 2;

  const groundY = 108;
  const centerY = groundY - rPx;

  const areaCoeff = radiusUnits * radiusUnits;
  const cHalfApprox = Math.round(Math.PI * radiusUnits * 100) / 100;
  const cFullApprox = Math.round(2 * Math.PI * radiusUnits * 100) / 100;

  const changeRadius = (delta: number) => {
    const nextR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radiusUnits + delta));
    setRadiusUnits(nextR);
  };

  // Dynamic progress values for the 2 stages:
  // p1 in [0 .. 1]: Unrolling 8 slices across 2πr
  // p2 in [0 .. 1]: Flipping half into parallelogram of width πr
  const p1 = Math.min(1, animProgress);
  const p2 = Math.max(0, animProgress - 1);

  const currentWheelX = startX + p1 * fullCircumW;

  // Single Wedge path template (pointing UP: apex at (w/2, -rPx), arc at bottom (0,0) to (w,0))
  const wedgeUpPath = `M ${halfW} ${-rPx} L ${singleToothW} 0 A ${rPx * 1.5} ${rPx * 0.3} 0 0 1 0 0 Z`;

  const sectorAngle = (2 * Math.PI) / NUM_SECTORS;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* Baseline Ruler */}
        <line x1={startX - 10} y1={groundY} x2={startX + fullCircumW + 15} y2={groundY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

        {/* Start Tick (0) */}
        <line x1={startX} y1={groundY - 3} x2={startX} y2={groundY + 3} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} />
        <text
          x={startX}
          y={groundY + 14}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill="rgba(255, 255, 255, 0.55)"
          fontFamily="var(--font-heading, system-ui)"
        >
          0
        </text>

        {/* Step 2: Full Circumference Callout (2πr) */}
        {p2 < 0.6 && p1 > 0.4 && (
          <g opacity={Math.max(0, (p1 - 0.4) * 2 * (1 - p2 * 2))}>
            <line x1={startX + fullCircumW} y1={groundY - 5} x2={startX + fullCircumW} y2={18} stroke={COLOR_BASE} strokeWidth={2} />
            <circle cx={startX + fullCircumW} cy={groundY} r={2.5} fill={COLOR_BASE} />
            <text
              x={startX + fullCircumW}
              y={groundY + 28}
              textAnchor="middle"
              fontSize={11}
              fontWeight="900"
              fill={COLOR_BASE}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              2πr ({cFullApprox})
            </text>
          </g>
        )}

        {/* Step 3: Parallelogram Base Callout (b = πr) & Height Callout (h = r) */}
        {p2 > 0.1 && (
          <g opacity={Math.min(1, p2 * 1.5)}>
            <line x1={startX} y1={groundY + 6} x2={startX + halfCircumW} y2={groundY + 6} stroke={COLOR_BASE} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={startX} y1={groundY + 2} x2={startX} y2={groundY + 10} stroke={COLOR_BASE} strokeWidth={2} />
            <line x1={startX + halfCircumW} y1={groundY + 2} x2={startX + halfCircumW} y2={groundY + 10} stroke={COLOR_BASE} strokeWidth={2} />
            <text
              x={startX + halfCircumW / 2}
              y={groundY + 24}
              textAnchor="middle"
              fontSize={12}
              fontWeight="900"
              fill={COLOR_BASE}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              base = π · r ({cHalfApprox})
            </text>

            {/* Height Callout (h = r) */}
            <line
              x1={startX + halfCircumW + halfW + 10}
              y1={groundY - rPx}
              x2={startX + halfCircumW + halfW + 10}
              y2={groundY}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray="3 2"
            />
            <circle cx={startX + halfCircumW + halfW + 10} cy={groundY - rPx} r={2.5} fill={COLOR_RADIUS} />
            <circle cx={startX + halfCircumW + halfW + 10} cy={groundY} r={2.5} fill={COLOR_RADIUS} />
            <text
              x={startX + halfCircumW + halfW + 18}
              y={groundY - rPx / 2}
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

        {/* 8 Slices Laid Down on Ground / Morphing into Parallelogram */}
        {Array.from({ length: NUM_SECTORS }, (_, k) => {
          const sliceFraction = (k + 1) / NUM_SECTORS;
          if (sliceFraction > p1) return null; // not yet unrolled from wheel

          const isEven = k % 2 === 0;

          // Stage 1 straight line position: x = startX + k * singleToothW
          const lineX = startX + k * singleToothW;
          const lineY = groundY;
          const lineRot = 0; // pointing UP

          // Stage 2 parallelogram target position:
          // Even slices k = 0, 2, 4, 6 stay at compacted positions x = startX + (k/2) * (2 * singleToothW)
          // Odd slices k = 1, 3, 5, 7 flip 180° and slot into x = startX + ((k-1)/2) * (2 * singleToothW) + 2 * singleToothW
          const pairIdx = Math.floor(k / 2);
          const paraX = isEven
            ? startX + pairIdx * (2 * singleToothW)
            : startX + pairIdx * (2 * singleToothW) + 2 * singleToothW;
          const paraY = isEven ? groundY : groundY - rPx;
          const paraRot = isEven ? 0 : 180;

          // Smooth interpolation between Stage 1 line and Stage 2 parallelogram
          const t = p2;
          const curX = lineX + (paraX - lineX) * t;
          // Arc upward trajectory for flipping odd slices
          const liftY = !isEven ? Math.sin(t * Math.PI) * 20 : 0;
          const curY = lineY + (paraY - lineY) * t - liftY;
          const curRot = lineRot + (paraRot - lineRot) * t;

          return (
            <g
              key={`ground-slice-${k}`}
              transform={`translate(${curX}, ${curY}) rotate(${curRot})`}
            >
              <path
                d={wedgeUpPath}
                fill={isEven ? COLOR_SECTOR_A : COLOR_SECTOR_B}
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth={1.2}
              />
            </g>
          );
        })}

        {/* Rolling Wheel Group (Rolls across distance 2πr during Stage 1) */}
        {p1 < 1 && (
          <g transform={`translate(${currentWheelX}, ${centerY})`}>
            {/* Ghost wheel outline */}
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.06)" />

            {/* Slices Remaining on Wheel */}
            {Array.from({ length: NUM_SECTORS }, (_, i) => {
              const sliceFraction = (i + 1) / NUM_SECTORS;
              if (sliceFraction <= p1) return null; // already unrolled onto ground

              const startA = (90 - (sliceFraction - p1) * 360) * (Math.PI / 180);
              const endA = startA + sectorAngle;
              const x1 = rPx * Math.cos(startA);
              const y1 = rPx * Math.sin(startA);
              const x2 = rPx * Math.cos(endA);
              const y2 = rPx * Math.sin(endA);
              const d = `M 0 0 L ${x1} ${y1} A ${rPx} ${rPx} 0 0 1 ${x2} ${y2} Z`;

              return (
                <path
                  key={`wheel-slice-${i}`}
                  d={d}
                  fill={i % 2 === 0 ? COLOR_SECTOR_A : COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth={1.2}
                />
              );
            })}

            {/* Center Hub & Radius Spoke */}
            <circle cx={0} cy={0} r={3} fill="#ffffff" />
            <line x1={0} y1={0} x2={0} y2={-rPx} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={0} cy={-rPx} r={3.5} fill={COLOR_RADIUS} />

            {/* Radius Label */}
            <text
              x={10}
              y={-rPx / 2}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={11.5}
              fontWeight="800"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              r = {radiusUnits}
            </text>
          </g>
        )}
      </svg>

      {/* Frosted Controls: [- / +] Stepper, Multi-Step Navigation Pills, and Play/Pause Button */}
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

        {/* Multi-Step Frosted Navigation Pills: 1. Circle, 2. Unroll, 3. Parallelogram */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(1);
            }}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 1 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            1. Circle
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(2);
            }}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. Unroll
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(3);
            }}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 3 ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            3. Parallelogram
          </button>
        </div>

        {/* Play / Pause Auto-Tour Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 fill-current text-white/90" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current text-white/90" />
              <span>Play</span>
            </>
          )}
        </button>
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
            <span className="text-white">Row Length</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">Circumference</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_BASE }} className="font-bold">2 · π · {radiusUnits}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_BASE }} className="font-bold">{2 * radiusUnits}π</span>
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
