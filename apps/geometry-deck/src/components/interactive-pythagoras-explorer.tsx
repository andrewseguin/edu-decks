"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@decks/core";

/* ── types & constants ────────────────────────────────────────────────────── */

type Triple = { a: number; b: number; c: number; unit: number };

const PRESETS: Triple[] = [
  { a: 3, b: 4, c: 5, unit: 18 },
  { a: 5, b: 12, c: 13, unit: 6 },
  { a: 8, b: 15, c: 17, unit: 5 },
];

const OX = 75, OY = 115; // right-angle vertex (fixed)

const COLOR_A = "#5ee8ff"; // cyan  – vertical leg (a)
const COLOR_B = "#ffd45e"; // gold  – base (b)
const COLOR_C = "#fb7185"; // rose – hypotenuse (c)

const rnd = (n: number) => Math.round(n * 10000) / 10000;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ── dot layout builder ───────────────────────────────────────────────────── */

type DotInfo = {
  srcX: number; srcY: number;
  tgtX: number; tgtY: number;
  color: string;
  delay: number;
  tileStartGp: number;
  tileFullGp: number;
  side: "a" | "b";
};

function buildDots(t: Triple): DotInfo[] {
  const { a, b, c, unit } = t;
  const aPx = a * unit, bPx = b * unit;
  const apexY = OY - aPx;
  const dots: DotInfo[] = [];
  const totalDots = a * a + b * b;

  // Helper: c² grid position at cell (i along hypotenuse, j along perpendicular)
  const cPos = (i: number, j: number) => ({
    x: rnd(OX + bPx * (i + 0.5) / c + aPx * (j + 0.5) / c),
    y: rnd(apexY + aPx * (i + 0.5) / c + (-bPx) * (j + 0.5) / c),
  });

  // ── Cyan dots: side a extrudes outward leftward from vertical leg ──
  for (let row = 0; row < a; row++) {
    for (let col = 0; col < a; col++) {
      const idx = row * a + col;
      const tgt = cPos(col, c - 1 - row);
      // col 0 is leftmost, col a-1 is rightmost (closest to leg x=OX)
      // Outline passes from leg outward to left.
      // We trigger tile emergence AFTER the outline has passed the outer edge of this column:
      const tileStartGp = (a - col) / (a + 0.5);
      const tileFullGp = Math.min(1, tileStartGp + 0.18);
      dots.push({
        srcX: rnd(OX - aPx + (col + 0.5) * unit),
        srcY: rnd(apexY + (row + 0.5) * unit),
        tgtX: tgt.x, tgtY: tgt.y,
        color: COLOR_A,
        delay: (idx / Math.max(1, totalDots - 1)) * 0.35,
        tileStartGp,
        tileFullGp,
        side: "a",
      });
    }
  }

  // ── Gold dots: side b extrudes outward downward from base leg ──
  const byYX = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    Math.abs(p.y - q.y) > 0.5 ? p.y - q.y : p.x - q.x;

  const goldSrcs: { x: number; y: number; row: number; col: number }[] = [];
  for (let row = 0; row < b; row++)
    for (let col = 0; col < b; col++)
      goldSrcs.push({ x: rnd(OX + (col + 0.5) * unit), y: rnd(OY + (row + 0.5) * unit), row, col });

  const goldTgts: { x: number; y: number }[] = [];
  for (let j = 0; j < c; j++)
    for (let i = 0; i < c; i++)
      if (!(i < a && j >= c - a)) goldTgts.push(cPos(i, j));

  goldSrcs.sort(byYX);
  goldTgts.sort(byYX);

  for (let idx = 0; idx < goldSrcs.length; idx++) {
    const src = goldSrcs[idx];
    // Outline sweeps downward.
    // Trigger tile emergence AFTER the outline has passed the bottom of this row:
    const tileStartGp = (src.row + 1) / (b + 0.5);
    const tileFullGp = Math.min(1, tileStartGp + 0.18);
    dots.push({
      srcX: src.x, srcY: src.y,
      tgtX: goldTgts[idx].x, tgtY: goldTgts[idx].y,
      color: COLOR_B,
      delay: ((a * a + idx) / Math.max(1, totalDots - 1)) * 0.35,
      tileStartGp,
      tileFullGp,
      side: "b",
    });
  }

  return dots;
}

const STEPS = [
  { step: 1, label: "1. Triangle" },
  { step: 2, label: "2. Squares" },
  { step: 3, label: "3. Combined" },
];

/* ── component ────────────────────────────────────────────────────────────── */

export function InteractivePythagorasExplorer({ color }: { color?: string }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const triple = PRESETS[presetIdx];
  const { a, b, c, unit } = triple;

  const [activeStep, setActiveStep] = useState<number>(1);
  const [growP, setGrowP] = useState(0);
  const [migrateP, setMigrateP] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  const dots = useMemo(() => buildDots(triple), [triple]);

  /* ── derived geometry ──────────────────────────────────────────────────── */
  const aPx = a * unit, bPx = b * unit, cPx = c * unit;

  // Rotation angle of the c² grid (hypotenuse tilt), and gap between unit squares
  const cAngleDeg = rnd(Math.atan2(a, b) * (180 / Math.PI));
  const cellGap = unit >= 10 ? 2.5 : 1.2;
  const cellSize = unit - cellGap;
  const apexY = OY - aPx;
  const BX = OX + bPx;

  const O = { x: OX, y: OY };
  const A = { x: OX, y: apexY };
  const B = { x: BX, y: OY };

  const m = 8;
  const marker = `M ${O.x + m} ${O.y} L ${O.x + m} ${O.y - m} L ${O.x} ${O.y - m}`;

  const gp = growP;
  const offX = rnd(aPx * gp), offY = rnd(-bPx * gp);

  // Square polygons
  const sqA = `${O.x},${O.y} ${A.x},${A.y} ${rnd(A.x - aPx * gp)},${A.y} ${rnd(O.x - aPx * gp)},${O.y}`;
  const sqB = `${O.x},${O.y} ${B.x},${B.y} ${B.x},${rnd(B.y + bPx * gp)} ${O.x},${rnd(O.y + bPx * gp)}`;
  const sqC = `${A.x},${A.y} ${B.x},${B.y} ${rnd(B.x + offX)},${rnd(B.y + offY)} ${rnd(A.x + offX)},${rnd(A.y + offY)}`;

  // Side labels (standardized 14px outward distance)
  const labelA = { x: O.x - 14, y: (O.y + A.y) / 2 };
  const labelB = { x: (O.x + B.x) / 2, y: O.y + 14 };
  const cMx = (A.x + B.x) / 2, cMy = (A.y + B.y) / 2;
  const labelC = { x: rnd(cMx + (aPx / cPx) * 14), y: rnd(cMy + (-bPx / cPx) * 14) };

  const lblStyle = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" } as React.CSSProperties;
  const lblAreaStyle = { filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.95))" } as React.CSSProperties;
  const lblFont = "var(--font-heading, system-ui)";

  /* ── step animation transitions ────────────────────────────────────────── */
  const transitionTo = useCallback((targetGrow: number, targetMigrate: number, targetStep: number, duration = 1000) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAutoPlaying(false);
    setActiveStep(targetStep);

    const startG = growP;
    const startM = migrateP;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      const eased = ease(t);
      setGrowP(startG + (targetGrow - startG) * eased);
      setMigrateP(startM + (targetMigrate - startM) * eased);

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setGrowP(targetGrow);
        setMigrateP(targetMigrate);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [growP, migrateP]);

  const handleStepClick = (stepNum: number) => {
    if (stepNum === 1) {
      transitionTo(0, 0, 1, 900);
    } else if (stepNum === 2) {
      transitionTo(1, 0, 2, 1200);
    } else if (stepNum === 3) {
      transitionTo(1, 1, 3, 3000);
    }
  };

  /* ── auto replay sequence ──────────────────────────────────────────────── */
  const handleReplay = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAutoPlaying(true);
    setActiveStep(1);
    setGrowP(0);
    setMigrateP(0);

    const GROW_TIME = 1800;
    const PAUSE = 700;
    const MIGRATE_TIME = 4200;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < GROW_TIME) {
        setActiveStep(2);
        setGrowP(ease(elapsed / GROW_TIME));
        setMigrateP(0);
      } else if (elapsed < GROW_TIME + PAUSE) {
        setGrowP(1);
        setMigrateP(0);
      } else if (elapsed < GROW_TIME + PAUSE + MIGRATE_TIME) {
        setActiveStep(3);
        setGrowP(1);
        setMigrateP(ease((elapsed - GROW_TIME - PAUSE) / MIGRATE_TIME));
      } else {
        setGrowP(1);
        setMigrateP(1);
        setActiveStep(3);
        setIsAutoPlaying(false);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const aSq = a * a, bSq = b * b, cSq = c * c;
  const mp = migrateP;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>

      <svg viewBox="10 -15 200 210"
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none">

        {/* ── Area squares (Dark frosted backing for contrast) ───────── */}
        {gp > 0.01 && (
          <>
            <polygon
              points={sqA}
              fill="rgba(0, 0, 0, 0.45)"
              stroke={COLOR_A}
              strokeWidth={1.5}
              opacity={rnd(gp * 0.95)}
            />
            <polygon
              points={sqB}
              fill="rgba(0, 0, 0, 0.45)"
              stroke={COLOR_B}
              strokeWidth={1.5}
              opacity={rnd(gp * 0.95)}
            />
            <polygon
              points={sqC}
              fill="rgba(0, 0, 0, 0.45)"
              stroke={COLOR_C}
              strokeWidth={1.5}
              opacity={rnd(gp * 0.95)}
            />
          </>
        )}

        {/* ── 1D Unit ticks along sides a & b ────────────────────────── */}
        {gp > 0.02 && (
          <g opacity={rnd(Math.min(1, gp * 2.5))}>
            {Array.from({ length: a - 1 }).map((_, k) => {
              const y = apexY + (k + 1) * unit;
              return (
                <line
                  key={`tick-a-${k}`}
                  x1={OX - 3}
                  y1={y}
                  x2={OX + 3}
                  y2={y}
                  stroke={COLOR_A}
                  strokeWidth={1.5}
                />
              );
            })}
            {Array.from({ length: b - 1 }).map((_, k) => {
              const x = OX + (k + 1) * unit;
              return (
                <line
                  key={`tick-b-${k}`}
                  x1={x}
                  y1={OY - 3}
                  x2={x}
                  y2={OY + 3}
                  stroke={COLOR_B}
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        )}

        {/* ── Unit squares (1D length -> 2D area extrusion strictly behind outline) ─── */}
        {gp > 0.01 && dots.map((dot, i) => {
          // If outline has not reached tile yet, do not render
          if (gp < dot.tileStartGp) return null;

          // Extrusion progress during Step 2: grows as outline sweeps across this tile
          const extrudeSpan = Math.max(0.01, dot.tileFullGp - dot.tileStartGp);
          const extrudeProgress = clamp01((gp - dot.tileStartGp) / extrudeSpan);
          const extrudeScale = ease(extrudeProgress);

          // Migration progress during Step 3: glides into square c
          const dotMp = clamp01((mp - dot.delay) / (1 - 0.4));
          const transP = ease(dotMp);
          const cx = rnd(lerp(dot.srcX, dot.tgtX, transP));
          const cy = rnd(lerp(dot.srcY, dot.tgtY, transP));
          const rotP = ease(dotMp);
          const rot = rnd(lerp(0, cAngleDeg, rotP));

          const opacity = rnd(extrudeScale * 0.95);
          const hs = cellSize / 2;

          if (extrudeScale <= 0.01) return null;

          return (
            <rect
              key={i}
              x={-hs}
              y={-hs}
              width={cellSize}
              height={cellSize}
              rx={1}
              fill={dot.color}
              fillOpacity={0.7}
              opacity={opacity}
              stroke={dot.color}
              strokeWidth={0.5}
              strokeOpacity={0.3}
              transform={`translate(${cx},${cy}) rotate(${rot}) scale(${extrudeScale})`}
            />
          );
        })}

        {/* ── Triangle ────────────────────────────────────────────────── */}
        <polygon points={`${O.x},${O.y} ${A.x},${A.y} ${B.x},${B.y}`}
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.9)"
          strokeWidth={2} strokeLinejoin="round" />

        <path d={marker} fill="none" stroke="white" strokeWidth={1.5} />

        <circle cx={O.x} cy={O.y} r={3} fill="white" />
        <circle cx={A.x} cy={A.y} r={3} fill="white" />
        <circle cx={B.x} cy={B.y} r={3} fill="white" />

        {/* ── Side & Area labels ───────────────────────────────────────── */}
        <text
          x={labelA.x}
          y={labelA.y}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={800}
          fill={COLOR_A}
          fontFamily={lblFont}
          style={lblStyle}
          opacity={gp > 0.5 ? 0 : 1}
        >
          {a}
        </text>
        <text
          x={labelB.x}
          y={labelB.y}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={14}
          fontWeight={800}
          fill={COLOR_B}
          fontFamily={lblFont}
          style={lblStyle}
          opacity={gp > 0.5 ? 0 : 1}
        >
          {b}
        </text>
        <text
          x={labelC.x}
          y={labelC.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={800}
          fill={COLOR_C}
          fontFamily={lblFont}
          style={lblStyle}
          opacity={gp > 0.5 ? 0 : 1}
        >
          {c}
        </text>

        {/* ── Exponent Area Labels (3² = 9, 4² = 16, 5² = 25) ────────────── */}
        {gp > 0.85 && (
          <>
            {/* Square a Area Label */}
            <text
              x={rnd(O.x - (aPx * gp) / 2)}
              y={rnd((O.y + A.y) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={presetIdx === 0 ? 12 : 10}
              fontWeight={900}
              fill={COLOR_A}
              fontFamily={lblFont}
              style={lblAreaStyle}
              opacity={rnd(Math.min(1, (gp - 0.85) * 6.6))}
            >
              {a}² = {aSq}
            </text>

            {/* Square b Area Label */}
            <text
              x={rnd((O.x + B.x) / 2)}
              y={rnd(O.y + (bPx * gp) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={presetIdx === 0 ? 12 : 10}
              fontWeight={900}
              fill={COLOR_B}
              fontFamily={lblFont}
              style={lblAreaStyle}
              opacity={rnd(Math.min(1, (gp - 0.85) * 6.6))}
            >
              {b}² = {bSq}
            </text>

            {/* Square c Area Label */}
            <text
              x={rnd(cMx + (offX * 0.5))}
              y={rnd(cMy + (offY * 0.5))}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={presetIdx === 0 ? 12 : 10}
              fontWeight={900}
              fill={COLOR_C}
              fontFamily={lblFont}
              style={lblAreaStyle}
              transform={`rotate(${cAngleDeg}, ${rnd(cMx + offX * 0.5)}, ${rnd(cMy + offY * 0.5)})`}
              opacity={rnd(Math.min(1, (gp - 0.85) * 6.6))}
            >
              {c}² = {cSq}
            </text>
          </>
        )}
      </svg>

      {/* ── Live Equation (Morphs to 9 + 16 = 25 during proof) ─────────── */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none transition-all duration-300">
          {mp > 0.3 ? (
            <>
              <span style={{ color: COLOR_A }}>{aSq}</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_B }}>{bSq}</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_C }}>{cSq}</span>
            </>
          ) : (
            <>
              <span style={{ color: COLOR_A }}>{a}²</span>
              <span className="text-white/50">+</span>
              <span style={{ color: COLOR_B }}>{b}²</span>
              <span className="text-white/50">=</span>
              <span style={{ color: COLOR_C }}>{c}²</span>
            </>
          )}
        </div>
      </div>

      {/* ── Step Controls (1. Triangle -> 2. Squares -> 3. Combined) ───── */}
      <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        {STEPS.map((s) => (
          <button
            key={`step-btn-${s.step}`}
            type="button"
            onClick={() => handleStepClick(s.step)}
            className={cn(
              "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none",
              activeStep === s.step
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {s.label}
          </button>
        ))}
        <div className="w-px h-3 bg-white/20 mx-0.5" />
        <button
          type="button"
          onClick={handleReplay}
          title="Replay full animation"
          className={cn(
            "p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all active:scale-95 cursor-pointer border-none",
            isAutoPlaying && "animate-spin text-white"
          )}
        >
          <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        </button>
      </div>

      {/* ── Triple Presets ────────────────────────────────────────────── */}
      <div className="flex gap-1.5 justify-center mt-0.5">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPresetIdx(i);
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all border-none ${
              i === presetIdx
                ? "bg-white/20 text-white shadow-none"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
          >
            {p.a}, {p.b}, {p.c}
          </button>
        ))}
      </div>
    </div>
  );
}
