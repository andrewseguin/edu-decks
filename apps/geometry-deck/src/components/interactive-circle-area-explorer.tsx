"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Minus, Plus, Play, Pause, RotateCcw } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);

  // Smooth continuous animation progress:
  // 0.0 = Circle
  // 1.0 = Unfolded Rows
  // 2.0 = Interlocked Parallelogram
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const targetProgress = step === 1 ? 0 : step === 2 ? 1 : 2;

  // Smooth transition interpolation when target step changes
  useEffect(() => {
    let start: number | null = null;
    const startP = animProgress;
    const targetP = targetProgress;
    if (Math.abs(startP - targetP) < 0.005) return;

    const duration = 650; // 650ms smooth morphing animation

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
    }, 2200);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, step]);

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
  const totalBaseW = Math.PI * rPx; // total length of unrolled half = πr
  const sectorW = totalBaseW / halfSectors; // width of 1 wedge along arc

  // Layout positions
  const circleCY = 72;
  const unfoldStartX = CX - totalBaseW / 2;

  // Compute animated (x, y, rotation) for each sector slice i
  const p = animProgress;

  const slices = Array.from({ length: numSectors }, (_, i) => {
    const isEven = i % 2 === 0;
    const col = isEven ? i / 2 : (i - 1) / 2;

    // 1. Circle Pose (p = 0)
    const circleAngleDeg = (i + 0.5) * 45 - 90;
    const circleX = CX;
    const circleY = circleCY;

    // 2. Unfolded Rows Pose (p = 1)
    const unfoldX = unfoldStartX + col * sectorW + sectorW / 2;
    const unfoldY = isEven ? 22 + rPx : 22 + rPx + 24;
    const unfoldRotDeg = isEven ? 0 : 180;

    // 3. Parallelogram Pose (p = 2)
    const paraX = isEven ? unfoldStartX + col * sectorW + sectorW / 2 : unfoldStartX + col * sectorW + sectorW;
    const paraY = isEven ? 36 + rPx : 36;
    const paraRotDeg = isEven ? 0 : 180;

    let curX: number, curY: number, curRot: number;

    if (p <= 1) {
      // Morph from Circle (0) -> Unfolded Rows (1)
      const t = p;
      curX = circleX + (unfoldX - circleX) * t;
      curY = circleY + (unfoldY - circleY) * t;

      // Unwind rotation from radial angle to 0 / 180
      let rotDiff = unfoldRotDeg - circleAngleDeg;
      // normalize shortest angle path
      while (rotDiff > 180) rotDiff -= 360;
      while (rotDiff < -180) rotDiff += 360;
      curRot = circleAngleDeg + rotDiff * t;
    } else {
      // Morph from Unfolded Rows (1) -> Parallelogram (2)
      const t = p - 1;
      curX = unfoldX + (paraX - unfoldX) * t;
      curY = unfoldY + (paraY - unfoldY) * t;
      curRot = unfoldRotDeg;
    }

    return {
      i,
      isEven,
      curX,
      curY,
      curRot,
    };
  });

  // Wedge path template: Tip at (0, 0), arc at ( -w/2, -rPx ) -> ( +w/2, -rPx )
  const halfW = sectorW / 2;
  const wedgePath = `M 0 0 L ${-halfW} ${-rPx} A ${rPx * 1.5} ${rPx * 0.35} 0 0 1 ${halfW} ${-rPx} Z`;

  // Opacity of dimension labels during transitions
  const circleLabelOpacity = Math.max(0, 1 - animProgress * 3);
  const unfoldLabelOpacity = Math.max(0, 1 - Math.abs(animProgress - 1) * 2.5);
  const paraLabelOpacity = Math.max(0, (animProgress - 1.2) * 1.25);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* Ghost background circle outline (fades out as slices unfold) */}
        {circleLabelOpacity > 0.01 && (
          <g opacity={circleLabelOpacity}>
            <circle cx={CX} cy={circleCY} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={CX} cy={circleCY} r={3} fill="#ffffff" />
            {/* Radius Spoke */}
            <line x1={CX} y1={circleCY} x2={CX + rPx} y2={circleCY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={CX + rPx} cy={circleCY} r={4} fill={COLOR_RADIUS} />
            <text
              x={CX + rPx / 2}
              y={circleCY - 10}
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

        {/* 8 Dynamically Morphing Pie Slices */}
        {slices.map(({ i, isEven, curX, curY, curRot }) => (
          <g
            key={i}
            transform={`translate(${curX}, ${curY}) rotate(${curRot})`}
          >
            <path
              d={wedgePath}
              fill={isEven ? COLOR_SECTOR_A : COLOR_SECTOR_B}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth={1.2}
            />
          </g>
        ))}

        {/* Step 2 Unfolded Labels: Top & Bottom Arc lengths (πr) */}
        {unfoldLabelOpacity > 0.01 && (
          <g opacity={unfoldLabelOpacity} transform={`translate(${unfoldStartX}, 22)`}>
            {/* Top Arc Callout */}
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

            {/* Bottom Arc Callout */}
            <line x1={0} y1={rPx * 2 + 30} x2={totalBaseW} y2={rPx * 2 + 30} stroke={COLOR_BASE} strokeWidth={2} strokeLinecap="round" />
            <text
              x={totalBaseW / 2}
              y={rPx * 2 + 42}
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
        )}

        {/* Step 3 Parallelogram Labels: Base = πr and Height = r */}
        {paraLabelOpacity > 0.01 && (
          <g opacity={paraLabelOpacity} transform={`translate(${unfoldStartX}, 36)`}>
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
              x1={totalBaseW + halfW + 10}
              y1={0}
              x2={totalBaseW + halfW + 10}
              y2={rPx}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray="3 2"
            />
            <circle cx={totalBaseW + halfW + 10} cy={0} r={2.5} fill={COLOR_RADIUS} />
            <circle cx={totalBaseW + halfW + 10} cy={rPx} r={2.5} fill={COLOR_RADIUS} />
            <text
              x={totalBaseW + halfW + 20}
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

      {/* Frosted Multi-Step Navigation Tabs & Controls */}
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

        {/* Multi-Step Frosted Navigation Pills */}
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
            2. Unfold
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
