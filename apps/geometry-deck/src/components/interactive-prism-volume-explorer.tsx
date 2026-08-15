"use client";

import React, { useState, useCallback } from "react";

type InteractivePrismVolumeProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;

const COLOR_CYAN = "#5ee8ff"; // base, length, width
const COLOR_GOLD = "#ffd45e"; // height
const COLOR_WHITE = "#ffffff";

export function InteractivePrismVolumeExplorer({ color }: InteractivePrismVolumeProps) {
  const [length, setLength] = useState(4); // l in [2..6]
  const [width, setWidth] = useState(3);   // w in [2..5]
  const [height, setHeight] = useState(3); // h in [1..4]

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = length * width;
  const volume = baseArea * height;

  // Visual scaling
  const unitPx = 14;
  const W = length * unitPx;
  const H = height * unitPx * 1.2;
  const D = width * unitPx * 0.7;

  const ox = 60, oy = 90;
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
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none overflow-visible">
        {/* Hidden back edges */}
        <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="3 3" />

        {/* Front Face */}
        <polygon
          points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
          fill="rgba(94, 232, 255, 0.18)"
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
          fill="rgba(94, 232, 255, 0.28)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Unit layer slicing lines along height */}
        {Array.from({ length: height - 1 }, (_, i) => {
          const ly = oy - (i + 1) * (H / height);
          const rly = ly + dyD;
          return (
            <g key={i} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="2 2">
              <line x1={ox} y1={ly} x2={ox + W} y2={ly} />
              <line x1={ox + W} y1={ly} x2={ox + W + dxD} y2={rly} />
            </g>
          );
        })}

        {/* Dimension Labels */}
        {/* Length */}
        <text x={(fl.x + fr.x) / 2} y={fl.y + 14} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLOR_CYAN}>
          l = {length}
        </text>
        {/* Width */}
        <text x={fr.x + dxD / 2 + 12} y={fr.y + dyD / 2 + 6} textAnchor="start" fontSize={11} fontWeight="bold" fill={COLOR_CYAN}>
          w = {width}
        </text>
        {/* Height */}
        <text x={ftl.x - 12} y={(ftl.y + fl.y) / 2} textAnchor="end" dominantBaseline="central" fontSize={11} fontWeight="bold" fill={COLOR_GOLD}>
          h = {height}
        </text>
      </svg>

      {/* Layer Controls */}
      <div className="flex items-center gap-4 text-xs font-bold text-white/90">
        <div className="flex items-center gap-1.5">
          <span>Length:</span>
          <button
            onClick={() => setLength((p) => Math.max(2, p - 1))}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20"
          >
            −
          </button>
          <span>{length}</span>
          <button
            onClick={() => setLength((p) => Math.min(6, p + 1))}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Height (layers):</span>
          <button
            onClick={() => setHeight((p) => Math.max(1, p - 1))}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20"
          >
            −
          </button>
          <span style={{ color: COLOR_GOLD }}>{height}</span>
          <button
            onClick={() => setHeight((p) => Math.min(4, p + 1))}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">V</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">Base Area (l · w) · h</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_CYAN }}>{baseArea}</span>
          <span className="text-white/60">·</span>
          <span style={{ color: COLOR_GOLD }}>{height}</span>
          <span className="text-white/60">=</span>
          <span className="text-white font-extrabold">{volume}</span>
        </div>
      </div>
    </div>
  );
}
