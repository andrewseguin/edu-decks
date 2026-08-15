"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type InteractiveParallelAnglesProps = {
  /** "alternate" for Z-angles (equal), "co-interior" for C-angles (sum 180) */
  mode: "alternate" | "co-interior";
  color: string;
};

const LINE_PAD = 30;
const LINE_Y1 = 55;
const LINE_Y2 = 145;
const SVG_W = 300;
const SVG_H = 200;
const ARC_R = 24;
const ARROW_SIZE = 6;

/** Round to 4 decimal places to avoid SSR/client floating-point hydration mismatches */
const r = (n: number) => Math.round(n * 10000) / 10000;

function toPoint(cx: number, cy: number, deg: number, len: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: r(cx + len * Math.cos(rad)), y: r(cy - len * Math.sin(rad)) };
}

function arcPath(cx: number, cy: number, from: number, to: number, r: number) {
  // Arc going CCW in math coords from 'from' to 'to'
  const s = toPoint(cx, cy, from, r);
  const e = toPoint(cx, cy, to, r);
  const span = to - from;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/** Small arrow tick marks on parallel lines */
function arrowTick(x: number, y: number): string {
  return `M ${x - ARROW_SIZE} ${y - ARROW_SIZE} L ${x} ${y} L ${x - ARROW_SIZE} ${y + ARROW_SIZE}`;
}

export function InteractiveParallelAngles({ mode, color }: InteractiveParallelAnglesProps) {
  const sweepMin = 25;
  const sweepMax = 155;

  const gap = LINE_Y2 - LINE_Y1;
  const midX = SVG_W / 2;
  const midY = (LINE_Y1 + LINE_Y2) / 2;

  const [theta, setTheta] = useState(55);
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
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.12) + 1) / 2;
    setTheta(sweepMin + t * (sweepMax - sweepMin));
    animRef.current = requestAnimationFrame(animate);
  }, [sweepMin, sweepMax]);

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, isUserControlling]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserControlling(true);
    setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;
    const scY = SVG_H / rect.height;
    const centerX = SVG_W / 2;
    const centerY = (LINE_Y1 + LINE_Y2) / 2;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;
      const rad = Math.atan2(-(py - centerY), px - centerX);
      let a = (rad * 180) / Math.PI;
      if (a < 0) a += 360;
      if (a > 180) a -= 180;
      a = Math.max(sweepMin, Math.min(sweepMax, a));
      setTheta(a);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [sweepMin, sweepMax]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute intersection points
  const sinT = Math.sin((theta * Math.PI) / 180);
  const cosT = Math.cos((theta * Math.PI) / 180);
  const dx = (gap / 2) * (cosT / sinT);
  const ux = r(midX + dx); // upper intersection x
  const lx = r(midX - dx); // lower intersection x

  // Transversal endpoints (extend beyond intersections)
  const ext = 30;
  const tTop = { x: r(ux + ext * cosT), y: r(LINE_Y1 - ext * sinT) };
  const tBot = { x: r(lx - ext * cosT), y: r(LINE_Y2 + ext * sinT) };

  const dTheta = Math.round(theta);
  const dComp = 180 - dTheta;

  // Angle arcs
  // At upper intersection: interior angles are below the upper line
  // Angle between right horizontal (0°) and transversal going down = angle (180° + θ) in math coords
  // Interior right angle: from (180° + θ) going CCW to 360° (= 0°), span = 180° - θ
  // Interior left angle: from 180° going CCW to (180° + θ), span = θ

  // At lower intersection: interior angles are above the lower line
  // Transversal going up = θ in math coords
  // Interior right angle: from 0° going CCW to θ, span = θ
  // Interior left angle: from θ going CCW to 180°, span = 180° - θ

  const COLOR_A = "#5ee8ff"; // cyan
  const COLOR_B = "#d8b4fe"; // neon lilac

  let upperArc: string;
  let lowerArc: string;
  let upperLabel: { pos: ReturnType<typeof toPoint>; text: string; color: string };
  let lowerLabel: { pos: ReturnType<typeof toPoint>; text: string; color: string };
  let upperArcColor: string;
  let lowerArcColor: string;

  if (mode === "alternate") {
    // Z-pattern: both angles equal → both in Cyan
    upperArc = arcPath(ux, LINE_Y1, 180, 180 + theta, ARC_R);
    lowerArc = arcPath(lx, LINE_Y2, 0, theta, ARC_R);
    const uLabelAngle = 180 + theta / 2;
    const lLabelAngle = theta / 2;
    upperLabel = { pos: toPoint(ux, LINE_Y1, uLabelAngle, ARC_R + 14), text: `${dTheta}°`, color: COLOR_A };
    lowerLabel = { pos: toPoint(lx, LINE_Y2, Math.max(lLabelAngle, 15), ARC_R + 14), text: `${dTheta}°`, color: COLOR_A };
    upperArcColor = COLOR_A;
    lowerArcColor = COLOR_A;
  } else {
    // C-pattern: angles sum to 180° → Cyan and Lilac
    upperArc = arcPath(ux, LINE_Y1, 180 + theta, 360, ARC_R);
    lowerArc = arcPath(lx, LINE_Y2, 0, theta, ARC_R);
    const uMid = 180 + theta + (180 - theta) / 2;
    const lMid = theta / 2;
    upperLabel = { pos: toPoint(ux, LINE_Y1, uMid, ARC_R + 14), text: `${dComp}°`, color: COLOR_A };
    lowerLabel = { pos: toPoint(lx, LINE_Y2, Math.max(lMid, 15), ARC_R + 14), text: `${dTheta}°`, color: COLOR_B };
    upperArcColor = COLOR_A;
    lowerArcColor = COLOR_B;
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Upper parallel line */}
        <line x1={LINE_PAD} y1={LINE_Y1} x2={SVG_W - LINE_PAD} y2={LINE_Y1}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />

        {/* Lower parallel line */}
        <line x1={LINE_PAD} y1={LINE_Y2} x2={SVG_W - LINE_PAD} y2={LINE_Y2}
          stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />

        {/* Parallel indicators (arrows) */}
        <path d={arrowTick(SVG_W / 2 - 20, LINE_Y1)} fill="none"
          stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={arrowTick(SVG_W / 2 - 20, LINE_Y2)} fill="none"
          stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Transversal */}
        <line x1={tTop.x} y1={tTop.y} x2={tBot.x} y2={tBot.y}
          stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" />

        {/* Angle arcs */}
        <path d={upperArc} fill="none" stroke={upperArcColor} strokeWidth={2.5} strokeOpacity={0.85} />
        <path d={lowerArc} fill="none" stroke={lowerArcColor} strokeWidth={2.5} strokeOpacity={0.85} />

        {/* Intersection dots */}
        <circle cx={ux} cy={LINE_Y1} r={3} fill="white" />
        <circle cx={lx} cy={LINE_Y2} r={3} fill="white" />

        {/* Labels */}
        <text x={upperLabel.pos.x} y={upperLabel.pos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={upperLabel.color}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{upperLabel.text}</text>
        <text x={lowerLabel.pos.x} y={lowerLabel.pos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={lowerLabel.color}
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>{lowerLabel.text}</text>

        {/* Drag handle on transversal top end */}
        <circle cx={tTop.x} cy={tTop.y} r={10}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        <circle cx={tTop.x} cy={tTop.y} r={3} fill="white" className="pointer-events-none" />
      </svg>

      {/* Live equation for co-interior angle pairs */}
      {mode === "co-interior" && (
        <div className="flex justify-center my-0.5">
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span style={{ color: COLOR_A }}>{dComp}°</span>
            <span className="text-white/50">+</span>
            <span style={{ color: COLOR_B }}>{dTheta}°</span>
            <span className="text-white/50">=</span>
            <span className="text-white font-bold">180°</span>
          </div>
        </div>
      )}
    </div>
  );
}
