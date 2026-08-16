"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEulerProps = {
  color?: string;
};

const SVG_H = 150;

const POLYHEDRA = [
  { name: "Cube", V: 8, E: 12, F: 6, shape: "cube" },
  { name: "Tetrahedron", V: 4, E: 6, F: 4, shape: "tetra" },
  { name: "Octahedron", V: 6, E: 12, F: 8, shape: "octa" },
  { name: "Pentagonal Prism", V: 10, E: 15, F: 7, shape: "prism5" },
];

const COLOR_CYAN = "#5ee8ff"; // Faces
const COLOR_GOLD = "#ffd45e"; // Edges
const COLOR_WHITE = "#ffffff"; // Vertices

export function InteractiveEulerExplorer({ color }: InteractiveEulerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [selectedIdx, setSelectedIdx] = useState(0); // Cube

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const current = POLYHEDRA[selectedIdx];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {current.shape === "cube" && (
          <g transform={`translate(${CX - 45}, 20)`}>
            {/* Hidden back edges */}
            <line x1={25} y1={85} x2={25} y2={15} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={25} y1={85} x2={0} y2={105} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={25} y1={85} x2={95} y2={85} stroke={COLOR_GOLD} strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Front face */}
            <polygon
              points="0,35 70,35 70,105 0,105"
              fill="rgba(94,232,255,0.30)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
            />
            {/* Right face */}
            <polygon
              points="70,35 95,15 95,85 70,105"
              fill="rgba(94,232,255,0.15)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
            />
            {/* Top face */}
            <polygon
              points="0,35 25,15 95,15 70,35"
              fill="rgba(94,232,255,0.40)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
            />

            {/* Vertices */}
            {[
              { x: 0, y: 35 }, { x: 70, y: 35 }, { x: 70, y: 105 }, { x: 0, y: 105 },
              { x: 25, y: 15 }, { x: 95, y: 15 }, { x: 95, y: 85 }, { x: 25, y: 85 }
            ].map((v, i) => (
              <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
            ))}
          </g>
        )}

        {current.shape === "tetra" && (
          <g transform={`translate(${CX - 60}, 20)`}>
            <line x1={60} y1={100} x2={60} y2={15} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
            <polygon
              points="60,15 0,85 120,85"
              fill="rgba(94,232,255,0.30)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
            />
            <polygon
              points="0,85 60,105 120,85"
              fill="rgba(94,232,255,0.18)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2}
            />
            <line x1={60} y1={15} x2={60} y2={105} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            {[{ x: 60, y: 15 }, { x: 0, y: 85 }, { x: 120, y: 85 }, { x: 60, y: 105 }].map((v, i) => (
              <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
            ))}
          </g>
        )}

        {current.shape === "octa" && (
          <g transform={`translate(${CX - 50}, 15)`}>
            <polygon points="50,15 0,65 50,115 100,65" fill="rgba(94,232,255,0.20)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={0} y1={65} x2={100} y2={65} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={50} y1={15} x2={50} y2={115} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            {[{ x: 50, y: 15 }, { x: 0, y: 65 }, { x: 100, y: 65 }, { x: 50, y: 115 }, { x: 35, y: 55 }, { x: 65, y: 75 }].map((v, i) => (
              <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
            ))}
          </g>
        )}

        {current.shape === "prism5" && (
          <g transform={`translate(${CX - 50}, 15)`}>
            <polygon points="20,35 50,15 80,35 70,70 30,70" fill="rgba(94,232,255,0.28)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <polygon points="20,90 50,70 80,90 70,125 30,125" fill="rgba(94,232,255,0.12)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={20} y1={35} x2={20} y2={90} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={80} y1={35} x2={80} y2={90} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={70} y1={70} x2={70} y2={125} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={30} y1={70} x2={30} y2={125} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* Polyhedron Capsule Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        {POLYHEDRA.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => setSelectedIdx(idx)}
            className={cn(
              "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all duration-200 border-none",
              selectedIdx === idx
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Live Euler Typographic Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_WHITE }}>V ({current.V})</span>
          <span className="text-white/50">−</span>
          <span style={{ color: COLOR_GOLD }}>E ({current.E})</span>
          <span className="text-white/50">+</span>
          <span style={{ color: COLOR_CYAN }}>F ({current.F})</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold text-base">2</span>
        </div>
      </div>
    </div>
  );
}
