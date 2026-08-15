"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveTrapezoidExplorerProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 155;
const BASE_Y = 125;
const PX_PER_UNIT = 14;

const COLOR_BASE_A = "#5ee8ff"; // Electric Cyan
const COLOR_BASE_B = "#ffd45e"; // Warm Gold
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan
const COLOR_AREA = "#ffffff";   // Crisp White

export function InteractiveTrapezoidExplorer({ color }: InteractiveTrapezoidExplorerProps) {
  // Dimensions in integer units: a in [3..6], b in [6..10], h in [3..6]
  const [units, setUnits] = useState({ a: 4, b: 8, h: 5 });
  const [showProof, setShowProof] = useState(false);
  const [isDragging, setIsDragging] = useState<"a" | "b" | "h" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const { a, b, h } = units;
  const area = 0.5 * (a + b) * h;

  const aPx = a * PX_PER_UNIT;
  const bPx = b * PX_PER_UNIT;
  const hPx = h * PX_PER_UNIT;
  const topY = BASE_Y - hPx;

  // Center trapezoid 1
  const cx = showProof ? 80 : 120;
  const xBase1 = cx - bPx / 2;
  const xBase2 = cx + bPx / 2;
  const xTop1 = cx - aPx / 2;
  const xTop2 = cx + aPx / 2;

  const trap1Pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${BASE_Y} ${xBase1},${BASE_Y}`;

  // Trapezoid 2 (Rotated 180° and docked adjacent along the right slanted edge)
  // Original right edge goes from (xTop2, topY) to (xBase2, BASE_Y)
  // Rotated trapezoid docks so its right edge matches original right edge
  // Vertices of trapezoid 2:
  // (xBase2, BASE_Y) -> (xTop2, topY) -> (xTop2 + bPx, topY) -> (xBase2 + aPx, BASE_Y)
  const trap2Pts = `${xTop2},${topY} ${xTop2 + bPx},${topY} ${xBase2 + aPx},${BASE_Y} ${xBase2},${BASE_Y}`;

  const handlePointerDown = useCallback((type: "a" | "b" | "h") => (e: React.PointerEvent) => {
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
        if (type === "a") {
          const rawA = Math.round(Math.abs(px - cx) * 2 / PX_PER_UNIT);
          const newA = Math.max(3, Math.min(prev.b - 2, rawA));
          return { ...prev, a: newA };
        }
        if (type === "b") {
          const rawB = Math.round(Math.abs(px - cx) * 2 / PX_PER_UNIT);
          const newB = Math.max(prev.a + 2, Math.min(10, rawB));
          return { ...prev, b: newB };
        }
        if (type === "h") {
          const rawH = Math.round((BASE_Y - py) / PX_PER_UNIT);
          const newH = Math.max(3, Math.min(6, rawH));
          return { ...prev, h: newH };
        }
        return prev;
      });
    };

    const onUp = () => {
      setIsDragging(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [cx]);

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Trapezoid 1 (Original) */}
        <polygon
          points={trap1Pts}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 2. Trapezoid 2 (Duplicate & Rotated 180° proof) */}
        {showProof && (
          <g style={{ animation: "fadeIn 0.5s ease forwards" }}>
            <polygon
              points={trap2Pts}
              fill="rgba(94, 232, 255, 0.18)"
              stroke={COLOR_BASE_A}
              strokeWidth={2.5}
              strokeDasharray="4 3"
              strokeLinejoin="round"
            />
            {/* Top base of trapezoid 2 is length b */}
            <text
              x={xTop2 + bPx / 2}
              y={topY - 10}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill={COLOR_BASE_B}
            >
              b = {b}
            </text>
            {/* Bottom base of trapezoid 2 is length a */}
            <text
              x={xBase2 + aPx / 2}
              y={BASE_Y + 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill={COLOR_BASE_A}
            >
              a = {a}
            </text>
          </g>
        )}

        {/* 3. Dashed Altitude Line (h) */}
        <line
          x1={xTop1}
          y1={topY}
          x2={xTop1}
          y2={BASE_Y}
          stroke={COLOR_HEIGHT}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <RightAngleMarker x={xTop1} y={BASE_Y} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_HEIGHT} />

        {/* 4. Dimension Labels on Trapezoid 1 */}
        {/* Top Base (a) */}
        <text
          x={cx}
          y={topY - 12}
          textAnchor="middle"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_BASE_A}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          a = {a}
        </text>

        {/* Bottom Base (b) */}
        <text
          x={cx}
          y={BASE_Y + 16}
          textAnchor="middle"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_BASE_B}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          b = {b}
        </text>

        {/* Height (h) */}
        <text
          x={xTop1 - 8}
          y={topY + hPx / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          h = {h}
        </text>

        {/* 5. Drag Handle on Top-Right Corner */}
        {!showProof && (
          <g
            transform={`translate(${xTop2}, ${topY})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown("a")}
          >
            <circle r={24} fill="transparent" />
            <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
            <circle r={4.5} fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* 6. Proof Toggle Button */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={() => setShowProof(!showProof)}
          className="px-3.5 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm backdrop-blur-md active:scale-95"
        >
          {showProof ? "Reset trapezoid" : "Show 2× parallelogram proof (a + b) · h"}
        </button>
      </div>

      {/* 7. Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">A</span>
          <span className="text-white/60">=</span>
          <StackedFraction numerator="1" denominator="2" />
          <span className="text-white/60">(</span>
          <span style={{ color: COLOR_BASE_A }}>{a}</span>
          <span className="text-white/60">+</span>
          <span style={{ color: COLOR_BASE_B }}>{b}</span>
          <span className="text-white/60">)</span>
          <span className="text-white/60">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{h}</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_AREA }} className="font-extrabold">{area}</span>
        </div>
      </div>
    </div>
  );
}
