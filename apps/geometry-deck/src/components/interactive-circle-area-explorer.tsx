"use client";

import React, { useState, useCallback, useRef } from "react";

type InteractiveCircleAreaProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan
const COLOR_AREA = "#ffffff";   // Crisp White
const COLOR_SECTOR_A = "rgba(94, 232, 255, 0.35)";
const COLOR_SECTOR_B = "rgba(216, 180, 254, 0.35)";

export function InteractiveCircleAreaExplorer({ color }: InteractiveCircleAreaProps) {
  const [radiusUnits, setRadiusUnits] = useState(5); // r in [3..7]
  const [showProof, setShowProof] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const rPx = radiusUnits * 9; // radius in px
  const areaCoeff = radiusUnits * radiusUnits;

  // Handle pointer down on radius handle
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const rawR = Math.round((px - (showProof ? 60 : CX)) / 9);
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
  }, [showProof]);

  // 8 radial sectors for the circle proof
  const numSectors = 8;
  const sectorAngle = (2 * Math.PI) / numSectors;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {!showProof ? (
          /* Normal Circle with 8 sector radial lines */
          <g>
            <circle cx={CX} cy={CY} r={rPx} fill="rgba(255, 255, 255, 0.10)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />
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
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={1}
                />
              );
            })}
            <circle cx={CX} cy={CY} r={3} fill="#ffffff" />
            {/* Radius line */}
            <line x1={CX} y1={CY} x2={CX + rPx} y2={CY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <text
              x={CX + rPx / 2}
              y={CY - 10}
              textAnchor="middle"
              fontSize={12}
              fontWeight="800"
              fill={COLOR_RADIUS}
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              r = {radiusUnits}
            </text>

            {/* Drag Handle */}
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
          /* Sector Rearrangement into Rectangle / Parallelogram */
          <g transform="translate(30, 30)">
            <text x={90} y={-10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="rgba(255,255,255,0.8)">
              Equivalent Parallelogram (base = πr, height = r)
            </text>
            {/* Interlocking 8 sectors */}
            {Array.from({ length: 4 }, (_, i) => {
              const sx = i * 40;
              // Pointing down
              return (
                <path
                  key={`top-${i}`}
                  d={`M ${sx} 0 L ${sx + 20} ${rPx} L ${sx + 40} 0 Z`}
                  fill={COLOR_SECTOR_A}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.5}
                />
              );
            })}
            {Array.from({ length: 4 }, (_, i) => {
              const sx = i * 40 + 20;
              // Pointing up
              return (
                <path
                  key={`bot-${i}`}
                  d={`M ${sx} ${rPx} L ${sx + 20} 0 L ${sx + 40} ${rPx} Z`}
                  fill={COLOR_SECTOR_B}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Base label πr */}
            <text x={90} y={rPx + 16} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLOR_RADIUS}>
              base = π · r ({radiusUnits}π)
            </text>
            {/* Height label r */}
            <text x={185} y={rPx / 2} textAnchor="start" dominantBaseline="central" fontSize={12} fontWeight="bold" fill={COLOR_RADIUS}>
              height = r ({radiusUnits})
            </text>
          </g>
        )}
      </svg>

      {/* Proof Toggle Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={() => setShowProof(!showProof)}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {showProof ? "Reset circle" : "Show sector rearrangement proof (πr · r)"}
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">A</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">π ·</span>
          <span style={{ color: COLOR_RADIUS }}>{radiusUnits}²</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_AREA }} className="font-extrabold">{areaCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
