"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE90,
  SvgLabel, UnknownPill,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Regular polygon shape
// ─────────────────────────────────────────────────────────────────────────────

export function Polygon({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const n = typeof dims.n === "number" ? dims.n : 5;
  const s = dims.s;
  const lm = dims.labelMode as string ?? "numeric";
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const cx = 110, cy = 98, r = 70;

  // Generate polygon vertices (top-pointing)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const pts = vertices.map(v => `${v.x},${v.y}`).join(" ");

  // Perimeter glow
  const glowPerim = mutation?.traceStroke === "perimeter";
  const perimLen = n * 2 * r * Math.sin(Math.PI / n);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      {glowPerim && (
        <polygon points={pts} fill="none" stroke="rgba(255,220,100,0.85)" strokeWidth={4} strokeLinejoin="round"
          style={{ strokeDasharray: `${perimLen} ${perimLen}`, strokeDashoffset: perimLen,
            animation: `drawArc 1.4s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": perimLen } as React.CSSProperties} />
      )}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* n label */}
      <SvgLabel x={cx} y={cy + 5} text={`n = ${n}`} size={12} opacity={0.6} />

      {/* Side label on bottom edge */}
      {s !== undefined && (
        <SvgLabel x={(vertices[0].x + vertices[n - 1].x) / 2} y={vertices[0].y + 16}
          text={lm === "variable" ? "s" : `s = ${s}`} />
      )}
      {unknownDim && <UnknownPill x={cx} y={cy - r - 16} />}
    </svg>
  );
}
