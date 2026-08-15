"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE50, WHITE70, WHITE90,
  SvgLabel, UnknownPill, DimLine, TickMark, RightAngleMarker,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Quadrilateral shapes
// ─────────────────────────────────────────────────────────────────────────────

export function Rectangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const l = dims.l, w = dims.w;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;
  const glowPerim = mutation?.traceStroke === "perimeter";

  const x1 = 35, y1 = 55, rw = 150, rh = 90;
  const x2 = x1 + rw, y2 = y1 + rh;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <rect x={x1} y={y1} width={rw} height={rh} fill={FILL_COLOR} />}
      {glowPerim && (
        <rect x={x1} y={y1} width={rw} height={rh} fill="none"
          stroke="rgba(255,220,100,0.85)" strokeWidth={4} strokeLinejoin="round"
          style={{ strokeDasharray: `${2 * (rw + rh)} ${2 * (rw + rh)}`, strokeDashoffset: 2 * (rw + rh),
            animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": 2 * (rw + rh) } as React.CSSProperties} />
      )}
      <rect x={x1} y={y1} width={rw} height={rh} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Right-angle markers (White L shapes) */}
      <RightAngleMarker x={x1} y={y1} size={10} orientation="top-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y1} size={10} orientation="top-right" strokeWidth={1.5} />
      <RightAngleMarker x={x1} y={y2} size={10} orientation="bottom-left" strokeWidth={1.5} />
      <RightAngleMarker x={x2} y={y2} size={10} orientation="bottom-right" strokeWidth={1.5} />
      {lm === "numeric" && (
        <>
          {l !== undefined && (unknownDim === "l" ? <UnknownPill x={(x1 + x2) / 2} y={y1 - 14} /> : <SvgLabel x={(x1 + x2) / 2} y={y1 - 14} text={`l = ${l}`} />)}
          {w !== undefined && (unknownDim === "w" ? <UnknownPill x={x2 + 18} y={(y1 + y2) / 2} /> : <SvgLabel x={x2 + 18} y={(y1 + y2) / 2} text={`w = ${w}`} />)}
          {dims.A !== undefined && (unknownDim === "A" ? <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} /> : <SvgLabel x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} text={`A = ${dims.A}`} />)}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x2) / 2} y={y1 - 14} text="l" />
          <SvgLabel x={x2 + 14} y={(y1 + y2) / 2} text="w" />
          {unknownDim === "A" && <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} />}
          {unknownDim === "P" && <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} />}
        </>
      )}
    </svg>
  );
}

export function Parallelogram({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const b = dims.b, h = dims.h;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const skew = 35;
  const x1 = 30, y1 = 150, bw = 140, bh = 80;
  const pts = `${x1 + skew},${y1 - bh} ${x1 + skew + bw},${y1 - bh} ${x1 + bw},${y1} ${x1},${y1}`;

  return (
    <svg viewBox="0 0 220 180" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Height dashed line */}
      <DimLine x1={x1 + skew} y1={y1 - bh} x2={x1 + skew} y2={y1} />
      {/* Parallel tick marks */}
      <TickMark x={(x1 + x1 + skew) / 2 + bw / 2} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 + bw / 2 + 8} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 - bw / 2 + 10} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 - bw / 2 + 18} y={y1 - bh / 2 + 10} angle={60} />
      {lm === "numeric" && (
        <>
          {b !== undefined && <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={x1 + skew - 20} y={y1 - bh / 2 + 5} text={`h = ${h}`} />}
          {unknownDim === "A" ? <UnknownPill x={x1 + skew + bw / 2} y={y1 - bh / 2} /> : null}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 16} text="b" />
          <SvgLabel x={x1 + skew - 20} y={y1 - bh / 2 + 5} text="h" />
          {unknownDim === "A" && <UnknownPill x={x1 + skew + bw / 2} y={y1 - bh / 2} />}
        </>
      )}
    </svg>
  );
}

export function Trapezoid({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const a = dims.a, b = dims.b, h = dims.h;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const bBase = 150, topW = 90, baseY = 155, topY = 75;
  const xBase1 = 35, xBase2 = xBase1 + bBase;
  const xTop1 = (220 - topW) / 2, xTop2 = xTop1 + topW;
  const pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${baseY} ${xBase1},${baseY}`;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Parallel tick marks on top & bottom */}
      <TickMark x={(xTop1 + xTop2) / 2} y={topY} angle={0} />
      <TickMark x={(xBase1 + xBase2) / 2 - 6} y={baseY} angle={0} />
      <TickMark x={(xBase1 + xBase2) / 2 + 6} y={baseY} angle={0} />
      {/* Height dashed line */}
      <DimLine x1={xTop2 + 12} y1={topY} x2={xTop2 + 12} y2={baseY} />
      {lm === "numeric" && (
        <>
          {a !== undefined && <SvgLabel x={(xTop1 + xTop2) / 2} y={topY - 14} text={`a = ${a}`} />}
          {b !== undefined && <SvgLabel x={(xBase1 + xBase2) / 2} y={baseY + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={xTop2 + 28} y={(topY + baseY) / 2} text={`h = ${h}`} />}
          {unknownDim === "A" ? <UnknownPill x={110} y={(topY + baseY) / 2} /> : null}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(xTop1 + xTop2) / 2} y={topY - 14} text="a" />
          <SvgLabel x={(xBase1 + xBase2) / 2} y={baseY + 16} text="b" />
          <SvgLabel x={xTop2 + 28} y={(topY + baseY) / 2} text="h" />
          {unknownDim === "A" && <UnknownPill x={110} y={(topY + baseY) / 2} />}
        </>
      )}
    </svg>
  );
}
