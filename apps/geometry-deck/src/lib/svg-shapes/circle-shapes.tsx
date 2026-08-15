"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE70, WHITE90,
  SvgLabel, UnknownPill,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Circle shape
// ─────────────────────────────────────────────────────────────────────────────

export function Circle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const r = dims.r, cVal = dims.C, aVal = dims.A;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;
  const traceCirc = mutation?.traceStroke === "circumference";

  const cx = 110, cy = 95, cr = 70;
  const circum = 2 * Math.PI * cr;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <circle cx={cx} cy={cy} r={cr} fill={FILL_COLOR} />}
      {traceCirc && (
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke="rgba(255,220,100,0.85)" strokeWidth={4}
          style={{ strokeDasharray: `${circum} ${circum}`, strokeDashoffset: circum,
            animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": circum } as React.CSSProperties} />
      )}
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={WHITE90} />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke={WHITE70} strokeWidth={STROKE_W} strokeDasharray="5 4" />
      {/* Diameter line (if shown) */}
      {dims.showDiameter && <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy} stroke={WHITE70} strokeWidth={STROKE_W} />}

      {lm === "numeric" && (
        <>
          {/* Always show radius when known */}
          {r !== undefined && unknownDim !== "r" && (
            <SvgLabel x={cx + cr / 2} y={cy - 14} text={`radius (r) = ${r}`} size={11} />
          )}
          {/* Given C or A values (reverse problems) */}
          {cVal !== undefined && <SvgLabel x={cx} y={cy - cr - 14} text={`circumference (C) = ${cVal}`} size={11} />}
          {aVal !== undefined && <SvgLabel x={cx} y={cy - cr - 14} text={`area (A) = ${aVal}`} size={11} />}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={cx + cr / 2} y={cy - 14} text="radius (r)" size={11} />
        </>
      )}
    </svg>
  );
}
