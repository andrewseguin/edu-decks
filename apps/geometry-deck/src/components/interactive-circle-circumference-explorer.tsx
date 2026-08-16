"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveCircleCircumferenceProps = {
  color?: string;
};

const SVG_H = 160;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_CIRCUM = "#fb923c"; // Vibrant Radiant Orange (Circumference ribbon)
const COLOR_GOLD = "#ffd45e";   // Warm Gold (Contact dot / angle tip)
const COLOR_PI = "#f472b6";     // Vibrant Rose Pink for Pi marker

const PRESETS = [1, 2, 3];
const NUM_SEGMENTS = 16; // 16 tape-measure teeth/ribs around the perimeter

export function InteractiveCircleCircumferenceExplorer({ color }: InteractiveCircleCircumferenceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(300, Math.min(500, rawW - 24));

  const [radiusUnits, setRadiusUnits] = useState(1); // Default r = 1 (Unit circle on real number line)
  const [unrollProgress, setUnrollProgress] = useState(0); // 0 (start) to 1 (fully unrolled: 2πr)
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const autoplayRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  const maxVal = radiusUnits * 7;
  const tickStep = radiusUnits === 1 ? 1 : radiusUnits;
  const numTicks = maxVal / tickStep;

  const startX = 35;
  const availableRulerW = SVG_W - 65;
  const pxPerUnit = availableRulerW / maxVal;
  const rPx = Math.min(38, Math.max(26, radiusUnits * pxPerUnit)); // visual radius in px
  const groundY = 112;
  const centerY = groundY - rPx;

  const cValue = 2 * Math.PI * radiusUnits;
  const fullRollDist = cValue * pxPerUnit;
  const endX = startX + fullRollDist;
  const cCoeff = 2 * radiusUnits;
  const cApprox = Math.round(cValue * 100) / 100;

  // Smooth back-and-forth rolling animation on reveal until user interacts
  useEffect(() => {
    if (hasInteracted) return;
    let start: number | null = null;
    const period = 5200; // 5.2s full forward-and-back cycle

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const prog = 0.5 * (1 - Math.cos((elapsed / period) * 2 * Math.PI));
      setUnrollProgress(prog);
      if (!hasInteracted) {
        autoplayRef.current = requestAnimationFrame(step);
      }
    };

    autoplayRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(autoplayRef.current);
    };
  }, [hasInteracted, radiusUnits]);

  // Direct 1:1 dragging of the wheel / handle along the ruler
  const handleTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasInteracted(true);
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

  const currentWheelX = startX + unrollProgress * fullRollDist;

  // Unspooling Tape Geometry on Front & Top of Wheel:
  const remainingFraction = 1 - unrollProgress;
  const remainingArcDeg = remainingFraction * 360;

  const tipAngleRad = (90 - remainingArcDeg) * (Math.PI / 180);
  const tipX = rPx * Math.cos(tipAngleRad);
  const tipY = rPx * Math.sin(tipAngleRad);

  let remainingArcPath = "";
  if (unrollProgress > 0 && remainingFraction > 0.005) {
    const largeArc = remainingArcDeg > 180 ? 1 : 0;
    // Sweep-flag 0 draws counter-clockwise from bottom (6 o'clock: (0, rPx)) up through front/right to tip
    remainingArcPath = `M 0 ${rPx} A ${rPx} ${rPx} 0 ${largeArc} 0 ${tipX} ${tipY}`;
  }

  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => i * tickStep);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible cursor-pointer"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Track Hitbox for easy dragging */}
        <rect x={startX - 20} y={groundY - 60} width={availableRulerW + 40} height={90} fill="transparent" />

        {/* Subtle Background Ruler Axis */}
        <line x1={startX - 10} y1={groundY} x2={startX + availableRulerW + 10} y2={groundY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

        {/* Standard Integer Ticks and Labels */}
        {ticks.map((t) => {
          const tickX = startX + t * pxPerUnit;
          return (
            <g key={t}>
              <line x1={tickX} y1={groundY - 3} x2={tickX} y2={groundY + 3} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} />
              <text
                x={tickX}
                y={groundY + 16}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fill="rgba(255, 255, 255, 0.55)"
                fontFamily="var(--font-heading, system-ui)"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* Highlighted π Marker on Number Line */}
        {radiusUnits === 1 && (
          <g transform={`translate(${startX + Math.PI * pxPerUnit}, ${groundY})`}>
            <line x1={0} y1={-6} x2={0} y2={6} stroke={COLOR_PI} strokeWidth={2} strokeDasharray="2 2" />
            <text
              x={0}
              y={-9}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight="900"
              fill={COLOR_PI}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              π (3.14)
            </text>
          </g>
        )}

        {/* Finish 2πr Tick on Number Line */}
        <g transform={`translate(${endX}, ${groundY})`}>
          <line x1={0} y1={-7} x2={0} y2={7} stroke={COLOR_CIRCUM} strokeWidth={2.5} />
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight="900"
            fill={COLOR_CIRCUM}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {cCoeff}π ({cApprox})
          </text>
        </g>

        {/* Ghost Starting Circle outline (when rolled away from origin) */}
        {unrollProgress > 0.02 && (
          <circle cx={startX} cy={centerY} r={rPx} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} strokeDasharray="3 3" />
        )}

        {/* Unrolled Segmented Ribbon Laid Down Along Ground */}
        {unrollProgress > 0 && (
          <g>
            {/* Base Glowing Orange Ribbon */}
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
            {/* Subtle Measuring Tape Stitching/Dashes */}
            <line
              x1={startX}
              y1={groundY}
              x2={currentWheelX}
              y2={groundY}
              stroke="rgba(0, 0, 0, 0.35)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            {/* Segment Notches on Ground */}
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
                  opacity={0.9}
                />
              );
            })}
          </g>
        )}

        {/* Rolling Wheel Group */}
        <g transform={`translate(${currentWheelX}, ${centerY})`}>
          {/* Wheel Disc Body */}
          <circle cx={0} cy={0} r={rPx} fill="rgba(255, 255, 255, 0.08)" />

          {/* At Zero State: Full Solid Vibrant Orange Circle with Tape Ribs */}
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
              {/* Inner stitching */}
              <circle
                cx={0}
                cy={0}
                r={rPx}
                fill="none"
                stroke="rgba(0, 0, 0, 0.35)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
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
                    opacity={0.85}
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
                  <path
                    d={remainingArcPath}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.35)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  {/* Rotating Segment Teeth on the remaining front/top arc */}
                  {Array.from({ length: NUM_SEGMENTS }, (_, i) => {
                    const segFraction = i / NUM_SEGMENTS;
                    if (segFraction <= unrollProgress) return null; // already stamped on ground
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
                        opacity={0.9}
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

      {/* Preset Radius Pills & Direct Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 select-none">
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          {PRESETS.map((pr) => (
            <button
              key={pr}
              onClick={() => {
                setHasInteracted(true);
                cancelAnimationFrame(autoplayRef.current);
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
          onClick={() => {
            setHasInteracted(true);
            cancelAnimationFrame(autoplayRef.current);
            setUnrollProgress(unrollProgress > 0 ? 0 : 1);
          }}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {unrollProgress > 0 ? "↺ Reset" : `Unroll (${cCoeff}π)`}
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
          <span className="text-white/50">≈</span>
          <span className="text-white font-bold">{cApprox}</span>
        </div>
      </div>
    </div>
  );
}
