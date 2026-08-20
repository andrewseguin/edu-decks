"use client";

import React, { useState, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractivePyramidVolumeProps = {
  color?: string;
};

const SVG_H = 195;

const COLOR_BASE = "#ffd45e"; // Warm Gold (B, b / base)
const COLOR_HEIGHT = "#5ee8ff"; // Electric Cyan (h / altitude)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractivePyramidVolumeExplorer({ color }: InteractivePyramidVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const b = 4; // base side
  const minH = 3;
  const maxH = 9;
  const [h, setH] = useState(6); // height [3, 6, 9] (multiples of 3)
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const startHRef = useRef<number>(h);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = b * b; // 16
  const pyramidVol = (baseArea * h) / 3;

  // Geometry coordinates
  const W = 96, D = 48;
  const pxPerH = 12;
  const hPx = h * pxPerH;
  const ox = CX - 58, oy = 158;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  const fl = { x: ox, y: oy };
  const fr = { x: ox + W, y: oy };
  const bl = { x: ox + dxD, y: oy + dyD };
  const br = { x: ox + W + dxD, y: oy + dyD };
  const baseMid = { x: (fl.x + fr.x + bl.x + br.x) / 4, y: (fl.y + fr.y + bl.y + br.y) / 4 };
  const apex = { x: baseMid.x, y: baseMid.y - hPx };

  // Prism top vertices for ghost container
  const ftl = { x: fl.x, y: fl.y - hPx };
  const ftr = { x: fr.x, y: fr.y - hPx };
  const btl = { x: bl.x, y: bl.y - hPx };
  const btr = { x: br.x, y: br.y - hPx };

  const handlePointerDown = (e: React.PointerEvent) => {
    stop(e);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHRef.current = h;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = startYRef.current - e.clientY;
    const deltaH = Math.round(dy / (pxPerH * 1.5)) * 3;
    const nextH = Math.max(minH, Math.min(maxH, startHRef.current + deltaH));
    setH(nextH);
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
        className="w-full touch-none select-none overflow-visible max-h-[195px] cursor-ns-resize"
      >
        {/* Ghost Equivalent Prism Outline (Showing 3x Volume Container) */}
        <g opacity={0.35}>
          <line x1={fl.x} y1={fl.y} x2={ftl.x} y2={ftl.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={fr.x} y1={fr.y} x2={ftr.x} y2={ftr.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={br.x} y1={br.y} x2={btr.x} y2={btr.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
          <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 3" />
        </g>

        {/* Hidden back edges of pyramid */}
        <line x1={bl.x} y1={bl.y} x2={apex.x} y2={apex.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Pyramid Base Fill */}
        <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${br.x},${br.y} ${bl.x},${bl.y}`} fill="rgba(255, 212, 94, 0.15)" />

        {/* Front Face */}
        <polygon points={`${apex.x},${apex.y} ${fl.x},${fl.y} ${fr.x},${fr.y}`} fill="rgba(94, 232, 255, 0.35)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        {/* Right Face */}
        <polygon points={`${apex.x},${apex.y} ${fr.x},${fr.y} ${br.x},${br.y}`} fill="rgba(94, 232, 255, 0.20)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Altitude Height Line */}
        <line x1={apex.x} y1={apex.y} x2={baseMid.x} y2={baseMid.y} stroke={COLOR_HEIGHT} strokeWidth={2} strokeDasharray="4 2" />
        <circle cx={baseMid.x} cy={baseMid.y} r={2.5} fill={COLOR_HEIGHT} />

        {/* Apex Drag Handle Indicator */}
        <g className="pointer-events-none">
          <circle cx={apex.x} cy={apex.y} r={11} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.5} opacity={0.7} className="animate-pulse" />
          <circle cx={apex.x} cy={apex.y} r={7} fill="rgba(255, 255, 255, 0.35)" stroke="#ffffff" strokeWidth={2} />
          <circle cx={apex.x} cy={apex.y} r={2.5} fill="#ffffff" />
        </g>

        {/* Labels */}
        <text
          x={(fl.x + fr.x) / 2}
          y={fl.y + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13.5}
          fontWeight="800"
          fill={COLOR_BASE}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          Base Area B = {baseArea}
        </text>
        <text
          x={apex.x - 14}
          y={(apex.y + baseMid.y) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          {h}
        </text>
      </svg>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none text-white">
          <span>V</span>
          <span className="text-white/50">=</span>
          <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
          <span className="text-white/80">·</span>
          <span style={{ color: COLOR_BASE }}>B ({baseArea})</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{h}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_VOL }} className="font-bold">{pyramidVol}</span>
        </div>
      </div>
    </div>
  );
}
