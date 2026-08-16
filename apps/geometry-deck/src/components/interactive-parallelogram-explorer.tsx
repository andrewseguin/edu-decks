"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveParallelogramExplorerProps = {
  mode?: "area" | "perimeter";
  color?: string;
};

const SVG_H = 175;
const ORIGIN_Y = 142;

const COLOR_BASE = "#ffd45e";   // Warm Gold (base b)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (height h / side a)
const COLOR_AREA = "#ffffff";   // Crisp Bold White

export function InteractiveParallelogramExplorer({ mode = "area", color }: InteractiveParallelogramExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  const SVG_W = Math.max(260, Math.min(480, rawW - 24));
  const pxPerUnit = SVG_W >= 360 ? 20 : 16;
  const isPerimeter = mode === "perimeter";

  // Base length in units
  const [baseUnits, setBaseUnits] = useState(8);
  const [skewUnits, setSkewUnits] = useState(3);
  const [heightUnits, setHeightUnits] = useState(5);
  const [showProof, setShowProof] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseLenPx = baseUnits * pxPerUnit;
  const skewX = skewUnits * pxPerUnit;
  const heightPx = heightUnits * pxPerUnit;
  const topY = ORIGIN_Y - heightPx;
  const area = baseUnits * heightUnits;
  // Side leg length (slant)
  const sideUnits = Math.round(Math.hypot(skewUnits, heightUnits) * 10) / 10;
  const perimeter = 2 * (baseUnits + Math.round(Math.hypot(skewUnits, heightUnits)));

  // Center horizontally in SVG canvas
  const totalW = baseLenPx + skewX;
  const b1X = Math.round((SVG_W - totalW) / 2);
  const b2X = b1X + baseLenPx;

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

      if (isPerimeter) {
        const rawB = Math.round((px - b1X - skewX) / pxPerUnit);
        setBaseUnits(Math.max(3, Math.min(12, rawB)));
        const rawH = Math.round((ORIGIN_Y - py) / pxPerUnit);
        setHeightUnits(Math.max(2, Math.min(7, rawH)));
      } else {
        const rawSkewU = Math.round((px - b1X) / pxPerUnit);
        setSkewUnits(Math.max(1, Math.min(5, rawSkewU)));
        const rawHU = Math.round((ORIGIN_Y - py) / pxPerUnit);
        setHeightUnits(Math.max(2, Math.min(7, rawHU)));
      }
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [SVG_W, b1X, isPerimeter, pxPerUnit]);

  const triPtsNormal = `${b1X},${ORIGIN_Y} ${b1X + skewX},${topY} ${b1X + skewX},${ORIGIN_Y}`;
  const triShiftX = showProof ? baseLenPx : 0;
  const paraPts = `${b1X + skewX},${topY} ${b2X + skewX},${topY} ${b2X},${ORIGIN_Y} ${b1X},${ORIGIN_Y}`;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`-10 -8 ${SVG_W + 20} ${SVG_H + 16}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Unit Grid Lines (Only for Area) */}
        {!isPerimeter && (
          <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1} strokeDasharray="2 4">
            {Array.from({ length: baseUnits + skewUnits - 1 }, (_, i) => {
              const gx = b1X + (i + 1) * pxPerUnit;
              if (Math.abs(gx - (b1X + skewX)) < 1) return null;
              return <line key={`v-${i}`} x1={gx} y1={topY} x2={gx} y2={ORIGIN_Y} />;
            })}
            {Array.from({ length: heightUnits - 1 }, (_, i) => {
              const gy = topY + (i + 1) * pxPerUnit;
              return <line key={`h-${i}`} x1={b1X} y1={gy} x2={b2X + skewX} y2={gy} />;
            })}
          </g>
        )}

        {/* 2. Shape Body */}
        {isPerimeter ? (
          <polygon
            points={paraPts}
            fill="rgba(255, 255, 255, 0.14)"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ) : (
          <>
            {/* Main Middle Trapezoid Body */}
            <polygon
              points={`${b1X + skewX},${topY} ${b2X + skewX},${topY} ${b2X},${ORIGIN_Y} ${b1X + skewX},${ORIGIN_Y}`}
              fill="rgba(255, 255, 255, 0.14)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* Sliding Triangular Wedge */}
            <g style={{ transform: `translateX(${triShiftX}px)`, transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
              <polygon
                points={triPtsNormal}
                fill="rgba(255, 255, 255, 0.14)"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            </g>
          </>
        )}

        {/* 3. Altitude Line (Only on Area cards) */}
        {!isPerimeter && (
          <>
            <line
              x1={b1X + skewX}
              y1={topY}
              x2={b1X + skewX}
              y2={ORIGIN_Y}
              stroke={COLOR_HEIGHT}
              strokeWidth={2.5}
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <RightAngleMarker x={b1X + skewX} y={ORIGIN_Y} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_HEIGHT} />
          </>
        )}

        {/* 4. Highlighted Base Line */}
        <line
          x1={b1X}
          y1={ORIGIN_Y}
          x2={b2X}
          y2={ORIGIN_Y}
          stroke={COLOR_BASE}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* 5. Highlighted Left Slanted Leg (Perimeter mode) */}
        {isPerimeter && (
          <line
            x1={b1X}
            y1={ORIGIN_Y}
            x2={b1X + skewX}
            y2={topY}
            stroke={COLOR_HEIGHT}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* 6. Dimension Labels */}
        {/* Base (b) */}
        <text
          x={b1X + baseLenPx / 2}
          y={ORIGIN_Y + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13.5}
          fontWeight="800"
          fill={COLOR_BASE}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {baseUnits}
        </text>

        {/* Height (h) on Area cards / Slanted Side (a) on Perimeter cards */}
        {isPerimeter ? (() => {
          const legAng = Math.atan2(heightPx, skewX);
          const midX = b1X + skewX / 2;
          const midY = (ORIGIN_Y + topY) / 2;
          const perpOffset = 14;
          const lx = midX - Math.sin(legAng) * perpOffset;
          const ly = midY - Math.cos(legAng) * perpOffset;
          return (
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_HEIGHT}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {heightUnits}
            </text>
          );
        })() : (
          <text
            x={b1X + skewX + 14}
            y={topY + heightPx / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13.5}
            fontWeight="800"
            fill={COLOR_HEIGHT}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {heightUnits}
          </text>
        )}

        {/* 7. Interactive Drag Handle */}
        <g
          transform={`translate(${b2X + skewX}, ${topY})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* 8. Area Proof Step Pills (Only on Area cards) */}
      {!isPerimeter && (
        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none">
          <button
            type="button"
            onClick={() => setShowProof(false)}
            className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none ${
              !showProof
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            1. Parallelogram
          </button>
          <button
            type="button"
            onClick={() => setShowProof(true)}
            className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none ${
              showProof
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            2. Rectangle Proof
          </button>
        </div>
      )}

      {/* 9. Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-1.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          {isPerimeter ? (
            <>
              <span className="text-white">P</span>
              <span className="text-white/50">=</span>
              <span className="text-white">2(<span style={{ color: COLOR_HEIGHT }}>{heightUnits}</span>)</span>
              <span className="text-white/50">+</span>
              <span className="text-white">2(<span style={{ color: COLOR_BASE }}>{baseUnits}</span>)</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{2 * (heightUnits + baseUnits)}</span>
            </>
          ) : !showProof ? (
            <>
              <span className="text-white">A</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_BASE }}>{baseUnits}</span>
              <span className="text-white/50">·</span>
              <span style={{ color: COLOR_HEIGHT }}>{heightUnits}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{area}</span>
            </>
          ) : (
            <>
              <span className="text-white/80">Rectangle Area = </span>
              <span style={{ color: COLOR_BASE }}>{baseUnits}</span>
              <span className="text-white/50">·</span>
              <span style={{ color: COLOR_HEIGHT }}>{heightUnits}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{area}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
