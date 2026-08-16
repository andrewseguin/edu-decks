"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveRectangleAreaExplorerProps = {
  mode?: "area" | "perimeter";
  color?: string;
};

const SVG_H = 175;
const ORIGIN_Y = 142;

const COLOR_LENGTH = "#ffd45e"; // Warm Gold (Length l)
const COLOR_WIDTH = "#5ee8ff";  // Electric Cyan (Width w)
const COLOR_RESULT = "#ffffff"; // Crisp Bold White

export function InteractiveRectangleAreaExplorer({ mode = "area", color }: InteractiveRectangleAreaExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  const SVG_W = Math.max(260, Math.min(480, rawW - 24));
  const CX = SVG_W / 2;

  // Responsive grid unit size
  const pxPerUnit = SVG_W >= 360 ? 22 : 18;
  const maxL = Math.max(6, Math.min(16, Math.floor((SVG_W - 60) / pxPerUnit)));
  const maxW = 6;

  // Rectangle dimensions in units: length in [3..maxL], width in [2..maxW]
  const [units, setUnits] = useState({ l: 8, w: 4 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const { l, w } = units;
  const area = l * w;
  const perimeter = 2 * (l + w);

  const rectW = l * pxPerUnit;
  const rectH = w * pxPerUnit;
  const x1 = Math.round(CX - rectW / 2);
  const y1 = ORIGIN_Y - rectH;
  const x2 = x1 + rectW;
  const y2 = ORIGIN_Y;

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

      // Symmetric 1:1 cursor tracking while staying perfectly centered
      const rawL = Math.round((px - CX) * 2 / pxPerUnit);
      const rawW = Math.round((ORIGIN_Y - py) / pxPerUnit);

      const newL = Math.max(3, Math.min(maxL, rawL));
      const newW = Math.max(2, Math.min(maxW, rawW));

      setUnits({ l: newL, w: newW });
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, SVG_W, maxL, maxW, pxPerUnit]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`-10 -8 ${SVG_W + 20} ${SVG_H + 16}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Unit Grid Lines (Prominent for Area) */}
        {mode === "area" && (
          <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1} strokeDasharray="2 4">
            {Array.from({ length: l - 1 }, (_, i) => {
              const gx = x1 + (i + 1) * pxPerUnit;
              return <line key={`v-${i}`} x1={gx} y1={y1} x2={gx} y2={y2} />;
            })}
            {Array.from({ length: w - 1 }, (_, i) => {
              const gy = y1 + (i + 1) * pxPerUnit;
              return <line key={`h-${i}`} x1={x1} y1={gy} x2={x2} y2={gy} />;
            })}
          </g>
        )}

        {/* 2. Soft Semi-transparent Fill */}
        <rect x={x1} y={y1} width={rectW} height={rectH} fill="rgba(255, 255, 255, 0.14)" />

        {/* 3. Outer Boundary */}
        <rect
          x={x1}
          y={y1}
          width={rectW}
          height={rectH}
          fill="none"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={mode === "perimeter" ? 3 : 2.5}
        />

        {/* 4. Dimension Labels */}
        {/* Length (l) bottom */}
        <text
          x={(x1 + x2) / 2}
          y={y2 + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13.5}
          fontWeight="800"
          fill={COLOR_LENGTH}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {l}
        </text>

        {/* Width (w) right */}
        <text
          x={x2 + 16}
          y={(y1 + y2) / 2}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={13.5}
          fontWeight="800"
          fill={COLOR_WIDTH}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {w}
        </text>

        {/* 5. Drag Handle at Top-Right Corner */}
        <g
          transform={`translate(${x2}, ${y1})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* 6. Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          {mode === "area" ? (
            <>
              <span className="text-white">A</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_LENGTH }}>{l}</span>
              <span className="text-white/50">·</span>
              <span style={{ color: COLOR_WIDTH }}>{w}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_RESULT }} className="font-bold">{area}</span>
            </>
          ) : (
            <>
              <span className="text-white">P</span>
              <span className="text-white/50">=</span>
              <span className="text-white">2(<span style={{ color: COLOR_LENGTH }}>{l}</span>)</span>
              <span className="text-white/50">+</span>
              <span className="text-white">2(<span style={{ color: COLOR_WIDTH }}>{w}</span>)</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_RESULT }} className="font-bold">{perimeter}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
