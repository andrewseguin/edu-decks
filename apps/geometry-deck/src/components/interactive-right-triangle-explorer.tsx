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
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Drag handler on apex
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
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

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const angB = 90 - angA;

  // Apex on semicircle via Thales' theorem: inscribed angle in semicircle = 90°
  const phi = (2 * angA * Math.PI) / 180;
  const apexX = rnd(CX + R * Math.cos(phi));
  const apexY = rnd(CY - R * Math.sin(phi));

  // Right-angle marker at apex (edge-aligned)
  const mSize = 10;
  const u1 = { x: (B1_X - apexX) / Math.hypot(B1_X - apexX, BASE_Y - apexY), y: (BASE_Y - apexY) / Math.hypot(B1_X - apexX, BASE_Y - apexY) };
  const u2 = { x: (B2_X - apexX) / Math.hypot(B2_X - apexX, BASE_Y - apexY), y: (BASE_Y - apexY) / Math.hypot(B2_X - apexX, BASE_Y - apexY) };
  const p1 = { x: rnd(apexX + u1.x * mSize), y: rnd(apexY + u1.y * mSize) };
  const p2 = { x: rnd(apexX + u1.x * mSize + u2.x * mSize), y: rnd(apexY + u1.y * mSize + u2.y * mSize) };
  const p3 = { x: rnd(apexX + u2.x * mSize), y: rnd(apexY + u2.y * mSize) };

  // Angle arcs at base vertices
  const arcA = arcSvg(B1_X, BASE_Y, 0, angA, ARC_R);
  const arcB = arcSvg(B2_X, BASE_Y, 180 - angB, 180, ARC_R);

  // Label positions
  const labelAPos = toPoint(B1_X, BASE_Y, Math.max(angA / 2, 12), ARC_R + 14);
  const labelBPos = toPoint(B2_X, BASE_Y, 180 - Math.max(angB / 2, 12), ARC_R + 14);

  // Semantic colors: A = Cyan (#5ee8ff), B = Yellow (#ffd45e)
  const COLOR_A = "#5ee8ff";
  const COLOR_B = "#ffd45e";

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Thales semicircle (construction guide) */}
        <path d={`M ${B2_X} ${BASE_Y} A ${R} ${R} 0 0 0 ${B1_X} ${BASE_Y}`}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Triangle fill */}
        <polygon points={`${B1_X},${BASE_Y} ${B2_X},${BASE_Y} ${apexX},${apexY}`}
          fill="rgba(255,255,255,0.08)" stroke="none" />

        {/* Triangle outline */}
        <line x1={B1_X} y1={BASE_Y} x2={B2_X} y2={BASE_Y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={B1_X} y1={BASE_Y} x2={apexX} y2={apexY}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={B2_X} y1={BASE_Y} x2={apexX} y2={apexY}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Right-angle square marker at apex */}
        <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />

        {/* Angle arcs */}
        <path d={arcA} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeOpacity={0.85} strokeLinecap="round" />
        <path d={arcB} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeOpacity={0.85} strokeLinecap="round" />

        {/* Base vertices */}
        <circle cx={B1_X} cy={BASE_Y} r={3} fill="white" />
        <circle cx={B2_X} cy={BASE_Y} r={3} fill="white" />

        {/* Labels */}
        <text x={labelAPos.x} y={labelAPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_A}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{angA}°</text>
        <text x={labelBPos.x} y={labelBPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_B}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{angB}°</text>

        {/* Transparent hit area */}
        <circle cx={apexX} cy={apexY} r={24} fill="transparent"
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        {/* Drag handle on apex */}
        <circle cx={apexX} cy={apexY} r={10}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          className="pointer-events-none" />
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
    </div>
  );
}
