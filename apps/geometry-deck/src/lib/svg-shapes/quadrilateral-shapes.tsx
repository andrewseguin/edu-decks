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
  fontSize = 15,
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

  const frontText = `${variable} = ?`;
  const backText = `${variable} = ${revealedValue}${unit}`;

  return (
    <g>
      {/* Target variable on front (e.g. 'P = ?', 'A = ?', 'l = ?') */}
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
        {frontText}
      </text>

      {/* Revealed answer on back (e.g. 'P = 22', 'A = 28', 'l = 6') */}
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
        {isRevealed ? backText : ""}
      </text>
    </g>
  );
}

/**
 * Standard solid ParallelChevron component matching term card design
 */
function ParallelChevron({
  x,
  y,
  angle = 0,
  count = 1,
  color = "rgba(255, 255, 255, 0.85)",
}: {
  x: number;
  y: number;
  angle?: number;
  count?: 1 | 2;
  color?: string;
}) {
  const transform = `translate(${x}, ${y}) rotate(${angle})`;
  return (
    <g transform={transform}>
      {count === 1 ? (
        <polygon points="-4,-3 3,0 -4,3" fill={color} />
      ) : (
        <>
          <polygon points="-5,-3 0,0 -5,3" fill={color} />
          <polygon points="0,-3 5,0 0,3" fill={color} />
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

  const numL = typeof l === "number" ? l : (typeof dims.A === "number" && typeof w === "number" ? Math.round(dims.A / w) : 7);
  const numW = typeof w === "number" ? w : 4;

  const x1 = 40, y1 = 45;
  const rw = 150, rh = 84;
  const x2 = x1 + rw, y2 = y1 + rh;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  // Grid subdivisions (only for Area calculation or area terms)
  const cols = Math.min(10, Math.max(2, numL));
  const rows = Math.min(8, Math.max(2, numW));
  const showGrid = dims.showGrid !== 0 && String(dims.showGrid) !== "false" && unknownDim !== "P" && (unknownDim === "A" || dims.A !== undefined || lm === "numeric" && dims.perimeter === undefined);

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Subtle Neutral Unit Grid (Only for Area) */}
      {showGrid && (
        <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1} strokeDasharray="2 4">
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
      <rect
        x={x1}
        y={y1}
        width={rw}
        height={rh}
        fill="rgba(255, 255, 255, 0.08)"
        stroke={WHITE90}
        strokeWidth={unknownDim === "P" ? 3 : STROKE_W}
      />

      {/* 5. Right-Angle Markers at All 4 Corners */}
      <RightAngleMarker x={x1} y={y1} size={8} orientation="top-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y1} size={8} orientation="top-right" strokeWidth={1.5} />
      <RightAngleMarker x={x1} y={y2} size={8} orientation="bottom-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y2} size={8} orientation="bottom-right" strokeWidth={1.5} />

      {/* 6. Labels */}
      {lm === "numeric" && (
        <>
          {/* Length (l) bottom horizontal */}
          {unknownDim === "l" ? (
            <RevealText x={cx} y={y2 + 15} variable="l" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
          ) : l !== undefined ? (
            <SvgLabel x={cx} y={y2 + 15} text={`${l}`} color={COLOR_GOLD} size={13} />
          ) : null}

          {/* Width (w) right vertical */}
          {unknownDim === "w" ? (
            <RevealText x={x2 + 15} y={cy} variable="w" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
          ) : w !== undefined ? (
            <SvgLabel x={x2 + 15} y={cy} text={`${w}`} color={COLOR_CYAN} size={13} />
          ) : null}

          {/* Area (A) center target (Only when solving for Area) */}
          {unknownDim === "A" && (
            <RevealText x={cx} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
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
  const b = dims.b, h = dims.h, a = dims.a ?? dims.side;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const glowPerim = mutation?.traceStroke === "perimeter";
  const revealedAnswer = mutation?.revealAnswer;

  const skew = 36;
  const x1 = 38, y1 = 132, bw = 136, bh = 76;
  const pts = `${x1 + skew},${y1 - bh} ${x1 + skew + bw},${y1 - bh} ${x1 + bw},${y1} ${x1},${y1}`;

  const cx = x1 + skew / 2 + bw / 2;
  const cy = y1 - bh / 2;

  const numB = typeof b === "number" ? b : 8;
  const numH = typeof h === "number" ? h : 5;
  const showGrid = dims.showGrid !== 0 && String(dims.showGrid) !== "false" && unknownDim !== "P" && (unknownDim === "A" || lm === "numeric");

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Subtle Unit Grid inside Parallelogram (skip altitude x-coordinate) */}
      {showGrid && (
        <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1} strokeDasharray="2 4">
          {Array.from({ length: Math.min(12, numB - 1) }, (_, i) => {
            const gx = x1 + ((i + 1) * bw) / numB;
            if (Math.abs(gx - (x1 + skew)) < 2) return null;
            return <line key={`v-${i}`} x1={gx} y1={y1 - bh} x2={gx} y2={y1} />;
          })}
          {Array.from({ length: Math.min(8, numH - 1) }, (_, i) => {
            const gy = y1 - bh + ((i + 1) * bh) / numH;
            return <line key={`h-${i}`} x1={x1} y1={gy} x2={x1 + bw} y2={gy} />;
          })}
        </g>
      )}

      {/* 2. Interior Fill */}
      {filled && <polygon points={pts} fill={FILL_COLOR} />}

      {/* 3. Perimeter Glow Animation */}
      {glowPerim && (
        <polygon
          points={pts}
          fill="none"
          stroke={COLOR_GOLD}
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={
            {
              strokeDasharray: "450 450",
              strokeDashoffset: 450,
              animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* 4. Main Parallelogram Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={unknownDim === "P" ? 3 : STROKE_W} strokeLinejoin="round" />

      {/* 5. Dashed Cyan Altitude Line (h) with Right Angle Marker (Only on Area cards) */}
      {unknownDim !== "P" && (
        <>
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
        </>
      )}

      {/* 6. Parallel Chevron Indicators */}
      <ParallelChevron x={x1 + skew + bw / 2} y={y1 - bh} angle={0} count={1} />
      <ParallelChevron x={x1 + bw / 2} y={y1} angle={0} count={1} />
      {(() => {
        const legAngDeg = (Math.atan2(-bh, skew) * 180) / Math.PI;
        return (
          <>
            <ParallelChevron x={x1 + skew / 2} y={y1 - bh / 2} angle={legAngDeg} count={2} />
            <ParallelChevron x={x1 + bw + skew / 2} y={y1 - bh / 2} angle={legAngDeg} count={2} />
          </>
        );
      })()}

      {/* 7. Labels */}
      {lm === "numeric" && (
        <>
          {/* Base (b) bottom */}
          {b !== undefined && (
            unknownDim === "b" ? (
              <RevealText x={(x1 + x1 + bw) / 2} y={y1 + 15} variable="b" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 15} text={`${b}`} color={COLOR_GOLD} size={13} />
            )
          )}

          {/* When solving for perimeter: only label adjacent sides b (bottom) and a (left) */}
          {unknownDim === "P" && (() => {
            const legAng = Math.atan2(bh, skew);
            const midX = x1 + skew / 2;
            const midY = y1 - bh / 2;
            const lx = midX - Math.sin(legAng) * 14;
            const ly = midY - Math.cos(legAng) * 14;
            return a !== undefined ? (
              <SvgLabel x={lx} y={ly} text={`${a}`} color={COLOR_CYAN} size={13} />
            ) : null;
          })()}

          {/* Height (h) on Area cards */}
          {unknownDim !== "P" && h !== undefined && (
            unknownDim === "h" ? (
              <RevealText x={x1 + skew + 14} y={y1 - bh / 2} variable="h" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={x1 + skew + 14} y={y1 - bh / 2} text={`${h}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Area Target */}
          {unknownDim === "A" && (
            <RevealText x={cx + 18} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}
        </>
      )}

      {lm === "variable" && (
        unknownDim === "P" ? (() => {
          const legAng = Math.atan2(bh, skew);
          const midX = x1 + skew / 2;
          const midY = y1 - bh / 2;
          const lx = midX - Math.sin(legAng) * 14;
          const ly = midY - Math.cos(legAng) * 14;
          return (
            <>
              <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 15} text="b" color={COLOR_GOLD} size={14} />
              <SvgLabel x={lx} y={ly} text="a" color={COLOR_CYAN} size={14} />
            </>
          );
        })() : (
          <>
            <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 15} text="b" color={COLOR_GOLD} size={14} />
            <SvgLabel x={x1 + skew - 14} y={y1 - bh / 2} text="h" color={COLOR_CYAN} size={14} />
          </>
        )
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
  const c = dims.c ?? dims.side ?? dims.cSide;
  const d = dims.d ?? dims.side ?? dims.dSide;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const glowPerim = mutation?.traceStroke === "perimeter";
  const revealedAnswer = mutation?.revealAnswer;

  const bBase = 150, topW = 90, baseY = 135, topY = 55;
  const xBase1 = 35, xBase2 = xBase1 + bBase;
  const xTop1 = (240 - topW) / 2, xTop2 = xTop1 + topW;
  const pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${baseY} ${xBase1},${baseY}`;

  const numB = typeof b === "number" ? b : 8;
  const numH = typeof h === "number" ? h : 5;
  const showGrid = dims.showGrid !== 0 && String(dims.showGrid) !== "false" && unknownDim !== "P" && (unknownDim === "A" || lm === "numeric");
  const cx = 120;
  const cy = (topY + baseY) / 2;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Subtle Neutral Unit Grid across Bounding Box (Only on Area cards) */}
      {showGrid && (
        <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1} strokeDasharray="2 4">
          {Array.from({ length: Math.min(10, numB - 1) }, (_, i) => {
            const gx = xBase1 + ((i + 1) * bBase) / numB;
            return <line key={`v-${i}`} x1={gx} y1={topY} x2={gx} y2={baseY} />;
          })}
          {Array.from({ length: Math.min(6, numH - 1) }, (_, i) => {
            const gy = topY + ((i + 1) * (baseY - topY)) / numH;
            return <line key={`h-${i}`} x1={xBase1} y1={gy} x2={xBase2} y2={gy} />;
          })}
        </g>
      )}

      {/* 2. Interior Fill */}
      {filled && <polygon points={pts} fill={FILL_COLOR} />}

      {/* 3. Perimeter Glow Animation */}
      {glowPerim && (
        <polygon
          points={pts}
          fill="none"
          stroke={COLOR_GOLD}
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={
            {
              strokeDasharray: "460 460",
              strokeDashoffset: 460,
              animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* 4. Main Trapezoid Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={unknownDim === "P" ? 3 : STROKE_W} strokeLinejoin="round" />

      {/* 5. Dashed Altitude Line (h) with Right Angle Marker (Only on Area cards) */}
      {unknownDim !== "P" && (
        <>
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
        </>
      )}

      {/* 6. Parallel Chevron Indicators on Bases a and b */}
      <ParallelChevron x={cx} y={topY} angle={0} count={1} />
      <ParallelChevron x={cx} y={baseY} angle={0} count={1} />

      {/* 7. Labels */}
      {lm === "numeric" && (
        <>
          {/* Top Base (a) in Lilac/Lavender */}
          {a !== undefined && (
            unknownDim === "a" ? (
              <RevealText x={cx} y={topY - 14} variable="a" revealedValue={revealedAnswer} color={COLOR_LAVENDER} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={topY - 14} text={`${a}`} color={COLOR_LAVENDER} size={13} />
            )
          )}

          {/* Bottom Base (b) in Gold */}
          {b !== undefined && (
            unknownDim === "b" ? (
              <RevealText x={cx} y={baseY + 15} variable="b" revealedValue={revealedAnswer} color={COLOR_GOLD} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={baseY + 15} text={`${b}`} color={COLOR_GOLD} size={13} />
            )
          )}

          {/* Altitude (h) in Cyan on Area cards */}
          {unknownDim !== "P" && h !== undefined && (
            unknownDim === "h" ? (
              <RevealText x={xTop2 - 14} y={cy} variable="h" revealedValue={revealedAnswer} color={COLOR_CYAN} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={xTop2 - 14} y={cy} text={`${h}`} color={COLOR_CYAN} size={13} />
            )
          )}

          {/* Slanted boundary legs on Perimeter cards */}
          {unknownDim === "P" && (
            <>
              {c !== undefined && (
                <SvgLabel x={(xBase1 + xTop1) / 2 - 14} y={cy} text={`${c}`} color={COLOR_CYAN} size={13} />
              )}
              {d !== undefined && (
                <SvgLabel x={(xBase2 + xTop2) / 2 + 14} y={cy} text={`${d}`} color={COLOR_CYAN} size={13} />
              )}
            </>
          )}

          {/* Area Target in Crisp White */}
          {unknownDim === "A" && (
            <RevealText x={cx - 18} y={cy} variable="A" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
          )}
        </>
      )}

      {lm === "variable" && (
        unknownDim === "P" ? (
          <>
            <SvgLabel x={cx} y={topY - 14} text="a" color={COLOR_LAVENDER} size={14} />
            <SvgLabel x={cx} y={baseY + 15} text="b" color={COLOR_GOLD} size={14} />
            <SvgLabel x={(xBase1 + xTop1) / 2 - 14} y={cy} text="c" color={COLOR_CYAN} size={14} />
            <SvgLabel x={(xBase2 + xTop2) / 2 + 14} y={cy} text="d" color={COLOR_CYAN} size={14} />
          </>
        ) : (
          <>
            <SvgLabel x={cx} y={topY - 14} text="a" color={COLOR_LAVENDER} size={14} />
            <SvgLabel x={cx} y={baseY + 15} text="b" color={COLOR_GOLD} size={14} />
            <SvgLabel x={xTop2 - 14} y={cy} text="h" color={COLOR_CYAN} size={14} />
          </>
        )
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Rhombus
// ─────────────────────────────────────────────────────────────────────────────

export function Rhombus({ dims, mutation }: { dims?: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims?.labelMode as string ?? "numeric";
  const s = dims?.s ?? dims?.b ?? dims?.side;
  const unknownDim = (dims?.unknown as string | undefined) ?? (dims?.unknownDimension as string | undefined);
  const glowPerim = mutation?.traceStroke === "perimeter";
  const cx = 120, cy = 85, rx = 65, ry = 45;
  const pts = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Diagonals (Only on Properties mode) */}
      {unknownDim !== "P" && (
        <>
          <line x1={cx} y1={cy - ry} x2={cx} y2={cy + ry} stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="3 3" />
          <line x1={cx - rx} y1={cy} x2={cx + rx} y2={cy} stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="3 3" />
        </>
      )}

      {/* Perimeter Glow */}
      {glowPerim && (
        <polygon
          points={pts}
          fill="none"
          stroke={COLOR_GOLD}
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={
            {
              strokeDasharray: "320 320",
              strokeDashoffset: 320,
              animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={unknownDim === "P" ? 3 : STROKE_W} strokeLinejoin="round" />

      {/* Equal-side tick marks (Only on Properties mode) */}
      {unknownDim !== "P" && (() => {
        const topRAng = (Math.atan2(ry, rx) * 180) / Math.PI;
        return (
          <>
            <SideTick x={cx + rx / 2} y={cy - ry / 2} angle={topRAng + 90} />
            <SideTick x={cx + rx / 2} y={cy + ry / 2} angle={-topRAng + 90} />
            <SideTick x={cx - rx / 2} y={cy + ry / 2} angle={topRAng + 90} />
            <SideTick x={cx - rx / 2} y={cy - ry / 2} angle={-topRAng + 90} />
          </>
        );
      })()}

      {/* Labeled Sides */}
      {s !== undefined && (
        unknownDim === "P" ? (
          <>
            <SvgLabel x={cx + rx / 2 + 14} y={cy - ry / 2 - 10} text={`${s}`} color={COLOR_GOLD} size={14} />
            <SvgLabel x={cx - rx / 2 - 14} y={cy - ry / 2 - 10} text={`${s}`} color={COLOR_GOLD} size={14} />
            <SvgLabel x={cx + rx / 2 + 14} y={cy + ry / 2 + 10} text={`${s}`} color={COLOR_GOLD} size={14} />
            <SvgLabel x={cx - rx / 2 - 14} y={cy + ry / 2 + 10} text={`${s}`} color={COLOR_GOLD} size={14} />
          </>
        ) : (
          <SvgLabel x={cx + rx / 2 + 14} y={cy - ry / 2 - 10} text={`${s}`} color={COLOR_GOLD} size={14} />
        )
      )}
    </svg>
  );
}
