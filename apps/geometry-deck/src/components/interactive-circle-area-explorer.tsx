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
const NUM_SECTORS = 8;

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(1);
  const [animatedRadius, setAnimatedRadius] = useState(1); // Smooth camera zoom
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1. Circle, 2. Unroll, 3. Parallelogram
  const [unrollProgress, setUnrollProgress] = useState(0); // 0.0 (Circle) -> 1.0 (Unrolled) -> 2.0 (Parallelogram)
  const [isPlaying, setIsPlaying] = useState(false);

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
  const singleToothW = fullRollDist / NUM_SECTORS; // width of 1 wedge along arc
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

    // 2.6s for unrolling (step 1->2), 3.0s for 3-stage elevator proof (step 2->3)
    const stepDiff = Math.abs(targetP - startP);
    const duration = Math.round((startP >= 0.99 || targetP >= 1.99 ? 3000 : 2600) * stepDiff);

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

  // Autoplay loop across 1 -> 2 -> 3 -> 1
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setStep((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
    }, step === 2 ? 4600 : step === 3 ? 5400 : 4200);

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
    }
  };

  // Stage 1 (p1 in [0..1]): Wheel rolls 2πr and unrolls 8 slices in a line on the ground
  // Stage 2 (p2 in [0..1]): 3-Stage Elevator (Lift & Flip -> Slide to πr -> Drop into slots)
  const p1 = Math.min(1, unrollProgress);
  const p2 = Math.max(0, unrollProgress - 1);

  const currentWheelX = startX + p1 * fullRollDist;

  // CANONICAL TRUE PIE SECTOR PATH (Apex at origin (0,0), radius rPx, subtending 45 deg)
  const halfAngleRad = Math.PI / NUM_SECTORS;
  const sinHalf = Math.sin(halfAngleRad);
  const cosHalf = Math.cos(halfAngleRad);
  const arcLeftX = -rPx * sinHalf;
  const arcLeftY = -rPx * cosHalf;
  const arcRightX = rPx * sinHalf;
  const arcRightY = -rPx * cosHalf;

  // Exact true curved sector (pointing UP from apex at (0,0) to curved arc of radius rPx at top)
  const canonicalSectorPath = `M 0 0 L ${arcLeftX} ${arcLeftY} A ${rPx} ${rPx} 0 0 1 ${arcRightX} ${arcRightY} Z`;

  // Radius spoke pointing straight DOWN at start (6 o'clock) and rotating with wheel
  const spokeAngleRad = (90 + p1 * 360) * (Math.PI / 180);
  const spokeTipX = rPx * Math.cos(spokeAngleRad);
  const spokeTipY = rPx * Math.sin(spokeAngleRad);

  // Integer Ticks & Pi Milestones matching Circumference card
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits <= 4 ? radiusUnits : 5;
  const maxTickToRender = Math.ceil(maxVal) + 5;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
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
        {p2 > 0.85 && (
          <g opacity={Math.min(1, (p2 - 0.85) * 6.6)}>
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

        {/* 8 Slices Laid Down on Ground / 3-Stage Elevator Proof (Zero overlap, mathematically exact clearance) */}
        {Array.from({ length: NUM_SECTORS }, (_, k) => {
          const handoverProgress = (k + 0.5) / NUM_SECTORS;
          if (p1 < handoverProgress && p1 < 0.999) return null; // still attached to rolling wheel!

          const isEven = k % 2 === 0;

          // Step 2 Ground resting coordinates:
          const groundX = startX + k * singleToothW + halfW;
          const groundYPos = groundY - rPx;

          // Step 3 Target slot coordinates in final parallelogram:
          const pairIdx = Math.floor(k / 2);
          const targetX = isEven
            ? startX + pairIdx * singleToothW + halfW
            : startX + pairIdx * singleToothW + singleToothW;

          let curX = groundX;
          let curY = groundYPos;
          let curRot = 180;

          if (p2 > 0) {
            const t = p2; // 0..1

            // 3 Clean Sequential Subphases:
            // Subphase 1: Lift & Flip in place (t in 0 .. 0.32)
            // Subphase 2: Pure horizontal slide (t in 0.32 .. 0.68)
            // Subphase 3: Lower down into slots (t in 0.68 .. 1.0)

            const sub1 = Math.min(1, Math.max(0, t / 0.32));
            const sub2 = Math.min(1, Math.max(0, (t - 0.32) / 0.36));
            const sub3 = Math.min(1, Math.max(0, (t - 0.68) / 0.32));

            const ease1 = 0.5 * (1 - Math.cos(sub1 * Math.PI));
            const ease2 = 0.5 * (1 - Math.cos(sub2 * Math.PI));
            const ease3 = 0.5 * (1 - Math.cos(sub3 * Math.PI));

            if (isEven) {
              // Bottom Upright Slices (k = 0, 2, 4, 6):
              // Stay in place during sub1, slide smoothly left during sub2, stay fixed during sub3
              curX = groundX + (targetX - groundX) * ease2;
              curY = groundYPos;
              curRot = 180;
            } else {
              // Top Flipping Slices (k = 1, 3, 5, 7):
              // Exact hover apex height: groundY - rPx - 8px.
              // This places the bottom tip of the inverted slice 8px ABOVE the top apex of standing slices (groundY - rPx),
              // while keeping the top curved rim at groundY - 2*rPx - 8px (~18px from top edge).
              const hoverApexY = groundY - rPx - 8;
              const finalSlotApexY = groundY;

              // 1. Lift & Flip from ground pose (groundYPos, 180°) to hover pose (hoverApexY, 0°):
              const startApexY = groundYPos;
              const yAfterLift = startApexY + (hoverApexY - startApexY) * ease1;

              // 2. Slide horizontally while hovering safely above:
              curX = groundX + (targetX - groundX) * ease2;

              // 3. Lower straight down from hover apex into slot at y = groundY:
              curY = yAfterLift + (finalSlotApexY - hoverApexY) * ease3;

              // Rotation flips during sub1 from 180° to 0°
              curRot = 180 - 180 * ease1;
            }
          }

          return (
            <g
              key={`ground-slice-${k}`}
              transform={`translate(${curX}, ${curY}) rotate(${curRot})`}
            >
              <path
                d={canonicalSectorPath}
                fill={COLOR_SECTOR}
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth={1.2}
              />
            </g>
          );
        })}

        {/* Rolling Wheel Group (Slices rotate smoothly around wheel center until released) */}
        {p1 < 1 && (
          <g transform={`translate(${currentWheelX}, ${centerY})`}>
            {/* Ghost wheel outline */}
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.06)" />

            {/* Slices Remaining inside Wheel (Rotating around wheel center (0,0)) */}
            {Array.from({ length: NUM_SECTORS }, (_, i) => {
              const handoverProgress = (i + 0.5) / NUM_SECTORS;
              if (p1 >= handoverProgress) return null; // cleanly handed over to ground!

              const angleDeg = 157.5 - i * (360 / NUM_SECTORS) + p1 * 360;

              return (
                <g key={`wheel-slice-${i}`} transform={`rotate(${angleDeg})`}>
                  <path
                    d={canonicalSectorPath}
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
