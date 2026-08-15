"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type InteractiveRightTriangleExplorerProps = {
  color?: string;
};

const CX = 110;
const CY = 118;
const R = 68;
const B1_X = CX - R; // left base vertex
const B2_X = CX + R; // right base vertex
const BASE_Y = CY;
const ARC_R = 20;
const SVG_W = 220;
const SVG_H = 150;

/** Round to 4dp to avoid SSR/client floating-point hydration mismatches */
const rnd = (n: number) => Math.round(n * 10000) / 10000;

function toPoint(cx: number, cy: number, deg: number, len: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: rnd(cx + len * Math.cos(rad)), y: rnd(cy - len * Math.sin(rad)) };
}

function arcSvg(cx: number, cy: number, from: number, to: number, radius: number) {
  const s = toPoint(cx, cy, from, radius);
  const e = toPoint(cx, cy, to, radius);
  const span = to - from;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function InteractiveRightTriangleExplorer({ color }: InteractiveRightTriangleExplorerProps) {
  const sweepMin = 15;
  const sweepMax = 75;

  const [angA, setAngA] = useState(53);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => { ucRef.current = isUserControlling; }, [isUserControlling]);

  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.25) + 1) / 2;
    setAngA(Math.round(sweepMin + t * (sweepMax - sweepMin)));
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, isUserControlling]);

  // Drag handler on apex
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsUserControlling(true); setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width, scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;
      // Compute angle from B1 to the pointer (math coords: y-up)
      const dx = px - B1_X;
      const dy = -(py - BASE_Y);
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      angle = Math.max(sweepMin, Math.min(sweepMax, Math.round(angle)));
      setAngA(angle);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserControlling) { setIsUserControlling(true); cancelAnimationFrame(animRef.current); }
    setAngA(Number(e.target.value));
  }, [isUserControlling]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const angB = 90 - angA;

  // Apex on semicircle via Thales' theorem: inscribed angle in semicircle = 90°
  const phi = (2 * angA * Math.PI) / 180;
  const apexX = rnd(CX + R * Math.cos(phi));
  const apexY = rnd(CY - R * Math.sin(phi));

  // Right-angle marker at apex (edge-aligned)
  const mSize = 10;
  const lenToB1 = Math.hypot(B1_X - apexX, BASE_Y - apexY);
  const lenToB2 = Math.hypot(B2_X - apexX, BASE_Y - apexY);
  const u1x = ((B1_X - apexX) / lenToB1) * mSize;
  const u1y = ((BASE_Y - apexY) / lenToB1) * mSize;
  const u2x = ((B2_X - apexX) / lenToB2) * mSize;
  const u2y = ((BASE_Y - apexY) / lenToB2) * mSize;
  const markerPath = `M ${rnd(apexX + u1x)} ${rnd(apexY + u1y)} L ${rnd(apexX + u1x + u2x)} ${rnd(apexY + u1y + u2y)} L ${rnd(apexX + u2x)} ${rnd(apexY + u2y)}`;

  // Angle arcs
  const arcAPath = arcSvg(B1_X, BASE_Y, 0, angA, ARC_R);
  const arcBPath = arcSvg(B2_X, BASE_Y, 90 + angA, 180, ARC_R);

  // Angle label positions — along bisector, pushed outward past the arc
  const labelAPos = toPoint(B1_X, BASE_Y, angA / 2, ARC_R + 14);
  const labelBPos = toPoint(B2_X, BASE_Y, 90 + angA + angB / 2, ARC_R + 14);

  const COLOR_A = "#5ee8ff"; // cyan
  const COLOR_B = "#ffd45e"; // yellow

  // Faint semicircle showing the Thales locus
  const semiArcPath = `M ${B1_X} ${BASE_Y} A ${R} ${R} 0 0 0 ${B2_X} ${BASE_Y}`;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Faint semicircle — the locus of all right-angle vertices (Thales' theorem) */}
        <path d={semiArcPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="4 4" />

        {/* Triangle fill */}
        <polygon points={`${B1_X},${BASE_Y} ${B2_X},${BASE_Y} ${apexX},${apexY}`}
          fill="rgba(255,255,255,0.06)" />

        {/* Triangle edges */}
        <line x1={B1_X} y1={BASE_Y} x2={B2_X} y2={BASE_Y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />
        <line x1={B1_X} y1={BASE_Y} x2={apexX} y2={apexY}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />
        <line x1={B2_X} y1={BASE_Y} x2={apexX} y2={apexY}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />

        {/* Right-angle marker at apex */}
        <path d={markerPath} fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="square" />

        {/* Angle arcs */}
        <path d={arcAPath} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        <path d={arcBPath} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

        {/* Base vertex dots */}
        <circle cx={B1_X} cy={BASE_Y} r={3} fill="white" />
        <circle cx={B2_X} cy={BASE_Y} r={3} fill="white" />

        {/* Angle labels with drop-shadow for contrast */}
        <text x={labelAPos.x} y={labelAPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_A}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{angA}°</text>
        <text x={labelBPos.x} y={labelBPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_B}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{angB}°</text>

        {/* Drag handle on apex */}
        <circle cx={apexX} cy={apexY} r={10}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        <circle cx={apexX} cy={apexY} r={3} fill="white" className="pointer-events-none" />
      </svg>

      {/* Equation: A + B + 90° = 180° */}
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: COLOR_A }}>{angA}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_B }}>{angB}°</span>
          <span className="text-white/50">+</span>
          <span className="text-white/90">90°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">180°</span>
        </div>
      </div>

      {/* Slider */}
      <div className="w-full max-w-[260px] sm:max-w-[300px] px-2" onClick={stop}>
        <input type="range" min={sweepMin} max={sweepMax} step={1}
          value={angA} onChange={handleSlider}
          className="angle-slider w-full"
          style={{ "--slider-color": color, "--slider-progress": `${((angA - sweepMin) / (sweepMax - sweepMin)) * 100}%` } as React.CSSProperties}
          aria-label="Adjust acute angle" />
      </div>
    </div>
  );
}
