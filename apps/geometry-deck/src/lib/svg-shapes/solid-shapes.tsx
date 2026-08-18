"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  FILL_COLOR, STROKE_W, WHITE70, WHITE90,
  SvgLabel,
} from "./svg-primitives";

const COLOR_CYAN = "#5ee8ff";    // Electric Cyan (length l, radius r, base)
const COLOR_LILAC = "#d8b4fe";   // Soft Lilac (width w)
const COLOR_GOLD = "#ffd45e";    // Warm Gold (height h, edges E)
const COLOR_WHITE = "#ffffff";   // Crisp White (vertices V, volume, surface area)

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
// 3D shapes — Isometric cabinet projection
// ─────────────────────────────────────────────────────────────────────────────

/** Isometric rectangular prism / cube */
export function Prism({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const revealedAnswer = mutation?.revealAnswer;
  const filled = mutation?.fillInterior;

  const W = 100, H = 64, D = 46;
  const ox = 50, oy = 55;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  // 8 vertices
  const fl = { x: ox, y: oy + H };
  const fr = { x: ox + W, y: oy + H };
  const ftl = { x: ox, y: oy };
  const ftr = { x: ox + W, y: oy };
  const bl = { x: ox + dxD, y: oy + H + dyD };
  const br = { x: ox + W + dxD, y: oy + H + dyD };
  const btl = { x: ox + dxD, y: oy + dyD };
  const btr = { x: ox + W + dxD, y: oy + dyD };

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Hidden back edges */}
      <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Faces */}
      {/* Front face */}
      <polygon
        points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
        fill={filled ? FILL_COLOR : "rgba(255,255,255,0.12)"}
        stroke={WHITE90}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* Right side face */}
      <polygon
        points={`${fr.x},${fr.y} ${br.x},${br.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
        fill="rgba(255,255,255,0.06)"
        stroke={WHITE90}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* Top face */}
      <polygon
        points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
        fill="rgba(255,255,255,0.18)"
        stroke={WHITE90}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />

      {/* Vertices */}
      {[fl, fr, ftl, ftr, br, btl, btr].map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
      ))}

      {/* Labels */}
      {/* Length l (front bottom) */}
      {dims.l !== undefined && (
        <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 14} text={lm === "variable" ? "l" : `${dims.l}`} color={COLOR_CYAN} size={13} />
      )}
      {/* Side s for cube */}
      {dims.s !== undefined && (
        <>
          <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 14} text={lm === "variable" ? "s" : `${dims.s}`} color={COLOR_CYAN} size={13} />
          <SvgLabel x={ftl.x - 14} y={(ftl.y + fl.y) / 2} text={lm === "variable" ? "s" : `${dims.s}`} color={COLOR_GOLD} size={13} />
        </>
      )}
      {/* Width w (depth) */}
      {dims.w !== undefined && (
        <SvgLabel x={fr.x + dxD / 2 + 14} y={fr.y + dyD / 2 + 8} text={lm === "variable" ? "w" : `${dims.w}`} color={COLOR_LILAC} size={13} />
      )}
      {/* Height h (vertical left) */}
      {dims.h !== undefined && (
        <SvgLabel x={ftl.x - 14} y={(ftl.y + fl.y) / 2} text={lm === "variable" ? "h" : `${dims.h}`} color={COLOR_GOLD} size={13} />
      )}

      {/* Volume or SA Unknown RevealText */}
      {unknownDim === "V" && (
        <RevealText x={(fl.x + fr.x) / 2} y={(ftl.y + fl.y) / 2} variable="V" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
      )}
      {unknownDim === "SA" && (
        <RevealText x={(fl.x + fr.x) / 2} y={(ftl.y + fl.y) / 2} variable="SA" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
      )}
    </svg>
  );
}

/** Cylinder */
export function Cylinder({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const revealedAnswer = mutation?.revealAnswer;
  const filled = mutation?.fillInterior;

  const cx = 120, topY = 42, botY = 126, cr = 54, ey = 14;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Bottom ellipse fill & stroke */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill={filled ? FILL_COLOR : "rgba(255,255,255,0.06)"} stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Cylinder body fill */}
      <path
        d={`M ${cx - cr} ${topY} L ${cx - cr} ${botY} A ${cr} ${ey} 0 0 0 ${cx + cr} ${botY} L ${cx + cr} ${topY} Z`}
        fill={filled ? FILL_COLOR : "rgba(255,255,255,0.10)"}
      />
      {/* Side boundary lines */}
      <line x1={cx - cr} y1={topY} x2={cx - cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={topY} x2={cx + cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Top ellipse */}
      <ellipse cx={cx} cy={topY} rx={cr} ry={ey} fill="rgba(255,255,255,0.18)" stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Center dot & Radius line */}
      <circle cx={cx} cy={topY} r={3} fill="#ffffff" />
      <line x1={cx} y1={topY} x2={cx + cr} y2={topY} stroke={COLOR_CYAN} strokeWidth={2} strokeDasharray="3 2" />
      <circle cx={cx + cr} cy={topY} r={3} fill={COLOR_CYAN} />

      {/* Height vertical reference line */}
      <line x1={cx + cr + 12} y1={topY} x2={cx + cr + 12} y2={botY} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="2 2" />
      <circle cx={cx + cr + 12} cy={topY} r={2.5} fill={COLOR_GOLD} />
      <circle cx={cx + cr + 12} cy={botY} r={2.5} fill={COLOR_GOLD} />

      {/* Labels */}
      {dims.r !== undefined && (
        <SvgLabel x={cx + cr / 2} y={topY - 14} text={lm === "variable" ? "r" : `${dims.r}`} color={COLOR_CYAN} size={13} />
      )}
      {dims.h !== undefined && (
        <SvgLabel x={cx + cr + 26} y={(topY + botY) / 2} text={lm === "variable" ? "h" : `${dims.h}`} color={COLOR_GOLD} size={13} />
      )}

      {/* Volume Unknown RevealText */}
      {unknownDim === "V" && (
        <RevealText
          x={cx}
          y={(topY + botY) / 2}
          variable="V"
          revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined}
          color={COLOR_WHITE}
          fontSize={18}
          fontWeight="900"
        />
      )}
    </svg>
  );
}

/** Cone */
export function Cone({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const revealedAnswer = mutation?.revealAnswer;
  const filled = mutation?.fillInterior;

  const cx = 120, apexY = 32, botY = 132, cr = 58, ey = 14;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Base ellipse */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill={filled ? FILL_COLOR : "rgba(255,255,255,0.08)"} stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Cone lateral surface */}
      <path
        d={`M ${cx - cr} ${botY} L ${cx} ${apexY} L ${cx + cr} ${botY} A ${cr} ${ey} 0 0 1 ${cx - cr} ${botY} Z`}
        fill={filled ? FILL_COLOR : "rgba(255,255,255,0.12)"}
      />
      <line x1={cx - cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Apex dot */}
      <circle cx={cx} cy={apexY} r={3.5} fill="#ffffff" />

      {/* Radius line at base */}
      <circle cx={cx} cy={botY} r={3} fill="#ffffff" />
      <line x1={cx} y1={botY} x2={cx + cr} y2={botY} stroke={COLOR_CYAN} strokeWidth={2} strokeDasharray="3 2" />
      <circle cx={cx + cr} cy={botY} r={3} fill={COLOR_CYAN} />

      {/* Height line inside from apex to center */}
      <line x1={cx} y1={apexY} x2={cx} y2={botY} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="3 2" />

      {/* Labels */}
      {dims.r !== undefined && (
        <SvgLabel x={cx + cr / 2} y={botY + 15} text={lm === "variable" ? "r" : `${dims.r}`} color={COLOR_CYAN} size={13} />
      )}
      {dims.h !== undefined && (
        <SvgLabel x={cx - 14} y={(apexY + botY) / 2} text={lm === "variable" ? "h" : `${dims.h}`} color={COLOR_GOLD} size={13} />
      )}

      {/* Volume Unknown RevealText */}
      {unknownDim === "V" && (
        <RevealText
          x={cx + 18}
          y={(apexY + botY) / 2 + 10}
          variable="V"
          revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined}
          color={COLOR_WHITE}
          fontSize={18}
          fontWeight="900"
        />
      )}
    </svg>
  );
}

/** Sphere */
export function Sphere({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const revealedAnswer = mutation?.revealAnswer;
  const filled = mutation?.fillInterior;

  const cx = 120, cy = 85, cr = 60;

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={cr} fill={filled ? FILL_COLOR : "rgba(255,255,255,0.10)"} stroke={WHITE90} strokeWidth={STROKE_W} />

      {/* Equator ellipse */}
      <ellipse cx={cx} cy={cy} rx={cr} ry={16} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Center dot & Radius line */}
      <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />
      <line x1={cx} y1={cy} x2={cx + cr * 0.707} y2={cy - cr * 0.707} stroke={COLOR_CYAN} strokeWidth={2} strokeDasharray="3 2" />
      <circle cx={cx + cr * 0.707} cy={cy - cr * 0.707} r={3} fill={COLOR_CYAN} />

      {/* Labels */}
      {dims.r !== undefined && (
        <SvgLabel x={cx + cr * 0.45} y={cy - cr * 0.45 - 10} text={lm === "variable" ? "r" : `${dims.r}`} color={COLOR_CYAN} size={13} />
      )}

      {/* Volume Unknown RevealText */}
      {unknownDim === "V" && (
        <RevealText
          x={cx}
          y={cy + 22}
          variable="V"
          revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined}
          color={COLOR_WHITE}
          fontSize={18}
          fontWeight="900"
        />
      )}
      {unknownDim === "SA" && (
        <RevealText
          x={cx}
          y={cy + 22}
          variable="SA"
          revealedValue={revealedAnswer != null ? `${revealedAnswer}π` : undefined}
          color={COLOR_WHITE}
          fontSize={18}
          fontWeight="900"
        />
      )}
    </svg>
  );
}

/** Square Pyramid */
export function Pyramid({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = (dims.labelMode as string) ?? "numeric";
  const unknownDim = (dims.unknown as string | undefined) ?? (dims.unknownDimension as string | undefined);
  const revealedAnswer = mutation?.revealAnswer;
  const filled = mutation?.fillInterior;

  const W = 90, H = 80, D = 46;
  const ox = 60, oy = 135;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  const fl = { x: ox, y: oy };
  const fr = { x: ox + W, y: oy };
  const bl = { x: ox + dxD, y: oy + dyD };
  const br = { x: ox + W + dxD, y: oy + dyD };
  const baseMid = { x: (fl.x + fr.x + bl.x + br.x) / 4, y: (fl.y + fr.y + bl.y + br.y) / 4 };
  const apex = { x: baseMid.x, y: baseMid.y - H };

  return (
    <svg viewBox="0 0 240 170" className="w-full h-full select-none" aria-hidden>
      {/* Hidden back edges */}
      <line x1={bl.x} y1={bl.y} x2={apex.x} y2={apex.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Base polygon fill */}
      <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${br.x},${br.y} ${bl.x},${bl.y}`} fill="rgba(255,255,255,0.06)" />

      {/* Front Face */}
      <polygon
        points={`${apex.x},${apex.y} ${fl.x},${fl.y} ${fr.x},${fr.y}`}
        fill={filled ? FILL_COLOR : "rgba(255,255,255,0.18)"}
        stroke={WHITE90}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* Right Face */}
      <polygon
        points={`${apex.x},${apex.y} ${fr.x},${fr.y} ${br.x},${br.y}`}
        fill="rgba(255,255,255,0.10)"
        stroke={WHITE90}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />

      {/* Height line inside from apex to base center */}
      <line x1={apex.x} y1={apex.y} x2={baseMid.x} y2={baseMid.y} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="3 2" />
      <circle cx={baseMid.x} cy={baseMid.y} r={2.5} fill={COLOR_GOLD} />

      {/* Vertices */}
      {[fl, fr, br, apex].map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
      ))}

      {/* Dimension Labels */}
      {dims.b !== undefined && (
        <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 14} text={lm === "variable" ? "b" : `${dims.b}`} color={COLOR_CYAN} size={13} />
      )}
      {dims.B !== undefined && (
        <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 14} text={lm === "variable" ? "B" : `B = ${dims.B}`} color={COLOR_CYAN} size={13} />
      )}
      {dims.h !== undefined && (
        <SvgLabel x={apex.x - 14} y={(apex.y + baseMid.y) / 2} text={lm === "variable" ? "h" : `${dims.h}`} color={COLOR_GOLD} size={13} />
      )}

      {/* Volume Unknown RevealText */}
      {unknownDim === "V" && (
        <RevealText x={apex.x + 18} y={(apex.y + baseMid.y) / 2 + 8} variable="V" revealedValue={revealedAnswer} color={COLOR_WHITE} fontSize={18} fontWeight="900" />
      )}
    </svg>
  );
}

