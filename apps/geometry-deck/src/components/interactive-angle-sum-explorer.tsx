"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@decks/core";

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
const COLOR_C = "#ffa756"; // orange – angle C (apex)

const rnd = (n: number) => Math.round(n * 10000) / 10000;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const STEPS = [
  { step: 1, label: "1. Triangle" },
  { step: 2, label: "2. Folded" },
];

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

function clampApex(x: number, y: number): { x: number; y: number } {
  const cx = Math.max(B1_X + 20, Math.min(B2_X - 20, x));
  const cy = Math.max(42, Math.min(BASE_Y - 25, y));
  return { x: rnd(cx), y: rnd(cy) };
}

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
  const [apex, setApex] = useState({ x: 105, y: 38 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  /* ── step animation state ──────────────────────────────────────────────── */
  const [activeStep, setActiveStep] = useState<number>(1);
  const [foldProgress, setFoldProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const foldAnimRef = useRef<number>(0);

  /* ── pointer drag on apex ──────────────────────────────────────────────── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (activeStep === 2 || foldProgress > 0.05) return;
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
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
  }, [activeStep, foldProgress]);

  /* ── step animation transitions ────────────────────────────────────────── */
  const transitionTo = useCallback((targetP: number, targetStep: number, duration = 800) => {
    if (foldAnimRef.current) cancelAnimationFrame(foldAnimRef.current);
    setIsAutoPlaying(false);
    setActiveStep(targetStep);

    const startP = foldProgress;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      const eased = ease(t);
      const p = startP + (targetP - startP) * eased;
      setFoldProgress(p);

      if (t < 1) {
        foldAnimRef.current = requestAnimationFrame(tick);
      } else {
        setFoldProgress(targetP);
      }
    };
    foldAnimRef.current = requestAnimationFrame(tick);
  }, [foldProgress]);

  const handleStepClick = (stepNum: number) => {
    if (stepNum === 1) {
      transitionTo(0, 1, 1800);
    } else if (stepNum === 2) {
      transitionTo(1, 2, 2600);
    }
  };

  /* ── auto replay sequence ──────────────────────────────────────────────── */
  const handleReplay = useCallback(() => {
    if (foldAnimRef.current) cancelAnimationFrame(foldAnimRef.current);
    setIsAutoPlaying(true);
    setActiveStep(1);
    setFoldProgress(0);

    const PAUSE_MS = 250;
    const FOLD_MS = 2800;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < PAUSE_MS) {
        setFoldProgress(0);
        setActiveStep(1);
      } else if (elapsed < PAUSE_MS + FOLD_MS) {
        setActiveStep(2);
        setFoldProgress(ease((elapsed - PAUSE_MS) / FOLD_MS));
      } else {
        setFoldProgress(1);
        setActiveStep(2);
        setIsAutoPlaying(false);
        return;
      }
      foldAnimRef.current = requestAnimationFrame(tick);
    };
    foldAnimRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (foldAnimRef.current) cancelAnimationFrame(foldAnimRef.current);
    };
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  /* ── derived geometry ──────────────────────────────────────────────────── */
  const { x: apexX, y: apexY } = apex;
  const V1 = { x: B1_X, y: BASE_Y };
  const V2 = { x: B2_X, y: BASE_Y };
  const V3 = { x: apexX, y: apexY };

  const radA = Math.atan2(BASE_Y - apexY, apexX - B1_X);
  const radB = Math.atan2(BASE_Y - apexY, B2_X - apexX);
  const degA = Math.round(radA * 180 / Math.PI);
  const degB = Math.round(radB * 180 / Math.PI);
  const degC = 180 - degA - degB;

  const edgeAngleL = rnd(Math.atan2(-(BASE_Y - apexY), B1_X - apexX) * 180 / Math.PI);
  const edgeAngleR = rnd(Math.atan2(-(BASE_Y - apexY), B2_X - apexX) * 180 / Math.PI);

  const lblStyle = { filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" } as React.CSSProperties;
  const lblFont = "var(--font-heading, system-ui)";

  const p = foldProgress;
  const ML = { x: rnd((V1.x + V3.x) / 2), y: rnd((V1.y + V3.y) / 2) };
  const MR = { x: rnd((V2.x + V3.x) / 2), y: rnd((V2.y + V3.y) / 2) };
  const BM = { x: rnd((V1.x + V2.x) / 2), y: BASE_Y };

  const foldAngle = p * 180;
  const V1f = rotateAround(V1.x, V1.y, ML.x, ML.y, foldAngle);
  const BMfL = rotateAround(BM.x, BM.y, ML.x, ML.y, foldAngle);
  const V2f = rotateAround(V2.x, V2.y, MR.x, MR.y, -foldAngle);
  const BMfR = rotateAround(BM.x, BM.y, MR.x, MR.y, -foldAngle);

  const flapOpacity = rnd(Math.max(0.2, 1 - p * 0.15));

  const baseAngleA_math = Math.atan2(0, 1) * 180 / Math.PI;
  const edgeAngleA_math = Math.atan2(BASE_Y - apexY, apexX - B1_X) * 180 / Math.PI;
  const curRotA = foldAngle;
  const fromA = baseAngleA_math - curRotA;
  const toA = edgeAngleA_math - curRotA;

  const edgeAngleB_math = Math.atan2(BASE_Y - apexY, apexX - B2_X) * 180 / Math.PI;
  const baseAngleB_math = 180;
  const curRotB = -foldAngle;
  const fromB = edgeAngleB_math - curRotB;
  const toB = baseAngleB_math - curRotB;

  const labelDist = 28;
  const labelAx = p < 0.1 ? B1_X - 10 : rnd(V3.x + (LABEL_R + 8) * Math.cos((180 + degA / 2) * Math.PI / 180));
  const labelAy = p < 0.1 ? BASE_Y + 10 : rnd(V3.y - (LABEL_R + 8) * Math.sin((180 + degA / 2) * Math.PI / 180));
  const labelBx = p < 0.1 ? B2_X + 10 : rnd(V3.x + (LABEL_R + 8) * Math.cos((-degB / 2) * Math.PI / 180));
  const labelBy = p < 0.1 ? BASE_Y + 10 : rnd(V3.y - (LABEL_R + 8) * Math.sin((-degB / 2) * Math.PI / 180));
  const labelCx = rnd(V3.x + (LABEL_R + 2) * Math.cos(((edgeAngleL + edgeAngleR) / 2 + 180 * (1 - p)) * Math.PI / 180));
  const labelCy = rnd(V3.y - (LABEL_R + 2) * Math.sin(((edgeAngleL + edgeAngleR) / 2 + 180 * (1 - p)) * Math.PI / 180));

  const lineExtent = 75;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox="-30 -10 280 180"
        className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        <polygon
          points={`${ML.x},${ML.y} ${V3.x},${V3.y} ${MR.x},${MR.y} ${BM.x},${BM.y}`}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <polygon
          points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${V3.x},${V3.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <polygon
          points={`${ML.x},${ML.y} ${V1f.x},${V1f.y} ${BMfL.x},${BMfL.y}`}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          opacity={flapOpacity}
        />
        <polygon
          points={`${MR.x},${MR.y} ${V2f.x},${V2f.y} ${BMfR.x},${BMfR.y}`}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          opacity={flapOpacity}
        />
        <line x1={ML.x} y1={ML.y} x2={BM.x} y2={BM.y}
          stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 2" />
        <line x1={MR.x} y1={MR.y} x2={BM.x} y2={BM.y}
          stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 2" />

        <g transform={`translate(${V1f.x}, ${V1f.y}) rotate(${foldAngle})`}>
          <path d={arcSvg(0, 0, 0, degA, ARC_R)} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>
        <g transform={`translate(${V2f.x}, ${V2f.y}) rotate(${-foldAngle})`}>
          <path d={arcSvg(0, 0, 180 - degB, 180, ARC_R)} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>
        <g transform={`translate(${V3.x}, ${V3.y})`}>
          <path d={arcSvg(0, 0, edgeAngleL, edgeAngleR, ARC_R)} fill="none" stroke={COLOR_C} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
        </g>

        <circle cx={V1f.x} cy={V1f.y} r={2.5} fill="white" opacity={flapOpacity} />
        <circle cx={V2f.x} cy={V2f.y} r={2.5} fill="white" opacity={flapOpacity} />
        <circle cx={V3.x} cy={V3.y} r={2.5} fill="white" />

        <text x={labelAx} y={labelAy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={COLOR_A} fontFamily={lblFont} style={lblStyle}>{degA}°</text>
        <text x={labelBx} y={labelBy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={COLOR_B} fontFamily={lblFont} style={lblStyle}>{degB}°</text>
        <text x={labelCx} y={labelCy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={COLOR_C} fontFamily={lblFont} style={lblStyle}>{degC}°</text>

        {p > 0.3 && (() => {
          const fadeIn = rnd(Math.min(1, (p - 0.3) / 0.3));
          const arcR = ARC_R + 6;
          return (
            <>
              <line x1={V3.x - lineExtent} y1={V3.y} x2={V3.x + lineExtent} y2={V3.y} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} strokeDasharray="4 3" opacity={fadeIn} />
              <path d={arcSvg(V3.x, V3.y, 0, 180, arcR)} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" opacity={rnd(fadeIn * 0.9)} />
              <text x={V3.x} y={V3.y - arcR - 8} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill="white" opacity={fadeIn} fontFamily={lblFont} style={lblStyle}>180°</text>
            </>
          );
        })()}

        {p < 0.1 && (
          <>
            <circle cx={apexX} cy={apexY} r={10} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }} onPointerDown={handlePointerDown} />
            <circle cx={apexX} cy={apexY} r={3} fill="white" className="pointer-events-none" />
          </>
        )}
      </svg>

      {/* ── Live equation ──────────────────────────────────────────────── */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: COLOR_A }}>{degA}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_B }}>{degB}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_C }}>{degC}°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">180°</span>
        </div>
      </div>

      {/* ── Step Controls (1. Triangle -> 2. Folded) ─────────────────── */}
      <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 bg-white/10 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30 shadow-sm pointer-events-auto z-30 select-none">
        {STEPS.map((s) => (
          <button
            key={`step-btn-${s.step}`}
            type="button"
            onClick={() => handleStepClick(s.step)}
            className={cn(
              "px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border",
              activeStep === s.step
                ? "bg-white/25 text-white border-white/60 shadow-sm"
                : "bg-transparent text-white/80 border-transparent hover:text-white hover:bg-white/15"
            )}
          >
            {s.label}
          </button>
        ))}
        <div className="w-px h-3 bg-white/25 mx-0.5" />
        <button
          type="button"
          onClick={handleReplay}
          title="Replay fold animation"
          className={cn(
            "p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer",
            isAutoPlaying && "animate-spin text-white"
          )}
        >
          <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}
