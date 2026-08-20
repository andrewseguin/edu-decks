"use client";

import React, { useState, useRef, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { useSvgDrag } from "@/hooks/use-svg-drag";

type InteractiveTrapezoidPropertyProps = {
  color?: string;
};

const SVG_H = 155;
const BASE_Y = 125;

const COLOR_PARALLEL = "#5ee8ff"; // Electric Cyan for the parallel bases pair

export function InteractiveTrapezoidPropertyExplorer({ color }: InteractiveTrapezoidPropertyProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  // Base lengths scale with container
  const bottomW = Math.round(SVG_W * 0.46);
  const b1X = CX - bottomW / 2;
  const b2X = CX + bottomW / 2;

  // Offsets for top vertices relative to bottom endpoints:
  // v4.x = b1X + leftOffset (can go negative to expand wider than base b!)
  // v3.x = b2X - rightOffset (can go negative to expand wider than base b!)
  const [leftOffset, setLeftOffset] = useState(24);
  const [rightOffset, setRightOffset] = useState(24);
  const [heightPx, setHeightPx] = useState(60);
  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const topY = BASE_Y - heightPx;
  const v1 = { x: b1X, y: BASE_Y };
  const v2 = { x: b2X, y: BASE_Y };
  const v3 = { x: b2X - rightOffset, y: topY };
  const v4 = { x: b1X + leftOffset, y: topY };

  const pts = `${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y} ${v4.x},${v4.y}`;

  const topMidX = (v4.x + v3.x) / 2;
  const botMidX = (v1.x + v2.x) / 2;

  const vbW = SVG_W + 20;
  const vbH = SVG_H + 16;

  const updateOffsetsFromPt = useCallback((pt: { x: number; y: number }, handle: "left" | "right") => {
    const px = pt.x - 10;
    const py = pt.y - 8;

    const rawH = Math.round(BASE_Y - py);
    setHeightPx(Math.max(30, Math.min(85, rawH)));

    const maxOffset = Math.round(bottomW * 0.45);
    const minOffset = -Math.round(SVG_W * 0.14);

    if (handle === "left") {
      const rawOffset = Math.round(px - b1X);
      setLeftOffset(Math.max(minOffset, Math.min(maxOffset, rawOffset)));
    } else if (handle === "right") {
      const rawOffset = Math.round(b2X - px);
      setRightOffset(Math.max(minOffset, Math.min(maxOffset, rawOffset)));
    }
  }, [b1X, b2X, bottomW, SVG_W]);

  const { handlePointerDown: handleDragLeft } = useSvgDrag({
    svgRef,
    viewBoxWidth: vbW,
    viewBoxHeight: vbH,
    onDragStart: (pt) => { setIsDragging("left"); updateOffsetsFromPt(pt, "left"); },
    onDragMove: (pt) => { updateOffsetsFromPt(pt, "left"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const { handlePointerDown: handleDragRight } = useSvgDrag({
    svgRef,
    viewBoxWidth: vbW,
    viewBoxHeight: vbH,
    onDragStart: (pt) => { setIsDragging("right"); updateOffsetsFromPt(pt, "right"); },
    onDragMove: (pt) => { updateOffsetsFromPt(pt, "right"); },
    onDragEnd: () => { setIsDragging(null); },
  });

  const handlePointerDown = (handle: "left" | "right") => handle === "left" ? handleDragLeft : handleDragRight;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`-10 -8 ${SVG_W + 20} ${SVG_H + 16}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Main Trapezoid Body */}
        <polygon
          points={pts}
          fill="rgba(255, 255, 255, 0.14)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Highlight Parallel Base a (Top - Cyan) */}
        <line x1={v4.x} y1={v4.y} x2={v3.x} y2={v3.y} stroke={COLOR_PARALLEL} strokeWidth={3.5} strokeLinecap="round" />

        {/* Highlight Parallel Base b (Bottom - Cyan) */}
        <line x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke={COLOR_PARALLEL} strokeWidth={3.5} strokeLinecap="round" />

        {/* Parallel Arrow Markers on Bases */}
        {/* Top Base Arrow */}
        <polygon
          points={`${topMidX - 4},${topY - 3.5} ${topMidX + 3},${topY} ${topMidX - 4},${topY + 3.5}`}
          fill={COLOR_PARALLEL}
        />
        {/* Bottom Base Arrow */}
        <polygon
          points={`${botMidX - 4},${BASE_Y - 3.5} ${botMidX + 3},${BASE_Y} ${botMidX - 4},${BASE_Y + 3.5}`}
          fill={COLOR_PARALLEL}
        />

        {/* Top Base Label (a) */}
        <text
          x={topMidX}
          y={topY - 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_PARALLEL}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          base a
        </text>

        {/* Bottom Base Label (b) */}
        <text
          x={botMidX}
          y={BASE_Y + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight="800"
          fill={COLOR_PARALLEL}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          base b
        </text>

        {/* Vertex Dots */}
        {[v1, v2].map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3.5} fill="#ffffff" />
        ))}

        {/* Top-Left Drag Handle (v4) */}
        <g
          transform={`translate(${v4.x}, ${v4.y})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown("left")}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>

        {/* Top-Right Drag Handle (v3) */}
        <g
          transform={`translate(${v3.x}, ${v3.y})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown("right")}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
