"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractivePrismVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_LEN = "#5ee8ff";   // Electric Cyan (l, w)
const COLOR_WIDTH = "#5ee8ff"; // Electric Cyan
const COLOR_HEIGHT = "#ffd45e";// Warm Gold (h)
const COLOR_VOL = "#ffffff";   // Bold Crisp White

export function InteractivePrismVolumeExplorer({ color }: InteractivePrismVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const l = 4; // length
  const w = 3; // width
  const maxLayers = 4;
  const [activeLayers, setActiveLayers] = useState(3);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = l * w;
  const currentVol = baseArea * activeLayers;

  const unitPx = SVG_W >= 380 ? 15 : 13;
  const W = l * unitPx;
  const H = activeLayers * unitPx * 1.15;
  const D = w * unitPx * 0.7;

  const ox = CX - (W + D * Math.cos(Math.PI / 6)) / 2;
  const oy = 115;
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

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {/* Hidden back edges */}
        <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Front Face */}
        <polygon
          points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
          fill="rgba(94, 232, 255, 0.22)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Right Side Face */}
        <polygon
          points={`${fr.x},${fr.y} ${br.x},${br.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
          fill="rgba(94, 232, 255, 0.10)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Top Face */}
        <polygon
          points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
          fill="rgba(94, 232, 255, 0.35)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Unit layer slicing lines along activeLayers */}
        {Array.from({ length: activeLayers - 1 }, (_, i) => {
          const ly = oy - (i + 1) * (H / activeLayers);
          const rly = ly + dyD;
          return (
            <g key={i} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1} strokeDasharray="2 2">
              <line x1={ox} y1={ly} x2={ox + W} y2={ly} />
              <line x1={ox + W} y1={ly} x2={ox + W + dxD} y2={rly} />
            </g>
          );
        })}

        {/* Dimension Labels */}
        {/* Length (l) */}
        <text
          x={(fl.x + fr.x) / 2}
          y={fl.y + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_LEN}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {l}
        </text>

        {/* Width (w) */}
        <text
          x={fr.x + dxD / 2 + 12}
          y={fr.y + dyD / 2 + 6}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_WIDTH}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {w}
        </text>

        {/* Height (h) */}
        <text
          x={ftl.x - 12}
          y={(ftl.y + fl.y) / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="800"
          fill={COLOR_HEIGHT}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
        >
          {activeLayers}
        </text>
      </svg>

      {/* Stepper Controls for activeLayers in Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setActiveLayers((prev) => Math.max(1, prev - 1))}
          disabled={activeLayers <= 1}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          −
        </button>
        <div className="flex items-center px-2 py-0.5 text-xs sm:text-sm font-headline font-bold text-white">
          {activeLayers} of {maxLayers} Layers (Base Area = {baseArea})
        </div>
        <button
          onClick={() => setActiveLayers((prev) => Math.min(maxLayers, prev + 1))}
          disabled={activeLayers >= maxLayers}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          +
        </button>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">V</span>
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
