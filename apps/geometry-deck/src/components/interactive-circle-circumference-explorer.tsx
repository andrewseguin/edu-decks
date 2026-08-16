"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#d8b4fe"; // Neon Lilac
const COLOR_GOLD = "#ffd45e";   // Warm Gold

const PRESETS = [2, 3, 4, 5];

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(480, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(3);
  const [unrollProgress, setUnrollProgress] = useState(0); // 0 (start) to 1 (fully unrolled: 2πr)
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Scale pxPerUnit so full roll fits comfortably on canvas
  const pxPerUnit = Math.max(5.5, Math.min(8.5, (SVG_W - 80) / (2 * Math.PI * 5)));
  const rPx = radiusUnits * pxPerUnit;
  const fullRollDist = 2 * Math.PI * rPx;

  const startX = Math.round((SVG_W - fullRollDist) / 2);
  const endX = Math.round(startX + fullRollDist);
  const groundY = 112;
  const centerY = groundY - rPx;
  const cCoeff = 2 * radiusUnits;

  // Direct 1:1 dragging of the unroll handle along the track
  const handleTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const currentWheelX = startX + unrollProgress * fullRollDist;

  // Unspooling Tape Geometry:
  const remainingFraction = 1 - unrollProgress;
  const remainingArcDeg = remainingFraction * 360;

  // The leading tip of the remaining ribbon on the wheel
  const tipAngleRad = (90 - remainingArcDeg) * (Math.PI / 180);
  const tipX = rPx * Math.cos(tipAngleRad);
  const tipY = rPx * Math.sin(tipAngleRad);

  let remainingArcPath = "";
  if (unrollProgress > 0 && remainingFraction > 0.005) {
    const largeArc = remainingArcDeg > 180 ? 1 : 0;
    // Sweep counter-clockwise from bottom (6 o'clock: (0, rPx)) up through front to tip
    remainingArcPath = `M 0 ${rPx} A ${rPx} ${rPx} 0 ${largeArc} 0 ${tipX} ${tipY}`;
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible cursor-pointer"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Track Hitbox for easy dragging */}
        <rect x={startX - 25} y={groundY - 60} width={fullRollDist + 50} height={90} fill="transparent" />

        {/* Ground Baseline Ruler */}
        <line x1={startX} y1={groundY} x2={endX} y2={groundY} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={2} />

        {/* Start Tick (0) */}
        <line x1={startX} y1={groundY - 5} x2={startX} y2={groundY + 5} stroke="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
        <text
          x={startX}
          y={groundY + 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill="rgba(255, 255, 255, 0.6)"
          fontFamily="var(--font-heading, system-ui)"
        >
          0
        </text>

        {/* Finish Tick (2πr) */}
        <line x1={endX} y1={groundY - 6} x2={endX} y2={groundY + 6} stroke={COLOR_CIRCUM} strokeWidth={2.5} />
        <text
          x={endX}
          y={groundY + 16}
          textAnchor="middle"
          fontSize={12}
          fontWeight="900"
          fill={COLOR_CIRCUM}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {cCoeff}π
        </text>

        {/* Ghost Starting Circle outline (only when rolled away from start) */}
        {unrollProgress > 0.03 && (
          <circle cx={startX} cy={centerY} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
        )}

        {/* Unrolled Lilac Boundary Ribbon along the ground */}
        {unrollProgress > 0 && (
          <line
            x1={startX}
            y1={groundY}
            x2={currentWheelX}
            y2={groundY}
            stroke={COLOR_CIRCUM}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}

        {/* Rolling Wheel Group */}
        <g transform={`translate(${currentWheelX}, ${centerY})`}>
          {/* Wheel Disc Body */}
          <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.12)" />

          {/* At Zero State: Full Solid Lilac Circle */}
          {unrollProgress === 0 ? (
            <circle cx={0} cy={0} r={rPx} fill="none" stroke={COLOR_CIRCUM} strokeWidth={3} />
          ) : (
            <>
              {/* Spool ghost track */}
              <circle cx={0} cy={0} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1.5} strokeDasharray="3 3" />
              {/* Unspooling Perimeter Ribbon on the Front/Top */}
              {remainingArcPath && (
                <path
                  d={remainingArcPath}
                  fill="none"
                  stroke={COLOR_CIRCUM}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              )}
            </>
          )}

          {/* Radius Spoke line */}
          {unrollProgress === 0 ? (
            /* Clean Horizontal Radius at zero state */
            <>
              <line x1={0} y1={0} x2={rPx} y2={0} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
              <circle cx={0} cy={0} r={3} fill="#ffffff" />
              <circle cx={rPx} cy={0} r={4} fill={COLOR_RADIUS} />
            </>
          ) : (
            remainingFraction > 0.005 && (
              <>
                <line x1={0} y1={0} x2={tipX} y2={tipY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
                <circle cx={0} cy={0} r={3} fill="#ffffff" />
                <circle cx={tipX} cy={tipY} r={4.5} fill={COLOR_GOLD} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
              </>
            )
          )}

          {/* Radius label (always clean above center) */}
          <text
            x={0}
            y={-12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12.5}
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
          <circle r={9} fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
          <circle r={4.5} fill={COLOR_CIRCUM} />
        </g>
      </svg>

      {/* Preset Radius Pills & Direct Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 select-none">
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          {PRESETS.map((pr) => (
            <button
              key={pr}
              onClick={() => {
                setRadiusUnits(pr);
                setUnrollProgress(0);
              }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
                radiusUnits === pr ? "bg-white/25 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              r = {pr}
            </button>
          ))}
        </div>

        <button
          onClick={() => setUnrollProgress(unrollProgress > 0 ? 0 : 1)}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {unrollProgress > 0 ? "↺ Reset" : "Unroll full turn (2πr)"}
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
          {unrollProgress > 0 && unrollProgress < 1 && (
            <>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/70 font-mono">
                {Math.round(unrollProgress * 100)}% unrolled
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
