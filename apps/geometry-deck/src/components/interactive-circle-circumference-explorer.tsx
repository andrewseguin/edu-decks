"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#fb923c"; // Vibrant Radiant Orange (Circumference ribbon & Target finish)
const COLOR_GOLD = "#ffd45e";   // Warm Gold (Contact dot / angle tip)
const COLOR_PI = "#f472b6";     // Vibrant Rose Pink (Consistent color for all Pi markers)

const MIN_RADIUS = 1;
const MAX_RADIUS = 10;
const NUM_SEGMENTS = 16;

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(1);
  const [animatedRadius, setAnimatedRadius] = useState(1); // Smoothly interpolated camera zoom [1.0 .. 10.0]
  const [unrollProgress, setUnrollProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

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

    const duration = 650; // 650ms smooth expansion & camera zoom

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

  // Camera scale: ruler shows 0 .. (animatedRadius * 7)
  const maxVal = animatedRadius * 7;
  const startX = 46;
  const availableRulerW = SVG_W - 92;
  const rightEdge = startX + availableRulerW;
  const pxPerUnit = availableRulerW / maxVal;
  
  // Continuous smooth visual circle radius (scales with animatedRadius up to 10)
  const rPx = 28 + Math.min(16, (animatedRadius - 1) * 2.0);
  const groundY = 98;
  const centerY = groundY - rPx;

  // Actual physical circumference values for current active radius
  const cValue = 2 * Math.PI * radiusUnits;
  const fullRollDist = cValue * pxPerUnit;
  const cCoeff = 2 * radiusUnits;

  // Smooth forward/backward animation when isPlaying is true
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(autoplayRef.current);
      return;
    }

    let start: number | null = null;
    const period = 5200; // 5.2s full forward-and-back cycle

    const clampedProg = Math.max(0, Math.min(1, unrollProgress));
    const initialPhi = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * clampedProg)));
    const initialElapsed = (initialPhi / (2 * Math.PI)) * period;

    const step = (ts: number) => {
      if (!start) start = ts - initialElapsed;
      const elapsed = ts - start;
      const prog = 0.5 * (1 - Math.cos((elapsed / period) * 2 * Math.PI));
      setUnrollProgress(prog);
      autoplayRef.current = requestAnimationFrame(step);
    };

    autoplayRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(autoplayRef.current);
    };
  }, [isPlaying, radiusUnits]);

  // Direct 1:1 dragging of the wheel / handle along the ruler
  const handleTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    cancelAnimationFrame(autoplayRef.current);
    setIsDraggingHandle(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const updateFromPointer = (clientX: number) => {
      const px = (clientX - rect.left) * scX;
      const prog = Math.max(0, Math.min(1, (px - startX) / fullRollDist));
      setUnrollProgress(prog);
    };

    updateFromPointer(e.clientX);

    const onMove = (ev: PointerEvent) => {
      updateFromPointer(ev.clientX);
    };

    const onUp = () => {
      setIsDraggingHandle(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [SVG_W, fullRollDist, startX]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (unrollProgress >= 0.98) {
        setUnrollProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const changeRadius = (delta: number) => {
    const nextR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radiusUnits + delta));
    if (nextR !== radiusUnits) {
      setRadiusUnits(nextR);
      setUnrollProgress(0);
      setIsPlaying(true);
    }
  };

  const currentWheelX = startX + unrollProgress * fullRollDist;

  // Unspooling Tape Geometry
  const remainingFraction = 1 - unrollProgress;
  const remainingArcDeg = remainingFraction * 360;

  const tipAngleRad = (90 - remainingArcDeg) * (Math.PI / 180);
  const tipX = rPx * Math.cos(tipAngleRad);
  const tipY = rPx * Math.sin(tipAngleRad);

  let remainingArcPath = "";
  if (unrollProgress > 0 && remainingFraction > 0.005) {
    const largeArc = remainingArcDeg > 180 ? 1 : 0;
    remainingArcPath = `M 0 ${rPx} A ${rPx} ${rPx} 0 ${largeArc} 0 ${tipX} ${tipY}`;
  }

  const targetFinishMultiple = 2 * radiusUnits;

  // Dynamic list of Pi multiples up to current range + extra buffer for smooth zoom
  const maxPiToRender = Math.min(20, Math.ceil(maxVal / Math.PI) + 2);
  const piMultiples = Array.from({ length: maxPiToRender }, (_, i) => i + 1);

  // Dynamic integer ticks spanning full visible range with clean steps
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits <= 4 ? radiusUnits : 5;
  const maxTickToRender = Math.ceil(maxVal) + 5;
  const numTicks = Math.floor(maxTickToRender / tickStep);
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => i * tickStep);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible cursor-pointer"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Track Hitbox */}
        <rect x={startX - 20} y={groundY - 60} width={availableRulerW + 40} height={90} fill="transparent" />

        {/* Ruler Axis */}
        <line x1={startX - 10} y1={groundY} x2={rightEdge + 10} y2={groundY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

        {/* Integer Ticks and Labels (smoothly glides & fades at right boundary) */}
        {ticks.map((t) => {
          const tickX = startX + t * pxPerUnit;
          if (tickX > rightEdge + 25) return null;
          const opacity = tickX <= rightEdge ? 1 : Math.max(0, 1 - (tickX - rightEdge) / 20);
          return (
            <g key={t} opacity={opacity}>
              <line x1={tickX} y1={groundY - 3} x2={tickX} y2={groundY + 3} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} />
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
            </g>
          );
        })}

        {/* Continuous Pi Markers (π, 2π, 3π... 20π) that smoothly slide on/off edge */}
        {piMultiples.map((k) => {
          const val = k * Math.PI;
          const markerX = startX + val * pxPerUnit;
          if (markerX > rightEdge + 30) return null;
          const opacity = markerX <= rightEdge ? 1 : Math.max(0, 1 - (markerX - rightEdge) / 25);
          const isTargetFinish = k === targetFinishMultiple;
          const markerColor = isTargetFinish ? COLOR_CIRCUM : COLOR_PI;
          const label = k === 1 ? "π" : `${k}π`;

          return (
            <g key={k} transform={`translate(${markerX}, ${groundY})`} opacity={opacity}>
              <line
                x1={0}
                y1={isTargetFinish ? -5 : -4}
                x2={0}
                y2={17}
                stroke={markerColor}
                strokeWidth={isTargetFinish ? 2 : 1.5}
                strokeDasharray={isTargetFinish ? undefined : "2 2"}
              />
              <circle cx={0} cy={0} r={isTargetFinish ? 2.5 : 2} fill={markerColor} />
              <text
                x={0}
                y={28}
                textAnchor="middle"
                fontSize={isTargetFinish ? 12 : 11}
                fontWeight="900"
                fill={markerColor}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Unrolled Orange Ribbon Laid Down Along Ground */}
        {unrollProgress > 0 && (
          <g>
            <line
              x1={startX}
              y1={groundY}
              x2={currentWheelX}
              y2={groundY}
              stroke={COLOR_CIRCUM}
              strokeWidth={4}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 5px rgba(251, 146, 60, 0.65))" }}
            />
            {/* Stamped Segment Notches on Ground */}
            {Array.from({ length: NUM_SEGMENTS + 1 }, (_, i) => {
              const segFraction = i / NUM_SEGMENTS;
              if (segFraction > unrollProgress) return null;
              const segX = startX + segFraction * fullRollDist;
              return (
                <line
                  key={`ground-notch-${i}`}
                  x1={segX}
                  y1={groundY - 3.5}
                  x2={segX}
                  y2={groundY + 3.5}
                  stroke="#ffffff"
                  strokeWidth={1.2}
                  opacity={0.95}
                />
              );
            })}
          </g>
        )}

        {/* Rolling Wheel Group */}
        <g transform={`translate(${currentWheelX}, ${centerY})`}>
          {/* Wheel Disc Body */}
          <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.08)" />

          {/* At Zero State: Full Solid Vibrant Orange Circle */}
          {unrollProgress === 0 ? (
            <g>
              <circle
                cx={0}
                cy={0}
                r={rPx}
                fill="none"
                stroke={COLOR_CIRCUM}
                strokeWidth={3.5}
                style={{ filter: "drop-shadow(0px 0px 5px rgba(251, 146, 60, 0.6))" }}
              />
              {/* Perimeter Segment Teeth around full circle */}
              {Array.from({ length: NUM_SEGMENTS }, (_, i) => {
                const ang = (90 - (i / NUM_SEGMENTS) * 360) * (Math.PI / 180);
                const x1 = (rPx - 3.5) * Math.cos(ang);
                const y1 = (rPx - 3.5) * Math.sin(ang);
                const x2 = (rPx + 3.5) * Math.cos(ang);
                const y2 = (rPx + 3.5) * Math.sin(ang);
                return (
                  <line
                    key={`wheel-tooth-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ffffff"
                    strokeWidth={1.2}
                    opacity={0.9}
                  />
                );
              })}
            </g>
          ) : (
            <>
              {/* Bare Spool Ghost track */}
              <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
              {/* Vibrant Orange Ribbon Unspooling on Front/Top */}
              {remainingArcPath && (
                <g>
                  <path
                    d={remainingArcPath}
                    fill="none"
                    stroke={COLOR_CIRCUM}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0px 0px 5px rgba(251, 146, 60, 0.6))" }}
                  />
                  {/* Rotating Segment Teeth on the remaining front/top arc */}
                  {Array.from({ length: NUM_SEGMENTS }, (_, i) => {
                    const segFraction = i / NUM_SEGMENTS;
                    if (segFraction <= unrollProgress) return null;
                    const ang = (90 - (segFraction - unrollProgress) * 360) * (Math.PI / 180);
                    const x1 = (rPx - 3.5) * Math.cos(ang);
                    const y1 = (rPx - 3.5) * Math.sin(ang);
                    const x2 = (rPx + 3.5) * Math.cos(ang);
                    const y2 = (rPx + 3.5) * Math.sin(ang);
                    return (
                      <line
                        key={`rem-tooth-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#ffffff"
                        strokeWidth={1.2}
                        opacity={0.95}
                      />
                    );
                  })}
                </g>
              )}
            </>
          )}

          {/* Continuous Radius Spoke pointing to unspooling tip */}
          <line x1={0} y1={0} x2={tipX} y2={tipY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
          <circle cx={0} cy={0} r={3} fill="#ffffff" />
          {/* Gold marker dot at the leading tip */}
          <circle cx={tipX} cy={tipY} r={4.5} fill={COLOR_GOLD} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />

          {/* Radius label */}
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

        {/* Drag Handle at bottom contact point */}
        <g
          transform={`translate(${currentWheelX}, ${groundY})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleTrackPointerDown}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(251, 146, 60, 0.25)" stroke={COLOR_CIRCUM} strokeWidth={1.5} />
          <circle r={4.5} fill={COLOR_CIRCUM} />
        </g>
      </svg>

      {/* Frosted Controls: [- / +] Stepper & Play/Pause/Replay Action Button */}
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

        {/* Play / Pause / Replay Action Button */}
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 fill-current text-white/90" />
              <span>Pause</span>
            </>
          ) : unrollProgress >= 0.98 ? (
            <>
              <RotateCcw className="w-3 h-3 text-white/90" />
              <span>Replay</span>
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
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">C</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">2 · π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{radiusUnits}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_CIRCUM }} className="font-bold">{cCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
