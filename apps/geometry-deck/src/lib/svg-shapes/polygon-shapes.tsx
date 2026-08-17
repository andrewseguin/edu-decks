"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE70, WHITE90,
  SvgLabel,
} from "./svg-primitives";

const COLOR_GOLD = "#ffd45e";    // Warm Gold (sides n, side length s)
const COLOR_CYAN = "#5ee8ff";    // Electric Cyan (interior angles, triangulation)
const COLOR_LILAC = "#d8b4fe";   // Neon Lilac (exterior angles)
const COLOR_WHITE = "#ffffff";   // Crisp White (total sum, answer)

const lblStyle: React.CSSProperties = {
  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const lblFont = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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

// ─────────────────────────────────────────────────────────────────────────────
// Regular polygon shape
// ─────────────────────────────────────────────────────────────────────────────

export function Polygon({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const n = typeof dims.n === "number" ? dims.n : 5;
  const s = dims.s;
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const revealedAnswer = mutation?.revealAnswer;
  // Triangulation is only for angle sum cards, never for perimeter
  const showTriangles = dims.showTriangles === "true" || dims.showTriangles === 1 || unknownDim === "Sum" || unknownDim === "sum";

  const cx = 120, cy = 85, r = 58;

  // Generate polygon vertices (top-pointing)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const pts = vertices.map((v) => `${v.x},${v.y}`).join(" ");

  // Perimeter trace
  const glowPerim = mutation?.traceStroke === "perimeter";
  const perimLen = n * 2 * r * Math.sin(Math.PI / n);

  // Find the bottom-most edge to place side length label
  let bestEdgeIdx = 0;
  let maxMidY = -Infinity;
  for (let i = 0; i < n; i++) {
    const nextV = vertices[(i + 1) % n];
    const midY = (vertices[i].y + nextV.y) / 2;
    if (midY > maxMidY) {
      maxMidY = midY;
      bestEdgeIdx = i;
    }
  }
  const vA = vertices[bestEdgeIdx];
  const vB = vertices[(bestEdgeIdx + 1) % n];
  const midX = (vA.x + vB.x) / 2;
  const midY = (vA.y + vB.y) / 2;
  const edx = midX - cx;
  const edy = midY - cy;
  const elen = Math.hypot(edx, edy) || 1;
  const sideLabelX = midX + (edx / elen) * 14;
  const sideLabelY = midY + (edy / elen) * 14;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* 1. Interior Fill */}
      {filled && <polygon points={pts} fill={FILL_COLOR} />}

      {/* 2. Perimeter Glow */}
      {glowPerim && (
        <polygon
          points={pts}
          fill="none"
          stroke={COLOR_GOLD}
          strokeWidth={4}
          strokeLinejoin="round"
          style={
            {
              strokeDasharray: `${perimLen} ${perimLen}`,
              strokeDashoffset: perimLen,
              animation: `drawArc 1.4s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* 3. Outer Polygon Edge Boundary */}
      <polygon points={pts} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* 4. Side Hash Ticks for Equilateral Sides (on perimeter cards) */}
      {s !== undefined && vertices.map((v, i) => {
        const nextV = vertices[(i + 1) % n];
        const mx = (v.x + nextV.x) / 2;
        const my = (v.y + nextV.y) / 2;
        const dx = nextV.x - v.x;
        const dy = nextV.y - v.y;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len;
        const ny = dx / len;
        const tickLen = 3.5;
        return (
          <line
            key={`tick-${i}`}
            x1={mx - nx * tickLen}
            y1={my - ny * tickLen}
            x2={mx + nx * tickLen}
            y2={my + ny * tickLen}
            stroke={COLOR_GOLD}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* 5. Triangulation Diagonals (Only for Angle Sum cards) */}
      {showTriangles && n >= 4 && (
        <g stroke={COLOR_CYAN} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.75}>
          {Array.from({ length: n - 3 }, (_, i) => {
            const targetV = vertices[i + 2];
            return <line key={i} x1={vertices[0].x} y1={vertices[0].y} x2={targetV.x} y2={targetV.y} />;
          })}
        </g>
      )}

      {/* 6. Centered Unknown Target */}
      {unknownDim === "P" || unknownDim === "perimeter" ? (
        <RevealText
          x={cx}
          y={cy}
          variable="P = ?"
          revealedValue={revealedAnswer != null ? `P = ${revealedAnswer}` : undefined}
          color="#ffffff"
          fontSize={18}
          fontWeight="900"
        />
      ) : unknownDim === "Sum" || unknownDim === "sum" ? (
        <g>
          <RevealText
            x={cx}
            y={cy - 7}
            variable="Sum = ?"
            revealedValue={revealedAnswer != null ? `Sum = ${revealedAnswer}°` : undefined}
            color={COLOR_CYAN}
            fontSize={16}
            fontWeight="900"
          />
          <SvgLabel x={cx} y={cy + 13} text={`n = ${n} sides`} color="#ffffff" size={12} />
        </g>
      ) : unknownDim === "angle" || unknownDim === "θ" ? (
        <RevealText
          x={cx}
          y={cy}
          variable="θ = ?"
          revealedValue={revealedAnswer != null ? `θ = ${revealedAnswer}°` : undefined}
          color={COLOR_CYAN}
          fontSize={17}
          fontWeight="900"
        />
      ) : (
        <SvgLabel x={cx} y={cy} text={`n = ${n} sides`} color="#ffffff" size={13} />
      )}

      {/* 7. Side Length Label Placed Cleanly Along Bottom Edge in Warm Gold */}
      {s !== undefined && (
        <SvgLabel
          x={sideLabelX}
          y={sideLabelY}
          text={lm === "variable" ? "s" : `${s}`}
          color={COLOR_GOLD}
          size={14}
        />
      )}
    </svg>
  );
}
