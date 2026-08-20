"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePrismVolumeProps = {
  color?: string;
};

const SVG_H = 190;

const COLOR_LEN = "#5ee8ff";   // Electric Cyan (l)
const COLOR_WIDTH = "#d8b4fe"; // Soft Lilac (w)
const COLOR_HEIGHT = "#ffd45e";// Warm Gold (h)
const COLOR_VOL = "#ffffff";   // Bold Crisp White

export function InteractivePrismVolumeExplorer({ color }: InteractivePrismVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const l = 4; // length
  const w = 3; // width
  const maxLayers = 4;
  const [activeLayers, setActiveLayers] = useState(3);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const startLayersRef = useRef<number>(activeLayers);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = l * w;
  const currentVol = baseArea * activeLayers;

  const unitPx = 24;
  const W = l * unitPx;
  const H = activeLayers * unitPx * 0.95;
  const D = w * unitPx * 0.65;

  const ox = CX - (W + D * Math.cos(Math.PI / 6)) / 2;
  const oy = 158;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = D * cos30, dyD = -D * sin30;

  const fl = { x: ox, y: oy };
  const fr = { x: ox + W, y: oy };
  const ftl = { x: ox, y: oy - H };
  const ftr = { x: ox + W, y: oy - H };
  const bl = { x: ox + dxD, y: oy + dyD };
  const br = { x: ox + W + dxD, y: oy + dyD };
  const btl = { x: ox + dxD, y: oy - H + dyD };
  const btr = { x: ox + W + dxD, y: oy - H + dyD };

  // Center of top face for drag handle
  const topMid = { x: (ftl.x + ftr.x + btr.x + btl.x) / 4, y: (ftl.y + ftr.y + btr.y + btl.y) / 4 };

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startLayersRef.current = activeLayers;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = startYRef.current - e.clientY; // upward drag increases height
    const deltaLayers = Math.round(dy / (unitPx * 0.95));
    const nextLayers = Math.max(1, Math.min(maxLayers, startLayersRef.current + deltaLayers));
    setActiveLayers(nextLayers);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pt-1 pb-1" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[190px] cursor-ns-resize"
      >
        {/* Hidden back edges */}
        <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.8} strokeDasharray="5 4" />
        <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.8} strokeDasharray="5 4" />
        <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.8} strokeDasharray="5 4" />

        {/* Front Face */}
        <polygon
          points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
          fill="rgba(94, 232, 255, 0.25)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        {/* Right Side Face */}
        <polygon
          points={`${fr.x},${fr.y} ${br.x},${br.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
          fill="rgba(94, 232, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        {/* Top Face */}
        <polygon
          points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
          fill="rgba(94, 232, 255, 0.40)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {/* Unit layer slicing lines along activeLayers */}
        {Array.from({ length: activeLayers - 1 }, (_, i) => {
          const ly = oy - (i + 1) * (H / activeLayers);
          const rly = ly + dyD;
          return (
            <g key={i} stroke="rgba(255, 255, 255, 0.55)" strokeWidth={1.2} strokeDasharray="3 3">
              <line x1={ox} y1={ly} x2={ox + W} y2={ly} />
              <line x1={ox + W} y1={ly} x2={ox + W + dxD} y2={rly} />
            </g>
          );
        })}

        {/* Top Face Drag Handle Indicator */}
        <g className="pointer-events-none">
          <circle cx={topMid.x} cy={topMid.y} r={11} fill="none" stroke={COLOR_HEIGHT} strokeWidth={1.5} opacity={0.6} className="animate-pulse" />
          <circle cx={topMid.x} cy={topMid.y} r={7} fill="rgba(255, 212, 94, 0.4)" stroke={COLOR_HEIGHT} strokeWidth={2} />
          <circle cx={topMid.x} cy={topMid.y} r={2.5} fill="#ffffff" />
        </g>

        {/* Dimension Labels */}
        {/* Length (l) */}
        <text
          x={(fl.x + fr.x) / 2}
          y={fl.y + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_LEN}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {l}
        </text>

        {/* Width (w) */}
        <text
          x={fr.x + dxD / 2 + 12}
          y={fr.y + dyD / 2 + 6}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_WIDTH}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {w}
        </text>

        {/* Height (h) */}
        <text
          x={ftl.x - 12}
          y={(ftl.y + fl.y) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {activeLayers}
        </text>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none text-white">
          <span>V</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_LEN }}>{l}</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_WIDTH }}>{w}</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{activeLayers}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_VOL }} className="font-bold">{currentVol}</span>
        </div>
      </div>
    </div>
  );
}
