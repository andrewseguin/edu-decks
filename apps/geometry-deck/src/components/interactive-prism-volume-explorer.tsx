"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePrismVolumeProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_LEN = "#ffd45e";   // Warm Gold (l / length)
const COLOR_WIDTH = "#d8b4fe"; // Soft Lilac (w / width)
const COLOR_HEIGHT = "#5ee8ff";// Electric Cyan (h / height)
const COLOR_VOL = "#ffffff";   // Bold Crisp White

export function InteractivePrismVolumeExplorer({ color }: InteractivePrismVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const l = 4; // length units
  const w = 3; // width units
  const maxLayers = 6;
  const [activeLayers, setActiveLayers] = useState(3); // height/layers [1..6]
  const [isDragging, setIsDragging] = useState(false);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = l * w;
  const currentVol = baseArea * activeLayers;

  const unitPx = 22;
  const W = l * unitPx;
  const layerH = unitPx * 0.85;
  const H = activeLayers * layerH;
  const D = w * unitPx * 0.6;

  const ox = CX - (W + D * Math.cos(Math.PI / 6)) / 2;
  const oy = 162;
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

  const updateFromPointer = useCallback((clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.height <= 0) return;
    const scaleY = SVG_H / rect.height;
    const svgPointerY = (clientY - rect.top) * scaleY;
    const dy = oy - svgPointerY;
    const nextLayers = Math.max(1, Math.min(maxLayers, Math.round(dy / layerH)));
    setActiveLayers(nextLayers);
  }, [oy, layerH, maxLayers]);

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    updateFromPointer(e.clientY);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientY);
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
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ns-resize"
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
          <circle cx={topMid.x} cy={topMid.y} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={topMid.x} cy={topMid.y} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
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
