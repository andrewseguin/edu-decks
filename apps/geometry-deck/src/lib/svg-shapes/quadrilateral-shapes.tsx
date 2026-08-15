"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE70, WHITE90,
  SvgLabel, RightAngleMarker,
} from "./svg-primitives";

// Semantic Colors tuned for high contrast on `#6366f1` Indigo
const COLOR_CYAN = "#5ee8ff";
const COLOR_GOLD = "#ffd45e";
const COLOR_LAVENDER = "#d8b4fe";
const COLOR_WHITE = "#ffffff";

const lblStyle: React.CSSProperties = {
  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const lblFont = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/**
 * Modern RevealText component for Quadrilaterals (17px bold 900)
 */
function RevealText({
  x,
  y,
  variable,
  revealedValue,
  unit = "",
  color,
  fontSize = 17,
  fontWeight = "bold",
  textAnchor = "middle",
  dominantBaseline = "central",
}: {
  x: number;
  y: number;
  variable: string;
  revealedValue?: number | string;
  unit?: string;
  color: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAnchor?: "start" | "middle" | "end";
  dominantBaseline?: "central" | "alphabetic" | "hanging";
}) {
  const isRevealed = revealedValue != null;
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  const commonProps = {
    x: rx,
    y: ry,
    textAnchor,
    dominantBaseline,
    fontSize,
    fontWeight,
    fill: color,
    fontFamily: lblFont,
  };

  return (
    <g>
      {/* Target variable (e.g. 'A', 'P', 'l', 'w') */}
      <text
        {...commonProps}
        style={{
          ...lblStyle,
          opacity: isRevealed ? 0 : 1,
          transform: isRevealed ? `translateY(-3px) scale(0.85)` : `translateY(0) scale(1)`,
          transformOrigin: `${rx}px ${ry}px`,
          transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {variable}
      </text>

      {/* Revealed answer (e.g. '28', '22', '6') */}
      <text
        {...commonProps}
        style={{
          ...lblStyle,
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? `translateY(0) scale(1)` : `translateY(3px) scale(1.15)`,
          transformOrigin: `${rx}px ${ry}px`,
          transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s",
        }}
      >
        {revealedValue != null ? `${revealedValue}${unit}` : ""}
      </text>
    </g>
  );
}

/**
 * Parallel arrow marker component
 */
function ParallelArrow({
  x,
  y,
  angle = 0,
  count = 1,
  color = COLOR_LAVENDER,
  size = 6,
}: {
  x: number;
  y: number;
  angle?: number;
  count?: 1 | 2;
  color?: string;
  size?: number;
}) {
  const transform = `translate(${x}, ${y}) rotate(${angle})`;
  const d = size;
  return (
    <g transform={transform} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {count === 1 ? (
        <path d={`M ${-d} ${-d * 0.7} L 0 0 L ${-d} ${d * 0.7}`} />
      ) : (
        <>
          <path d={`M ${-d - 3} ${-d * 0.7} L ${-3} 0 L ${-d - 3} ${d * 0.7}`} />
          <path d={`M ${-d + 3} ${-d * 0.7} L ${3} 0 L ${-d + 3} ${d * 0.7}`} />
        </>
      )}
    </g>
  );
}

/**
 * Side tick mark component
 */
function SideTick({
  x,
  y,
  angle = 0,
  count = 1,
  color = WHITE90,
  len = 9,
}: {
  x: number;
  y: number;
  angle?: number;
  count?: 1 | 2;
  color?: string;
  len?: number;
}) {
  const transform = `translate(${x}, ${y}) rotate(${angle})`;
  return (
    <g transform={transform} stroke={color} strokeWidth={1.75} strokeLinecap="round">
      {count === 1 ? (
        <line x1={0} y1={-len / 2} x2={0} y2={len / 2} />
      ) : (
        <>
          <line x1={-2.5} y1={-len / 2} x2={-2.5} y2={len / 2} />
          <line x1={2.5} y1={-len / 2} x2={2.5} y2={len / 2} />
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Rectangle
// ─────────────────────────────────────────────────────────────────────────────

export function Rectangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const l = dims.l, w = dims.w;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const glowPerim = mutation?.traceStroke === "perimeter";
  const revealedAnswer = mutation?.revealAnswer;

  const numL = typeof l === "number" ? l : 7;
  const numW = typeof w === "number" ? w : 4;

  const x1 = 40, y1 = 45;
  const rw = 150, rh = 84;
  const x2 = x1 + rw, y2 = y1 + rh;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  // Grid subdivisions (up to 10 columns and 8 rows)
  const cols = Math.min(10, Math.max(2, numL));
  const rows = Math.min(8, Math.max(2, numW));
  const showGrid = dims.showGrid !== 0 && String(dims.showGrid) !== "false" && (unknownDim === "A" || dims.A !== undefined || lm === "numeric");

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Subtle Neutral Unit Grid */}
      {showGrid && (
        <g stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1} strokeDasharray="2 2">
          {Array.from({ length: cols - 1 }, (_, i) => {
            const gx = x1 + ((i + 1) * rw) / cols;
            return <line key={`v-${i}`} x1={gx} y1={y1} x2={gx} y2={y2} />;
          })}
          {Array.from({ length: rows - 1 }, (_, i) => {
            const gy = y1 + ((i + 1) * rh) / rows;
            return <line key={`h-${i}`} x1={x1} y1={gy} x2={x2} y2={gy} />;
          })}
        </g>
      )}

      {/* 2. Interior Fill */}
      {filled && <rect x={x1} y={y1} width={rw} height={rh} fill={FILL_COLOR} />}

      {/* 3. Perimeter Trace Glow Animation */}
      {glowPerim && (
        <rect
          x={x1}
          y={y1}
          width={rw}
          height={rh}
          fill="none"
          stroke={COLOR_GOLD}
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={
            {
              strokeDasharray: `${2 * (rw + rh)} ${2 * (rw + rh)}`,
              strokeDashoffset: 2 * (rw + rh),
              animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* 4. Main Shape Boundary */}
      <rect x={x1} y={y1} width={rw} height={rh} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* 5. Right-Angle Markers at All 4 Corners */}
      <RightAngleMarker x={x1} y={y1} size={8} orientation="top-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y1} size={8} orientation="top-right" strokeWidth={1.5} />
      <RightAngleMarker x={x1} y={y2} size={8} orientation="bottom-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y2} size={8} orientation="bottom-right" strokeWidth={1.5} />

      {/* 6. Labels */}
      {lm === "numeric" && (
        <>
          {/* Length (l) bottom horizontal */}
          {l !== undefined && (
            unknownDim === "l" ? (
              <RevealText x={cx} y={y2 + 15} variable="l" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={y2 + 15} text={`${l}`} color={COLOR_GOLD} size={13} />
            )
          )}

          {/* Width (w) right vertical */}
          {w !== undefined && (
            unknownDim === "w" ? (
              <RevealText x={x2 + 16} y={cy} variable="w" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={x2 + 16} y={cy} text={`${w}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Area (A) center target */}
          {unknownDim === "A" && (
            <RevealText x={cx} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}

          {/* Perimeter (P) target */}
          {unknownDim === "P" && (
            <RevealText x={cx} y={cy} variable="P" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}

          {/* Given Area in reverse problems */}
          {dims.A !== undefined && unknownDim !== "A" && (
            <SvgLabel x={cx} y={cy} text={`A = ${dims.A}`} color={COLOR_WHITE} size={14} />
          )}
        </>
      )}

      {lm === "variable" && (
        <>
          <SvgLabel x={cx} y={y2 + 15} text="l" color={COLOR_GOLD} size={14} />
          <SvgLabel x={x2 + 16} y={cy} text="w" color={COLOR_CYAN} size={14} />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Parallelogram
// ─────────────────────────────────────────────────────────────────────────────

export function Parallelogram({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const b = dims.b, h = dims.h;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const revealedAnswer = mutation?.revealAnswer;

  const skew = 36;
  const x1 = 38, y1 = 132, bw = 136, bh = 76;
  const pts = `${x1 + skew},${y1 - bh} ${x1 + skew + bw},${y1 - bh} ${x1 + bw},${y1} ${x1},${y1}`;

  const cx = x1 + skew / 2 + bw / 2;
  const cy = y1 - bh / 2;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Subtle Bounding Box / Height Reference */}
      <rect
        x={x1}
        y={y1 - bh}
        width={bw}
        height={bh}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeDasharray="3 3"
        strokeWidth={1}
      />

      {/* 2. Interior Fill */}
      {filled && <polygon points={pts} fill={FILL_COLOR} />}

      {/* 3. Main Parallelogram Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* 4. Dashed Cyan Altitude Line (h) with Right Angle Marker */}
      <line
        x1={x1 + skew}
        y1={y1 - bh}
        x2={x1 + skew}
        y2={y1}
        stroke={COLOR_CYAN}
        strokeWidth={1.75}
        strokeDasharray="4 3"
      />
      <RightAngleMarker x={x1 + skew} y={y1} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_CYAN} />

      {/* 5. Parallel Arrow Indicators */}
      <ParallelArrow x={(x1 + skew + x1 + skew + bw) / 2} y={y1 - bh} angle={0} count={1} />
      <ParallelArrow x={(x1 + x1 + bw) / 2} y={y1} angle={0} count={1} />
      <ParallelArrow x={x1 + skew / 2} y={y1 - bh / 2} angle={-Math.atan2(bh, skew) * (180 / Math.PI) + 90} count={2} />
      <ParallelArrow x={x1 + bw + skew / 2} y={y1 - bh / 2} angle={-Math.atan2(bh, skew) * (180 / Math.PI) + 90} count={2} />

      {/* 6. Labels */}
      {lm === "numeric" && (
        <>
          {/* Base (b) */}
          {b !== undefined && (
            unknownDim === "b" ? (
              <RevealText x={(x1 + x1 + bw) / 2} y={y1 + 15} variable="b" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 15} text={`${b}`} color={COLOR_GOLD} size={13} />
            )
          )}

          {/* Height (h) */}
          {h !== undefined && (
            unknownDim === "h" ? (
              <RevealText x={x1 + skew - 14} y={y1 - bh / 2} variable="h" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={x1 + skew - 14} y={y1 - bh / 2} text={`${h}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Area Target */}
          {unknownDim === "A" && (
            <RevealText x={cx + 12} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}
        </>
      )}

      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 15} text="b" color={COLOR_GOLD} size={14} />
          <SvgLabel x={x1 + skew - 14} y={y1 - bh / 2} text="h" color={COLOR_CYAN} size={14} />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Trapezoid
// ─────────────────────────────────────────────────────────────────────────────

export function Trapezoid({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const a = dims.a, b = dims.b, h = dims.h;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const revealedAnswer = mutation?.revealAnswer;

  const bBase = 150, topW = 90, baseY = 135, topY = 55;
  const xBase1 = 35, xBase2 = xBase1 + bBase;
  const xTop1 = (240 - topW) / 2, xTop2 = xTop1 + topW;
  const pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${baseY} ${xBase1},${baseY}`;

  const cx = 120;
  const cy = (topY + baseY) / 2;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Interior Fill */}
      {filled && <polygon points={pts} fill={FILL_COLOR} />}

      {/* 2. Main Trapezoid Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* 3. Dashed Altitude Line (h) with Right Angle Marker */}
      <line
        x1={xTop2}
        y1={topY}
        x2={xTop2}
        y2={baseY}
        stroke={COLOR_CYAN}
        strokeWidth={1.75}
        strokeDasharray="4 3"
      />
      <RightAngleMarker x={xTop2} y={baseY} size={8} orientation="bottom-left" strokeWidth={1.5} color={COLOR_CYAN} />

      {/* 4. Parallel Arrow Markers on Bases a and b */}
      <ParallelArrow x={cx} y={topY} angle={0} count={1} />
      <ParallelArrow x={cx} y={baseY} angle={0} count={1} />

      {/* 5. Labels */}
      {lm === "numeric" && (
        <>
          {/* Top Base (a) */}
          {a !== undefined && (
            unknownDim === "a" ? (
              <RevealText x={cx} y={topY - 14} variable="a" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={topY - 14} text={`${a}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Bottom Base (b) */}
          {b !== undefined && (
            unknownDim === "b" ? (
              <RevealText x={cx} y={baseY + 15} variable="b" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={baseY + 15} text={`${b}`} color={COLOR_GOLD} size={13} />
            )
          )}

          {/* Altitude (h) */}
          {h !== undefined && (
            unknownDim === "h" ? (
              <RevealText x={xTop2 + 14} y={cy} variable="h" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={xTop2 + 14} y={cy} text={`${h}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Area Target */}
          {unknownDim === "A" && (
            <RevealText x={cx - 10} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}
        </>
      )}

      {lm === "variable" && (
        <>
          <SvgLabel x={cx} y={topY - 14} text="a" color={COLOR_CYAN} size={14} />
          <SvgLabel x={cx} y={baseY + 15} text="b" color={COLOR_GOLD} size={14} />
          <SvgLabel x={xTop2 + 14} y={cy} text="h" color={COLOR_CYAN} size={14} />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Rhombus
// ─────────────────────────────────────────────────────────────────────────────

export function Rhombus({ dims }: { dims?: Record<string, number | string> }) {
  const lm = dims?.labelMode as string ?? "numeric";
  const b = dims?.b;
  const cx = 120, cy = 85, rx = 65, ry = 45;
  const pts = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Diagonals */}
      <line x1={cx - rx} y1={cy} x2={cx + rx} y2={cy} stroke={COLOR_LAVENDER} strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={cx} y1={cy - ry} x2={cx} y2={cy + ry} stroke={COLOR_LAVENDER} strokeWidth={1.5} strokeDasharray="3 3" />
      {/* Central Right Angle */}
      <RightAngleMarker x={cx} y={cy} size={7} orientation="top-right" strokeWidth={1.5} color={COLOR_LAVENDER} />

      {/* Main Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* Equal Side Ticks on all 4 sides */}
      <SideTick x={(cx + cx + rx) / 2} y={(cy - ry + cy) / 2} angle={Math.atan2(ry, rx) * (180 / Math.PI) + 90} />
      <SideTick x={(cx + rx + cx) / 2} y={(cy + cy + ry) / 2} angle={-Math.atan2(ry, rx) * (180 / Math.PI) + 90} />
      <SideTick x={(cx + cx - rx) / 2} y={(cy + ry + cy) / 2} angle={Math.atan2(ry, rx) * (180 / Math.PI) + 90} />
      <SideTick x={(cx - rx + cx) / 2} y={(cy + cy - ry) / 2} angle={-Math.atan2(ry, rx) * (180 / Math.PI) + 90} />

      {/* Label */}
      {b !== undefined && (
        <SvgLabel x={(cx + rx + cx) / 2 + 10} y={(cy + cy + ry) / 2 + 10} text={lm === "variable" ? "s" : `${b}`} color={COLOR_GOLD} size={13} />
      )}
    </svg>
  );
}
