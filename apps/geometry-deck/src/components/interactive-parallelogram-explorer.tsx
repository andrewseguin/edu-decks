"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";

type InteractiveParallelogramExplorerProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const BASE_Y = 120;
const B1_X = 40;
const BASE_LEN_PX = 135; // base length in px
const B2_X = B1_X + BASE_LEN_PX;
const PX_PER_UNIT = 15;

const COLOR_BASE = "#ffd45e";   // Warm Gold
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan
const COLOR_AREA = "#ffffff";   // Crisp White

export function InteractiveParallelogramExplorer({ color }: InteractiveParallelogramExplorerProps) {
  // apex position: skewX offset from B1_X, height in px
  const [skewX, setSkewX] = useState(45); // 3 units skew
  const [heightUnits, setHeightUnits] = useState(5); // 5 units high (75px)
  const [showProof, setShowProof] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const heightPx = heightUnits * PX_PER_UNIT;
  const topY = BASE_Y - heightPx;
  const baseUnits = Math.round(BASE_LEN_PX / PX_PER_UNIT); // 9
  const area = baseUnits * heightUnits;

  // Handle pointer down on top-left apex vertex
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

      // Adjust skew: px - B1_X in [15..60]
      const rawSkew = Math.max(15, Math.min(60, px - B1_X));
      setSkewX(Math.round(rawSkew));

      // Adjust height: in [3..6] units
      const rawH = (BASE_Y - py) / PX_PER_UNIT;
      setHeightUnits(Math.max(3, Math.min(6, Math.round(rawH))));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  // Coordinates
  // Main body without left triangle: Trapezoid (B1_X+skewX, topY) -> (B2_X+skewX, topY) -> (B2_X, BASE_Y) -> (B1_X+skewX, BASE_Y)
  // Left triangle: (B1_X, BASE_Y) -> (B1_X+skewX, topY) -> (B1_X+skewX, BASE_Y)
  // When proof is shown, the triangle translates by +BASE_LEN_PX to dock on the right: (B2_X, BASE_Y) -> (B2_X+skewX, topY) -> (B2_X+skewX, BASE_Y)
  const triPtsNormal = `${B1_X},${BASE_Y} ${B1_X + skewX},${topY} ${B1_X + skewX},${BASE_Y}`;
  const triShiftX = showProof ? BASE_LEN_PX : 0;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Bounding Box */}
        <rect
          x={B1_X + skewX}
          y={topY}
          width={BASE_LEN_PX}
          height={heightPx}
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeDasharray="3 3"
          strokeWidth={1.2}
        />

        {/* 2. Main Middle Trapezoid Body */}
        <polygon
          points={`${B1_X + skewX},${topY} ${B2_X + skewX},${topY} ${B2_X + (showProof ? skewX : 0)},${BASE_Y} ${B1_X + skewX},${BASE_Y}`}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 3. Sliding Triangular Wedge (Proof animation) */}
        <g style={{ transform: `translateX(${triShiftX}px)`, transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          <polygon
            points={triPtsNormal}
            fill={showProof ? "rgba(94, 232, 255, 0.25)" : "rgba(255, 255, 255, 0.12)"}
            stroke={showProof ? COLOR_HEIGHT : "rgba(255, 255, 255, 0.95)"}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {showProof && (
            <text
              x={B1_X + skewX / 2}
              y={BASE_Y - heightPx / 3}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill={COLOR_HEIGHT}
            >
              +wedge
            </text>
          )}
        </g>

        {/* 4. Dashed Altitude Line (h) with Right Angle Box */}
        <line
          x1={B1_X + skewX}
          y1={topY}
          x2={B1_X + skewX}
          y2={BASE_Y}
          stroke={COLOR_HEIGHT}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <RightAngleMarker x={B1_X + skewX} y={BASE_Y} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_HEIGHT} />

        {/* 5. Dimension Labels */}
        {/* Base (b) */}
        <text
          x={B1_X + BASE_LEN_PX / 2}
          y={BASE_Y + 16}
          textAnchor="middle"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_BASE}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          b = {baseUnits}
        </text>

        {/* Height (h) */}
        <text
          x={B1_X + skewX - 10}
          y={topY + heightPx / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          h = {heightUnits}
        </text>

        {/* 6. Drag Handle on Top-Left Apex */}
        <g
          transform={`translate(${B1_X + skewX}, ${topY})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <circle r={24} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* 7. Frosted Controls / Proof Action Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={() => setShowProof(!showProof)}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {showProof ? "Reset parallelogram" : "Show rectangle proof (cut & slide)"}
        </button>
      </div>

      {/* 8. Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">A</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_BASE }}>{baseUnits}</span>
          <span className="text-white/60">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{heightUnits}</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_AREA }} className="font-extrabold">{area}</span>
        </div>
      </div>
    </div>
  );
}
