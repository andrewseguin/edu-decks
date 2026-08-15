"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type InteractiveScaleneExplorerProps = {
  color?: string;
};

const SVG_W = 220;
const SVG_H = 155;
const BASE_Y = 135;
const B1_X = 35;  // left base vertex
const B2_X = 185; // right base vertex
const ARC_R = 18;

/** Round to 4dp to avoid SSR/client floating-point hydration mismatches */
const rnd = (n: number) => Math.round(n * 10000) / 10000;

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

/** Clamp apex inside bounds AND enforce scalene (no two rounded angles equal) */
function clampApex(x: number, y: number): { x: number; y: number } {
  let cx = Math.max(B1_X + 15, Math.min(B2_X - 15, x));
  const cy = Math.max(20, Math.min(BASE_Y - 20, y));

  // Nudge x until all three rounded angles are different
  for (let i = 0; i < 12; i++) {
    const a = Math.round(Math.atan2(BASE_Y - cy, cx - B1_X) * 180 / Math.PI);
    const b = Math.round(Math.atan2(BASE_Y - cy, B2_X - cx) * 180 / Math.PI);
    const c = 180 - a - b;
    if (a !== b && a !== c && b !== c) break;
    cx += cx >= (B1_X + B2_X) / 2 ? 1 : -1; // nudge away from midpoint
    cx = Math.max(B1_X + 15, Math.min(B2_X - 15, cx));
  }

  return { x: rnd(cx), y: rnd(cy) };
}

export function InteractiveScaleneExplorer({ color }: InteractiveScaleneExplorerProps) {
  const [apex, setApex] = useState({ x: 85, y: 50 });
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => { ucRef.current = isUserControlling; }, [isUserControlling]);

  // Auto-animation: apex traces a Lissajous orbit offset from base midpoint
  // so the two legs are never equal (always scalene)
  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const elapsed = (ts - startTimeRef.current) / 1000;
    // Center at x=75 (well left of base midpoint 110) so left leg ≠ right leg
    const cx = 75, cy = 72;
    const rx = 28, ry = 28;
    const x = cx + rx * Math.cos(elapsed * 0.4);
    const y = cy + ry * Math.sin(elapsed * 0.55);
    setApex(clampApex(x, y));
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
      setApex(clampApex(px, py));
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

  const { x: apexX, y: apexY } = apex;

  // Compute angles (math coords, y-up)
  const radA = Math.atan2(BASE_Y - apexY, apexX - B1_X);
  const radB = Math.atan2(BASE_Y - apexY, B2_X - apexX);
  const degA = Math.round(radA * 180 / Math.PI);
  const degB = Math.round(radB * 180 / Math.PI);
  const degC = 180 - degA - degB;


  // Arc paths at each vertex
  const arcAPath = arcSvg(B1_X, BASE_Y, 0, degA, ARC_R);
  const arcBPath = arcSvg(B2_X, BASE_Y, 180 - degB, 180, ARC_R);

  // Apex arc: angle between the two downward edges
  const downL = Math.atan2(BASE_Y - apexY, B1_X - apexX) * 180 / Math.PI; // negative (pointing down-left)
  const downR = Math.atan2(BASE_Y - apexY, B2_X - apexX) * 180 / Math.PI; // negative (pointing down-right)
  // In math coords (y-up), both are negative. We need the arc from downR to downL going CCW.
  // Convert to SVG: toPoint uses standard math (0=right, 90=up)
  // Edge to B1 from apex: angle = atan2(-(BASE_Y - apexY), B1_X - apexX) in math coords = -(downL screen)
  const edgeAngleL = rnd(Math.atan2(-(BASE_Y - apexY), B1_X - apexX) * 180 / Math.PI);
  const edgeAngleR = rnd(Math.atan2(-(BASE_Y - apexY), B2_X - apexX) * 180 / Math.PI);
  // Arc from edgeAngleR to edgeAngleL (the interior angle at apex goes CCW from right edge to left edge)
  const arcCPath = arcSvg(apexX, apexY, edgeAngleL, edgeAngleR, ARC_R);


  // Angle label positions — base labels OUTSIDE, apex label along bisector
  const labelCMid = (edgeAngleR + edgeAngleL) / 2;
  const labelAPos = { x: B1_X - 8, y: BASE_Y + 3 };
  const labelBPos = { x: B2_X + 8, y: BASE_Y + 3 };
  const labelCPos = toPoint(apexX, apexY, labelCMid, ARC_R + 14);

  const COLOR_A = "#5ee8ff"; // cyan
  const COLOR_B = "#ffd45e"; // yellow
  const COLOR_C = "#fb923c"; // orange

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

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


        {/* Angle arcs */}
        <path d={arcAPath} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        <path d={arcBPath} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        <path d={arcCPath} fill="none" stroke={COLOR_C} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

        {/* Base vertex dots */}
        <circle cx={B1_X} cy={BASE_Y} r={3} fill="white" />
        <circle cx={B2_X} cy={BASE_Y} r={3} fill="white" />

        {/* Angle labels with drop-shadow for contrast */}
        <text x={labelAPos.x} y={labelAPos.y} textAnchor="end" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_A}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{degA}°</text>
        <text x={labelBPos.x} y={labelBPos.y} textAnchor="start" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_B}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{degB}°</text>
        <text x={labelCPos.x} y={labelCPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR_C}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{degC}°</text>

        {/* Drag handle on apex */}
        <circle cx={apexX} cy={apexY} r={10}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        <circle cx={apexX} cy={apexY} r={3} fill="white" className="pointer-events-none" />
      </svg>


      {/* Equation: A + B + C = 180° */}
      <div className="flex justify-center mt-2">
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
    </div>
  );
}
