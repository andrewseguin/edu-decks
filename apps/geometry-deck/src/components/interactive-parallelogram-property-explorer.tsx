"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveParallelogramPropertyProps = {
  color?: string;
};

const SVG_H = 155;
const BASE_Y = 126;

const COLOR_CYAN = "#5ee8ff";   // Angle A (bottom-left & top-right)
const COLOR_LILAC = "#d8b4fe";  // Angle B (bottom-right & top-left)

export function InteractiveParallelogramPropertyExplorer({ color }: InteractiveParallelogramPropertyProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  // Dynamic coordinate width matching rendered container width (clamped for optimal geometry)
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  // Base width scales fluidly with container (approx 44% of card width)
  const BASE_W = Math.round(SVG_W * 0.44);
  const maxSkew = Math.round(SVG_W * 0.22);

  // apex position relative to bottom-left: skew in px, height in px
  const [skewPx, setSkewPx] = useState(36);
  const [heightPx, setHeightPx] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Clamped skew based on current container capacity
  const clampedSkewPx = Math.max(-maxSkew, Math.min(maxSkew, skewPx));
  const b1X = CX - BASE_W / 2;
  const b2X = CX + BASE_W / 2;
  const topY = BASE_Y - heightPx;

  // Vertices:
  // V1 = Bottom-Left (b1X, BASE_Y)
  // V2 = Bottom-Right (b2X, BASE_Y)
  // V3 = Top-Right (b2X + clampedSkewPx, topY)
  // V4 = Top-Left (b1X + clampedSkewPx, topY)
  const v1 = { x: b1X, y: BASE_Y };
  const v2 = { x: b2X, y: BASE_Y };
  const v3 = { x: b2X + clampedSkewPx, y: topY };
  const v4 = { x: b1X + clampedSkewPx, y: topY };

  const pts = `${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y} ${v4.x},${v4.y}`;

  // Slant angle from horizontal in degrees
  const slantRad = Math.atan2(heightPx, clampedSkewPx);
  const slantAngDeg = (slantRad * 180) / Math.PI;

  const acuteDeg = Math.round((Math.atan2(heightPx, Math.max(1, Math.abs(clampedSkewPx))) * 180) / Math.PI);
  const angleADeg = clampedSkewPx >= 0 ? acuteDeg : 180 - acuteDeg;
  const angleBDeg = 180 - angleADeg;

  // Helpers for polar coordinates and SVG arc paths
  const polar = (cx: number, cy: number, deg: number, len: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + len * Math.cos(rad), y: cy - len * Math.sin(rad) };
  };

  const makeArc = (cx: number, cy: number, fromDeg: number, toDeg: number, r: number) => {
    const s = polar(cx, cy, fromDeg, r);
    const e = polar(cx, cy, toDeg, r);
    const span = ((toDeg - fromDeg) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
  };

  const makeArcStroke = (cx: number, cy: number, fromDeg: number, toDeg: number, r: number) => {
    const s = polar(cx, cy, fromDeg, r);
    const e = polar(cx, cy, toDeg, r);
    const span = ((toDeg - fromDeg) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  const ARC_R = 15;
  const LABEL_R = 26;

  // V1 (bottom-left, Angle A): 0° to slantAngDeg
  const v1ArcD = makeArc(v1.x, v1.y, 0, slantAngDeg, ARC_R);
  const v1StrokeD = makeArcStroke(v1.x, v1.y, 0, slantAngDeg, ARC_R);
  const v1LabelPos = polar(v1.x, v1.y, slantAngDeg / 2, LABEL_R);

  // V3 (top-right, Angle A): 180° to 180° + slantAngDeg
  const v3ArcD = makeArc(v3.x, v3.y, 180, 180 + slantAngDeg, ARC_R);
  const v3StrokeD = makeArcStroke(v3.x, v3.y, 180, 180 + slantAngDeg, ARC_R);
  const v3LabelPos = polar(v3.x, v3.y, 180 + slantAngDeg / 2, LABEL_R);

  // V2 (bottom-right, Angle B): slantAngDeg to 180°
  const v2ArcD = makeArc(v2.x, v2.y, slantAngDeg, 180, ARC_R);
  const v2StrokeD = makeArcStroke(v2.x, v2.y, slantAngDeg, 180, ARC_R);
  const v2LabelPos = polar(v2.x, v2.y, (slantAngDeg + 180) / 2, LABEL_R);

  // V4 (top-left, Angle B): 180° + slantAngDeg to 360°
  const v4ArcD = makeArc(v4.x, v4.y, 180 + slantAngDeg, 360, ARC_R);
  const v4StrokeD = makeArcStroke(v4.x, v4.y, 180 + slantAngDeg, 360, ARC_R);
  const v4LabelPos = polar(v4.x, v4.y, (180 + slantAngDeg + 360) / 2, LABEL_R);

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

      const curB1X = CX - BASE_W / 2;
      const rawSkew = Math.round(px - curB1X);
      const rawH = Math.round(BASE_Y - py);

      setSkewPx(Math.max(-maxSkew, Math.min(maxSkew, rawSkew)));
      setHeightPx(Math.max(25, Math.min(85, rawH)));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, BASE_W, SVG_W, maxSkew]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Main Parallelogram Body */}
        <polygon
          points={pts}
          fill="rgba(255, 255, 255, 0.14)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Parallel Side Chevron Indicators */}
        {/* Horizontal Bases: Single Chevron */}
        <polygon
          points={`${(v4.x + v3.x) / 2 - 4},${topY - 3} ${(v4.x + v3.x) / 2 + 3},${topY} ${(v4.x + v3.x) / 2 - 4},${topY + 3}`}
          fill="rgba(255, 255, 255, 0.75)"
        />
        <polygon
          points={`${(v1.x + v2.x) / 2 - 4},${BASE_Y - 3} ${(v1.x + v2.x) / 2 + 3},${BASE_Y} ${(v1.x + v2.x) / 2 - 4},${BASE_Y + 3}`}
          fill="rgba(255, 255, 255, 0.75)"
        />

        {/* Slanted Legs: Double Chevron */}
        {(() => {
          const legAngDeg = (Math.atan2(-heightPx, clampedSkewPx) * 180) / Math.PI;
          const leftMidX = (v1.x + v4.x) / 2;
          const leftMidY = (BASE_Y + topY) / 2;
          const rightMidX = (v2.x + v3.x) / 2;
          const rightMidY = (BASE_Y + topY) / 2;
          return (
            <>
              <g transform={`translate(${leftMidX}, ${leftMidY}) rotate(${legAngDeg})`}>
                <polygon points="-5,-3 0,0 -5,3" fill="rgba(255, 255, 255, 0.75)" />
                <polygon points="0,-3 5,0 0,3" fill="rgba(255, 255, 255, 0.75)" />
              </g>
              <g transform={`translate(${rightMidX}, ${rightMidY}) rotate(${legAngDeg})`}>
                <polygon points="-5,-3 0,0 -5,3" fill="rgba(255, 255, 255, 0.75)" />
                <polygon points="0,-3 5,0 0,3" fill="rgba(255, 255, 255, 0.75)" />
              </g>
            </>
          );
        })()}

        {/* 1. Angle Arc Wedges & Arcs */}
        {/* V1 Arc (Cyan) */}
        <path d={v1ArcD} fill="rgba(94, 232, 255, 0.22)" />
        <path d={v1StrokeD} fill="none" stroke={COLOR_CYAN} strokeWidth={2} strokeLinecap="round" />

        {/* V3 Arc (Cyan) */}
        <path d={v3ArcD} fill="rgba(94, 232, 255, 0.22)" />
        <path d={v3StrokeD} fill="none" stroke={COLOR_CYAN} strokeWidth={2} strokeLinecap="round" />

        {/* V2 Arc (Lilac) */}
        <path d={v2ArcD} fill="rgba(216, 180, 254, 0.22)" />
        <path d={v2StrokeD} fill="none" stroke={COLOR_LILAC} strokeWidth={2} strokeLinecap="round" />

        {/* V4 Arc (Lilac) */}
        <path d={v4ArcD} fill="rgba(216, 180, 254, 0.22)" />
        <path d={v4StrokeD} fill="none" stroke={COLOR_LILAC} strokeWidth={2} strokeLinecap="round" />

        {/* 2. Angle Readouts (Interior Corner Quadrants) */}
        {/* Bottom-Left Angle A (Cyan) */}
        <text
          x={v1LabelPos.x}
          y={v1LabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.5}
          fontWeight="800"
          fill={COLOR_CYAN}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {angleADeg}°
        </text>

        {/* Top-Right Angle A (Cyan) */}
        <text
          x={v3LabelPos.x}
          y={v3LabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.5}
          fontWeight="800"
          fill={COLOR_CYAN}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {angleADeg}°
        </text>

        {/* Bottom-Right Angle B (Lilac) */}
        <text
          x={v2LabelPos.x}
          y={v2LabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.5}
          fontWeight="800"
          fill={COLOR_LILAC}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {angleBDeg}°
        </text>

        {/* Top-Left Angle B (Lilac) */}
        <text
          x={v4LabelPos.x}
          y={v4LabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.5}
          fontWeight="800"
          fill={COLOR_LILAC}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {angleBDeg}°
        </text>

        {/* Vertex Dots */}
        {[v1, v2, v3].map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3.5} fill="#ffffff" />
        ))}

        {/* Single Universal Apex Drag Handle on v4 */}
        <g
          transform={`translate(${v4.x}, ${v4.y})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
