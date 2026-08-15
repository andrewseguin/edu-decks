"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE90,
  SvgLabel, UnknownPill, TickMark, RightAngleMarker,
} from "./svg-primitives";

// Semantic Color Tokens — tuned for high-contrast luminance against emerald cards
const COLOR_CYAN = "#5ee8ff";
const COLOR_GOLD = "#ffd45e";
const COLOR_ORANGE = "#ffa756";

const lblStyle: React.CSSProperties = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" };
const lblFont = "var(--font-heading, system-ui)";

/**
 * Robust vector-based corner arc helper.
 * Computes exact edge-touching endpoints P1 and P2 at distance `r` from vertex `V`,
 * then draws the smooth connecting circular arc along the interior.
 */
function cornerArcSvg(
  V: { x: number; y: number },
  V1: { x: number; y: number },
  V2: { x: number; y: number },
  r = 18
): string {
  const d1x = V1.x - V.x, d1y = V1.y - V.y;
  const len1 = Math.hypot(d1x, d1y) || 1;
  const p1 = { x: V.x + (d1x / len1) * r, y: V.y + (d1y / len1) * r };

  const d2x = V2.x - V.x, d2y = V2.y - V.y;
  const len2 = Math.hypot(d2x, d2y) || 1;
  const p2 = { x: V.x + (d2x / len2) * r, y: V.y + (d2y / len2) * r };

  // Cross product of v1 x v2 in screen coords to determine correct interior arc sweep
  const cross = d1x * d2y - d1y * d2x;
  const sweep = cross > 0 ? 1 : 0;

  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 0 ${sweep} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
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

  // If angA is provided, compute angle-sum geometry dynamically so arcs align 100%
  const hasAngles = dims.angA !== undefined;
  const angA = hasAngles ? Number(dims.angA) : 0;
  const angB = hasAngles ? Number(dims.angB) : 0;
  const angC = hasAngles ? (dims.angC !== undefined ? Number(dims.angC) : 180 - angA - angB) : 0;

  if (hasAngles && angA > 0 && angB > 0) {
    const radA = (angA * Math.PI) / 180;
    const radB = (angB * Math.PI) / 180;
    const tanA = Math.tan(radA);
    const tanB = Math.tan(radB);
    const baseW = V2.x - V1.x; // 170
    // Height from baseline
    const computedH = (baseW * tanA * tanB) / (tanA + tanB);
    const apexX = V1.x + computedH / tanA;
    const apexY = baseY - computedH;
    V3 = { x: Math.round(apexX * 10) / 10, y: Math.round(apexY * 10) / 10 };
  }

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
            d={cornerArcSvg(V1, V2, V3, 18)}
            fill="none"
            stroke={COLOR_CYAN}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Arc B at V2 (Gold) */}
          <path
            d={cornerArcSvg(V2, V3, V1, 18)}
            fill="none"
            stroke={COLOR_GOLD}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Arc C at V3 (Orange) */}
          <path
            d={cornerArcSvg(V3, V1, V2, 18)}
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

          {/* Label C / Unknown (Orange) — clean unboxed typography matching A and B */}
          <text
            x={V3.x}
            y={V3.y - 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={800}
            fill={COLOR_ORANGE}
            fontFamily={lblFont}
            style={lblStyle}
          >
            {unknownDim === "C" ? "?" : `${angC}°`}
          </text>
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
