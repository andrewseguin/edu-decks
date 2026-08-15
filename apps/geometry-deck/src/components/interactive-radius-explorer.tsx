"use client";

import React, { useState, useCallback, useRef } from "react";

type InteractiveRadiusExplorerProps = {
  mode?: "radius" | "diameter" | "pi";
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;
const CR = 54;

const COLOR_RADIUS = "#5ee8ff";  // Electric Cyan
const COLOR_DIAMETER = "#ffd45e";// Warm Gold
const COLOR_CIRCUM = "#d8b4fe";  // Neon Lilac

export function InteractiveRadiusExplorer({ mode = "radius", color }: InteractiveRadiusExplorerProps) {
  const [angleDeg, setAngleDeg] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

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
  }, []);

  const isDiameter = mode === "diameter";
  const isPi = mode === "pi";

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Circle Boundary */}
        <circle cx={CX} cy={CY} r={CR} fill="rgba(255, 255, 255, 0.10)" stroke={isPi ? COLOR_CIRCUM : "rgba(255, 255, 255, 0.9)"} strokeWidth={isPi ? 3 : 2} />

        {/* Center Dot */}
        <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

        {/* Diameter Line or Radius Line */}
        {isDiameter ? (
          <>
            <line x1={oppX} y1={oppY} x2={pX} y2={pY} stroke={COLOR_DIAMETER} strokeWidth={2.5} />
            <circle cx={oppX} cy={oppY} r={3.5} fill={COLOR_DIAMETER} />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_DIAMETER} />
            {/* Label */}
            <text x={CX} y={CY - 12} textAnchor="middle" fontSize={13} fontWeight="800" fill={COLOR_DIAMETER} style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}>
              d = 2r
            </text>
          </>
        ) : (
          <>
            <line x1={CX} y1={CY} x2={pX} y2={pY} stroke={COLOR_RADIUS} strokeWidth={2.5} strokeDasharray="3 2" />
            <circle cx={pX} cy={pY} r={3.5} fill={COLOR_RADIUS} />
            {/* Label */}
            <text x={(CX + pX) / 2} y={(CY + pY) / 2 - 10} textAnchor="middle" fontSize={13} fontWeight="800" fill={COLOR_RADIUS} style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}>
              radius (r)
            </text>
          </>
        )}

        {/* Drag Handle on circumference */}
        <g transform={`translate(${pX}, ${pY})`} className="cursor-grab active:cursor-grabbing" onPointerDown={handlePointerDown}>
          <circle r={24} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* Live Typographic Status Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          {isDiameter ? (
            <>
              <span style={{ color: COLOR_DIAMETER }}>d = 2 · r</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Straight chord through centre</span>
            </>
          ) : isPi ? (
            <>
              <span style={{ color: COLOR_CIRCUM }}>π = C ÷ d</span>
              <span className="text-white/40">≈</span>
              <span className="text-white font-extrabold">3.14159…</span>
            </>
          ) : (
            <>
              <span style={{ color: COLOR_RADIUS }}>r = centre to edge</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Equal in all 360° directions</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
