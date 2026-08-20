"use client";

import React from "react";
import type { SvgMutation, ShapeDims } from "../types";
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

export function Polygon({ dims, mutation }: { dims: ShapeDims; mutation?: SvgMutation }) {
  const n = typeof dims.n === "number" ? dims.n : 5;
  const s = dims.s;
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const filled = mutation?.fillInterior;
  const revealedAnswer = mutation?.revealAnswer;

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

  const minY = Math.min(...vertices.map((v) => v.y));
  const maxY = Math.max(...vertices.map((v) => v.y));
  const polyCenterY = (minY + maxY) / 2;
  const minX = Math.min(...vertices.map((v) => v.x));
  const maxX = Math.max(...vertices.map((v) => v.x));
  const polyCenterX = (minX + maxX) / 2;

  const isAngleCard = unknownDim === "Sum" || unknownDim === "sum" || unknownDim === "angle" || unknownDim === "θ" || dims.showArcs === "true" || dims.showArcs === true || dims.showArcs === 1 || dims.sum !== undefined;

  // Compute congruent interior angle arcs at all vertices
  const arcRadius = Math.max(10, Math.min(16, 85 / n));
  const angleSectors = isAngleCard ? vertices.map((v, i) => {
    const prevV = vertices[(i - 1 + n) % n];
    const nextV = vertices[(i + 1) % n];

    const d1x = prevV.x - v.x;
    const d1y = prevV.y - v.y;
    const len1 = Math.hypot(d1x, d1y);

    const d2x = nextV.x - v.x;
    const d2y = nextV.y - v.y;
    const len2 = Math.hypot(d2x, d2y);

    const u1x = d1x / len1;
    const u1y = d1y / len1;
    const u2x = d2x / len2;
    const u2y = d2y / len2;

    const p1x = v.x + arcRadius * u1x;
    const p1y = v.y + arcRadius * u1y;
    const p2x = v.x + arcRadius * u2x;
    const p2y = v.y + arcRadius * u2y;

    const cross = u1x * u2y - u1y * u2x;
    const sweep = cross > 0 ? 1 : 0;

    return {
      sectorD: `M ${v.x} ${v.y} L ${p1x} ${p1y} A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${p2x} ${p2y} Z`,
      arcD: `M ${p1x} ${p1y} A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${p2x} ${p2y}`,
    };
  }) : [];

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

      {/* 4. Glowing Interior Angle Arcs (for Angle Sum & Angle cards) */}
      {isAngleCard && (
        <g style={{ filter: "drop-shadow(0px 1px 4px rgba(216, 180, 254, 0.7))" }}>
          {angleSectors.map((s, i) => (
            <g key={`angle-arc-${i}`}>
              <path d={s.sectorD} fill="rgba(216, 180, 254, 0.45)" stroke="none" />
              <path d={s.arcD} fill="none" stroke="#f5d0fe" strokeWidth={2} strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {/* 5. Side Hash Ticks for Equilateral Sides (on perimeter cards) */}
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

      {/* 6. Centered Unknown Target / Known Value at Exact Polygon Centroid */}
      {dims.sum !== undefined ? (
        <g style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7))" }}>
          <g transform={`translate(${polyCenterX - (String(dims.sum).length > 3 ? 38 : 34)}, ${polyCenterY})`}>
            {/* Vector Sigma Symbol (Standard right-facing) */}
            <path
              d="M 9.5 -6 L 0.5 -6 L 5.5 0 L 0.5 6 L 9.5 6"
              fill="none"
              stroke="#ffffff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="miter"
            />
            <text
              x={14}
              y={0}
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={14}
              fontWeight="800"
              fontFamily="var(--font-heading, system-ui)"
            >
              θ = {dims.sum}°
            </text>
          </g>
        </g>
      ) : unknownDim === "n" ? (
        <RevealText
          x={polyCenterX}
          y={polyCenterY}
          variable="n = ?"
          revealedValue={revealedAnswer != null ? `n = ${revealedAnswer}` : undefined}
          color="#ffffff"
          fontSize={16}
          fontWeight="800"
        />
      ) : unknownDim === "P" || unknownDim === "perimeter" ? (
        <RevealText
          x={polyCenterX}
          y={polyCenterY}
          variable="P = ?"
          revealedValue={revealedAnswer != null ? `P = ${revealedAnswer}` : undefined}
          color="#ffffff"
          fontSize={15}
          fontWeight="800"
        />
      ) : unknownDim === "Sum" || unknownDim === "sum" ? (
        <g style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7))" }}>
          {revealedAnswer != null ? (
            <g transform={`translate(${polyCenterX - 30}, ${polyCenterY})`}>
              {/* Vector Sigma Symbol (Standard right-facing) */}
              <path
                d="M 9.5 -6 L 0.5 -6 L 5.5 0 L 0.5 6 L 9.5 6"
                fill="none"
                stroke="#ffffff"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="miter"
              />
              <text
                x={14}
                y={0}
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={14}
                fontWeight="800"
                fontFamily="var(--font-heading, system-ui)"
              >
                θ = {revealedAnswer}°
              </text>
            </g>
          ) : (
            <g transform={`translate(${polyCenterX - 22}, ${polyCenterY})`}>
              {/* Vector Sigma Symbol (Standard right-facing) */}
              <path
                d="M 9.5 -6 L 0.5 -6 L 5.5 0 L 0.5 6 L 9.5 6"
                fill="none"
                stroke="#ffffff"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="miter"
              />
              <text
                x={14}
                y={0}
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={14}
                fontWeight="800"
                fontFamily="var(--font-heading, system-ui)"
              >
                θ = ?
              </text>
            </g>
          )}
        </g>
      ) : unknownDim === "angle" || unknownDim === "θ" ? (
        <RevealText
          x={polyCenterX}
          y={vertices[0].y + arcRadius + (n >= 8 ? 9 : 12)}
          variable="θ = ?"
          revealedValue={revealedAnswer != null ? `θ = ${revealedAnswer}°` : undefined}
          color="#ffffff"
          fontSize={n >= 8 ? 12.5 : 14}
          fontWeight="800"
        />
      ) : (dims.exteriorAngle || unknownDim === "extAngle" || unknownDim === "exteriorAngle") ? (
        (() => {
          // Find rightmost edge to place exterior angle with generous margin
          let extEdgeIdx = 0;
          let maxMidX = -Infinity;
          for (let i = 0; i < n; i++) {
            const nextV = vertices[(i + 1) % n];
            const midX = (vertices[i].x + nextV.x) / 2;
            if (midX > maxMidX) {
              maxMidX = midX;
              extEdgeIdx = i;
            }
          }
          const extVA = vertices[extEdgeIdx];
          const extVB = vertices[(extEdgeIdx + 1) % n];
          const extVC = vertices[(extEdgeIdx + 2) % n];

          const d1x = extVB.x - extVA.x;
          const d1y = extVB.y - extVA.y;
          const len1 = Math.hypot(d1x, d1y) || 1;
          const u1x = d1x / len1;
          const u1y = d1y / len1;

          const d2x = extVC.x - extVB.x;
          const d2y = extVC.y - extVB.y;
          const len2 = Math.hypot(d2x, d2y) || 1;
          const u2x = d2x / len2;
          const u2y = d2y / len2;

          const extRayLen = 32;
          const extX = extVB.x + u1x * extRayLen;
          const extY = extVB.y + u1y * extRayLen;

          const arcR = 18;
          const p1x = extVB.x + u1x * arcR;
          const p1y = extVB.y + u1y * arcR;
          const p2x = extVB.x + u2x * arcR;
          const p2y = extVB.y + u2y * arcR;

          const cross = u1x * u2y - u1y * u2x;
          const sweep = cross > 0 ? 1 : 0;

          const midUX = u1x + u2x;
          const midUY = u1y + u2y;
          const midLen = Math.hypot(midUX, midUY) || 1;
          const lblX = extVB.x + (midUX / midLen) * 32;
          const lblY = extVB.y + (midUY / midLen) * 32;

          const isExtUnknown = unknownDim === "extAngle" || unknownDim === "exteriorAngle";
          const knownAngle = typeof dims.extAngle === "number" ? dims.extAngle : (typeof dims.exteriorAngle === "number" ? dims.exteriorAngle : null);

          return (
            <g>
              {/* Extended dashed baseline */}
              <line
                x1={extVB.x}
                y1={extVB.y}
                x2={extX}
                y2={extY}
                stroke="#ffd45e"
                strokeWidth={1.8}
                strokeDasharray="4 3"
              />
              {/* Vertex dot */}
              <circle cx={extVB.x} cy={extVB.y} r={3} fill="#ffd45e" />
              {/* Exterior Angle Arc */}
              <path
                d={`M ${p1x} ${p1y} A ${arcR} ${arcR} 0 0 ${sweep} ${p2x} ${p2y}`}
                fill="none"
                stroke="#ffd45e"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
              {/* Exterior Angle Sector Fill */}
              <path
                d={`M ${extVB.x} ${extVB.y} L ${p1x} ${p1y} A ${arcR} ${arcR} 0 0 ${sweep} ${p2x} ${p2y} Z`}
                fill="rgba(255, 212, 94, 0.25)"
                stroke="none"
              />
              {/* Label */}
              {isExtUnknown ? (
                <RevealText
                  x={lblX}
                  y={lblY}
                  variable={lm === "variable" ? "θ" : "θ = ?"}
                  revealedValue={revealedAnswer != null ? `θ = ${revealedAnswer}°` : undefined}
                  color="#ffd45e"
                  fontSize={13}
                  fontWeight="800"
                />
              ) : knownAngle != null ? (
                <SvgLabel
                  x={lblX}
                  y={lblY}
                  text={`${knownAngle}°`}
                  color={COLOR_GOLD}
                  size={13}
                />
              ) : lm === "variable" ? (
                <SvgLabel
                  x={lblX}
                  y={lblY}
                  text="θ"
                  color={COLOR_GOLD}
                  size={13}
                />
              ) : (
                <SvgLabel
                  x={lblX}
                  y={lblY}
                  text={`${360 / n}°`}
                  color={COLOR_GOLD}
                  size={13}
                />
              )}
            </g>
          );
        })()
      ) : null}

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
