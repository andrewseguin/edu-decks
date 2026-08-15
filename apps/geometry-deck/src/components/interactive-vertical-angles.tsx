"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type InteractiveVerticalAnglesProps = {
  color: string;
};

const LINE_LEN = 90;
const ARC_R1 = 28;
const ARC_R2 = 38;
const HANDLE_R = 12;
const PAD = 4;

function toPoint(cx: number, cy: number, deg: number, len: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + len * Math.cos(rad), y: cy - len * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, from: number, to: number, r: number) {
  const s = toPoint(cx, cy, from, r);
  const e = toPoint(cx, cy, to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function InteractiveVerticalAngles({ color }: InteractiveVerticalAnglesProps) {
  const sweepMin = 20;
  const sweepMax = 160;

  const totalR = LINE_LEN + HANDLE_R;
  const cx = totalR + PAD;
  const cy = totalR + PAD;
  const svgW = (totalR + PAD) * 2;
  const svgH = (totalR + PAD) * 2;

  const [angleA, setAngleA] = useState(50);
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
    setAngleA(sweepMin + t * (sweepMax - sweepMin));
    animRef.current = requestAnimationFrame(animate);
  }, []);

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
      let a = (Math.atan2(-(py - cy), px - cx) * 180) / Math.PI;
      if (a < 0) a += 360;
      if (a > 180) a = 360 - a;
      a = Math.max(sweepMin, Math.min(sweepMax, a));
      setAngleA(a);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [svgW, svgH, cx, cy]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserControlling) { setIsUserControlling(true); cancelAnimationFrame(animRef.current); }
    setAngleA(Number(e.target.value));
  }, [isUserControlling]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const dA = Math.round(angleA);
  const dB = 180 - dA;

  // Line endpoints
  const hR = toPoint(cx, cy, 0, LINE_LEN);
  const hL = toPoint(cx, cy, 180, LINE_LEN);
  const rU = toPoint(cx, cy, angleA, LINE_LEN);
  const rD = toPoint(cx, cy, angleA + 180, LINE_LEN);

  // Arcs: A (solid) at top-right and bottom-left, B (dashed) at top-left and bottom-right
  const arc1 = arcPath(cx, cy, 0, angleA, ARC_R1);
  const arc2 = arcPath(cx, cy, angleA, 180, ARC_R2);
  const arc3 = arcPath(cx, cy, 180, 180 + angleA, ARC_R1);
  const arc4 = arcPath(cx, cy, 180 + angleA, 360, ARC_R2);

  // Label positions
  const l1 = toPoint(cx, cy, Math.max(angleA / 2, 15), ARC_R1 + 16);
  const l2 = toPoint(cx, cy, angleA + (180 - angleA) / 2, ARC_R2 + 16);
  const l3 = toPoint(cx, cy, 180 + Math.max(angleA / 2, 15), ARC_R1 + 16);
  const l4 = toPoint(cx, cy, 180 + angleA + (180 - angleA) / 2, ARC_R2 + 16);

  const COLOR_A = "#5ee8ff"; // cyan — for the equal pair A & C
  const COLOR_B = "#ffd45e"; // yellow — for the equal pair B & D

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[240px] sm:max-w-[280px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Arc A (top-right) */}
        <path d={arc1} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeOpacity={0.85} />
        {/* Arc B (top-left) */}
        <path d={arc2} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeOpacity={0.85} />
        {/* Arc A (bottom-left, opposite) */}
        <path d={arc3} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeOpacity={0.85} />
        {/* Arc B (bottom-right, opposite) */}
        <path d={arc4} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeOpacity={0.85} />

        {/* Horizontal line */}
        <line x1={hL.x} y1={hL.y} x2={hR.x} y2={hR.y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Rotating line */}
        <line x1={rD.x} y1={rD.y} x2={rU.x} y2={rU.y}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={4} fill="white" />

        {/* Labels */}
        <text x={l1.x} y={l1.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={700} fill={COLOR_A}
          stroke={color} strokeWidth={4} paintOrder="stroke">A {dA}°</text>
        <text x={l2.x} y={l2.y} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR_B}
          stroke={color} strokeWidth={4} paintOrder="stroke">B {dB}°</text>
        <text x={l3.x} y={l3.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={700} fill={COLOR_A}
          stroke={color} strokeWidth={4} paintOrder="stroke">C {dA}°</text>
        <text x={l4.x} y={l4.y} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR_B}
          stroke={color} strokeWidth={4} paintOrder="stroke">D {dB}°</text>

        {/* Drag handle on upper arm */}
        <circle cx={rU.x} cy={rU.y} r={HANDLE_R}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        <circle cx={rU.x} cy={rU.y} r={4} fill="white" className="pointer-events-none" />
      </svg>

      {/* Equation as pill tokens */}
      <div className="flex items-end gap-1.5 justify-center px-2">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold" style={{ color: COLOR_A }}>A = C</span>
          <span className="px-3 py-1 rounded-md text-sm font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: COLOR_A, border: `1.5px solid ${COLOR_A}90` }}>
            {dA}°
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold" style={{ color: COLOR_B }}>B = D</span>
          <span className="px-3 py-1 rounded-md text-sm font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: COLOR_B, border: `1.5px solid ${COLOR_B}90` }}>
            {dB}°
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="w-full max-w-[260px] sm:max-w-[300px] px-2" onClick={stop}>
        <input type="range" min={sweepMin} max={sweepMax} step={1}
          value={Math.round(angleA)} onChange={handleSlider}
          className="angle-slider w-full"
          style={{ "--slider-color": color, "--slider-progress": `${((angleA - sweepMin) / (sweepMax - sweepMin)) * 100}%` } as React.CSSProperties}
          aria-label="Adjust angle" />
      </div>
    </div>
  );
}
