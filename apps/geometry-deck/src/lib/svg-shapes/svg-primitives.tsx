"use client";

import React from "react";


// ─────────────────────────────────────────────────────────────────────────────
// Shared constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

export const LABEL_FONT = "inherit";
export const LABEL_SIZE = 13;
export const STROKE_W = 2;
export const WHITE70 = "rgba(255,255,255,0.70)";
export const WHITE90 = "rgba(255,255,255,0.90)";
export const WHITE50 = "rgba(255,255,255,0.50)";
export const WHITE25 = "rgba(255,255,255,0.25)";
export const FILL_COLOR = "rgba(255,255,255,0.18)";

export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export function SvgLabel({ x, y, text, size = LABEL_SIZE, opacity = 0.95, color }: {
  x: number; y: number; text: string; size?: number; opacity?: number; color?: string;
}) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  const fill = color ?? `rgba(255,255,255,${opacity})`;
  return (
    <text x={rx} y={ry} textAnchor="middle" fontSize={size} fontWeight="600"
      fill={fill} fontFamily={LABEL_FONT} style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{text}</text>
  );
}

export function UnknownPill({
  x,
  y,
  label,
  revealValue,
  color,
  unit = "°",
}: {
  x: number;
  y: number;
  label?: string;
  revealValue?: number;
  color?: string;
  unit?: string;
}) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  const isRevealed = revealValue != null;
  const pillW = 34;
  const pillH = 22;
  const labelColor = color ?? "white";

  const labelText = label ? `${label} = ` : "";
  const pillCx = label ? rx + 16 : rx;
  const labelX = label ? rx - 4 : rx;

  const displayAnswer = isRevealed ? `${revealValue}${unit}` : "";

  return (
    <g>
      {label && (
        <text
          x={labelX}
          y={ry + 4}
          textAnchor="end"
          fontSize={13}
          fontWeight="700"
          fill={labelColor}
          fontFamily={LABEL_FONT}
        >
          {labelText}
        </text>
      )}

      {/* Revealed answer */}
      <text
        x={pillCx}
        y={ry + 4}
        textAnchor={label ? "start" : "middle"}
        fontSize={14}
        fontWeight="700"
        fill={labelColor}
        fontFamily={LABEL_FONT}
        style={{
          opacity: isRevealed ? 1 : 0,
          transition: "opacity 0.4s ease 0.15s",
        }}
      >
        {displayAnswer}
      </text>

      {/* Glassmorphic ? badge */}
      <g
        style={{
          opacity: isRevealed ? 0 : 1,
          transform: isRevealed ? "scale(0.75)" : "scale(1)",
          transformOrigin: `${pillCx}px ${ry}px`,
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <rect
          x={pillCx - pillW / 2}
          y={ry - pillH / 2}
          width={pillW}
          height={pillH}
          rx={pillH / 2}
          fill={color ? `${color}25` : "rgba(255,255,255,0.22)"}
          stroke={color ? `${color}99` : "rgba(255,255,255,0.65)"}
          strokeWidth={1.5}
        />
        <text
          x={pillCx}
          y={ry + 4}
          textAnchor="middle"
          fontSize={14}
          fontWeight="800"
          fill={labelColor}
          fontFamily={LABEL_FONT}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
        >
          ?
        </text>
      </g>
    </g>
  );
}

export function DimLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={WHITE50} strokeWidth={1.5} strokeDasharray="4 3" />;
}

export function TickMark({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  const rad = (angle * Math.PI) / 180;
  const len = 6;
  return <line x1={x - len * Math.sin(rad)} y1={y + len * Math.cos(rad)}
    x2={x + len * Math.sin(rad)} y2={y - len * Math.cos(rad)}
    stroke={WHITE90} strokeWidth={2} strokeLinecap="round" />;
}

export function RightAngleMarker({
  x,
  y,
  size = 14,
  orientation = "bottom-left",
  color = "#ffffff",
  strokeWidth = 2,
}: {
  x: number;
  y: number;
  size?: number;
  orientation?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  color?: string;
  strokeWidth?: number;
}) {
  let pathD = "";
  if (orientation === "bottom-left") {
    pathD = `M ${x} ${y - size} H ${x + size} V ${y}`;
  } else if (orientation === "bottom-right") {
    pathD = `M ${x} ${y - size} H ${x - size} V ${y}`;
  } else if (orientation === "top-left") {
    pathD = `M ${x} ${y + size} H ${x + size} V ${y}`;
  } else if (orientation === "top-right") {
    pathD = `M ${x} ${y + size} H ${x - size} V ${y}`;
  }

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
    />
  );
}

export function computeRightTriangleVertices(x1: number, y1: number, legA: number, legB: number) {
  const x2 = x1 + legB;
  const y2 = y1;
  const x3 = x1;
  const y3 = y1 - legA;
  const hyp = Math.hypot(legB, legA);
  const angA = (Math.atan2(legA, legB) * 180) / Math.PI;
  const angB = 90 - angA;
  return { x1, y1, x2, y2, x3, y3, legA, legB, hyp, angA, angB };
}

export function SvgTriangle({
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
  fill = FILL_COLOR,
  stroke = WHITE90,
  strokeWidth = STROKE_W,
  rightAngleVertex,
  rightAngleSize = 14,
  className,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rightAngleVertex?: "v1" | "v2" | "v3";
  rightAngleSize?: number;
  className?: string;
}) {
  const pts = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
  return (
    <g className={className}>
      {fill && fill !== "none" && <polygon points={pts} fill={fill} />}
      <polygon
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {rightAngleVertex === "v1" && (
        <RightAngleMarker x={x1} y={y1} size={rightAngleSize} orientation="bottom-left" />
      )}
      {rightAngleVertex === "v2" && (
        <RightAngleMarker x={x2} y={y2} size={rightAngleSize} orientation="bottom-right" />
      )}
      {rightAngleVertex === "v3" && (
        <RightAngleMarker x={x3} y={y3} size={rightAngleSize} orientation="top-left" />
      )}
    </g>
  );
}
