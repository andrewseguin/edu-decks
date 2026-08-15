"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE90,
  SvgLabel, UnknownPill, TickMark, RightAngleMarker,
} from "./svg-primitives";

// Semantic Color Tokens
const COLOR_CYAN = "#5ee8ff";
const COLOR_GOLD = "#ffd45e";
const COLOR_ORANGE = "#fb923c";

const lblStyle: React.CSSProperties = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" };
const lblFont = "var(--font-heading, system-ui)";

/** Helper to draw an SVG arc path in math coords (0 = right, CCW positive, y-up) */
function arcPathSvg(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const p1 = { x: cx + r * Math.cos(rad(startDeg)), y: cy - r * Math.sin(rad(startDeg)) };
  const p2 = { x: cx + r * Math.cos(rad(endDeg)), y: cy - r * Math.sin(rad(endDeg)) };
  let sweep = endDeg - startDeg;
  while (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// General Triangle (Angle sum, Area, Perimeter, Classification)
// ─────────────────────────────────────────────────────────────────────────────

export function Triangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const b = dims.b, h = dims.h;
  const a = dims.a, c = dims.c;
  const style = (dims.style as string) ?? "scalene";
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  // Standard geometry canvas dimensions
  const baseY = 140;
  let V1 = { x: 35, y: baseY };
  let V2 = { x: 205, y: baseY };
  let V3 = { x: 95, y: 45 };

  if (style === "equilateral") {
    V1 = { x: 45, y: 140 };
    V2 = { x: 195, y: 140 };
    V3 = { x: 120, y: 140 - 75 * Math.sqrt(3) };
  } else if (style === "isosceles") {
    V1 = { x: 55, y: 140 };
    V2 = { x: 185, y: 140 };
    V3 = { x: 120, y: 45 };
  } else if (style === "isosceles-wide") {
    V1 = { x: 40, y: 135 };
    V2 = { x: 200, y: 135 };
    V3 = { x: 120, y: 75 };
  }

  // If angA is provided, compute angle-sum geometry
  const hasAngles = dims.angA !== undefined;
  const angA = hasAngles ? Number(dims.angA) : 0;
  const angB = hasAngles ? Number(dims.angB) : 0;
  const angC = hasAngles ? (dims.angC !== undefined ? Number(dims.angC) : 180 - angA - angB) : 0;

  // Apex angle direction vectors for Arc C
  const edgeAngleL = Math.round(Math.atan2(-(baseY - V3.y), V1.x - V3.x) * 180 / Math.PI);
  const edgeAngleR = Math.round(Math.atan2(-(baseY - V3.y), V2.x - V3.x) * 180 / Math.PI);

  // Perpendicular outward normal calculations for side length labels
  const getSideNormal = (p1: { x: number; y: number }, p2: { x: number; y: number }, dist = 14) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    // Inward normal for CCW winding is (-dy, dx), outward is (dy, -dx)
    return {
      midX: (p1.x + p2.x) / 2 + (dy / len) * dist,
      midY: (p1.y + p2.y) / 2 - (dx / len) * dist,
    };
  };

  const normA = getSideNormal(V1, V3, -14); // Left side outward normal
  const normC = getSideNormal(V3, V2, -14); // Right side outward normal

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* ── Main Triangle Polygon ────────────────────────────────────────── */}
      <polygon
        points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${V3.x},${V3.y}`}
        fill={filled ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"}
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* ── Area Mode: Altitude Line & Base/Height Labels ────────────────── */}
      {h !== undefined && (
        <>
          {/* Vertical altitude line from apex to baseline */}
          <line
            x1={V3.x}
            y1={V3.y}
            x2={V3.x}
            y2={baseY}
            stroke={COLOR_CYAN}
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          {/* Right angle marker at the foot of the altitude */}
          <path
            d={`M ${V3.x} ${baseY - 10} L ${V3.x + 10} ${baseY - 10} L ${V3.x + 10} ${baseY}`}
            fill="none"
            stroke={COLOR_CYAN}
            strokeWidth={1.5}
          />
          {/* Height label in Cyan */}
          <text
            x={V3.x + 14}
            y={(V3.y + baseY) / 2}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={COLOR_CYAN}
            fontFamily={lblFont}
            style={lblStyle}
          >
            {lm === "numeric" ? `${h}` : "h"}
          </text>
          {/* Base label in Gold */}
          {b !== undefined && (
            <text
              x={(V1.x + V2.x) / 2}
              y={baseY + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={COLOR_GOLD}
              fontFamily={lblFont}
              style={lblStyle}
            >
              {lm === "numeric" ? `${b}` : "b"}
            </text>
          )}
        </>
      )}

      {/* ── Perimeter / Side Lengths Mode ────────────────────────────────── */}
      {h === undefined && !hasAngles && (
        <>
          {/* Side a (Cyan) */}
          {a !== undefined && (
            <text
              x={normA.midX}
              y={normA.midY}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={COLOR_CYAN}
              fontFamily={lblFont}
              style={lblStyle}
            >
              {lm === "numeric" ? `${a}` : "a"}
            </text>
          )}
          {/* Side b (Gold) */}
          {b !== undefined && (
            <text
              x={(V1.x + V2.x) / 2}
              y={baseY + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={COLOR_GOLD}
              fontFamily={lblFont}
              style={lblStyle}
            >
              {lm === "numeric" ? `${b}` : "b"}
            </text>
          )}
          {/* Side c (Orange) */}
          {c !== undefined && (
            <text
              x={normC.midX}
              y={normC.midY}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={COLOR_ORANGE}
              fontFamily={lblFont}
              style={lblStyle}
            >
              {lm === "numeric" ? `${c}` : "c"}
            </text>
          )}
        </>
      )}

      {/* ── Angle Sum Mode: Colored Arcs & Vertex Labels ─────────────────── */}
      {hasAngles && (
        <>
          {/* Arc A at V1 (Cyan) */}
          <path
            d={arcPathSvg(V1.x, V1.y, 18, 0, angA)}
            fill="none"
            stroke={COLOR_CYAN}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Arc B at V2 (Gold) */}
          <path
            d={arcPathSvg(V2.x, V2.y, 18, 180 - angB, 180)}
            fill="none"
            stroke={COLOR_GOLD}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Arc C at V3 (Orange) */}
          <path
            d={arcPathSvg(V3.x, V3.y, 18, edgeAngleL, edgeAngleR)}
            fill="none"
            stroke={COLOR_ORANGE}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Label A (Cyan) */}
          <text
            x={V1.x - 8}
            y={V1.y + 4}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={COLOR_CYAN}
            fontFamily={lblFont}
            style={lblStyle}
          >
            {angA}°
          </text>

          {/* Label B (Gold) */}
          <text
            x={V2.x + 8}
            y={V2.y + 4}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={COLOR_GOLD}
            fontFamily={lblFont}
            style={lblStyle}
          >
            {angB}°
          </text>

          {/* Label C or Unknown Question Badge (Orange) */}
          {unknownDim === "C" ? (
            <UnknownPill x={V3.x} y={V3.y - 14} color={COLOR_ORANGE} />
          ) : (
            <text
              x={V3.x}
              y={V3.y - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={COLOR_ORANGE}
              fontFamily={lblFont}
              style={lblStyle}
            >
              {angC}°
            </text>
          )}
        </>
      )}

      {/* ── Classification Tick Marks ────────────────────────────────────── */}
      {style === "equilateral" && (
        <>
          <TickMark x={(V1.x + V3.x) / 2} y={(V1.y + V3.y) / 2} angle={-50} />
          <TickMark x={(V2.x + V3.x) / 2} y={(V2.y + V3.y) / 2} angle={50} />
          <TickMark x={(V1.x + V2.x) / 2} y={baseY} angle={0} />
        </>
      )}
      {(style === "isosceles" || style === "isosceles-wide") && (
        <>
          <TickMark x={(V1.x + V3.x) / 2} y={(V1.y + V3.y) / 2} angle={style === "isosceles-wide" ? -30 : -55} />
          <TickMark x={(V2.x + V3.x) / 2} y={(V2.y + V3.y) / 2} angle={style === "isosceles-wide" ? 30 : 55} />
        </>
      )}

      {/* ── Vertex Dots ──────────────────────────────────────────────────── */}
      <circle cx={V1.x} cy={V1.y} r={3} fill="white" />
      <circle cx={V2.x} cy={V2.y} r={3} fill="white" />
      <circle cx={V3.x} cy={V3.y} r={3} fill="white" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right Triangle (Pythagorean Theorem, Right-Triangle Area)
// ─────────────────────────────────────────────────────────────────────────────

export function RightTriangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const a = dims.a, b = dims.b, c_val = dims.c;
  const unknownDim = dims.unknown as string | undefined;
  const highlightHyp = mutation?.traceStroke === "hypotenuse";

  // Standard Right Triangle Coordinates
  const V1 = { x: 50, y: 140 }; // Right angle vertex
  const V2 = { x: 195, y: 140 }; // Bottom-right vertex
  const V3 = { x: 50, y: 45 };   // Top-left vertex

  const hypLen = Math.hypot(V2.x - V3.x, V2.y - V3.y);
  // Hypotenuse normal for label placement
  const hypMidX = (V2.x + V3.x) / 2 + 12;
  const hypMidY = (V2.y + V3.y) / 2 - 10;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* ── Right Triangle Polygon ───────────────────────────────────────── */}
      <polygon
        points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${V3.x},${V3.y}`}
        fill={mutation?.fillInterior ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"}
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* ── Right Angle Square Marker at V1 ──────────────────────────────── */}
      <path
        d={`M ${V1.x} ${V1.y - 12} L ${V1.x + 12} ${V1.y - 12} L ${V1.x + 12} ${V1.y}`}
        fill="none"
        stroke="white"
        strokeWidth={1.5}
      />

      {/* ── Hypotenuse Highlight Trace ───────────────────────────────────── */}
      {highlightHyp && (
        <line
          x1={V3.x}
          y1={V3.y}
          x2={V2.x}
          y2={V2.y}
          stroke={COLOR_ORANGE}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      )}

      {/* ── Side a (Vertical Leg — Cyan) ─────────────────────────────────── */}
      {unknownDim === "a" ? (
        <UnknownPill x={V1.x - 22} y={(V1.y + V3.y) / 2} color={COLOR_CYAN} unit="" />
      ) : a !== undefined ? (
        <text
          x={V1.x - 14}
          y={(V1.y + V3.y) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_CYAN}
          fontFamily={lblFont}
          style={lblStyle}
        >
          {lm === "numeric" ? `${a}` : "a"}
        </text>
      ) : null}

      {/* ── Side b (Horizontal Leg — Gold) ───────────────────────────────── */}
      {unknownDim === "b" ? (
        <UnknownPill x={(V1.x + V2.x) / 2} y={V1.y + 18} color={COLOR_GOLD} unit="" />
      ) : b !== undefined ? (
        <text
          x={(V1.x + V2.x) / 2}
          y={V1.y + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_GOLD}
          fontFamily={lblFont}
          style={lblStyle}
        >
          {lm === "numeric" ? `${b}` : "b"}
        </text>
      ) : null}

      {/* ── Side c (Hypotenuse — Orange) ─────────────────────────────────── */}
      {unknownDim === "c" ? (
        <UnknownPill x={hypMidX} y={hypMidY} color={COLOR_ORANGE} unit="" />
      ) : c_val !== undefined ? (
        <text
          x={hypMidX}
          y={hypMidY}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_ORANGE}
          fontFamily={lblFont}
          style={lblStyle}
        >
          {lm === "numeric" ? `${c_val}` : "c"}
        </text>
      ) : null}

      {/* ── Vertex Dots ──────────────────────────────────────────────────── */}
      <circle cx={V1.x} cy={V1.y} r={3} fill="white" />
      <circle cx={V2.x} cy={V2.y} r={3} fill="white" />
      <circle cx={V3.x} cy={V3.y} r={3} fill="white" />
    </svg>
  );
}
