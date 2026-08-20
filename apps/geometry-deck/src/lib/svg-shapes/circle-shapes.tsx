"use client";

import React from "react";
import type { SvgMutation, ShapeDims } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE70, WHITE90,
  SvgLabel,
} from "./svg-primitives";

const COLOR_RADIUS = "#5ee8ff";  // Electric Cyan
const COLOR_DIAMETER = "#ffd45e";// Warm Gold
const COLOR_CIRCUM = "#ffd45e";  // Warm Gold / Amber Orange
const COLOR_AREA = "#ffd45e";    // Warm Gold / Amber Orange (Consistent secondary circle color)

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
// Circle shape
// ─────────────────────────────────────────────────────────────────────────────

export function Circle({ dims, mutation }: { dims: ShapeDims; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const r = dims.r, cVal = dims.C, aVal = dims.A;
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const showDiameter = Boolean(dims.showDiameter);
  const filled = mutation?.fillInterior;
  const traceCirc = mutation?.traceStroke === "circumference";
  const revealedAnswer = mutation?.revealAnswer;

  const cx = 120, cy = 85, cr = 58;
  const circum = 2 * Math.PI * cr;

  const isAreaContext = unknownDim === "A" || dims.A !== undefined || filled;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      <defs>
        <pattern id="circle-unit-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="rgba(255, 255, 255, 0.04)" />
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" strokeDasharray="2 3" />
        </pattern>
      </defs>

      {/* 1. Interior Fill (Solid when filled + Unit Squares Grid for Area) */}
      {filled && <circle cx={cx} cy={cy} r={cr} fill={FILL_COLOR} />}
      {isAreaContext && <circle cx={cx} cy={cy} r={cr} fill="url(#circle-unit-grid)" />}

      {/* 2. Circumference Glow Animation */}
      {traceCirc && (
        <circle
          cx={cx}
          cy={cy}
          r={cr}
          fill="none"
          stroke={COLOR_CIRCUM}
          strokeWidth={4}
          style={
            {
              strokeDasharray: `${circum} ${circum}`,
              strokeDashoffset: circum,
              animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
            } as React.CSSProperties
          }
        />
      )}

      {/* 3. Outer Boundary */}
      <circle cx={cx} cy={cy} r={cr} fill="rgba(255, 255, 255, 0.08)" stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* 4. Center Dot Marker */}
      <circle cx={cx} cy={cy} r={6} fill="rgba(255, 255, 255, 0.2)" />
      <circle cx={cx} cy={cy} r={3} fill="#ffffff" />

      {/* 5. Diameter or Radius Line */}
      {showDiameter ? (
        <>
          <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy} stroke={COLOR_DIAMETER} strokeWidth={2} />
          <circle cx={cx - cr} cy={cy} r={3} fill={COLOR_DIAMETER} />
          <circle cx={cx + cr} cy={cy} r={3} fill={COLOR_DIAMETER} />
        </>
      ) : (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={cx + cr}
            y2={cy}
            stroke={COLOR_RADIUS}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <circle cx={cx + cr} cy={cy} r={3} fill={COLOR_RADIUS} />
        </>
      )}

      {/* 6. Labels */}
      {lm === "numeric" && (
        <>
          {/* Radius label */}
          {!showDiameter && (
            unknownDim === "r" ? (
              <RevealText x={cx + cr / 2} y={cy - 14} variable="r" revealedValue={revealedAnswer} color={COLOR_RADIUS} fontSize={17} fontWeight="900" />
            ) : r !== undefined ? (
              <SvgLabel x={cx + cr / 2} y={cy - 14} text={`r = ${r}`} color={COLOR_RADIUS} size={13} />
            ) : null
          )}

          {/* Diameter label */}
          {showDiameter && (
            unknownDim === "d" ? (
              <RevealText x={cx} y={cy - 14} variable="d" revealedValue={revealedAnswer} color={COLOR_DIAMETER} fontSize={17} fontWeight="900" />
            ) : (
              <SvgLabel x={cx} y={cy - 14} text={r !== undefined ? `d = ${Number(r) * 2}` : "d"} color={COLOR_DIAMETER} size={13} />
            )
          )}

          {/* Circumference target or given (Outside along boundary) */}
          {unknownDim === "C" && (
            <RevealText x={cx} y={cy - cr - 14} variable="C" revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined} color={COLOR_CIRCUM} fontSize={18} fontWeight="900" />
          )}
          {cVal !== undefined && unknownDim !== "C" && (
            <SvgLabel x={cx} y={cy - cr - 14} text={`C = ${cVal}`} color={COLOR_CIRCUM} size={14} />
          )}

          {/* Area target or given (Inside circle interior on unit grid) */}
          {unknownDim === "A" && (
            <RevealText x={cx} y={cy + 22} variable="A" revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined} color={COLOR_AREA} fontSize={18} fontWeight="900" />
          )}
          {aVal !== undefined && unknownDim !== "A" && (
            <SvgLabel x={cx} y={cy + 22} text={`A = ${aVal}`} color={COLOR_AREA} size={14} />
          )}
        </>
      )}

      {lm === "variable" && (
        <>
          {showDiameter ? (
            <SvgLabel x={cx} y={cy - 14} text="d" color={COLOR_DIAMETER} size={14} />
          ) : (
            <SvgLabel x={cx + cr / 2} y={cy - 14} text="r" color={COLOR_RADIUS} size={14} />
          )}
        </>
      )}
    </svg>
  );
}
