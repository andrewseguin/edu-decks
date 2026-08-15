"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const SVG_W = 220;
const SVG_H = 180;
const CX = 110;
const CY = 95;
const ARC_R = 16;
const COLOR = "#5ee8ff"; // all angles are equal → same color

/** Round to 4dp to avoid hydration mismatches */
const rnd = (n: number) => Math.round(n * 10000) / 10000;

/** Given center + angle + radius, compute equilateral triangle vertices */
function triVertices(cx: number, cy: number, rotation: number, radius: number) {
  const verts: { x: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const a = rotation + (i * 2 * Math.PI) / 3;
    verts.push({ x: rnd(cx + radius * Math.cos(a)), y: rnd(cy + radius * Math.sin(a)) });
  }
  return verts as [typeof verts[0], typeof verts[0], typeof verts[0]];
}

/** SVG arc between two edge directions at a vertex */
function vertexArc(vx: number, vy: number, p1: { x: number; y: number }, p2: { x: number; y: number }, r: number) {
  const a1 = Math.atan2(p1.y - vy, p1.x - vx);
  const a2 = Math.atan2(p2.y - vy, p2.x - vx);
  const sx = rnd(vx + r * Math.cos(a1)), sy = rnd(vy + r * Math.sin(a1));
  const ex = rnd(vx + r * Math.cos(a2)), ey = rnd(vy + r * Math.sin(a2));
  // Use sweep=1 for CW (interior arc)
  return `M ${sx} ${sy} A ${r} ${r} 0 0 0 ${ex} ${ey}`;
}

export function InteractiveEquilateralExplorer({ color }: { color?: string }) {
  const [rotation, setRotation] = useState(-Math.PI / 2); // apex starts at top
  const radius = 65;
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rotOffsetRef = useRef(-Math.PI / 2); // base rotation when animation resumes
  const draggingRef = useRef(false);

  // Auto-animation: slow rotation from current offset
  const animate = useCallback((ts: number) => {
    if (draggingRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const elapsed = (ts - startTimeRef.current) / 1000;
    const r = rnd(rotOffsetRef.current + elapsed * 0.3);
    setRotation(r);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    startTimeRef.current = null;
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate]);

  // Drag: sets rotation from pointer angle relative to center
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    draggingRef.current = true; setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width, scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;
      const dx = px - CX, dy = py - CY;
      const r = rnd(Math.atan2(dy, dx));
      setRotation(r);
      rotOffsetRef.current = r; // track for seamless resume
    };

    const onUp = () => {
      draggingRef.current = false; setIsDragging(false);
      // Resume animation from current rotation
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [animate]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const [v0, v1, v2] = triVertices(CX, CY, rotation, radius);

  // Arcs at each vertex (interior)
  const arc0 = vertexArc(v0.x, v0.y, v2, v1, ARC_R);
  const arc1 = vertexArc(v1.x, v1.y, v0, v2, ARC_R);
  const arc2 = vertexArc(v2.x, v2.y, v1, v0, ARC_R);

  // Label positions: along bisector (toward center) past the arc
  const labelR = ARC_R + 14;
  const label0 = { x: rnd(v0.x + (CX - v0.x) / radius * labelR), y: rnd(v0.y + (CY - v0.y) / radius * labelR) };
  const label1 = { x: rnd(v1.x + (CX - v1.x) / radius * labelR), y: rnd(v1.y + (CY - v1.y) / radius * labelR) };
  const label2 = { x: rnd(v2.x + (CX - v2.x) / radius * labelR), y: rnd(v2.y + (CY - v2.y) / radius * labelR) };

  // Tick mark positions (midpoints of each edge)
  const tickData = [
    { x: (v0.x + v1.x) / 2, y: (v0.y + v1.y) / 2, angle: Math.atan2(v1.y - v0.y, v1.x - v0.x) * 180 / Math.PI },
    { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2, angle: Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI },
    { x: (v2.x + v0.x) / 2, y: (v2.y + v0.y) / 2, angle: Math.atan2(v0.y - v2.y, v0.x - v2.x) * 180 / Math.PI },
  ];

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}>

        {/* Triangle fill */}
        <polygon points={`${v0.x},${v0.y} ${v1.x},${v1.y} ${v2.x},${v2.y}`}
          fill="rgba(255,255,255,0.06)" />

        {/* Triangle edges */}
        <line x1={v0.x} y1={v0.y} x2={v1.x} y2={v1.y} stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />
        <line x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />
        <line x1={v2.x} y1={v2.y} x2={v0.x} y2={v0.y} stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" />

        {/* Tick marks (equal side indicators) */}
        {tickData.map((t, i) => (
          <line key={i}
            x1={t.x - 6 * Math.cos((t.angle + 90) * Math.PI / 180)}
            y1={t.y - 6 * Math.sin((t.angle + 90) * Math.PI / 180)}
            x2={t.x + 6 * Math.cos((t.angle + 90) * Math.PI / 180)}
            y2={t.y + 6 * Math.sin((t.angle + 90) * Math.PI / 180)}
            stroke="rgba(255,255,255,0.8)" strokeWidth={2} strokeLinecap="round" />
        ))}

        {/* Angle arcs */}
        <path d={arc0} fill="none" stroke={COLOR} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        <path d={arc1} fill="none" stroke={COLOR} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        <path d={arc2} fill="none" stroke={COLOR} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

        {/* Vertex dots */}
        <circle cx={v0.x} cy={v0.y} r={3} fill="white" />
        <circle cx={v1.x} cy={v1.y} r={3} fill="white" />
        <circle cx={v2.x} cy={v2.y} r={3} fill="white" />

        {/* 60° labels */}
        <text x={label0.x} y={label0.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR} fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>
        <text x={label1.x} y={label1.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR} fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>
        <text x={label2.x} y={label2.y} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR} fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}>60°</text>

        {/* Drag handle on v0 (the "apex" vertex that follows rotation) */}
        <circle cx={v0.x} cy={v0.y} r={10}
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown} />
        <circle cx={v0.x} cy={v0.y} r={3} fill="white" className="pointer-events-none" />
      </svg>

      {/* Equation: 60° + 60° + 60° = 180° */}
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: COLOR }}>60°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR }}>60°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR }}>60°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">180°</span>
        </div>
      </div>
    </div>
  );
}
