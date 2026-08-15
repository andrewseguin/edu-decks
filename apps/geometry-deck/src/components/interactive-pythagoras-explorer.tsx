"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
const COLOR_C = "#fb923c"; // orange – hypotenuse (c)

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

  // ── Cyan dots: explicit mapping that preserves grid topology ──
  // Source (col, row) → Target (i=col, j=c-1-row)
  // top-left source → top of target, bottom-right → bottom. No crossing.
  for (let row = 0; row < a; row++) {
    for (let col = 0; col < a; col++) {
      const idx = row * a + col;
      const tgt = cPos(col, c - 1 - row);
      dots.push({
        srcX: rnd(OX - aPx + (col + 0.5) * unit),
        srcY: rnd(apexY + (row + 0.5) * unit),
        tgtX: tgt.x, tgtY: tgt.y,
        color: COLOR_A,
        delay: (idx / Math.max(1, totalDots - 1)) * 0.35,
      });
    }
  }

  // ── Gold dots: sort-matched to minimize crossing ──
  const byYX = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    Math.abs(p.y - q.y) > 0.5 ? p.y - q.y : p.x - q.x;

  const goldSrcs: { x: number; y: number }[] = [];
  for (let row = 0; row < b; row++)
    for (let col = 0; col < b; col++)
      goldSrcs.push({ x: rnd(OX + (col + 0.5) * unit), y: rnd(OY + (row + 0.5) * unit) });

  const goldTgts: { x: number; y: number }[] = [];
  for (let j = 0; j < c; j++)
    for (let i = 0; i < c; i++)
      if (!(i < a && j >= c - a)) goldTgts.push(cPos(i, j));

  goldSrcs.sort(byYX);
  goldTgts.sort(byYX);

  for (let idx = 0; idx < goldSrcs.length; idx++) {
    dots.push({
      srcX: goldSrcs[idx].x, srcY: goldSrcs[idx].y,
      tgtX: goldTgts[idx].x, tgtY: goldTgts[idx].y,
      color: COLOR_B,
      delay: ((a * a + idx) / Math.max(1, totalDots - 1)) * 0.35,
    });
  }

  return dots;
}

/* ── component ────────────────────────────────────────────────────────────── */

export function InteractivePythagorasExplorer({ color }: { color?: string }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const triple = PRESETS[presetIdx];
  const { a, b, c, unit } = triple;

  const [phase, setPhase] = useState<"idle" | "grow" | "migrate" | "hold" | "shrink">("idle");
  const [growP, setGrowP] = useState(0);
  const [migrateP, setMigrateP] = useState(0);
  const phaseRef = useRef<number>(0);

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

  // Side labels
  const labelA = { x: O.x - 12, y: (O.y + A.y) / 2 };
  const labelB = { x: (O.x + B.x) / 2, y: O.y + 14 };
  const cMx = (A.x + B.x) / 2, cMy = (A.y + B.y) / 2;
  const labelC = { x: rnd(cMx + (aPx / cPx) * 14), y: rnd(cMy + (-bPx / cPx) * 14) };

  const lblStyle = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" } as React.CSSProperties;
  const lblFont = "var(--font-heading, system-ui)";

  /* ── animation ─────────────────────────────────────────────────────────── */
  const handleShow = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (phase !== "idle") return;

    const GROW = 1500, MIGRATE = 2500, HOLD = 2500, SHRINK = 1200;
    const t0 = performance.now();

    const tick = (ts: number) => {
      const el = ts - t0;
      if (el < GROW) {
        setPhase("grow");
        setGrowP(ease(el / GROW));
        setMigrateP(0);
      } else if (el < GROW + MIGRATE) {
        setPhase("migrate");
        setGrowP(1);
        setMigrateP(ease((el - GROW) / MIGRATE));
      } else if (el < GROW + MIGRATE + HOLD) {
        setPhase("hold");
        setGrowP(1);
        setMigrateP(1);
      } else if (el < GROW + MIGRATE + HOLD + SHRINK) {
        setPhase("shrink");
        const t = ease((el - GROW - MIGRATE - HOLD) / SHRINK);
        setGrowP(1 - t);
        setMigrateP(1 - t);
      } else {
        setPhase("idle");
        setGrowP(0);
        setMigrateP(0);
        return;
      }
      phaseRef.current = requestAnimationFrame(tick);
    };
    phaseRef.current = requestAnimationFrame(tick);
  }, [phase]);

  useEffect(() => {
    return () => { if (phaseRef.current) cancelAnimationFrame(phaseRef.current); };
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const aSq = a * a, bSq = b * b, cSq = c * c;
  const mp = migrateP;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>

      <svg viewBox="10 -15 200 210"
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none">

        {/* ── Area squares ────────────────────────────────────────────── */}
        {gp > 0.01 && (
          <>
            <polygon points={sqA} fill={`${COLOR_A}15`} stroke={COLOR_A}
              strokeWidth={1.5} opacity={rnd(gp * 0.85)} />
            <polygon points={sqB} fill={`${COLOR_B}15`} stroke={COLOR_B}
              strokeWidth={1.5} opacity={rnd(gp * 0.85)} />
            <polygon points={sqC} fill={`${COLOR_C}10`} stroke={COLOR_C}
              strokeWidth={1.5} opacity={rnd(gp * 0.85)} />
          </>
        )}

        {/* ── Unit squares ──────────────────────────────────────────── */}
        {gp > 0.8 && dots.map((dot, i) => {
          const dotMp = clamp01((mp - dot.delay) / (1 - 0.35));
          // Phase 1: rotate in place (0–20%), Phase 2: translate (20–100%)
          const transP = ease(clamp01((dotMp - 0.2) / 0.8));
          const cx = rnd(lerp(dot.srcX, dot.tgtX, transP));
          const cy = rnd(lerp(dot.srcY, dot.tgtY, transP));
          const rotP = ease(clamp01(dotMp / 0.2));
          const rot = rnd(lerp(0, cAngleDeg, rotP));
          const opacity = rnd(Math.min(1, (gp - 0.8) * 5));
          const hs = cellSize / 2;
          return (
            <rect key={i}
              x={-hs} y={-hs} width={cellSize} height={cellSize} rx={1}
              fill={dot.color} fillOpacity={0.65} opacity={opacity}
              stroke={dot.color} strokeWidth={0.5} strokeOpacity={0.3}
              transform={`translate(${cx},${cy}) rotate(${rot})`}
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

        {/* ── Side labels ───────────────────────────────────────────── */}
        <text x={labelA.x} y={labelA.y} textAnchor="end" dominantBaseline="central"
          fontSize={14} fontWeight={800} fill={COLOR_A} fontFamily={lblFont} style={lblStyle}>{a}</text>
        <text x={labelB.x} y={labelB.y} textAnchor="middle" dominantBaseline="hanging"
          fontSize={14} fontWeight={800} fill={COLOR_B} fontFamily={lblFont} style={lblStyle}>{b}</text>
        <text x={labelC.x} y={labelC.y} textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={800} fill={COLOR_C} fontFamily={lblFont} style={lblStyle}>{c}</text>
      </svg>

      {/* ── Equation ──────────────────────────────────────────────────────── */}
      <div className="flex justify-center my-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: COLOR_A }}>{a}²</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_B }}>{b}²</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_C }}>{c}²</span>
        </div>
      </div>

      {/* ── Presets ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 justify-center my-0.5">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (phase === "idle") setPresetIdx(i);
            }}
            disabled={phase !== "idle"}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all border ${
              i === presetIdx
                ? "bg-white/25 text-white border-white/60 shadow-sm"
                : "bg-black/25 text-white/70 border-white/15 hover:bg-white/10 hover:text-white"
            }`}
          >
            {p.a}, {p.b}, {p.c}
          </button>
        ))}
      </div>

      {/* ── Show proof button ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleShow}
        onPointerDown={stop}
        disabled={phase !== "idle"}
        className="mt-1 px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm disabled:opacity-50 disabled:cursor-default"
      >
        {phase !== "idle" ? "Showing…" : "Show proof ▶"}
      </button>
    </div>
  );
}
