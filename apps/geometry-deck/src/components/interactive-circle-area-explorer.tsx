"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type InteractiveCircleAreaProps = {
  color?: string;
};

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (Radius r & Height)
const COLOR_AREA = "#ffffff";   // Crisp Bold White
const COLOR_SECTOR = "rgba(255, 255, 255, 0.18)"; // Neutral dim translucent white fill

const MIN_RADIUS = 1;
const MAX_RADIUS = 5;

type SectorCount = 4 | 8 | 16 | 32 | 64;

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(360);
  const containerW = Math.max(340, Math.min(650, rawW - 16));
  const SVG_W = containerW;

  const [radiusUnits, setRadiusUnits] = useState(1);
  const [animatedRadius, setAnimatedRadius] = useState(1); // Smooth camera zoom
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1. Circle, 2. Unroll, 3. Combine
  const [unrollProgress, setUnrollProgress] = useState(0); // 0.0 (Circle) -> 1.0 (Unrolled) -> 2.0 (Parallelogram)
  const [isPlaying, setIsPlaying] = useState(true);
  const [sectorCount, setSectorCount] = useState<SectorCount>(8);

  const svgRef = useRef<SVGSVGElement>(null);
  const autoplayRef = useRef<number>(0);
  const zoomAnimRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Smoothly animate camera zoom when switching radius
  useEffect(() => {
    let start: number | null = null;
    const startR = animatedRadius;
    const targetR = radiusUnits;
    if (Math.abs(startR - targetR) < 0.001) return;

    const duration = 650;

    const animateZoom = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const currentR = startR + (targetR - startR) * ease;
      setAnimatedRadius(currentR);

      if (t < 1) {
        zoomAnimRef.current = requestAnimationFrame(animateZoom);
      }
    };

    zoomAnimRef.current = requestAnimationFrame(animateZoom);

    return () => cancelAnimationFrame(zoomAnimRef.current);
  }, [radiusUnits]);

  // Wide Spatial Dimensions extending near edges without clipping:
  const maxVal = animatedRadius * 7;
  const rPx = Math.floor((SVG_W - 36) / 8.3);
  const availableRulerW = 7 * rPx;
  const startX = rPx + 18;
  const rightEdge = startX + availableRulerW;
  const pxPerUnit = availableRulerW / maxVal;

  const groundY = Math.round(rPx * 2 + 14);
  const centerY = groundY - rPx;
  const SVG_H = groundY + 42;

  // Real world math
  const fullCircumVal = 2 * Math.PI * radiusUnits;
  const fullRollDist = fullCircumVal * pxPerUnit; // distance along ruler corresponding to 2πr
  const halfRollDist = Math.PI * radiusUnits * pxPerUnit; // distance corresponding to πr

  // Active number of slices across all steps (4, 8, 16, 32, or 64)
  const activeN = sectorCount;
  const singleToothW = fullRollDist / activeN;
  const halfW = singleToothW / 2;

  const areaCoeff = radiusUnits * radiusUnits;

  // Step target progress
  const targetProgress = step === 1 ? 0 : step === 2 ? 1 : 2;

  // Smooth transition when changing step tabs
  useEffect(() => {
    let start: number | null = null;
    const startP = unrollProgress;
    const targetP = targetProgress;
    if (Math.abs(startP - targetP) < 0.005) return;

    const stepDiff = Math.abs(targetP - startP);
    const duration = Math.round((startP >= 0.99 || targetP >= 1.99 ? 3200 : 2600) * stepDiff);

    const stepAnim = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 0.5 * (1 - Math.cos(t * Math.PI));
      const currentP = startP + (targetP - startP) * ease;
      setUnrollProgress(currentP);

      if (t < 1) {
        autoplayRef.current = requestAnimationFrame(stepAnim);
      }
    };

    autoplayRef.current = requestAnimationFrame(stepAnim);

    return () => cancelAnimationFrame(autoplayRef.current);
  }, [step]);

  // Autoplay loop across 1 -> 2 -> 3 -> 1 with 2s initial diagram dwell time
  useEffect(() => {
    if (!isPlaying) return;

    const dwell = step === 1 ? 2000 : step === 2 ? 4600 : 5400;

    const timer = setTimeout(() => {
      setStep((prev) => {
        return prev === 1 ? 2 : prev === 2 ? 3 : 1;
      });
    }, dwell);

    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const changeRadius = (delta: number) => {
    const nextR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radiusUnits + delta));
    if (nextR !== radiusUnits) {
      setRadiusUnits(nextR);
      setStep(1);
      setUnrollProgress(0);
      setIsPlaying(false);
    }
  };

  // Stage 1 (p1 in [0..1]): Wheel rolls 2πr and unrolls N slices in a line on the ground
  // Stage 2 (p2 in [0..1]): Pure Lift -> Flip in Sky -> Slide -> Drop into Slots
  const p1 = Math.min(1, unrollProgress);
  const p2 = Math.max(0, unrollProgress - 1);

  const currentWheelX = startX + p1 * fullRollDist;

  // CANONICAL TRUE PIE SECTOR PATH HELPER (Subtending 360 / activeN degrees)
  const halfAngle = Math.PI / activeN;
  const sinH = Math.sin(halfAngle);
  const cosH = Math.cos(halfAngle);
  const ax1 = -rPx * sinH;
  const ay1 = -rPx * cosH;
  const ax2 = rPx * sinH;
  const ay2 = -rPx * cosH;
  const activeSectorPath = `M 0 0 L ${ax1} ${ay1} A ${rPx} ${rPx} 0 0 1 ${ax2} ${ay2} Z`;

  // Radius spoke pointing straight DOWN at start (6 o'clock) and rotating with wheel
  const spokeAngleRad = (90 + p1 * 360) * (Math.PI / 180);
  const spokeTipX = rPx * Math.cos(spokeAngleRad);
  const spokeTipY = rPx * Math.sin(spokeAngleRad);

  // Integer Ticks & Pi Milestones matching Circumference card
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits <= 4 ? radiusUnits : 5;
  const maxTickToRender = Math.ceil(maxVal) + 5;

  // Exact Trigonometric Edge-Sharing Geometry for Step 3:
  const trigSlotW = 2 * rPx * sinH;
  const trigHeight = rPx * cosH;

  // Height callout x position at right edge of assembled parallelogram (strictly outside slices)
  const rightmostSliceX = startX + (activeN + 1) * rPx * sinH;
  const targetHeightX = rightmostSliceX + 12;
  const startRadiusScootX = startX + fullRollDist;
  const scootT = Math.min(1, Math.max(0, (p2 - 0.70) / 0.30));
  const scootEase = 0.5 * (1 - Math.cos(scootT * Math.PI));
  const currentHeightCalloutX = startRadiusScootX + (targetHeightX - startRadiusScootX) * scootEase;

  const isCompact = rawW < 460;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full max-w-[650px] mx-auto select-none" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 155 }}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* Ruler Axis Line */}
        <line x1={startX - 8} y1={groundY} x2={rightEdge + 8} y2={groundY} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={2} />

        {/* Integer Ticks and Labels (Large, bold, high-contrast) */}
        {Array.from({ length: maxTickToRender + 1 }, (_, t) => {
          const tickX = startX + t * pxPerUnit;
          if (tickX > rightEdge + 25) return null;
          let opacity = tickX <= rightEdge ? 1 : Math.max(0, 1 - (tickX - rightEdge) / 20);
          if (p2 > 0.4 && tickX >= startX && tickX <= startX + halfRollDist) {
            opacity *= Math.max(0.15, 1 - (p2 - 0.4) * 1.5);
          }
          const isMajor = t % tickStep === 0;

          return (
            <g key={t} opacity={opacity}>
              <line
                x1={tickX}
                y1={groundY - (isMajor ? 5 : 2.5)}
                x2={tickX}
                y2={groundY + (isMajor ? 5 : 2.5)}
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth={isMajor ? 2 : 1.2}
                opacity={isMajor ? 1 : 0.45}
              />
              {isMajor && (
                <text
                  x={tickX}
                  y={groundY + 15}
                  textAnchor="middle"
                  fontSize={13.5}
                  fontWeight="900"
                  fill="rgba(255, 255, 255, 0.85)"
                  fontFamily="var(--font-heading, system-ui)"
                >
                  {t}
                </text>
              )}
            </g>
          );
        })}

        {/* Half-turn π marker below number line */}
        <g transform={`translate(${startX + halfRollDist}, ${groundY})`}>
          <line x1={0} y1={-5} x2={0} y2={16} stroke="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
          <circle cx={0} cy={0} r={3} fill="#ffffff" />
          <text
            x={0}
            y={29}
            textAnchor="middle"
            fontSize={14}
            fontWeight="900"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
          >
            {radiusUnits === 1 ? (
              <tspan fill="#ffffff">π</tspan>
            ) : (
              <>
                <tspan fill={COLOR_RADIUS}>{radiusUnits}</tspan>
                <tspan fill="#ffffff">π</tspan>
              </>
            )}
          </text>
        </g>

        {/* Finish 2π marker below number line */}
        <g transform={`translate(${startX + fullRollDist}, ${groundY})`}>
          <line x1={0} y1={-4} x2={0} y2={16} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.8} strokeDasharray="2.5 2" />
          <circle cx={0} cy={0} r={2.2} fill="#ffffff" />
          <text
            x={0}
            y={29}
            textAnchor="middle"
            fontSize={13.5}
            fontWeight="900"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
          >
            {radiusUnits === 1 ? (
              <tspan fill="#ffffff">2π</tspan>
            ) : (
              <>
                <tspan fill="#ffffff">2·</tspan>
                <tspan fill={COLOR_RADIUS}>{radiusUnits}</tspan>
                <tspan fill="#ffffff">π</tspan>
              </>
            )}
          </text>
        </g>

        {/* Base Dimension Bracket Along Bottom (π · r in Step 3) */}
        {p2 > 0.4 && (
          <g opacity={Math.min(1, (p2 - 0.4) * 2.5)}>
            <line x1={startX} y1={groundY + 6} x2={startX + halfRollDist} y2={groundY + 6} stroke="rgba(255, 255, 255, 0.75)" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={startX} y1={groundY + 1} x2={startX} y2={groundY + 11} stroke="rgba(255, 255, 255, 0.75)" strokeWidth={2} />
            <line x1={startX + halfRollDist} y1={groundY + 1} x2={startX + halfRollDist} y2={groundY + 11} stroke="rgba(255, 255, 255, 0.75)" strokeWidth={2} />
            <text
              x={startX + halfRollDist / 2}
              y={groundY + 22}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight="900"
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              <tspan fill="#ffffff">π · </tspan>
              <tspan fill={COLOR_RADIUS}>r</tspan>
            </text>
          </g>
        )}

        {/* Persisted Cyan Radius Line Scooting over to become Height Callout (r) */}
        {p1 >= 0.999 && (
          <g>
            <line
              x1={currentHeightCalloutX}
              y1={groundY - rPx}
              x2={currentHeightCalloutX}
              y2={groundY}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray={p2 > 0.6 ? "4 2.5" : "none"}
            />
            <circle cx={currentHeightCalloutX} cy={groundY - rPx} r={3} fill={COLOR_RADIUS} />
            <circle cx={currentHeightCalloutX} cy={groundY} r={3} fill={COLOR_RADIUS} />
            
            {/* Label stays as r = N */}
            <text
              x={currentHeightCalloutX + (p2 > 0.6 ? 8 : 0)}
              y={p2 > 0.6 ? groundY - rPx / 2 : groundY - rPx - 13}
              textAnchor={p2 > 0.6 ? "start" : "middle"}
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              r = {radiusUnits}
            </text>
          </g>
        )}

        {/* Active N Slices on Ground (With exact trigonometric edge alignment) */}
        {Array.from({ length: activeN }, (_, k) => {
          const handoverProgress = (k + 0.5) / activeN;
          if (p1 < handoverProgress && p1 < 0.999) return null; // still attached to rolling wheel!

          const isEven = k % 2 === 0;

          // Ground position during unrolling (Step 2)
          const groundX = startX + k * singleToothW + halfW;
          const groundApexY = groundY - rPx;

          // Exact trigonometric target position for interlocking Step 3
          const pairIdx = Math.floor(k / 2);
          const targetX = isEven
            ? startX + rPx * sinH + pairIdx * trigSlotW
            : startX + 2 * rPx * sinH + pairIdx * trigSlotW;
          const targetSlotApexY = isEven ? groundY - trigHeight : groundY;

          let curX = groundX;
          let curY = groundApexY;
          let curRot = 180;

          if (p2 > 0) {
            const t = p2;

            const sub1 = Math.min(1, Math.max(0, t / 0.20));
            const sub2 = Math.min(1, Math.max(0, (t - 0.20) / 0.20));
            const sub3 = Math.min(1, Math.max(0, (t - 0.40) / 0.30));
            const sub4 = Math.min(1, Math.max(0, (t - 0.70) / 0.30));

            const ease1 = 0.5 * (1 - Math.cos(sub1 * Math.PI));
            const ease2 = 0.5 * (1 - Math.cos(sub2 * Math.PI));
            const ease3 = 0.5 * (1 - Math.cos(sub3 * Math.PI));
            const ease4 = 0.5 * (1 - Math.cos(sub4 * Math.PI));

            if (isEven) {
              curX = groundX + (targetX - groundX) * ease3;
              curY = groundApexY + (targetSlotApexY - groundApexY) * ease3;
              curRot = 180;
            } else {
              const hoverApexY = groundY - rPx - 8;
              const finalSlotApexY = targetSlotApexY;

              const liftedApexY = groundApexY - (rPx + 8);
              const yLifted = groundApexY + (liftedApexY - groundApexY) * ease1;
              const yAfterFlip = yLifted + (hoverApexY - liftedApexY) * ease2;

              curX = groundX + (targetX - groundX) * ease3;
              curY = yAfterFlip + (finalSlotApexY - hoverApexY) * ease4;
              curRot = 180 - 180 * ease2;
            }
          }

          return (
            <g
              key={`ground-slice-${k}`}
              transform={`translate(${curX}, ${curY}) rotate(${curRot})`}
            >
              <path
                d={activeSectorPath}
                fill={COLOR_SECTOR}
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth={activeN >= 64 ? 0.75 : activeN >= 32 ? 1 : activeN >= 16 ? 1.3 : 1.6}
              />
            </g>
          );
        })}

        {/* Rolling Wheel Group (Slices on wheel dynamically match activeN across Step 1 and Step 2) */}
        {p1 < 1 && (
          <g transform={`translate(${currentWheelX}, ${centerY})`}>
            {/* Ghost wheel outline */}
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.8} strokeDasharray="4 3" />
            <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.06)" />

            {/* Active Slices Remaining inside Wheel */}
            {Array.from({ length: activeN }, (_, i) => {
              const handoverProgress = (i + 0.5) / activeN;
              if (p1 >= handoverProgress) return null; // cleanly handed over to ground!

              const baseAngle = 180 - 180 / activeN;
              const angleDeg = baseAngle - i * (360 / activeN) + p1 * 360;

              return (
                <g key={`wheel-slice-${i}`} transform={`rotate(${angleDeg})`}>
                  <path
                    d={activeSectorPath}
                    fill={COLOR_SECTOR}
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth={activeN >= 64 ? 0.75 : activeN >= 32 ? 1 : activeN >= 16 ? 1.3 : 1.6}
                  />
                </g>
              );
            })}

            {/* Center Hub & Radius Spoke Facing DOWN at Start (and rotating with wheel) */}
            <circle cx={0} cy={0} r={3} fill="#ffffff" />
            <line x1={0} y1={0} x2={spokeTipX} y2={spokeTipY} stroke={COLOR_RADIUS} strokeWidth={2.5} strokeDasharray="3 2" />
            <circle cx={spokeTipX} cy={spokeTipY} r={3.5} fill={COLOR_RADIUS} />

            {/* Static Radius Label above center point */}
            <text
              x={0}
              y={-13}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="900"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              r = {radiusUnits}
            </text>
          </g>
        )}
      </svg>

      {/* Row 1: Animation Step Tabs (Segmented switcher with solid active pill) */}
      <div className="flex justify-center select-none">
        <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md p-1 rounded-full border border-white/30 shadow-md">
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(1);
            }}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
              step === 1
                ? "bg-white text-purple-950 font-black shadow-md scale-[1.02]"
                : "bg-transparent text-white/85 hover:text-white hover:bg-white/10"
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
              "px-3.5 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
              step === 2
                ? "bg-white text-purple-950 font-black shadow-md scale-[1.02]"
                : "bg-transparent text-white/85 hover:text-white hover:bg-white/10"
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
              "px-3.5 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
              step === 3
                ? "bg-white text-purple-950 font-black shadow-md scale-[1.02]"
                : "bg-transparent text-white/85 hover:text-white hover:bg-white/10"
            )}
          >
            3. Combine
          </button>
        </div>
      </div>

      {/* Row 2: Parameters (Radius & Slices) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 select-none">
        {/* Radius Stepper */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
          <button
            onClick={() => changeRadius(-1)}
            disabled={radiusUnits <= MIN_RADIUS}
            className={cn(
              "w-5 h-5 flex items-center justify-center rounded-full text-white/90 transition-all border-none bg-transparent active:scale-95",
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
              "w-5 h-5 flex items-center justify-center rounded-full text-white/90 transition-all border-none bg-transparent active:scale-95",
              radiusUnits >= MAX_RADIUS ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20 cursor-pointer"
            )}
            aria-label="Increase radius"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Slices Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
          <span className="text-xs text-white/70 font-bold px-0.5">Slices:</span>
          {([4, 8, 16, 32, 64] as const).map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setIsPlaying(false);
                setSectorCount(cnt);
              }}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                sectorCount === cnt ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/65 hover:text-white"
              )}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-5 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base md:text-lg font-bold font-headline select-none">
          <span className="text-white">A</span>
          <span className="text-white/50">=</span>
          <span className="text-white">π</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}</span>
          <span className="text-white/50">=</span>
          <span className="text-white">π</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_RADIUS }} className="font-bold">{radiusUnits}²</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{areaCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
