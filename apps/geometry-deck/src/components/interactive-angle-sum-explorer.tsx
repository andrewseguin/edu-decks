"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/* ── constants ────────────────────────────────────────────────────────────── */

const SVG_W = 220;
const SVG_H = 160;
const BASE_Y = 140;
const B1_X = 35;   // left base vertex
const B2_X = 185;  // right base vertex
const ARC_R = 18;
const LABEL_R = ARC_R + 14;

const COLOR_A = "#5ee8ff"; // cyan  – angle A (bottom-left)
const COLOR_B = "#ffd45e"; // gold  – angle B (bottom-right)
const COLOR_C = "#fb923c"; // orange – angle C (apex)

const rnd = (n: number) => Math.round(n * 10000) / 10000;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ── geometry helpers ─────────────────────────────────────────────────────── */

function toPoint(cx: number, cy: number, deg: number, len: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: rnd(cx + len * Math.cos(rad)), y: rnd(cy - len * Math.sin(rad)) };
}

function arcSvg(cx: number, cy: number, from: number, to: number, radius: number) {
  const s = toPoint(cx, cy, from, radius);
  const e = toPoint(cx, cy, to, radius);
  const span = ((to - from) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 0 ${e.x} ${e.y}`;
}

/** Clamp apex inside a valid triangle region */
function clampApex(x: number, y: number): { x: number; y: number } {
  const cx = Math.max(B1_X + 20, Math.min(B2_X - 20, x));
  const cy = Math.max(42, Math.min(BASE_Y - 25, y));
  return { x: rnd(cx), y: rnd(cy) };
}

/** Rotate point (px,py) around (ox,oy) by angleDeg degrees (screen coords: CW positive) */
function rotateAround(px: number, py: number, ox: number, oy: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - ox;
  const dy = py - oy;
  return {
    x: rnd(ox + dx * cos - dy * sin),
    y: rnd(oy + dx * sin + dy * cos),
  };
}

/* ── component ────────────────────────────────────────────────────────────── */

export function InteractiveAngleSumExplorer({ color }: { color?: string }) {
  /* ── draggable apex state ──────────────────────────────────────────────── */
  const [apex, setApex] = useState({ x: 105, y: 38 });
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => { ucRef.current = isUserControlling; }, [isUserControlling]);

  /* ── fold animation state ──────────────────────────────────────────────── */
  const [foldProgress, setFoldProgress] = useState(0);
  const [isFolding, setIsFolding] = useState(false);
  const foldAnimRef = useRef<number>(0);

  /* ── idle auto-animation ───────────────────────────────────────────────── */
  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const elapsed = (ts - startTimeRef.current) / 1000;
    const cx = 100, cy = 75;
    const rx = 40, ry = 20;
    const x = cx + rx * Math.cos(elapsed * 0.35);
    const y = cy + ry * Math.sin(elapsed * 0.55);
    setApex(clampApex(x, y));
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isUserControlling && !isFolding) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, isUserControlling, isFolding]);

  /* ── pointer drag on apex ──────────────────────────────────────────────── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isFolding) return;
    e.preventDefault(); e.stopPropagation();
    setIsUserControlling(true); setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vbW = SVG_W + 60, vbH = SVG_H + 20;
    const scX = vbW / rect.width, scY = vbH / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX - 30;
      const py = (ev.clientY - rect.top) * scY - 10;
      setApex(clampApex(px, py));
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [isFolding]);

  /* ── fold button handler ───────────────────────────────────────────────── */
  const handleFold = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (isFolding) return;
    setIsUserControlling(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsFolding(true);

    const FOLD_MS = 2800;
    const HOLD_MS = 3000;
    const UNFOLD_MS = 2200;
    const TOTAL = FOLD_MS + HOLD_MS + UNFOLD_MS;
    const t0 = performance.now();

    const tick = (ts: number) => {
      const elapsed = ts - t0;
      let p: number;
      if (elapsed < FOLD_MS) {
        p = ease(elapsed / FOLD_MS);
      } else if (elapsed < FOLD_MS + HOLD_MS) {
        p = 1;
      } else if (elapsed < TOTAL) {
        p = 1 - ease((elapsed - FOLD_MS - HOLD_MS) / UNFOLD_MS);
      } else {
        p = 0;
        setFoldProgress(0);
        setIsFolding(false);
        return;
      }
      setFoldProgress(p);
      foldAnimRef.current = requestAnimationFrame(tick);
    };
    foldAnimRef.current = requestAnimationFrame(tick);
  }, [isFolding]);

  useEffect(() => {
    return () => { if (foldAnimRef.current) cancelAnimationFrame(foldAnimRef.current); };
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  /* ── derived geometry ──────────────────────────────────────────────────── */
  const { x: apexX, y: apexY } = apex;
  const V1 = { x: B1_X, y: BASE_Y };  // bottom-left
  const V2 = { x: B2_X, y: BASE_Y };  // bottom-right
  const V3 = { x: apexX, y: apexY };  // apex

  // Angles in math coords (y-up)
  const radA = Math.atan2(BASE_Y - apexY, apexX - B1_X);
  const radB = Math.atan2(BASE_Y - apexY, B2_X - apexX);
  const degA = Math.round(radA * 180 / Math.PI);
  const degB = Math.round(radB * 180 / Math.PI);
  const degC = 180 - degA - degB;

  // Edge direction angles for apex arc (in math coords for toPoint: 0=right, CCW positive, y-up)
  const edgeAngleL = rnd(Math.atan2(-(BASE_Y - apexY), B1_X - apexX) * 180 / Math.PI);
  const edgeAngleR = rnd(Math.atan2(-(BASE_Y - apexY), B2_X - apexX) * 180 / Math.PI);

  const lblStyle = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" } as React.CSSProperties;
  const lblFont = "var(--font-heading, system-ui)";

  /* ── fold geometry ─────────────────────────────────────────────────────── */
  const p = foldProgress;

  // Midpoints of the two side edges (fold hinges)
  const ML = { x: rnd((V1.x + V3.x) / 2), y: rnd((V1.y + V3.y) / 2) };
  const MR = { x: rnd((V2.x + V3.x) / 2), y: rnd((V2.y + V3.y) / 2) };

  // Base midpoint (the tear point)
  const BM = { x: rnd((V1.x + V2.x) / 2), y: BASE_Y };

  // Fold: each base corner rotates 180° around the midpoint of its side edge.
  // At p=1: V1 rotates 180° around ML → lands at V3 (since ML is midpoint of V1-V3).
  // We need to find the correct rotation direction.
  // Left side: the edge goes from V1 (bottom-left) up to V3 (apex).
  // To fold the left flap "inward" (over the edge toward the right), we rotate CW in screen coords.
  // The direction that takes V1 to V3: 
  //   V1 is below-left of ML, V3 is above-right of ML.
  //   CW rotation (positive angle in screen coords) sweeps V1 upward.
  // Let's verify: rotate V1 around ML by 180° should give V3.
  // rotateAround(V1.x, V1.y, ML.x, ML.y, 180) should equal (V3.x, V3.y).
  // dx = V1.x - ML.x = V1.x - (V1.x+V3.x)/2 = (V1.x-V3.x)/2
  // After 180° rotation: ox + dx*cos(π) - dy*sin(π) = ML.x - dx = ML.x - (V1.x-V3.x)/2 = (V1.x+V3.x)/2 + (V3.x-V1.x)/2 = V3.x ✓

  const foldAngle = p * 180; // both flaps rotate 180°

  // Left flap vertices: V1 and BM, rotated around ML
  const V1f = rotateAround(V1.x, V1.y, ML.x, ML.y, foldAngle);
  const BMfL = rotateAround(BM.x, BM.y, ML.x, ML.y, foldAngle);

  // Right flap vertices: V2 and BM, rotated around MR
  // For the right side, rotating CW takes V2 upward-left → V3. Let's verify:
  // V2 is bottom-right, MR is midpoint of V2-V3.
  // rotate(V2, MR, 180) → V3. Same logic applies. ✓
  // But we want the right flap to fold inward too, so it should go the OTHER way (CCW).
  // Actually no — CW 180° around MR takes V2 → V3 regardless of direction (180° is half turn).
  // Both CW and CCW by 180° produce the same endpoint. 
  // But the path matters: CW will sweep rightward first (wrong), CCW will sweep leftward (correct for inward fold).
  // For visual coherence: left flap sweeps CW (rightward → upward → leftward), 
  //                        right flap sweeps CCW (leftward → upward → rightward).
  const V2f = rotateAround(V2.x, V2.y, MR.x, MR.y, -foldAngle);
  const BMfR = rotateAround(BM.x, BM.y, MR.x, MR.y, -foldAngle);

  // Flap transparency for depth illusion at mid-fold
  const flapOpacity = rnd(1 - 0.25 * Math.sin(p * Math.PI));

  // ── Arc transforms during fold ──
  // Arc A sits at V1. During fold, V1 moves to V1f and the entire flap rotates by foldAngle around ML.
  // So we need to use SVG group transform: translate to V1f, rotate by foldAngle.
  // But the arc is drawn relative to V1 (centered at 0,0 when we use translate(V1.x, V1.y)).
  // So: translate(V1f.x, V1f.y) rotate(foldAngle)  — but rotation is in SVG screen coords.
  // Arc A at 0,0: arcSvg(0, 0, 0, degA, ARC_R)

  // Arc B at 0,0: arcSvg(0, 0, 180-degB, 180, ARC_R)
  // During fold: translate(V2f.x, V2f.y) rotate(-foldAngle)

  // Arc C stays at V3: arcSvg(0, 0, edgeAngleL, edgeAngleR, ARC_R)

  // ── Label positions during fold ──
  // Unfolded labels
  const labelAUnfolded = { x: B1_X - 8, y: BASE_Y + 3 };
  const labelBUnfolded = { x: B2_X + 8, y: BASE_Y + 3 };
  // Apex label: use EXTERIOR bisector (flip by 180°) so it sits outside the triangle
  const labelCMidInterior = (edgeAngleR + edgeAngleL) / 2;
  const labelCMidExterior = labelCMidInterior + 180;
  const labelCPos = toPoint(apexX, apexY, labelCMidExterior, LABEL_R);

  // Folded label positions — computed from where each arc's bisector points
  // when fully folded, so the three labels fan out around the apex without colliding.
  // When folded:
  //   Arc A (originally 0→degA at V1) rotates +180° → now spans (180)→(180+degA) at V3
  //     bisector direction = 180 + degA/2  (upper-left)
  //   Arc B (originally (180-degB)→180 at V2) rotates -180° → now spans (-degB)→0 at V3
  //     bisector direction = -degB/2  (upper-right)
  //   Arc C stays at apex → bisector = labelCMidInterior (downward)
  const labelAFolded = toPoint(V3.x, V3.y, 180 + degA / 2, LABEL_R + 2);
  const labelBFolded = toPoint(V3.x, V3.y, -degB / 2, LABEL_R + 2);
  // C label target when folded: same exterior bisector direction but from V3
  const labelCFolded = toPoint(V3.x, V3.y, labelCMidInterior, LABEL_R + 2);

  const labelAx = rnd(lerp(labelAUnfolded.x, labelAFolded.x, p));
  const labelAy = rnd(lerp(labelAUnfolded.y, labelAFolded.y, p));
  const labelBx = rnd(lerp(labelBUnfolded.x, labelBFolded.x, p));
  const labelBy = rnd(lerp(labelBUnfolded.y, labelBFolded.y, p));
  // C label lerps from its exterior position to the folded interior position
  const labelCx = rnd(lerp(labelCPos.x, labelCFolded.x, p));
  const labelCy = rnd(lerp(labelCPos.y, labelCFolded.y, p));

  // Straight line at apex when folded
  const lineExtent = 42;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`-30 -10 ${SVG_W + 60} ${SVG_H + 20}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {p < 0.01 ? (
          /* ── Solid triangle (no split lines visible at rest) ──────────── */
          <polygon
            points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${V3.x},${V3.y}`}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ) : (
          /* ── Split pieces: solid original edges, dashed bisecting lines ── */
          <>
            {/* Fills for the three regions (no stroke — lines drawn separately) */}
            <polygon points={`${V3.x},${V3.y} ${ML.x},${ML.y} ${BM.x},${BM.y} ${MR.x},${MR.y}`}
              fill="rgba(255,255,255,0.06)" stroke="none" />
            <polygon points={`${V1f.x},${V1f.y} ${BMfL.x},${BMfL.y} ${ML.x},${ML.y}`}
              fill="rgba(255,255,255,0.06)" stroke="none" opacity={flapOpacity} />
            <polygon points={`${BMfR.x},${BMfR.y} ${V2f.x},${V2f.y} ${MR.x},${MR.y}`}
              fill="rgba(255,255,255,0.06)" stroke="none" opacity={flapOpacity} />

            {/* ── Original triangle edges (SOLID) ─────────────────────── */}
            {/* Left side: V1f → ML (flap half, moves) + ML → V3 (diamond half, stays) */}
            <line x1={V1f.x} y1={V1f.y} x2={ML.x} y2={ML.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" opacity={flapOpacity} />
            <line x1={ML.x} y1={ML.y} x2={V3.x} y2={V3.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" />
            {/* Right side: V3 → MR (diamond half, stays) + MR → V2f (flap half, moves) */}
            <line x1={V3.x} y1={V3.y} x2={MR.x} y2={MR.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" />
            <line x1={MR.x} y1={MR.y} x2={V2f.x} y2={V2f.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" opacity={flapOpacity} />
            {/* Base: V1f → BMfL (left flap) + BMfR → V2f (right flap) */}
            <line x1={V1f.x} y1={V1f.y} x2={BMfL.x} y2={BMfL.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" opacity={flapOpacity} />
            <line x1={BMfR.x} y1={BMfR.y} x2={V2f.x} y2={V2f.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" opacity={flapOpacity} />

            {/* ── Internal bisecting lines (DASHED) ───────────────────── */}
            {/* Left bisect: ML → BM (diamond edge) */}
            <line x1={ML.x} y1={ML.y} x2={BM.x} y2={BM.y}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />
            {/* Right bisect: BM → MR (diamond edge) */}
            <line x1={BM.x} y1={BM.y} x2={MR.x} y2={MR.y}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />
            {/* Left flap bisect: BMfL → ML (moves with flap) */}
            <line x1={BMfL.x} y1={BMfL.y} x2={ML.x} y2={ML.y}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" opacity={flapOpacity} />
            {/* Right flap bisect: MR → BMfR (moves with flap) */}
            <line x1={MR.x} y1={MR.y} x2={BMfR.x} y2={BMfR.y}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" opacity={flapOpacity} />
          </>
        )}

        {/* ── Angle arc A at V1 — moves with left flap ────────────────── */}
        <g transform={`translate(${V1f.x}, ${V1f.y}) rotate(${rnd(foldAngle)})`}>
          <path d={arcSvg(0, 0, 0, degA, ARC_R)} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>

        {/* ── Angle arc B at V2 — moves with right flap ───────────────── */}
        <g transform={`translate(${V2f.x}, ${V2f.y}) rotate(${rnd(-foldAngle)})`}>
          <path d={arcSvg(0, 0, 180 - degB, 180, ARC_R)} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>

        {/* ── Angle arc C at apex — stays put ──────────────────────────── */}
        <g transform={`translate(${V3.x}, ${V3.y})`}>
          <path d={arcSvg(0, 0, edgeAngleL, edgeAngleR, ARC_R)} fill="none" stroke={COLOR_C} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>

        {/* ── Vertex dots ──────────────────────────────────────────────── */}
        <circle cx={V1f.x} cy={V1f.y} r={3} fill="white" opacity={flapOpacity} />
        <circle cx={V2f.x} cy={V2f.y} r={3} fill="white" opacity={flapOpacity} />
        <circle cx={V3.x} cy={V3.y} r={3} fill="white" />

        {/* ── Angle labels ─────────────────────────────────────────────── */}
        <text x={labelAx} y={labelAy} textAnchor="end" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_A} fontFamily={lblFont} style={lblStyle}>{degA}°</text>
        <text x={labelBx} y={labelBy} textAnchor="start" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_B} fontFamily={lblFont} style={lblStyle}>{degB}°</text>
        <text x={labelCx} y={labelCy} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_C} fontFamily={lblFont} style={lblStyle}>{degC}°</text>

        {/* ── Straight-line + 180° arc when folded ──────────────────── */}
        {p > 0.3 && (() => {
          const fadeIn = rnd(Math.min(1, (p - 0.3) / 0.3));
          const arcR = ARC_R + 6; // slightly larger than angle arcs
          // Semicircle arc from 0° to 180° above the apex (math coords: 0=right, 180=left)
          const semiArc = arcSvg(V3.x, V3.y, 0, 180, arcR);
          return (
            <>
              {/* Dashed straight line */}
              <line
                x1={V3.x - lineExtent} y1={V3.y}
                x2={V3.x + lineExtent} y2={V3.y}
                stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} strokeDasharray="4 3"
                opacity={fadeIn}
              />
              {/* White semicircle arc above the line */}
              <path d={semiArc} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"
                opacity={rnd(fadeIn * 0.9)} />
              {/* 180° label above the arc */}
              <text x={V3.x} y={V3.y - arcR - 8} textAnchor="middle" dominantBaseline="central"
                fontSize={12} fontWeight={800} fill="white"
                opacity={fadeIn}
                fontFamily={lblFont} style={lblStyle}>180°</text>
            </>
          );
        })()}

        {/* ── Drag handle on apex (hidden during fold) ─────────────────── */}
        {!isFolding && (
          <>
            <circle cx={apexX} cy={apexY} r={10}
              fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
              style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
              onPointerDown={handlePointerDown} />
            <circle cx={apexX} cy={apexY} r={3} fill="white" className="pointer-events-none" />
          </>
        )}
      </svg>

      {/* ── Equation pills ──────────────────────────────────────────────── */}
      <div className="flex items-end gap-1.5 justify-center px-2">
        <span className="px-2.5 py-1 rounded-md text-sm font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: COLOR_A, border: `1.5px solid ${COLOR_A}90` }}>
          {degA}°
        </span>
        <span className="text-white/50 text-sm font-bold pb-1.5">+</span>
        <span className="px-2.5 py-1 rounded-md text-sm font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: COLOR_B, border: `1.5px solid ${COLOR_B}90` }}>
          {degB}°
        </span>
        <span className="text-white/50 text-sm font-bold pb-1.5">+</span>
        <span className="px-2.5 py-1 rounded-md text-sm font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: COLOR_C, border: `1.5px solid ${COLOR_C}90` }}>
          {degC}°
        </span>
        <span className="text-white/50 text-sm font-bold pb-1.5">=</span>
        <span className="text-white text-base font-bold pb-1">180°</span>
      </div>

      {/* ── Fold button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleFold}
        onPointerDown={stop}
        disabled={isFolding}
        className="mt-0.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
        style={{
          backgroundColor: isFolding ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.35)',
          color: isFolding ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
          border: `1.5px solid ${isFolding ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
          cursor: isFolding ? 'default' : 'pointer',
        }}
      >
        {isFolding ? 'Folding…' : 'Fold corners ▶'}
      </button>
    </div>
  );
}
