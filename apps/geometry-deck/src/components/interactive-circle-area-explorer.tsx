"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveCircleAreaProps = {
  color?: string;
};

const SVG_H = 160;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_AREA = "#ffffff";   // Crisp Bold White
const COLOR_SECTOR_A = "rgba(94, 232, 255, 0.35)";
const COLOR_SECTOR_B = "rgba(216, 180, 254, 0.35)";

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 78;

  const [radiusUnits, setRadiusUnits] = useState(5); // r in [3..7]
  const [step, setStep] = useState<1 | 2>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ambientR, setAmbientR] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const ambientRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  }, []);

  const pxPerUnit = SVG_W >= 380 ? 11 : 9.5;
  const rPx = (radiusUnits + ambientR) * pxPerUnit; // radius in px
  const areaCoeff = radiusUnits * radiusUnits;

  // Gentle breathing ambient motion on initial reveal until user interacts
  useEffect(() => {
    if (hasInteracted || isDragging || step === 2) return;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pulse = Math.sin(elapsed / 700) * 0.25;
      setAmbientR(pulse);
      ambientRef.current = requestAnimationFrame(animate);
    };
    ambientRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ambientRef.current);
  }, [hasInteracted, isDragging, step]);

  // Handle pointer down on radius handle
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasInteracted(true);
    setAmbientR(0);
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const rawR = Math.round((px - CX) / pxPerUnit);
      const clampedR = Math.max(3, Math.min(7, rawR));
      setRadiusUnits(clampedR);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, SVG_W, pxPerUnit]);

  // 8 radial sectors for circle proof
  const numSectors = 8;
  const sectorAngle = (2 * Math.PI) / numSectors;

  // Rearranged parallelogram dimensions
  const numPairs = 4;
  const pairWidth = (Math.PI * rPx) / numPairs;
  const halfPair = pairWidth / 2;
  const proofStartX = Math.max(15, CX - (Math.PI * rPx) / 2);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {step === 1 ? (
          /* Step 1: Normal Circle with radial sectors */
          <g>
            <circle cx={CX} cy={CY} r={rPx} fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />
            {Array.from({ length: numSectors }, (_, i) => {
              const startA = i * sectorAngle;
              const endA = (i + 1) * sectorAngle;
              const x1 = CX + rPx * Math.cos(startA);
              const y1 = CY + rPx * Math.sin(startA);
              const x2 = CX + rPx * Math.cos(endA);
              const y2 = CY + rPx * Math.sin(endA);
              const d = `M ${CX} ${CY} L ${x1} ${y1} A ${rPx} ${rPx} 0 0 1 ${x2} ${y2} Z`;
              return (
                <path
                  key={i}
                  d={d}
                  fill={i % 2 === 0 ? COLOR_SECTOR_A : COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth={1}
                />
              );
            })}
            <circle cx={CX} cy={CY} r={3} fill="#ffffff" />
            {/* Radius line */}
            <line x1={CX} y1={CY} x2={CX + rPx} y2={CY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <text
              x={CX + rPx / 2}
              y={CY - 12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12.5}
              fontWeight="800"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {radiusUnits}
            </text>

            {/* Drag Handle on Radius */}
            <g
              transform={`translate(${CX + rPx}, ${CY})`}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
            >
              <circle r={24} fill="transparent" />
              <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
              <circle r={4.5} fill="#ffffff" />
            </g>
          </g>
        ) : (
          /* Step 2: Sector Rearrangement into Equivalent Parallelogram */
          <g transform={`translate(${proofStartX}, 32)`}>
            {/* Sectors pointing down (Alternating A) */}
            {Array.from({ length: numPairs }, (_, i) => {
              const sx = i * pairWidth;
              return (
                <path
                  key={`top-${i}`}
                  d={`M ${sx} 0 L ${sx + halfPair} ${rPx} L ${sx + pairWidth} 0 Z`}
                  fill={COLOR_SECTOR_A}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.5}
                />
              );
            })}
            {/* Sectors pointing up (Alternating B) */}
            {Array.from({ length: numPairs }, (_, i) => {
              const sx = i * pairWidth + halfPair;
              return (
                <path
                  key={`bot-${i}`}
                  d={`M ${sx} ${rPx} L ${sx + halfPair} 0 L ${sx + pairWidth} ${rPx} Z`}
                  fill={COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Base label: πr */}
            <text
              x={(numPairs * pairWidth) / 2}
              y={rPx + 16}
              textAnchor="middle"
              fontSize={12}
              fontWeight="bold"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              base = π · {radiusUnits}
            </text>

            {/* Height label: r */}
            <text
              x={numPairs * pairWidth + halfPair + 10}
              y={rPx / 2}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={12}
              fontWeight="bold"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              h = {radiusUnits}
            </text>
          </g>
        )}
      </svg>

      {/* Standard Frosted Step Navigation Pills */}
      <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none">
        <button
          onClick={() => {
            setHasInteracted(true);
            setStep(1);
          }}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            step === 1 ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          1. Circle
        </button>
        <button
          onClick={() => {
            setHasInteracted(true);
            setStep(2);
          }}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            step === 2 ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          2. Parallelogram Proof
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        {step === 1 ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">A</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">π ·</span>
            <span style={{ color: COLOR_RADIUS }}>{radiusUnits}²</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_AREA }} className="font-bold">{areaCoeff}π</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span className="text-white">A</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">base · height</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_RADIUS }}>(π · {radiusUnits})</span>
            <span className="text-white/50">·</span>
            <span style={{ color: COLOR_RADIUS }}>{radiusUnits}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_AREA }} className="font-bold">{areaCoeff}π</span>
          </div>
        )}
      </div>
    </div>
  );
}
