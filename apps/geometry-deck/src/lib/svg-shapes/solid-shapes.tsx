"use client";

import React from "react";
import {
  STROKE_W, WHITE50, WHITE70, WHITE90,
  SvgLabel, UnknownPill, DimLine,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// 3D shapes — Isometric cabinet projection
// ─────────────────────────────────────────────────────────────────────────────

/** Isometric rectangular prism using 30° cabinet projection */
export function Prism({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";

  // Cabinet projection: right=30°, scale=0.5 for depth
  // Front face: rectangle, then top face parallelogram, then right face parallelogram
  const W = 90, H = 70, D = 50; // visual dimensions
  const ox = 30, oy = 50; // origin (front-bottom-left)
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  // Corners
  const fl = { x: ox,     y: oy + H }; // front-left-bottom
  const fr = { x: ox + W, y: oy + H }; // front-right-bottom
  const ftl = { x: ox,     y: oy };     // front-left-top
  const ftr = { x: ox + W, y: oy };     // front-right-top
  const bl = { x: ox + dxD,     y: oy + H + dyD }; // back-left-bottom
  const br = { x: ox + W + dxD, y: oy + H + dyD }; // back-right-bottom
  const btl = { x: ox + dxD,     y: oy + dyD };     // back-left-top
  const btr = { x: ox + W + dxD, y: oy + dyD };     // back-right-top

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Hidden edges */}
      <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      {/* Visible edges — front face */}
      <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`} fill="rgba(255,255,255,0.06)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Right face */}
      <polygon points={`${fr.x},${fr.y} ${br.x},${br.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Top face */}
      <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`} fill="rgba(255,255,255,0.10)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* Labels */}
      <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 16} text={lv ? "l" : `l = ${dims.l}`} />
      <SvgLabel x={fr.x + (br.x - fr.x) / 2 + 16} y={(fr.y + ftr.y) / 2 + (br.y - fr.y) / 4} text={lv ? "w" : `w = ${dims.w}`} />
      <SvgLabel x={ftl.x - 18} y={(ftl.y + fl.y) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={110} y={135} />}
    </svg>
  );
}

export function Cylinder({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, topY = 50, botY = 150, cr = 60, ey = 15;

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Bottom ellipse */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Cylinder sides */}
      <line x1={cx - cr} y1={topY} x2={cx - cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={topY} x2={cx + cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Top ellipse */}
      <ellipse cx={cx} cy={topY} rx={cr} ry={ey} fill="rgba(255,255,255,0.10)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Radius line */}
      <line x1={cx} y1={topY} x2={cx + cr} y2={topY} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      {/* Height line */}
      <DimLine x1={cx + cr + 10} y1={topY} x2={cx + cr + 10} y2={botY} />

      <SvgLabel x={cx + cr / 2} y={topY - 14} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      <SvgLabel x={cx + cr + 28} y={(topY + botY) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={(topY + botY) / 2 + 5} />}
    </svg>
  );
}

export function Cone({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, apexY = 35, botY = 155, cr = 65, ey = 14;

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Base ellipse */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Sides */}
      <line x1={cx - cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Apex dot */}
      <circle cx={cx} cy={apexY} r={3} fill={WHITE90} />
      {/* Radius line */}
      <line x1={cx} y1={botY} x2={cx + cr} y2={botY} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      {/* Height line */}
      <DimLine x1={cx + cr + 10} y1={apexY} x2={cx + cr + 10} y2={botY} />

      <SvgLabel x={cx + cr / 2} y={botY + 16} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      <SvgLabel x={cx + cr + 30} y={(apexY + botY) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={(apexY + botY) / 2 + 5} />}
    </svg>
  );
}

export function Sphere({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, cy = 95, cr = 72;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      <circle cx={cx} cy={cy} r={cr} fill="rgba(255,255,255,0.05)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Equator ellipse */}
      <ellipse cx={cx} cy={cy} rx={cr} ry={18} fill="none" stroke={WHITE50} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx + cr * 0.707} y2={cy - cr * 0.707} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={3} fill={WHITE90} />

      <SvgLabel x={cx + cr * 0.5} y={cy - cr * 0.5 - 10} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={cy + cr + 16} />}
      {dims.unknown === "SA" && <UnknownPill x={cx} y={cy + cr + 16} />}
    </svg>
  );
}
