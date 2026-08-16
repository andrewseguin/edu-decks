"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";

type InteractiveCircleAreaProps = {
  color?: string;
};

const SVG_H = 165;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (Radius r & Height)
const COLOR_BASE = "#ffd45e";   // Warm Gold (Base πr)
const COLOR_AREA = "#ffffff";   // Crisp Bold White
const COLOR_SECTOR_A = "#5ee8ff"; // Electric Cyan Sector
const COLOR_SECTOR_B = "#d8b4fe"; // Radiant Lilac Sector

const MIN_RADIUS = 1;
const MAX_RADIUS = 5;
const NUM_SECTORS = 8; // 8 sectors (4 pairs interlocking into parallelogram)

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(3);
  const [unrollProgress, setUnrollProgress] = useState(0); // 0 (full circle) to 1 (fully unrolled parallelogram)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const autoplayRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Radius sizing
  const startX = 48;
  const availableW = SVG_W - 96;
  const maxVal = 3.5 * Math.PI; // total roll distance corresponds to π * r
  const rPx = Math.min(36, Math.max(26, (availableW / (3.5 * Math.PI)) * 0.95)); // visual radius
  const totalBaseW = Math.PI * rPx; // length of laid down parallelogram = πr
  const toothW = totalBaseW / 4; // width of 1 pair of interlocking teeth
  const halfTooth = toothW / 2;

  const groundY = 106;
  const centerY = groundY - rPx;
  const fullRollDist = totalBaseW;

  const areaCoeff = radiusUnits * radiusUnits;
  const cApprox = Math.round(Math.PI * radiusUnits * 100) / 100;

  // Smooth back-and-forth rolling animation on reveal
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(autoplayRef.current);
      return;
    }

    let start: number | null = null;
    const period = 5600; // 5.6s full cycle

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

  // Direct 1:1 dragging along ruler
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

  // Wedge path templates
  // Wedge pointing UP (arcs on ground at y=groundY, apex at y=groundY-rPx)
  const wedgeUpPath = `M ${halfTooth / 2} ${-rPx} L ${halfTooth} 0 A ${rPx * 1.5} ${rPx * 0.35} 0 0 1 0 0 Z`;
  // Wedge pointing DOWN (apex at y=groundY, arc at y=groundY-rPx)
  const wedgeDownPath = `M 0 ${-rPx} A ${rPx * 1.5} ${rPx * 0.35} 0 0 1 ${halfTooth} ${-rPx} L ${halfTooth / 2} 0 Z`;

  // Standard radial slice path for rotating wheel
  const sectorAngle = (2 * Math.PI) / NUM_SECTORS;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible cursor-pointer"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Track Hitbox */}
        <rect x={startX - 20} y={groundY - 60} width={availableW + 40} height={90} fill="transparent" />

        {/* Baseline Ruler */}
        <line x1={startX - 10} y1={groundY} x2={startX + totalBaseW + 45} y2={groundY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

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

        {/* Finish Base Tick (πr) */}
        <line x1={startX + totalBaseW} y1={groundY - 5} x2={startX + totalBaseW} y2={18} stroke={COLOR_BASE} strokeWidth={2} />
        <circle cx={startX + totalBaseW} cy={groundY} r={2.5} fill={COLOR_BASE} />
        <text
          x={startX + totalBaseW}
          y={groundY + 28}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight="900"
          fill={COLOR_BASE}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          base = πr ({cApprox})
        </text>

        {/* Slices Laid Down Along Ground (Peels off wheel behind it) */}
        {Array.from({ length: NUM_SECTORS }, (_, k) => {
          const sliceFraction = (k + 1) / NUM_SECTORS;
          if (sliceFraction > unrollProgress) return null; // not yet unrolled onto ground

          const isEven = k % 2 === 0;
          const pairIdx = Math.floor(k / 2);
          const segX = startX + pairIdx * toothW + (isEven ? 0 : halfTooth);

          return (
            <g
              key={`laid-slice-${k}`}
              transform={`translate(${segX}, ${groundY})`}
            >
              <path
                d={isEven ? wedgeUpPath : wedgeDownPath}
                fill={isEven ? COLOR_SECTOR_A : COLOR_SECTOR_B}
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth={1.2}
                opacity={0.85}
              />
            </g>
          );
        })}

        {/* Dimension Callouts for Interlocked Parallelogram when unrolled */}
        {unrollProgress > 0.85 && (
          <g opacity={Math.min(1, (unrollProgress - 0.85) * 6.6)}>
            {/* Height Callout (h = r) */}
            <line
              x1={startX + totalBaseW + 12}
              y1={groundY - rPx}
              x2={startX + totalBaseW + 12}
              y2={groundY}
              stroke={COLOR_RADIUS}
              strokeWidth={2.5}
              strokeDasharray="3 2"
            />
            <circle cx={startX + totalBaseW + 12} cy={groundY - rPx} r={2.5} fill={COLOR_RADIUS} />
            <circle cx={startX + totalBaseW + 12} cy={groundY} r={2.5} fill={COLOR_RADIUS} />
            <text
              x={startX + totalBaseW + 20}
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

        {/* Rolling Wheel Group */}
        <g transform={`translate(${currentWheelX}, ${centerY})`}>
          {/* Wheel Ghost Spool outline */}
          <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.06)" />

          {/* Slices Still On The Wheel (Rotating with wheel rim until they peel off) */}
          {Array.from({ length: NUM_SECTORS }, (_, i) => {
            const sliceFraction = (i + 1) / NUM_SECTORS;
            if (sliceFraction <= unrollProgress) return null; // already peeled off onto ground!

            // Angle of slice i on the wheel as wheel rotates
            const startA = (90 - (sliceFraction - unrollProgress) * 360) * (Math.PI / 180);
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
                opacity={0.85}
              />
            );
          })}

          {/* Center Hub & Radius Spoke */}
          <circle cx={0} cy={0} r={3} fill="#ffffff" />
          <line x1={0} y1={0} x2={0} y2={-rPx} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
          <circle cx={0} cy={-rPx} r={3.5} fill={COLOR_RADIUS} />

          {/* Radius Label */}
          <text
            x={12}
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

        {/* Drag Handle at bottom contact point */}
        <g
          transform={`translate(${currentWheelX}, ${groundY})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleTrackPointerDown}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(94, 232, 255, 0.25)" stroke={COLOR_RADIUS} strokeWidth={1.5} />
          <circle r={4.5} fill={COLOR_RADIUS} />
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
      </div>
    </div>
  );
}
