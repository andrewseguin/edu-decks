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
const COLOR_PI = "#f472b6";     // Vibrant Rose Pink (Pi markers)
const COLOR_SECTOR = "rgba(255, 255, 255, 0.18)"; // Neutral dim translucent white fill

const MIN_RADIUS = 1;
const MAX_RADIUS = 5;

type SectorCount = 8 | 16 | 32 | "inf";

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(1);
  const [animatedRadius, setAnimatedRadius] = useState(1); // Smooth camera zoom
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1. Circle, 2. Unroll, 3. Parallelogram
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

  // Spatial Dimensions matching Circumference card exactly
  const maxVal = animatedRadius * 7;
  const targetRulerW = Math.min(SVG_W - 120, Math.max(210, Math.min(300, (SVG_W - 80) * 0.78)));
  const rPx = targetRulerW / 7; // ~32px to 38px
  const availableRulerW = targetRulerW;
  const startX = Math.round((SVG_W - availableRulerW) / 2);
  const rightEdge = startX + availableRulerW;
  const pxPerUnit = availableRulerW / maxVal;

  const groundY = Math.round(rPx * 2 + 24); // ~92px
  const centerY = groundY - rPx;

  // Real world math
  const fullCircumVal = 2 * Math.PI * radiusUnits;
  const fullRollDist = fullCircumVal * pxPerUnit; // distance along ruler corresponding to 2πr
  const halfRollDist = Math.PI * radiusUnits * pxPerUnit; // distance corresponding to πr

  // Base 8-Sector geometry for unrolling
  const singleToothW = fullRollDist / 8;
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

    // 2.6s for unrolling (step 1->2), 3.2s for 4-stage elevator proof (step 2->3)
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
        if (prev === 3) setSectorCount(8); // reset sectors on loop
        return prev === 1 ? 2 : prev === 2 ? 3 : 1;
      });
    }, dwell);

    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  // Step 2: Direct 1:1 unrolling along ruler (0..2πr)
  const handleStep2TrackPointerDown = useCallback((e: React.PointerEvent) => {
    if (step !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    cancelAnimationFrame(autoplayRef.current);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const updateFromPointer = (clientX: number) => {
      const px = (clientX - rect.left) * scX;
      const prog = Math.max(0, Math.min(1, (px - startX) / fullRollDist));
      setUnrollProgress(prog); // strictly 0..1 in Step 2
    };

    updateFromPointer(e.clientX);

    const onMove = (ev: PointerEvent) => {
      updateFromPointer(ev.clientX);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [SVG_W, fullRollDist, startX, step]);

  const changeRadius = (delta: number) => {
    const nextR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radiusUnits + delta));
    if (nextR !== radiusUnits) {
      setRadiusUnits(nextR);
      setStep(1);
      setUnrollProgress(0);
      setIsPlaying(false);
      setSectorCount(8);
    }
  };

  // Stage 1 (p1 in [0..1]): Wheel rolls 2πr and unrolls 8 slices in a line on the ground
  // Stage 2 (p2 in [0..1]): Pure Lift -> Flip in Sky -> Slide -> Drop into Slots
  const p1 = Math.min(1, unrollProgress);
  const p2 = Math.max(0, unrollProgress - 1);

  const currentWheelX = startX + p1 * fullRollDist;

  // CANONICAL TRUE PIE SECTOR PATH HELPER
  const makeSectorPath = (numSectors: number) => {
    const halfAngle = Math.PI / numSectors;
    const sinH = Math.sin(halfAngle);
    const cosH = Math.cos(halfAngle);
    const ax1 = -rPx * sinH;
    const ay1 = -rPx * cosH;
    const ax2 = rPx * sinH;
    const ay2 = -rPx * cosH;
    return `M 0 0 L ${ax1} ${ay1} A ${rPx} ${rPx} 0 0 1 ${ax2} ${ay2} Z`;
  };

  const sectorPath8 = makeSectorPath(8);
  const sectorPath16 = makeSectorPath(16);
  const sectorPath32 = makeSectorPath(32);

  // Radius spoke pointing straight DOWN at start (6 o'clock) and rotating with wheel
  const spokeAngleRad = (90 + p1 * 360) * (Math.PI / 180);
  const spokeTipX = rPx * Math.cos(spokeAngleRad);
  const spokeTipY = rPx * Math.sin(spokeAngleRad);

  // Integer Ticks & Pi Milestones matching Circumference card
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits <= 4 ? radiusUnits : 5;
  const maxTickToRender = Math.ceil(maxVal) + 5;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2.5 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* Step 2 Interactive Track Hitbox */}
        {step === 2 && (
          <rect
            x={startX - 20}
            y={groundY - 60}
            width={availableRulerW + 40}
            height={90}
            fill="transparent"
            className="cursor-pointer"
            onPointerDown={handleStep2TrackPointerDown}
          />
        )}

        {/* Ruler Axis Line */}
        <line x1={startX - 10} y1={groundY} x2={rightEdge + 10} y2={groundY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

        {/* Integer Ticks and Labels (smoothly glides & matches circumference card) */}
        {Array.from({ length: maxTickToRender + 1 }, (_, t) => {
          const tickX = startX + t * pxPerUnit;
          if (tickX > rightEdge + 25) return null;
          const opacity = tickX <= rightEdge ? 1 : Math.max(0, 1 - (tickX - rightEdge) / 20);
          const isMajor = t % tickStep === 0;

          return (
            <g key={t} opacity={opacity}>
              <line
                x1={tickX}
                y1={groundY - (isMajor ? 3 : 1.8)}
                x2={tickX}
                y2={groundY + (isMajor ? 3 : 1.8)}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth={isMajor ? 1.5 : 1}
                opacity={isMajor ? 1 : 0.4}
              />
              {isMajor && (
                <text
                  x={tickX}
                  y={groundY + 13}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontWeight="bold"
                  fill="rgba(255, 255, 255, 0.55)"
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
          <line x1={0} y1={-4} x2={0} y2={17} stroke={COLOR_BASE} strokeWidth={2} />
          <circle cx={0} cy={0} r={2.5} fill={COLOR_BASE} />
          <text
            x={0}
            y={28}
            textAnchor="middle"
            fontSize={11}
            fontWeight="900"
            fill={COLOR_BASE}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {radiusUnits === 1 ? "π" : `${radiusUnits}π`}
          </text>
        </g>

        {/* Finish 2π marker below number line */}
        <g transform={`translate(${startX + fullRollDist}, ${groundY})`}>
          <line x1={0} y1={-4} x2={0} y2={17} stroke={COLOR_PI} strokeWidth={1.5} strokeDasharray="2 2" />
          <circle cx={0} cy={0} r={2} fill={COLOR_PI} />
          <text
            x={0}
            y={28}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight="900"
            fill={COLOR_PI}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {2 * radiusUnits}π
          </text>
        </g>

        {/* Dimension Callouts for Interlocked Parallelogram (Step 3) */}
        {p2 > 0.88 && (
          <g opacity={Math.min(1, (p2 - 0.88) * 8)}>
            {/* Base Dimension Bracket Along Bottom (b = πr) */}
            <line x1={startX} y1={groundY + 6} x2={startX + halfRollDist} y2={groundY + 6} stroke={COLOR_BASE} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={startX} y1={groundY + 2} x2={startX} y2={groundY + 10} stroke={COLOR_BASE} strokeWidth={2} />
            <line x1={startX + halfRollDist} y1={groundY + 2} x2={startX + halfRollDist} y2={groundY + 10} stroke={COLOR_BASE} strokeWidth={2} />

            {/* Height Callout (h = r) */}
            <line
              x1={startX + halfRollDist + halfW + 10}
              y1={groundY - rPx}
              x2={startX + halfRollDist + halfW + 10}
              y2={groundY}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray="3 2"
            />
            <circle cx={startX + halfRollDist + halfW + 10} cy={groundY - rPx} r={2.5} fill={COLOR_RADIUS} />
            <circle cx={startX + halfRollDist + halfW + 10} cy={groundY} r={2.5} fill={COLOR_RADIUS} />
            <text
              x={startX + halfRollDist + halfW + 18}
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

        {/* Step 3 Subdivided Sectors (When fully assembled at p2 >= 1 and sectorCount !== 8) */}
        {p2 >= 0.99 && sectorCount !== 8 ? (
          sectorCount === "inf" ? (
            /* Perfect Flat Rectangle (Limit as N -> ∞) */
            <g>
              <rect
                x={startX}
                y={groundY - rPx}
                width={halfRollDist}
                height={rPx}
                fill={COLOR_SECTOR}
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={1.5}
              />
              {/* Infinitesimal vertical slice grid lines */}
              {Array.from({ length: 32 }, (_, k) => {
                const sx = startX + (k / 32) * halfRollDist;
                return (
                  <line
                    key={`inf-line-${k}`}
                    x1={sx}
                    y1={groundY - rPx}
                    x2={sx}
                    y2={groundY}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth={0.75}
                  />
                );
              })}
            </g>
          ) : (
            /* 16 or 32 Fine Interlocking Slices */
            <g>
              {Array.from({ length: sectorCount as number }, (_, k) => {
                const n = sectorCount as number;
                const toothW = fullRollDist / n;
                const hW = toothW / 2;
                const isEven = k % 2 === 0;
                const pairIdx = Math.floor(k / 2);
                const apexX = isEven
                  ? startX + pairIdx * toothW + hW
                  : startX + pairIdx * toothW + toothW;
                const apexY = isEven ? groundY - rPx : groundY;
                const rot = isEven ? 180 : 0;
                const p = n === 16 ? sectorPath16 : sectorPath32;

                return (
                  <g key={`subdivided-slice-${k}`} transform={`translate(${apexX}, ${apexY}) rotate(${rot})`}>
                    <path
                      d={p}
                      fill={COLOR_SECTOR}
                      stroke="rgba(255, 255, 255, 0.65)"
                      strokeWidth={n === 32 ? 0.8 : 1}
                    />
                  </g>
                );
              })}
            </g>
          )
        ) : (
          /* Default 8-Sector Assembly (With 4-Stage Elevator Choreography) */
          Array.from({ length: 8 }, (_, k) => {
            const handoverProgress = (k + 0.5) / 8;
            if (p1 < handoverProgress && p1 < 0.999) return null; // still attached to rolling wheel!

            const isEven = k % 2 === 0;

            const groundX = startX + k * singleToothW + halfW;
            const groundApexY = groundY - rPx;

            const pairIdx = Math.floor(k / 2);
            const targetX = isEven
              ? startX + pairIdx * singleToothW + halfW
              : startX + pairIdx * singleToothW + singleToothW;

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
                curY = groundApexY;
                curRot = 180;
              } else {
                const hoverApexY = groundY - rPx - 8;
                const finalSlotApexY = groundY;

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
                  d={sectorPath8}
                  fill={COLOR_SECTOR}
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth={1.2}
                />
              </g>
            );
          })
        )}

        {/* Rolling Wheel Group (Slices rotate smoothly around wheel center until released) */}
        {p1 < 1 && (
          <g transform={`translate(${currentWheelX}, ${centerY})`}>
            {/* Ghost wheel outline */}
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.06)" />

            {/* Slices Remaining inside Wheel (Rotating around wheel center (0,0)) */}
            {Array.from({ length: 8 }, (_, i) => {
              const handoverProgress = (i + 0.5) / 8;
              if (p1 >= handoverProgress) return null; // cleanly handed over to ground!

              const angleDeg = 157.5 - i * (360 / 8) + p1 * 360;

              return (
                <g key={`wheel-slice-${i}`} transform={`rotate(${angleDeg})`}>
                  <path
                    d={sectorPath8}
                    fill={COLOR_SECTOR}
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth={1.2}
                  />
                </g>
              );
            })}

            {/* Center Hub & Radius Spoke Facing DOWN at Start (and rotating with wheel) */}
            <circle cx={0} cy={0} r={3} fill="#ffffff" />
            <line x1={0} y1={0} x2={spokeTipX} y2={spokeTipY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={spokeTipX} cy={spokeTipY} r={3.5} fill={COLOR_RADIUS} />

            {/* Static Radius Label above center point */}
            <text
              x={0}
              y={-12}
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

        {/* Drag Handle on Ground Wheel (Only visible and active in Step 2) */}
        {step === 2 && (
          <g
            transform={`translate(${currentWheelX}, ${groundY})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handleStep2TrackPointerDown}
          >
            <circle r={26} fill="transparent" />
            <circle r={9} fill="rgba(94, 232, 255, 0.25)" stroke={COLOR_RADIUS} strokeWidth={1.5} />
            <circle r={4.5} fill={COLOR_RADIUS} />
          </g>
        )}
      </svg>

      {/* Row 1: Primary Navigation Controls ([1. Circle | 2. Unroll | 3. Parallelogram] & [Play/Pause]) */}
      <div className="flex items-center gap-2 select-none justify-center">
        {/* Multi-Step Frosted Navigation Pills */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(1);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
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
              "px-3 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
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
              "px-3 py-1 rounded-full text-xs font-headline font-bold transition-all border-none",
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

      {/* Row 2: Secondary Settings ([ - r = N + ] Radius Stepper & [ Slices: 8 | 16 | 32 | ∞ ]) */}
      <div className="flex items-center gap-2 select-none justify-center">
        {/* [- r = N +] Radius Stepper */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => changeRadius(-1)}
            disabled={radiusUnits <= MIN_RADIUS}
            className={cn(
              "w-5 h-5 flex items-center justify-center rounded-full text-white/90 transition-all border-none bg-transparent active:scale-95",
              radiusUnits <= MIN_RADIUS ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20 cursor-pointer"
            )}
            aria-label="Decrease radius"
          >
            <Minus className="w-3 h-3 stroke-[2.5]" />
          </button>

          <span
            style={{ color: COLOR_RADIUS }}
            className="px-1 text-xs font-headline font-black tracking-wide min-w-[32px] text-center"
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
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Slices Subdivider Selector [ 8 | 16 | 32 | ∞ ] */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/25 shadow-sm">
          <span className="text-[11px] text-white/60 font-bold px-0.5 select-none">Slices:</span>
          {([8, 16, 32, "inf"] as const).map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setIsPlaying(false);
                setSectorCount(cnt);
                if (step !== 3) setStep(3);
              }}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
                sectorCount === cnt ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/65 hover:text-white"
              )}
            >
              {cnt === "inf" ? "∞" : cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
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
            <span className="text-white/80">
              {sectorCount === "inf" ? "base · height" : "base · height"}
            </span>
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
