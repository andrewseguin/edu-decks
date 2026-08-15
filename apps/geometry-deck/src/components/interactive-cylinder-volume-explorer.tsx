"use client";

import React, { useState, useCallback } from "react";

type InteractiveCylinderVolumeProps = {
  color?: string;
};

const SVG_W = 240;
const SVG_H = 150;
const CX = 120;

const COLOR_CYAN = "#5ee8ff"; // base radius r
const COLOR_GOLD = "#ffd45e"; // height h
const COLOR_WHITE = "#ffffff";

export function InteractiveCylinderVolumeExplorer({ color }: InteractiveCylinderVolumeProps) {
  const [r, setR] = useState(3); // r in [2..5]
  const [h, setH] = useState(4); // h in [2..6]

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const cr = r * 14;
  const ey = 12;
  const topY = 40;
  const botY = topY + h * 16;
  const baseAreaCoeff = r * r;
  const volCoeff = baseAreaCoeff * h;

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none overflow-visible">
        {/* Bottom Base Ellipse */}
        <ellipse cx={CX} cy={botY} rx={cr} ry={ey} fill="rgba(94, 232, 255, 0.12)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Cylinder Body */}
        <path
          d={`M ${CX - cr} ${topY} L ${CX - cr} ${botY} A ${cr} ${ey} 0 0 0 ${CX + cr} ${botY} L ${CX + cr} ${topY} Z`}
          fill="rgba(94, 232, 255, 0.18)"
        />
        <line x1={CX - cr} y1={topY} x2={CX - cr} y2={botY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
        <line x1={CX + cr} y1={topY} x2={CX + cr} y2={botY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Horizontal disk slice lines */}
        {Array.from({ length: h - 1 }, (_, i) => {
          const sliceY = topY + (i + 1) * 16;
          return (
            <ellipse
              key={i}
              cx={CX}
              cy={sliceY}
              rx={cr}
              ry={ey}
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Top Base Ellipse */}
        <ellipse cx={CX} cy={topY} rx={cr} ry={ey} fill="rgba(94, 232, 255, 0.3)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

        {/* Radius line on top */}
        <circle cx={CX} cy={topY} r={3} fill="#ffffff" />
        <line x1={CX} y1={topY} x2={CX + cr} y2={topY} stroke={COLOR_CYAN} strokeWidth={2} strokeDasharray="3 2" />
        <circle cx={CX + cr} cy={topY} r={3} fill={COLOR_CYAN} />
        <text x={CX + cr / 2} y={topY - 8} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLOR_CYAN}>
          r = {r}
        </text>

        {/* Height line */}
        <line x1={CX + cr + 10} y1={topY} x2={CX + cr + 10} y2={botY} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="2 2" />
        <text x={CX + cr + 22} y={(topY + botY) / 2} textAnchor="start" dominantBaseline="central" fontSize={11} fontWeight="bold" fill={COLOR_GOLD}>
          h = {h}
        </text>
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-4 text-xs font-bold text-white/90">
        <div className="flex items-center gap-1.5">
          <span>Radius (r):</span>
          <button onClick={() => setR((p) => Math.max(2, p - 1))} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20">
            −
          </button>
          <span style={{ color: COLOR_CYAN }}>{r}</span>
          <button onClick={() => setR((p) => Math.min(5, p + 1))} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20">
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Height (h):</span>
          <button onClick={() => setH((p) => Math.max(2, p - 1))} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20">
            −
          </button>
          <span style={{ color: COLOR_GOLD }}>{h}</span>
          <button onClick={() => setH((p) => Math.min(6, p + 1))} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 border border-white/20">
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">V</span>
          <span className="text-white/60">=</span>
          <span className="text-white/80">Base (πr²) · h</span>
          <span className="text-white/60">=</span>
          <span style={{ color: COLOR_CYAN }}>{baseAreaCoeff}π</span>
          <span className="text-white/60">·</span>
          <span style={{ color: COLOR_GOLD }}>{h}</span>
          <span className="text-white/60">=</span>
          <span className="text-white font-extrabold">{volCoeff}π</span>
        </div>
      </div>
    </div>
  );
}
