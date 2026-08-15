"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type InteractiveAnglePairProps = {
  /** 90 for complementary, 180 for supplementary */
  targetSum: 90 | 180;
  label: string;
  color: string;
};

const RAY_LEN = 110;
const ARC_R_A = 34;
const ARC_R_B = 46;
const HANDLE_R = 12;
const PAD = 24;
const SQ = 12;

function toPoint(vx: number, vy: number, deg: number, len: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: vx + len * Math.cos(rad), y: vy - len * Math.sin(rad) };
}

function arcPath(vx: number, vy: number, from: number, to: number, r: number) {
  const s = toPoint(vx, vy, from, r);
  const e = toPoint(vx, vy, to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function InteractiveAnglePair({ targetSum, label, color }: InteractiveAnglePairProps) {
  const margin = 5;
  const sliderMin = 1;
  const sliderMax = targetSum - 1;
  const animMin = margin;
  const animMax = targetSum - margin;
  const is180 = targetSum === 180;

  // Layout: complementary vertex at left, supplementary vertex at center
  const totalR = RAY_LEN + HANDLE_R;
  const topPad = 14;
  const sidePad = 16;
  const vx = is180 ? totalR + sidePad : sidePad + 4;
  const vy = RAY_LEN + topPad;
  const svgW = is180 ? (totalR + sidePad) * 2 : totalR + sidePad * 2 + 4;
  const svgH = vy + 18;

  const [angleA, setAngleA] = useState(is180 ? 65 : 40);
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
    const t = (Math.sin((ts - startTimeRef.current) / 1000 * Math.PI * 0.25) + 1) / 2;
    setAngleA(animMin + t * (animMax - animMin));
    animRef.current = requestAnimationFrame(animate);
  }, [animMin, animMax]);

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, isUserControlling]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsUserControlling(true); setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = svgW / rect.width, scY = svgH / rect.height;
    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;
      let a = (Math.atan2(-(py - vy), px - vx) * 180) / Math.PI;
      if (a < 0) a += 360;
      a = Math.max(sliderMin, Math.min(sliderMax, a));
      setAngleA(a);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [sliderMin, sliderMax, svgW, svgH, vx, vy]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Geometry
  const angleB = targetSum - angleA;
  const dA = Math.round(angleA);
  const dB = Math.round(angleB);

  // Accent colors for A and B
  const COLOR_A = "#5ee8ff"; // cyan
  const COLOR_B = "#d8b4fe"; // neon lilac

  const armEnd = toPoint(vx, vy, angleA, RAY_LEN);
  const baseEnd = toPoint(vx, vy, 0, RAY_LEN);
  const topEnd = toPoint(vx, vy, targetSum, RAY_LEN);

  const arcA = arcPath(vx, vy, 0, angleA, ARC_R_A);
  const arcB = arcPath(vx, vy, angleA, targetSum, ARC_R_B);

  // Labels — push well outside arcs and clamp away from boundary rays
  const labelR = RAY_LEN * 0.55;
  const labelAAngle = Math.max(Math.min(angleA / 2, angleA - 6), 9);
  const labelAR = labelR + Math.max(0, (25 - angleA) * 0.6);
  const labelAPos = toPoint(vx, vy, labelAAngle, labelAR);
  const labelBMid = Math.min(Math.max(angleA + (targetSum - angleA) / 2, angleA + 8), targetSum - 15);
  const labelBPos = toPoint(vx, vy, labelBMid, labelR);

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Right-angle square (complementary only) */}
        {!is180 && (
          <path d={`M ${vx + SQ} ${vy} L ${vx + SQ} ${vy - SQ} L ${vx} ${vy - SQ}`}
            fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
        )}

        {/* Filled wedge A */}
        {(() => {
          const as = toPoint(vx, vy, 0, ARC_R_A);
          const ae = toPoint(vx, vy, angleA, ARC_R_A);
          return <path d={`M ${vx} ${vy} L ${as.x} ${as.y} A ${ARC_R_A} ${ARC_R_A} 0 0 0 ${ae.x} ${ae.y} Z`}
            fill={`${COLOR_A}22`} />;
        })()}

        {/* Filled wedge B */}
        {(() => {
          const bs = toPoint(vx, vy, angleA, ARC_R_B);
          const be = toPoint(vx, vy, targetSum, ARC_R_B);
          const large = targetSum - angleA > 180 ? 1 : 0;
          return <path d={`M ${vx} ${vy} L ${bs.x} ${bs.y} A ${ARC_R_B} ${ARC_R_B} 0 ${large} 0 ${be.x} ${be.y} Z`}
            fill={`${COLOR_B}22`} />;
        })()}

        {/* Arc A */}
        <path d={arcA} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

        {/* Arc B */}
        <path d={arcB} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

        {/* Base ray */}
        <line x1={vx} y1={vy} x2={baseEnd.x} y2={baseEnd.y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Top/left ray */}
        <line x1={vx} y1={vy} x2={topEnd.x} y2={topEnd.y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Dividing arm */}
        <line x1={vx} y1={vy} x2={armEnd.x} y2={armEnd.y}
          stroke="rgba(255,255,255,0.65)" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 4" />

        {/* Vertex */}
        <circle cx={vx} cy={vy} r={4} fill="white" />

        {/* Label A */}
        <text x={labelAPos.x} y={labelAPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight={800} fill={COLOR_A}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >{dA}°</text>

        {/* Label B */}
        <text x={labelBPos.x} y={labelBPos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight={800} fill={COLOR_B}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >{dB}°</text>

        {/* Transparent large hit area */}
        <circle cx={armEnd.x} cy={armEnd.y} r={24} fill="transparent"
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        {/* Drag handle */}
        <circle cx={armEnd.x} cy={armEnd.y} r={HANDLE_R}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          className="pointer-events-none" />
        <circle cx={armEnd.x} cy={armEnd.y} r={4} fill="white" className="pointer-events-none" />
      </svg>

      {/* Live equation matching design spec */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: COLOR_A }}>{dA}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_B }}>{dB}°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{targetSum}°</span>
        </div>
      </div>
    </div>
  );
}
