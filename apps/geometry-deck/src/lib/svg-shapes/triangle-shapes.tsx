"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE90,
  SvgLabel, SvgTriangle, UnknownPill, DimLine, TickMark, RightAngleMarker,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Triangle shapes
// ─────────────────────────────────────────────────────────────────────────────

export function Triangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const b = dims.b, h = dims.h;
  const a = dims.a, c = dims.c;
  const style = (dims.style as string) ?? "scalene"; // scalene | isosceles | equilateral
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  // Vertices: base centered, apex above
  const cx = 110;
  const baseY = 155, topY = 40;
  let x1: number, x2: number, x3: number;
  let actualTopY = topY;

  if (style === "equilateral") {
    const hw = 75;
    x1 = cx - hw; x2 = cx + hw; x3 = cx;
  } else if (style === "isosceles-wide") {
    const hw = 80;
    actualTopY = 85;
    x1 = cx - hw; x2 = cx + hw; x3 = cx;
  } else if (style === "isosceles") {
    x1 = cx - 55; x2 = cx + 55; x3 = cx;
  } else if (style === "scalene-obtuse") {
    actualTopY = 80;
    x1 = 25; x2 = 195; x3 = 55;
  } else {
    // scalene
    x1 = 30; x2 = 185; x3 = cx - 20;
  }

  const pts = `${x1},${baseY} ${x2},${baseY} ${x3},${actualTopY}`;

  // Side lengths for labeling
  const bLen = Math.round(x2 - x1);
  const hLen = Math.round(baseY - actualTopY);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      <SvgTriangle
        x1={x1} y1={baseY}
        x2={x2} y2={baseY}
        x3={x3} y3={actualTopY}
        fill={filled ? FILL_COLOR : "none"}
      />

      {/* Tick marks for equilateral/isosceles */}
      {style === "equilateral" && (
        <>
          <TickMark x={(x1 + x3) / 2} y={(baseY + actualTopY) / 2} angle={-50} />
          <TickMark x={(x2 + x3) / 2} y={(baseY + actualTopY) / 2} angle={50} />
          <TickMark x={(x1 + x2) / 2} y={baseY} angle={0} />
          {/* Angle arcs at all three 60° vertices */}
          {/* Bottom-left arc: 0° to 60° */}
          <path d={`M ${x1 + 18} ${baseY} A 18 18 0 0 0 ${x1 + 18 * Math.cos(Math.PI / 3)} ${baseY - 18 * Math.sin(Math.PI / 3)}`}
            fill="none" stroke="rgba(94,232,255,0.85)" strokeWidth={2} strokeLinecap="round" />
          {/* Bottom-right arc: 120° to 180° */}
          <path d={`M ${x2 - 18 * Math.cos(Math.PI / 3)} ${baseY - 18 * Math.sin(Math.PI / 3)} A 18 18 0 0 0 ${x2 - 18} ${baseY}`}
            fill="none" stroke="rgba(94,232,255,0.85)" strokeWidth={2} strokeLinecap="round" />
          {/* Apex arc: pointing downward, from edge-to-left to edge-to-right */}
          {(() => {
            const eL = Math.atan2(baseY - actualTopY, x1 - x3);
            const eR = Math.atan2(baseY - actualTopY, x2 - x3);
            const sX = x3 + 18 * Math.cos(eR), sY = actualTopY + 18 * Math.sin(eR);
            const eX = x3 + 18 * Math.cos(eL), eY = actualTopY + 18 * Math.sin(eL);
            return <path d={`M ${sX} ${sY} A 18 18 0 0 1 ${eX} ${eY}`}
              fill="none" stroke="rgba(94,232,255,0.85)" strokeWidth={2} strokeLinecap="round" />;
          })()}
          {/* 60° labels */}
          <text x={x1 - 8} y={baseY + 3} textAnchor="end" dominantBaseline="central"
            fontSize={12} fontWeight={800} fill="#5ee8ff" fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>
          <text x={x2 + 8} y={baseY + 3} textAnchor="start" dominantBaseline="central"
            fontSize={12} fontWeight={800} fill="#5ee8ff" fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>
          <text x={x3} y={actualTopY - 12} textAnchor="middle" dominantBaseline="central"
            fontSize={12} fontWeight={800} fill="#5ee8ff" fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>
        </>
      )}
      {(style === "isosceles" || style === "isosceles-wide") && (
        <>
          <TickMark x={(x1 + x3) / 2} y={(baseY + actualTopY) / 2} angle={style === "isosceles-wide" ? -30 : -55} />
          <TickMark x={(x2 + x3) / 2} y={(baseY + actualTopY) / 2} angle={style === "isosceles-wide" ? 30 : 55} />
          <path d={`M ${x1 + 18} ${baseY} A 18 18 0 0 0 ${x1 + 14} ${baseY - 12}`} fill="none" stroke="rgba(94,232,255,0.85)" strokeWidth={2} />
          <path d={`M ${x2 - 18} ${baseY} A 18 18 0 0 1 ${x2 - 14} ${baseY - 12}`} fill="none" stroke="rgba(94,232,255,0.85)" strokeWidth={2} />
        </>
      )}

      {/* Height dashed line */}
      {(lm === "numeric" || lm === "variable") && (
        <DimLine x1={x3} y1={topY} x2={x3} y2={baseY} />
      )}

      {/* Labels */}
      {lm === "numeric" && (
        <>
          {unknownDim === "A" && <UnknownPill x={cx} y={topY - 14} />}
          {b !== undefined && <SvgLabel x={(x1 + x2) / 2} y={baseY + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={x3 + 22} y={(baseY + topY) / 2 + 5} text={`h = ${h}`} />}
          {a !== undefined && <SvgLabel x={x1 - 12} y={(baseY + topY) / 2} text={`${a}`} />}
          {c !== undefined && <SvgLabel x={x2 + 12} y={(baseY + topY) / 2} text={`${c}`} />}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x2) / 2} y={baseY + 16} text="b" />
          <SvgLabel x={x3 + 22} y={(baseY + topY) / 2 + 5} text="h" />
          {unknownDim === "A" && <UnknownPill x={cx + 30} y={topY - 5} />}
        </>
      )}

      {/* Angle labels for angle-sum cards */}
      {dims.angA !== undefined && (
        <>
          <SvgLabel x={x1 + 16} y={baseY - 10} text={`${dims.angA}°`} size={12} />
          <SvgLabel x={x2 - 16} y={baseY - 10} text={`${dims.angB}°`} size={12} />
          {unknownDim === "C"
            ? <UnknownPill x={x3} y={topY + 18} />
            : (dims.angC !== undefined ? <SvgLabel x={x3} y={topY + 18} text={`${dims.angC}°`} size={12} /> : null)}
        </>
      )}
    </svg>
  );
}

export function RightTriangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const a = dims.a, b = dims.b, c_val = dims.c;
  const unknownDim = dims.unknown as string | undefined;
  const highlightHyp = mutation?.traceStroke === "hypotenuse";

  // Right angle at bottom-left
  const x1 = 40, y1 = 155; // bottom-left (right angle)
  const x2 = 175, y2 = 155; // bottom-right
  const x3 = 40, y3 = 50;   // top-left

  const hypLen = Math.sqrt((x2 - x3) ** 2 + (y2 - y3) ** 2);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      <SvgTriangle
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        x3={x3} y3={y3}
        fill={mutation?.fillInterior ? FILL_COLOR : "none"}
        rightAngleVertex="v1"
      />
      {/* Hypotenuse highlight */}
      {highlightHyp && (
        <line x1={x2} y1={y2} x2={x3} y2={y3} stroke="rgba(255,220,100,0.9)" strokeWidth={3.5} strokeLinecap="round"
          style={{ strokeDasharray: `${hypLen} ${hypLen}`, strokeDashoffset: hypLen,
            animation: `drawArc 0.7s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": hypLen } as React.CSSProperties} />
      )}
      {/* Labels */}
      {lm === "numeric" && (
        <>
          {a !== undefined && (unknownDim === "a" ? <UnknownPill x={x1 - 22} y={(y1 + y3) / 2} /> : <SvgLabel x={x1 - 22} y={(y1 + y3) / 2} text={`a = ${a}`} />)}
          {b !== undefined && (unknownDim === "b" ? <UnknownPill x={(x1 + x2) / 2} y={y1 + 18} /> : <SvgLabel x={(x1 + x2) / 2} y={y1 + 18} text={`b = ${b}`} />)}
          {c_val !== undefined && (unknownDim === "c" ? <UnknownPill x={(x2 + x3) / 2 + 18} y={(y2 + y3) / 2 - 4} /> : <SvgLabel x={(x2 + x3) / 2 + 18} y={(y2 + y3) / 2 - 4} text={`c = ${c_val}`} />)}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={x1 - 14} y={(y1 + y3) / 2} text="a" />
          <SvgLabel x={(x1 + x2) / 2} y={y1 + 18} text="b" />
          {unknownDim === "c" && <UnknownPill x={(x2 + x3) / 2 + 18} y={(y2 + y3) / 2 - 4} />}
        </>
      )}
    </svg>
  );
}
