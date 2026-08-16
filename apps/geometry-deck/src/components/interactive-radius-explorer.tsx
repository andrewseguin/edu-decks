"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveRadiusExplorerProps = {
  mode?: "radius" | "diameter";
  color?: string;
};

const SVG_H = 160;
const CR = 58;

const COLOR_RADIUS = "#5ee8ff";  // Electric Cyan
const COLOR_DIAMETER = "#ffd45e";// Warm Gold
const COLOR_CIRCUM = "#d8b4fe";  // Neon Lilac

export function InteractiveRadiusExplorer({ mode = "radius", color }: InteractiveRadiusExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(360);
  const containerW = Math.max(340, Math.min(650, rawW - 16));
  const SVG_W = containerW;
  const CX = SVG_W / 2;
  const CY = SVG_H / 2;

  const [angleDeg, setAngleDeg] = useState(35);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const rad = (angleDeg * Math.PI) / 180;
  const pX = CX + CR * Math.cos(rad);
  const pY = CY - CR * Math.sin(rad);

  const oppX = CX - CR * Math.cos(rad);
  const oppY = CY + CR * Math.sin(rad);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;
    const scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;

      const dx = px - CX;
      const dy = CY - py;
      const ang = Math.atan2(dy, dx) * (180 / Math.PI);
      setAngleDeg(Math.round((ang + 360) % 360));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, CY, SVG_W]);

  const isDiameter = mode === "diameter";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full max-w-[650px] mx-auto select-none" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default", maxHeight: 155 }}
      >
        {/* Circle Disk Fill & Boundary */}
        <circle
          cx={CX}
          cy={CY}
          r={CR}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
        />

        {/* Center Point Dot */}
        <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

        {/* Diameter Line or Radius Line */}
        {isDiameter ? (
          <>
            <line x1={oppX} y1={oppY} x2={pX} y2={pY} stroke={COLOR_DIAMETER} strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={oppX} cy={oppY} r={3.5} fill={COLOR_DIAMETER} />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_DIAMETER} />
            {/* Label */}
            <text
              x={CX}
              y={CY - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_DIAMETER}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              diameter (d)
            </text>
          </>
        ) : (
          <>
            <line x1={CX} y1={CY} x2={pX} y2={pY} stroke={COLOR_RADIUS} strokeWidth={2.5} strokeDasharray="4 3" strokeLinecap="round" />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_RADIUS} />
            {/* Label */}
            <text
              x={(CX + pX) / 2}
              y={(CY + pY) / 2 - 12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              radius (r)
            </text>
          </>
        )}

        {/* Interactive Drag Handle on circumference */}
        <g transform={`translate(${pX}, ${pY})`} className="cursor-grab active:cursor-grabbing" onPointerDown={handlePointerDown}>
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* Live Definition / Formula Banner */}
      <div className="flex justify-center mt-1">
        {isDiameter ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span style={{ color: COLOR_DIAMETER }}>d</span>
            <span className="text-white/50">=</span>
            <span className="text-white/80">2 ·</span>
            <span style={{ color: COLOR_RADIUS }}>r</span>
            <span className="text-white/40">·</span>
            <span className="text-white/80">Full straight chord through center</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span style={{ color: COLOR_RADIUS }}>r</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_DIAMETER }}>d</span>
            <span className="text-white/50">÷</span>
            <span className="text-white/80">2</span>
            <span className="text-white/40">·</span>
            <span className="text-white/80">Distance from center to edge</span>
          </div>
        )}
      </div>
    </div>
  );
}
