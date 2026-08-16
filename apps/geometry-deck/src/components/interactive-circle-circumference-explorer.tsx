"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#fb923c"; // Vibrant Radiant Orange (Circumference ribbon & Target finish)
const COLOR_PI = "#f472b6";     // Vibrant Rose Pink (Intermediate Pi markers)

const MIN_RADIUS = 1;
const MAX_RADIUS = 10;

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(340);
  const SVG_W = Math.max(320, Math.min(460, rawW - 16));

  const [radiusUnits, setRadiusUnits] = useState(1);
  const [animatedRadius, setAnimatedRadius] = useState(1); // Smoothly interpolated camera zoom [1.0 .. 10.0]
  const [unrollProgress, setUnrollProgress] = useState(0); // 0 (start) -> 1 (full roll of 2*pi*r)
  const [isPlaying, setIsPlaying] = useState(false); // start false, autoplay triggers after 2s
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const autoplayRef = useRef<number>(0);
  const zoomAnimRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Initial 2s diagram inspection delay on reveal before autoplay starts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 2000);
    return () => clearTimeout(timer);
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

  // Spatial Dimensions bounded to fit standard reveal height without expansion
  const maxVal = animatedRadius * 7;
  const targetRulerW = SVG_W - 54;
  const rPx = targetRulerW / 7; // ~36px to 42px
  const availableRulerW = targetRulerW;
  const startX = Math.round((SVG_W - availableRulerW) / 2);
  const rightEdge = startX + availableRulerW;
  const pxPerUnit = availableRulerW / maxVal;
  
  // Vertical positioning: 18px headspace above circle, room for Pi labels below
  const groundY = Math.round(rPx * 2 + 18);
  const centerY = groundY - rPx;
  const SVG_H = groundY + 34; // ~126px

  // Actual physical circumference values for current active radius
  const cValue = 2 * Math.PI * radiusUnits;
  const fullRollDist = cValue * pxPerUnit; // distance along ruler corresponding to 2*pi*r

  // Wheel horizontal position based on unroll progress [0..1]
  const currentWheelX = startX + unrollProgress * fullRollDist;

  // Wheel rotation angle (starts with seam pointing straight down at 6 o'clock)
  const wheelRotationDeg = unrollProgress * 360;

  // Radius spoke pointing straight DOWN at start (6 o'clock) and rotating with wheel
  const spokeAngleRad = (90 + wheelRotationDeg) * (Math.PI / 180);
  const spokeTipX = rPx * Math.cos(spokeAngleRad);
  const spokeTipY = rPx * Math.sin(spokeAngleRad);

  // Smooth forward/backward animation when isPlaying is true (plays immediately)
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
    if (unrollProgress >= 0.98) {
      setUnrollProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
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

  // Pi milestone ticks up to 2*pi*r
  const milestones: { fraction: number; val: number; label: string }[] = [];
  const maxPiK = 2 * radiusUnits;
  for (let k = 1; k <= maxPiK; k++) {
    const piVal = k * Math.PI;
    const fraction = piVal / cValue;
    if (fraction <= 1.001) {
      milestones.push({
        fraction,
        val: piVal,
        label: k === 1 ? "π" : `${k}π`,
      });
    }
  }

  // Integer unit ticks matching active scale
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits <= 4 ? radiusUnits : 5;
  const maxTickToRender = Math.ceil(maxVal) + 5;

  // Precise 1-unit ticks for wheel ribbon
  const totalUnitTeeth = Math.floor(cValue);
  const unitTeeth: { u: number; fraction: number }[] = [];
  for (let u = 1; u <= totalUnitTeeth; u++) {
    unitTeeth.push({
      u,
      fraction: u / cValue,
    });
  }

  // Active circumference formula formatting
  const formattedC = (2 * radiusUnits * Math.PI).toFixed(2);

  // SVG Arc Path for remaining ribbon on the wheel:
  const remainingAngleDeg = 360 - wheelRotationDeg;
  const startAngRad = 90 * (Math.PI / 180); // 6 o'clock contact point
  const endAngRad = (90 - remainingAngleDeg) * (Math.PI / 180);
  
  const arcStartX = rPx * Math.cos(startAngRad);
  const arcStartY = rPx * Math.sin(startAngRad);
  const arcEndX = rPx * Math.cos(endAngRad);
  const arcEndY = rPx * Math.sin(endAngRad);
  const largeArcFlag = remainingAngleDeg > 180 ? 1 : 0;
  
  const remainingWheelArcPath = remainingAngleDeg > 0.5
    ? `M ${arcStartX} ${arcStartY} A ${rPx} ${rPx} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`
    : "";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full max-w-[460px] mx-auto select-none" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[460px] max-h-[128px] touch-none select-none overflow-visible"
      >
        {/* Interactive Track Hitbox for Scrubbing */}
        <rect
          x={startX - 20}
          y={groundY - 60}
          width={availableRulerW + 40}
          height={90}
          fill="transparent"
          className="cursor-pointer"
          onPointerDown={handleTrackPointerDown}
        />

        {/* Ruler Axis */}
        <line x1={startX - 10} y1={groundY} x2={rightEdge + 10} y2={groundY} stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1.8} />

        {/* Integer Ticks and Labels (Large, bold, high-contrast) */}
        {Array.from({ length: maxTickToRender + 1 }, (_, t) => {
          const tickX = startX + t * pxPerUnit;
          if (tickX > rightEdge + 25) return null;
          const opacity = tickX <= rightEdge ? 1 : Math.max(0, 1 - (tickX - rightEdge) / 20);
          const isMajor = t % tickStep === 0;

          return (
            <g key={t} opacity={opacity}>
              <line
                x1={tickX}
                y1={groundY - (isMajor ? 4.5 : 2.2)}
                x2={tickX}
                y2={groundY + (isMajor ? 4.5 : 2.2)}
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth={isMajor ? 1.8 : 1}
                opacity={isMajor ? 1 : 0.45}
              />
              {isMajor && (
                <text
                  x={tickX}
                  y={groundY + 14}
                  textAnchor="middle"
                  fontSize={12}
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

        {/* Milestone Markers: 1π, 2π, etc. */}
        {milestones.map(({ fraction, label }) => {
          const mX = startX + fraction * fullRollDist;
          if (mX > rightEdge + 25) return null;
          const isTargetFinish = Math.abs(fraction - 1) < 0.001;
          const markerColor = isTargetFinish ? COLOR_CIRCUM : COLOR_PI;

          return (
            <g key={label} transform={`translate(${mX}, ${groundY})`}>
              <line
                x1={0}
                y1={isTargetFinish ? -5 : -4}
                x2={0}
                y2={16}
                stroke={markerColor}
                strokeWidth={isTargetFinish ? 2.5 : 1.8}
                strokeDasharray={isTargetFinish ? undefined : "2.5 2"}
              />
              <circle cx={0} cy={0} r={isTargetFinish ? 2.8 : 2.2} fill={markerColor} />
              <text
                x={0}
                y={28}
                textAnchor="middle"
                fontSize={isTargetFinish ? 14 : 12.5}
                fontWeight="900"
                fill={markerColor}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
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
              strokeWidth={3.5}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 5px rgba(251, 146, 60, 0.65))" }}
            />
            {/* Stamped Unit Notches on Ground (Lays down EXACTLY at integer ticks 1, 2, 3...) */}
            {unitTeeth.map(({ u, fraction }) => {
              if (fraction > unrollProgress) return null;
              const segX = startX + u * pxPerUnit; // lands EXACTLY on integer tick u!
              return (
                <line
                  key={`ground-notch-${u}`}
                  x1={segX}
                  y1={groundY - 3}
                  x2={segX}
                  y2={groundY + 3}
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
                strokeWidth={3}
                style={{ filter: "drop-shadow(0px 0px 5px rgba(251, 146, 60, 0.6))" }}
              />
              {/* Unit Teeth placed at exact 1-unit intervals around perimeter */}
              {unitTeeth.map(({ u, fraction }) => {
                const ang = (90 - fraction * 360) * (Math.PI / 180);
                const x1 = (rPx - 3.5) * Math.cos(ang);
                const y1 = (rPx - 3.5) * Math.sin(ang);
                const x2 = (rPx + 3.5) * Math.cos(ang);
                const y2 = (rPx + 3.5) * Math.sin(ang);
                return (
                  <line
                    key={`wheel-notch-${u}`}
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
          ) : remainingAngleDeg > 0.5 ? (
            /* During Rolling: Remaining coiled ribbon on the wheel */
            <g>
              {/* Ghost track showing where ribbon peeled off */}
              <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} strokeDasharray="3 3" />
              
              {/* Active remaining orange perimeter arc */}
              <path
                d={remainingWheelArcPath}
                fill="none"
                stroke={COLOR_CIRCUM}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0px 0px 4px rgba(251, 146, 60, 0.6))" }}
              />
              
              {/* Unit Teeth remaining on wheel */}
              {unitTeeth.map(({ u, fraction }) => {
                if (fraction <= unrollProgress) return null; // already peeled off and laid on ground!
                const teethAngDeg = 90 - (fraction - unrollProgress) * 360;
                const ang = teethAngDeg * (Math.PI / 180);
                const x1 = (rPx - 3.5) * Math.cos(ang);
                const y1 = (rPx - 3.5) * Math.sin(ang);
                const x2 = (rPx + 3.5) * Math.cos(ang);
                const y2 = (rPx + 3.5) * Math.sin(ang);
                return (
                  <line
                    key={`wheel-notch-${u}`}
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
            /* Fully Unrolled: Empty ghost wheel */
            <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
          )}

          {/* Center Hub */}
          <circle cx={0} cy={0} r={3} fill="#ffffff" />

          {/* Cyan Radius Spoke from Center to Perimeter (Rotating with wheel) */}
          <line
            x1={0}
            y1={0}
            x2={spokeTipX}
            y2={spokeTipY}
            stroke={COLOR_RADIUS}
            strokeWidth={2.2}
            strokeDasharray="3 2"
          />
          <circle cx={spokeTipX} cy={spokeTipY} r={3.5} fill={COLOR_RADIUS} />

          {/* Radius Value Label above center point */}
          <text
            x={0}
            y={-12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight="900"
            fill={COLOR_RADIUS}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
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

        {/* Play / Pause / Replay Action Button */}
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
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

      {/* Frosted Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-5 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">C</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_CIRCUM }} className="font-bold">2 · π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{radiusUnits}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_CIRCUM }} className="font-bold">{2 * radiusUnits}π</span>
          {radiusUnits > 1 && (
            <>
              <span className="text-white/40">≈</span>
              <span className="text-white/80 text-xs sm:text-sm font-semibold tracking-normal font-sans">
                {formattedC}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
