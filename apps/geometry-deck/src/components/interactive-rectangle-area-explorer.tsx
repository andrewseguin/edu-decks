"use client";

import React, { useState, useCallback, useRef } from "react";

type InteractiveRectangleAreaExplorerProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const ORIGIN_X = 40;
const ORIGIN_Y = 120;
const PX_PER_UNIT = 16;

const COLOR_LENGTH = "#ffd45e"; // Warm Gold
const COLOR_WIDTH = "#5ee8ff";  // Electric Cyan
const COLOR_AREA = "#ffffff";   // Crisp White

export function InteractiveRectangleAreaExplorer({ color }: InteractiveRectangleAreaExplorerProps) {
  // Rectangle dimensions in units: length in [3..9], width in [2..6]
  const [units, setUnits] = useState({ l: 7, w: 4 });
  const [isDragging, setIsDragging] = useState<"length" | "width" | "corner" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const handlePointerDown = useCallback((type: "length" | "width" | "corner") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;
    const scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;

      setUnits((prev) => {
        let newL = prev.l;
        let newW = prev.w;

        if (type === "length" || type === "corner") {
          const rawL = (px - ORIGIN_X) / PX_PER_UNIT;
          newL = Math.max(3, Math.min(9, Math.round(rawL)));
        }
        if (type === "width" || type === "corner") {
          const rawW = (ORIGIN_Y - py) / PX_PER_UNIT;
          newW = Math.max(2, Math.min(6, Math.round(rawW)));
        }
        return { l: newL, w: newW };
      });
    };

    const onUp = () => {
      setIsDragging(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const { l, w } = units;
  const area = l * w;

  const rectW = l * PX_PER_UNIT;
  const rectH = w * PX_PER_UNIT;
  const x1 = ORIGIN_X;
  const y1 = ORIGIN_Y - rectH;
  const x2 = ORIGIN_X + rectW;
  const y2 = ORIGIN_Y;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Unit Grid Lines */}
        <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1} strokeDasharray="2 2">
          {Array.from({ length: l - 1 }, (_, i) => {
            const gx = x1 + (i + 1) * PX_PER_UNIT;
            return <line key={`v-${i}`} x1={gx} y1={y1} x2={gx} y2={y2} />;
          })}
          {Array.from({ length: w - 1 }, (_, i) => {
            const gy = y1 + (i + 1) * PX_PER_UNIT;
            return <line key={`h-${i}`} x1={x1} y1={gy} x2={x2} y2={gy} />;
          })}
        </g>

        {/* 2. Soft Semi-transparent Fill */}
        <rect x={x1} y={y1} width={rectW} height={rectH} fill="rgba(255, 255, 255, 0.12)" />

        {/* 3. Outer Boundary */}
        <rect x={x1} y={y1} width={rectW} height={rectH} fill="none" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />

        {/* 4. Dimension Labels */}
        {/* Length (l) bottom horizontal */}
        <text
          x={(x1 + x2) / 2}
          y={y2 + 16}
          textAnchor="middle"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_LENGTH}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {l}
        </text>

        {/* Width (w) right vertical */}
        <text
          x={x2 + 14}
          y={(y1 + y2) / 2}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_WIDTH}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {w}
        </text>

        {/* 5. Drag Handle at Top-Right Corner */}
        <g
          transform={`translate(${x2}, ${y1})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown("corner")}
        >
          <circle r={24} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* 6. Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">A</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_LENGTH }}>{l}</span>
          <span className="text-white/60">·</span>
          <span style={{ color: COLOR_WIDTH }}>{w}</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_AREA }} className="font-extrabold">{area}</span>
        </div>
      </div>
    </div>
  );
}
