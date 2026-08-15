"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";

type InteractiveRhombusExplorerProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;
const CY = 75;
const SIDE_LEN = 65;

const COLOR_SIDE = "#ffd45e";    // Warm Gold
const COLOR_DIAG = "#d8b4fe";    // Neon Lilac
const COLOR_ANGLE = "#5ee8ff";   // Electric Cyan

export function InteractiveRhombusExplorer({ color }: InteractiveRhombusExplorerProps) {
  // Half apex angle in degrees [20°..70°]
  const [halfAngleDeg, setHalfAngleDeg] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const rad = (halfAngleDeg * Math.PI) / 180;
  const rx = Math.round(SIDE_LEN * Math.sin(rad));
  const ry = Math.round(SIDE_LEN * Math.cos(rad));

  const apexAngle = halfAngleDeg * 2;
  const obtuseAngle = 180 - apexAngle;

  const topV = { x: CX, y: CY - ry };
  const rightV = { x: CX + rx, y: CY };
  const botV = { x: CX, y: CY + ry };
  const leftV = { x: CX - rx, y: CY };

  const pts = `${topV.x},${topV.y} ${rightV.x},${rightV.y} ${botV.x},${botV.y} ${leftV.x},${leftV.y}`;

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
      const ang = Math.atan2(dx, dy) * (180 / Math.PI);
      const clamped = Math.max(20, Math.min(70, Math.round(ang)));
      setHalfAngleDeg(clamped);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Diagonals (Perpendicular Bisectors) */}
        <line x1={leftV.x} y1={leftV.y} x2={rightV.x} y2={rightV.y} stroke={COLOR_DIAG} strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={topV.x} y1={topV.y} x2={botV.x} y2={botV.y} stroke={COLOR_DIAG} strokeWidth={1.5} strokeDasharray="3 3" />

        {/* 2. Central 90° Marker */}
        <RightAngleMarker x={CX} y={CY} size={7} orientation="top-right" strokeWidth={1.5} color={COLOR_DIAG} />

        {/* 3. Main Boundary */}
        <polygon points={pts} fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} strokeLinejoin="round" />

        {/* 4. Angle Readouts */}
        {/* Top Acute/Obtuse Angle */}
        <text
          x={CX}
          y={topV.y - 12}
          textAnchor="middle"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_ANGLE}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {apexAngle}°
        </text>

        {/* Right Acute/Obtuse Angle */}
        <text
          x={rightV.x + 14}
          y={CY}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="800"
          fill={COLOR_ANGLE}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {obtuseAngle}°
        </text>

        {/* 5. Drag Handle on Top Vertex */}
        <g
          transform={`translate(${topV.x}, ${topV.y})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <circle r={24} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* 6. Live Typographic Status Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">4 equal sides</span>
          <span className="text-white/40">·</span>
          <span style={{ color: COLOR_DIAG }}>Diagonals cross at 90°</span>
        </div>
      </div>
    </div>
  );
}
