"use client";

import React, { useCallback, useRef, useState } from "react";

const SVG_W = 260;
const SVG_H = 150;
const BASE_Y = 110;
const B1_X = 70;
const B2_X = 190;
const PX_PER_UNIT = 12;

const COLOR_A = "#5ee8ff"; // cyan - side a (left)
const COLOR_B = "#ffd45e"; // gold - side b (base)
const COLOR_C = "#ffa756"; // orange - side c (right)

const rnd = (n: number) => Math.round(n * 1000) / 1000;

export function InteractiveTrianglePerimeterExplorer({ color }: { color?: string }) {
  // Draggable apex vertex
  const [apex, setApex] = useState({ x: 125, y: 35 });
  const [isDragging, setIsDragging] = useState(false);
  const [unrollProgress, setUnrollProgress] = useState(0); // 0 = closed triangle, 1 = unrolled straight line
  const [isUnrolling, setIsUnrolling] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  const clampApex = (x: number, y: number) => {
    const cx = Math.max(B1_X + 15, Math.min(B2_X - 15, x));
    const cy = Math.max(25, Math.min(BASE_Y - 25, y));
    return { x: rnd(cx), y: rnd(cy) };
  };

  // Pointer drag handler on apex
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (unrollProgress > 0.05) return; // Only drag when triangle is closed
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scX = SVG_W / rect.width;
      const scY = SVG_H / rect.height;

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
    },
    [unrollProgress]
  );

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const { x: apexX, y: apexY } = apex;

  // Exact pixel lengths
  const lenAPx = Math.hypot(apexX - B1_X, apexY - BASE_Y);
  const lenBPx = B2_X - B1_X; // 120px = 10 units
  const lenCPx = Math.hypot(apexX - B2_X, apexY - BASE_Y);

  // Integer unit lengths for clean equations
  const unitsB = 10;
  const unitsA = Math.max(4, Math.round(lenAPx / PX_PER_UNIT));
  const unitsC = Math.max(4, Math.round(lenCPx / PX_PER_UNIT));
  const totalPerimeter = unitsA + unitsB + unitsC;

  // Angles of sides relative to horizontal for unrolling rotation
  const angleAClosed = Math.atan2(apexY - BASE_Y, apexX - B1_X); // negative rad (~ -0.8 to -1.2)
  const angleAUnrolled = -Math.PI; // -180° = flat left (rotates outward counter-clockwise)
  const currentAngleA = angleAClosed + (angleAUnrolled - angleAClosed) * unrollProgress;

  const currentAEnd = {
    x: B1_X + lenAPx * Math.cos(currentAngleA),
    y: BASE_Y + lenAPx * Math.sin(currentAngleA),
  };

  const angleCClosed = Math.atan2(apexY - BASE_Y, apexX - B2_X); // negative rad
  const angleCUnrolled = 0; // 0° = flat right
  const currentAngleC = angleCClosed + (angleCUnrolled - angleCClosed) * unrollProgress;

  const currentCEnd = {
    x: B2_X + lenCPx * Math.cos(currentAngleC),
    y: BASE_Y + lenCPx * Math.sin(currentAngleC),
  };

  // Toggle Unroll Animation
  const handleToggleUnroll = () => {
    if (isUnrolling) return;
    setIsUnrolling(true);
    const target = unrollProgress > 0.5 ? 0 : 1;
    const startProgress = unrollProgress;
    const startTime = performance.now();
    const duration = 750;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const val = startProgress + (target - startProgress) * eased;
      setUnrollProgress(val);

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setUnrollProgress(target);
        setIsUnrolling(false);
      }
    };

    animRef.current = requestAnimationFrame(tick);
  };

  // Exact outward normal offsets (constant 14px perpendicular distance)
  const LABEL_DIST = 14;

  // Side a outward normal
  const normAx = lenAPx > 0 ? (currentAEnd.y - BASE_Y) / lenAPx : 0;
  const normAy = lenAPx > 0 ? -(currentAEnd.x - B1_X) / lenAPx : 1;
  const midA = {
    x: (B1_X + currentAEnd.x) / 2 + normAx * LABEL_DIST,
    y: (BASE_Y + currentAEnd.y) / 2 + normAy * LABEL_DIST,
  };

  // Side b outward normal (straight down)
  const midB = {
    x: (B1_X + B2_X) / 2,
    y: BASE_Y + LABEL_DIST,
  };

  // Side c outward normal
  const normCx = lenCPx > 0 ? -(currentCEnd.y - BASE_Y) / lenCPx : 0;
  const normCy = lenCPx > 0 ? (currentCEnd.x - B2_X) / lenCPx : 1;
  const midC = {
    x: (B2_X + currentCEnd.x) / 2 + normCx * LABEL_DIST,
    y: (BASE_Y + currentCEnd.y) / 2 + normCy * LABEL_DIST,
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-3 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-[320px] sm:max-w-[360px] touch-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Ghost triangle fill when unrolling */}
        <polygon
          points={`${B1_X},${BASE_Y} ${B2_X},${BASE_Y} ${apexX},${apexY}`}
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Straight baseline extension guide for unrolled perimeter */}
        <line
          x1={B1_X - lenAPx - 8}
          y1={BASE_Y}
          x2={B2_X + lenCPx + 8}
          y2={BASE_Y}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          strokeDasharray="2 2"
        />

        {/* ── Side a (Cyan) ────────────────────────────────────────────── */}
        <line
          x1={B1_X}
          y1={BASE_Y}
          x2={currentAEnd.x}
          y2={currentAEnd.y}
          stroke={COLOR_A}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* ── Side b (Gold Base) ───────────────────────────────────────── */}
        <line
          x1={B1_X}
          y1={BASE_Y}
          x2={B2_X}
          y2={BASE_Y}
          stroke={COLOR_B}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* ── Side c (Orange) ──────────────────────────────────────────── */}
        <line
          x1={B2_X}
          y1={BASE_Y}
          x2={currentCEnd.x}
          y2={currentCEnd.y}
          stroke={COLOR_C}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Vertex dots */}
        <circle cx={B1_X} cy={BASE_Y} r={3.5} fill="white" />
        <circle cx={B2_X} cy={BASE_Y} r={3.5} fill="white" />
        <circle cx={currentAEnd.x} cy={currentAEnd.y} r={3.5} fill={COLOR_A} />
        <circle cx={currentCEnd.x} cy={currentCEnd.y} r={3.5} fill={COLOR_C} />

        {/* Side a Label */}
        <text
          x={midA.x}
          y={midA.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_A}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {unitsA}
        </text>

        {/* Side b Label */}
        <text
          x={midB.x}
          y={midB.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_B}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {unitsB}
        </text>

        {/* Side c Label */}
        <text
          x={midC.x}
          y={midC.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={COLOR_C}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {unitsC}
        </text>

        {/* Draggable Apex handle (only active when closed) */}
        {unrollProgress < 0.05 && (
          <>
            <circle
              cx={apexX}
              cy={apexY}
              r={12}
              fill="rgba(255, 255, 255, 0.2)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth={2}
              style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
              onPointerDown={handlePointerDown}
            />
            <circle cx={apexX} cy={apexY} r={4} fill="white" className="pointer-events-none" />
          </>
        )}
      </svg>

      {/* ── Live calculation formula display ───────────────────────────── */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">P</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_A }}>{unitsA}</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_B }}>{unitsB}</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_C }}>{unitsC}</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{totalPerimeter}</span>
        </div>
      </div>

      {/* ── Interactive Unroll Toggle Control ──────────────────────────── */}
      <button
        type="button"
        onClick={handleToggleUnroll}
        disabled={isUnrolling}
        className="mt-1 px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/30 shadow-sm disabled:opacity-50"
      >
        {unrollProgress > 0.5 ? "Close triangle" : "Unroll perimeter"}
      </button>
    </div>
  );
}
