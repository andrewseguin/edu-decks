"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveCubeSurfaceAreaProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_SIDE = "#5ee8ff"; // Electric Cyan (s)
const COLOR_SA = "#ffffff";   // Bold Crisp White

export function InteractiveCubeSurfaceAreaExplorer({ color }: InteractiveCubeSurfaceAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const minS = 2;
  const maxS = 6;
  const [s, setS] = useState(3); // side length [2..6]
  const [isDragging, setIsDragging] = useState(false);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const faceArea = s * s;
  const totalSA = 6 * faceArea;

  const unitPx = 18;
  const cubeW = s * unitPx;
  const cubeH = s * unitPx;
  const cubeD = s * unitPx * 0.45;

  const ox = CX - (cubeW + cubeD) / 2;
  const oy = 152;

  const updateFromPointer = useCallback((clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const scaleX = SVG_W / rect.width;
    const svgPointerX = (clientX - rect.left) * scaleX;
    const dx = svgPointerX - ox;
    const nextS = Math.max(minS, Math.min(maxS, Math.round(dx / unitPx)));
    setS(nextS);
  }, [ox, unitPx, minS, maxS, SVG_W]);

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    updateFromPointer(e.clientX);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleX = ox + cubeW;
  const handleY = oy - cubeH;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pt-1 pb-1" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ew-resize"
      >
        {/* Hidden back edges */}
        <line x1={ox + cubeD} y1={oy - cubeD} x2={ox + cubeD} y2={oy - cubeH - cubeD} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={ox + cubeD} y1={oy - cubeD} x2={ox} y2={oy} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={ox + cubeD} y1={oy - cubeD} x2={ox + cubeW + cubeD} y2={oy - cubeD} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Front face */}
        <polygon
          points={`${ox},${oy - cubeH} ${ox + cubeW},${oy - cubeH} ${ox + cubeW},${oy} ${ox},${oy}`}
          fill="rgba(94, 232, 255, 0.42)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
        />
        {/* Right face */}
        <polygon
          points={`${ox + cubeW},${oy - cubeH} ${ox + cubeW + cubeD},${oy - cubeH - cubeD} ${ox + cubeW + cubeD},${oy - cubeD} ${ox + cubeW},${oy}`}
          fill="rgba(94, 232, 255, 0.22)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
        />
        {/* Top face */}
        <polygon
          points={`${ox},${oy - cubeH} ${ox + cubeD},${oy - cubeH - cubeD} ${ox + cubeW + cubeD},${oy - cubeH - cubeD} ${ox + cubeW},${oy - cubeH}`}
          fill="rgba(94, 232, 255, 0.32)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
        />

        {/* Vertices */}
        {[
          { x: ox, y: oy }, { x: ox + cubeW, y: oy }, { x: ox, y: oy - cubeH },
          { x: ox + cubeD, y: oy - cubeH - cubeD }, { x: ox + cubeW + cubeD, y: oy - cubeH - cubeD }, { x: ox + cubeW + cubeD, y: oy - cubeD }
        ].map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
        ))}

        {/* Drag handle on Top-Right front vertex */}
        <g className="pointer-events-none">
          <circle cx={handleX} cy={handleY} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={handleX} cy={handleY} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
          <circle cx={handleX} cy={handleY} r={2.5} fill="#ffffff" />
        </g>

        {/* Side Length Labels */}
        <text x={ox + cubeW / 2} y={oy + 14} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="800" fill={COLOR_SIDE} fontFamily="var(--font-heading, system-ui)" style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}>
          {s}
        </text>
        <text x={ox - 12} y={oy - cubeH / 2} textAnchor="end" dominantBaseline="central" fontSize={13} fontWeight="800" fill={COLOR_SIDE} fontFamily="var(--font-heading, system-ui)" style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}>
          {s}
        </text>

        {/* 1 Face Area Highlight */}
        <text x={ox + cubeW / 2} y={oy - cubeH / 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="800" fill="#ffffff" fontFamily="var(--font-heading, system-ui)">
          s² = {faceArea}
        </text>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none text-white">
          <span>SA</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">6 ·</span>
          <span style={{ color: COLOR_SIDE }}>{s}²</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">6 · {faceArea}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_SA }} className="font-bold">{totalSA}</span>
        </div>
      </div>
    </div>
  );
}
