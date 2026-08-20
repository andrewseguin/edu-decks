"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";
import { StackedFraction } from "./ui/formatted-math-text";
import { useContainerWidth } from "@/hooks/use-container-width";
import { useSvgDrag } from "@/hooks/use-svg-drag";

type InteractiveTrapezoidExplorerProps = {
  mode?: "area" | "perimeter";
  color?: string;
};

const SVG_H = 175;
const BASE_Y = 142;

const COLOR_BASE_A = "#d8b4fe"; // Soft Lilac (top base a)
const COLOR_BASE_B = "#ffd45e"; // Warm Gold (bottom base b)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (height h / leg c)
const COLOR_AREA = "#ffffff";   // Crisp Bold White

export function InteractiveTrapezoidExplorer({ mode = "area", color }: InteractiveTrapezoidExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  const SVG_W = Math.max(260, Math.min(480, rawW - 24));
  const pxPerUnit = SVG_W >= 380 ? 18 : 15;
  const CX = SVG_W / 2;
  const isPerimeter = mode === "perimeter";

  // Dimensions in integer units: a in [3..6], b in [6..10], h in [3..6]
  const [units, setUnits] = useState({ a: 4, b: 8, h: 5 });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState<"a" | "b" | "h" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const { a, b, h } = units;
  const area = 0.5 * (a + b) * h;
  const combinedBase = a + b;
  const combinedArea = combinedBase * h;

  const aPx = a * pxPerUnit;
  const bPx = b * pxPerUnit;
  const hPx = h * pxPerUnit;
  const topY = BASE_Y - hPx;

  // Leg length for perimeter
  const legX = (bPx - aPx) / 2;
  const legUnits = Math.round(Math.hypot(legX / pxPerUnit, h) * 10) / 10;
  const perimeter = a + b + Math.round(legUnits) * 2;

  // Step 1: Center single trapezoid at CX
  // Step 2 & 3: Center combined parallelogram at CX
  const isProof = step >= 2 && !isPerimeter;
  const totalBasePx = combinedBase * pxPerUnit;

  // Origin point for the active step
  const originX = isProof
    ? Math.round(CX - totalBasePx / 2)
    : Math.round(CX - bPx / 2);

  const xBase1 = originX;
  const xBase2 = xBase1 + bPx;
  const xTop1 = isProof ? originX + Math.round((bPx - aPx) / 2) : Math.round(CX - aPx / 2);
  const xTop2 = xTop1 + aPx;

  // Step 2 & 3 points
  const xTopEnd = xTop1 + totalBasePx;
  const xBaseEnd = xBase1 + totalBasePx;

  // Polygons
  const trap1Pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${BASE_Y} ${xBase1},${BASE_Y}`;
  const trap2Pts = `${xTop2},${topY} ${xTopEnd},${topY} ${xBaseEnd},${BASE_Y} ${xBase2},${BASE_Y}`;
  const staticBodyPts = `${xTop1},${topY} ${xTopEnd},${topY} ${xBaseEnd},${BASE_Y} ${xTop1},${BASE_Y}`;
  const slidingWedgePts = `${xBase1},${BASE_Y} ${xTop1},${topY} ${xTop1},${BASE_Y}`;

  const maxBAllowed = Math.max(8, Math.min(16, Math.floor((SVG_W - 40) / pxPerUnit)));

  const updateUnitsFromPt = useCallback((pt: { x: number; y: number }, type: "a" | "b" | "h" | "top2d") => {
    setUnits((prev) => {
      if (type === "top2d") {
        const rawA = Math.round(((pt.x - CX) * 2) / pxPerUnit);
        const rawH = Math.round((BASE_Y - pt.y) / pxPerUnit);
        const newA = Math.max(2, Math.min(prev.b - 1, rawA));
        const newH = Math.max(2, Math.min(7, rawH));
        return { ...prev, a: newA, h: newH };
      }
      if (type === "a") {
        const rawA = Math.round(((pt.x - CX) * 2) / pxPerUnit);
        const newA = Math.max(2, Math.min(prev.b - 1, rawA));
        return { ...prev, a: newA };
      }
      if (type === "b") {
        const rawB = Math.round(((pt.x - CX) * 2) / pxPerUnit);
        const newB = Math.max(prev.a + 1, Math.min(maxBAllowed, rawB));
        return { ...prev, b: newB };
      }
      if (type === "h") {
        const rawH = Math.round((BASE_Y - pt.y) / pxPerUnit);
        const newH = Math.max(2, Math.min(7, rawH));
        return { ...prev, h: newH };
      }
      return prev;
    });
  }, [CX, maxBAllowed, pxPerUnit]);

  const { handlePointerDown: handleDragTop2d } = useSvgDrag({
    svgRef,
    viewBoxWidth: SVG_W,
    viewBoxHeight: SVG_H,
    onDragStart: (pt) => { setIsDragging("a"); updateUnitsFromPt(pt, "top2d"); },
    onDragMove: (pt) => { updateUnitsFromPt(pt, "top2d"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const { handlePointerDown: handleDragA } = useSvgDrag({
    svgRef,
    viewBoxWidth: SVG_W,
    viewBoxHeight: SVG_H,
    onDragStart: (pt) => { setIsDragging("a"); updateUnitsFromPt(pt, "a"); },
    onDragMove: (pt) => { updateUnitsFromPt(pt, "a"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const { handlePointerDown: handleDragB } = useSvgDrag({
    svgRef,
    viewBoxWidth: SVG_W,
    viewBoxHeight: SVG_H,
    onDragStart: (pt) => { setIsDragging("b"); updateUnitsFromPt(pt, "b"); },
    onDragMove: (pt) => { updateUnitsFromPt(pt, "b"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const { handlePointerDown: handleDragH } = useSvgDrag({
    svgRef,
    viewBoxWidth: SVG_W,
    viewBoxHeight: SVG_H,
    onDragStart: (pt) => { setIsDragging("h"); updateUnitsFromPt(pt, "h"); },
    onDragMove: (pt) => { updateUnitsFromPt(pt, "h"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const handlePointerDown = (type: "a" | "b" | "h" | "top2d") => {
    switch (type) {
      case "top2d": return handleDragTop2d;
      case "a": return handleDragA;
      case "b": return handleDragB;
      case "h": return handleDragH;
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* 1. Neutral Unit Grid Lines (skips altitude line at xTop1, only on Area cards) */}
        {!isPerimeter && (
          <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1} strokeDasharray="2 4">
            {Array.from({ length: (isProof ? combinedBase + 2 : b) + 1 }, (_, i) => {
              const gx = xBase1 + i * pxPerUnit;
              if (Math.abs(gx - xTop1) < 2) return null;
              return <line key={`v-${i}`} x1={gx} y1={topY} x2={gx} y2={BASE_Y} />;
            })}
            {Array.from({ length: h - 1 }, (_, i) => {
              const gy = topY + (i + 1) * pxPerUnit;
              const gridRight = isProof ? xBaseEnd : xBase2;
              return <line key={`h-${i}`} x1={xBase1} y1={gy} x2={gridRight} y2={gy} />;
            })}
          </g>
        )}

        {/* 2. Step 1 & 2: Main Trapezoid 1 (Single continuous polygon) */}
        {step < 3 || isPerimeter ? (
          <polygon
            points={trap1Pts}
            fill="rgba(255, 255, 255, 0.14)"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ) : (
          /* Step 3: Static central remainder body */
          <polygon
            points={staticBodyPts}
            fill="rgba(255, 255, 255, 0.14)"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}

        {/* 3. Step 2: Docked Duplicate Trapezoid 2 (Only for Area) */}
        {!isPerimeter && (
          <g
            style={{
              transform: step >= 2 ? "rotate(0deg)" : "rotate(180deg)",
              transformOrigin: `${(xTop2 + xBase2) / 2}px ${(topY + BASE_Y) / 2}px`,
              transition: "transform 0.85s cubic-bezier(0.34, 1.15, 0.64, 1)",
              pointerEvents: "none",
            }}
          >
            <polygon
              points={trap2Pts}
              fill="rgba(255, 255, 255, 0.12)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth={2.5}
              strokeDasharray="4 3"
              strokeLinejoin="round"
            />
            {/* Step 2 labels on Trapezoid 2 */}
            <g style={{ opacity: step === 2 ? 1 : 0, transition: "opacity 0.3s ease 0.35s" }}>
              <text
                x={xTop2 + bPx / 2}
                y={topY - 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight="800"
                fill={COLOR_BASE_B}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
              >
                {b}
              </text>
              <text
                x={xBase2 + aPx / 2}
                y={BASE_Y + 16}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight="800"
                fill={COLOR_BASE_A}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
              >
                {a}
              </text>
            </g>
          </g>
        )}

        {/* 4. Step 3: Sliding Left Wedge (Only for Area) */}
        {!isPerimeter && step === 3 && (
          <g
            style={{
              animation: "slideTrapWedge 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          >
            <style>{`
              @keyframes slideTrapWedge {
                from { transform: translateX(0px); }
                to { transform: translateX(${totalBasePx}px); }
              }
            `}</style>
            <polygon
              points={slidingWedgePts}
              fill="rgba(255, 255, 255, 0.14)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* 5. Dashed Altitude Line (h) with Right Angle Box (Only for Area) */}
        {!isPerimeter && (
          <>
            <line
              x1={xTop1}
              y1={topY}
              x2={xTop1}
              y2={BASE_Y}
              stroke={COLOR_HEIGHT}
              strokeWidth={2}
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <RightAngleMarker x={xTop1} y={BASE_Y} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_HEIGHT} />
          </>
        )}

        {/* 6. Highlighted Bases on Trapezoid 1 (Step 1 & 2) */}
        {(step < 3 || isPerimeter) && (
          <>
            <line x1={xTop1} y1={topY} x2={xTop2} y2={topY} stroke={COLOR_BASE_A} strokeWidth={3} strokeLinecap="round" />
            <line x1={xBase1} y1={BASE_Y} x2={xBase2} y2={BASE_Y} stroke={COLOR_BASE_B} strokeWidth={3} strokeLinecap="round" />

            {/* Top Base (a) in Lilac */}
            <text
              x={xTop1 + aPx / 2}
              y={topY - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_BASE_A}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {a}
            </text>

            {/* Bottom Base (b) in Gold */}
            <text
              x={xBase1 + bPx / 2}
              y={BASE_Y + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_BASE_B}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {b}
            </text>
          </>
        )}

        {/* Perimeter Slanted Side Labels */}
        {isPerimeter && (
          <>
            <text
              x={(xBase1 + xTop1) / 2 - 15}
              y={topY + hPx / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_HEIGHT}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {Math.round(legUnits)}
            </text>
            <text
              x={(xBase2 + xTop2) / 2 + 15}
              y={topY + hPx / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_HEIGHT}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {Math.round(legUnits)}
            </text>
          </>
        )}

        {/* Step 3 Combined Dimension Label on top */}
        {!isPerimeter && step === 3 && (
          <text
            x={xTop1 + totalBasePx / 2}
            y={topY - 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13.5}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            a + b = {combinedBase}
          </text>
        )}

        {/* Height (h) on Area cards */}
        {!isPerimeter && (
          <text
            x={xTop1 + 14}
            y={topY + hPx / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13.5}
            fontWeight="800"
            fill={COLOR_HEIGHT}
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {h}
          </text>
        )}

        {/* 7. Interactive Drag Handles on Trapezoid 1 (Active in Step 1) */}
        {(step === 1 || isPerimeter) && (
          <>
            {/* Handle a & h (Top right vertex of trap 1: full 2D control) */}
            <g
              transform={`translate(${xTop2}, ${topY})`}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown("top2d")}
            >
              <circle r={26} fill="transparent" />
              <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
              <circle r={4.5} fill="#ffffff" />
            </g>

            {/* Handle b (Bottom right vertex of trap 1) */}
            <g
              transform={`translate(${xBase2}, ${BASE_Y})`}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown("b")}
            >
              <circle r={26} fill="transparent" />
              <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
              <circle r={4.5} fill="#ffffff" />
            </g>

            {/* Handle h (Top left vertex of trap 1) */}
            {!isPerimeter && (
              <g
                transform={`translate(${xTop1}, ${topY})`}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown("h")}
              >
                <circle r={26} fill="transparent" />
                <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
                <circle r={4.5} fill="#ffffff" />
              </g>
            )}
          </>
        )}
      </svg>

      {/* 8. Numbered Step Controls (Only for Area) */}
      {!isPerimeter && (
        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none ${
              step === 1
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            1. Trapezoid
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none ${
              step === 2
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            2. Parallelogram
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none ${
              step === 3
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            3. Rectangle Proof
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
              <span style={{ color: COLOR_BASE_A }}>{a}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_BASE_B }}>{b}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_HEIGHT }}>{Math.round(legUnits)}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_HEIGHT }}>{Math.round(legUnits)}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{perimeter}</span>
            </>
          ) : step === 1 ? (
            <>
              <span className="text-white">A</span>
              <span className="text-white/50">=</span>
              <StackedFraction numerator="1" denominator="2" className="text-white" />
              <span className="text-white/50">(</span>
              <span style={{ color: COLOR_BASE_A }}>{a}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_BASE_B }}>{b}</span>
              <span className="text-white/50">)</span>
              <span className="text-white/50">·</span>
              <span style={{ color: COLOR_HEIGHT }}>{h}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{area}</span>
            </>
          ) : step === 2 ? (
            <>
              <span className="text-white/80">2× Area = (</span>
              <span style={{ color: COLOR_BASE_A }}>{a}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_BASE_B }}>{b}</span>
              <span className="text-white/80">) · </span>
              <span style={{ color: COLOR_HEIGHT }}>{h}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{combinedArea}</span>
              <span className="text-white/40 ml-2">→</span>
              <span className="text-white/80 ml-2">A = </span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{area}</span>
            </>
          ) : (
            <>
              <span className="text-white/80">Rectangle Area = </span>
              <span className="text-white font-bold">{combinedBase}</span>
              <span className="text-white/50"> · </span>
              <span style={{ color: COLOR_HEIGHT }}>{h}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{combinedArea}</span>
              <span className="text-white/40 ml-2">→</span>
              <span className="text-white/80 ml-2">Trapezoid A = </span>
              <span style={{ color: COLOR_AREA }} className="font-bold">{area}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
