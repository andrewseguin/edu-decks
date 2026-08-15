"use client";

import React, { useState, useCallback } from "react";

type InteractiveEulerProps = {
  color?: string;
};

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
  const [selectedIdx, setSelectedIdx] = useState(0); // Cube
  const [highlightMode, setHighlightMode] = useState<"all" | "V" | "E" | "F">("all");

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const current = POLYHEDRA[selectedIdx];

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox="0 0 240 145" className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none overflow-visible">
        {current.shape === "cube" && (
          <g transform="translate(60, 20)">
            {/* Hidden back edges */}
            <line x1={25} y1={85} x2={25} y2={25} stroke={highlightMode === "E" || highlightMode === "all" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={highlightMode === "E" ? 2.5 : 1.5} strokeDasharray="3 3" />
            <line x1={25} y1={85} x2={0} y2={95} stroke={highlightMode === "E" || highlightMode === "all" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={highlightMode === "E" ? 2.5 : 1.5} strokeDasharray="3 3" />
            <line x1={25} y1={85} x2={95} y2={85} stroke={highlightMode === "E" || highlightMode === "all" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={highlightMode === "E" ? 2.5 : 1.5} strokeDasharray="3 3" />

            {/* Front face */}
            <polygon
              points="0,35 70,35 70,105 0,105"
              fill={highlightMode === "F" ? "rgba(94,232,255,0.35)" : "rgba(255,255,255,0.12)"}
              stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"}
              strokeWidth={highlightMode === "E" ? 3 : 2}
            />
            {/* Right face */}
            <polygon
              points="70,35 95,15 95,85 70,105"
              fill={highlightMode === "F" ? "rgba(94,232,255,0.25)" : "rgba(255,255,255,0.06)"}
              stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"}
              strokeWidth={highlightMode === "E" ? 3 : 2}
            />
            {/* Top face */}
            <polygon
              points="0,35 25,15 95,15 70,35"
              fill={highlightMode === "F" ? "rgba(94,232,255,0.45)" : "rgba(255,255,255,0.18)"}
              stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"}
              strokeWidth={highlightMode === "E" ? 3 : 2}
            />

            {/* Vertices */}
            {(highlightMode === "V" || highlightMode === "all") && (
              <>
                {[
                  { x: 0, y: 35 }, { x: 70, y: 35 }, { x: 70, y: 105 }, { x: 0, y: 105 },
                  { x: 25, y: 15 }, { x: 95, y: 15 }, { x: 95, y: 85 }, { x: 25, y: 85 }
                ].map((v, i) => (
                  <circle key={i} cx={v.x} cy={v.y} r={highlightMode === "V" ? 4.5 : 3.5} fill={COLOR_WHITE} />
                ))}
              </>
            )}
          </g>
        )}

        {current.shape === "tetra" && (
          <g transform="translate(60, 20)">
            <line x1={60} y1={100} x2={60} y2={20} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="3 3" />
            <polygon
              points="60,20 0,90 120,90"
              fill={highlightMode === "F" ? "rgba(94,232,255,0.35)" : "rgba(255,255,255,0.12)"}
              stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"}
              strokeWidth={2}
            />
            <polygon
              points="0,90 60,110 120,90"
              fill={highlightMode === "F" ? "rgba(94,232,255,0.2)" : "rgba(255,255,255,0.06)"}
              stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"}
              strokeWidth={2}
            />
            <line x1={60} y1={20} x2={60} y2={110} stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"} strokeWidth={2} />
            {(highlightMode === "V" || highlightMode === "all") && (
              <>
                {[{ x: 60, y: 20 }, { x: 0, y: 90 }, { x: 120, y: 90 }, { x: 60, y: 110 }].map((v, i) => (
                  <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
                ))}
              </>
            )}
          </g>
        )}

        {current.shape === "octa" && (
          <g transform="translate(70, 15)">
            <polygon points="50,15 0,65 50,115 100,65" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={0} y1={65} x2={100} y2={65} stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"} strokeWidth={2} />
            <line x1={50} y1={15} x2={50} y2={115} stroke={highlightMode === "E" ? COLOR_GOLD : "rgba(255,255,255,0.95)"} strokeWidth={2} />
            {(highlightMode === "V" || highlightMode === "all") && (
              <>
                {[{ x: 50, y: 15 }, { x: 0, y: 65 }, { x: 100, y: 65 }, { x: 50, y: 115 }, { x: 35, y: 55 }, { x: 65, y: 75 }].map((v, i) => (
                  <circle key={i} cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
                ))}
              </>
            )}
          </g>
        )}

        {current.shape === "prism5" && (
          <g transform="translate(60, 15)">
            <polygon points="20,40 50,20 80,40 70,75 30,75" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <polygon points="20,95 50,75 80,95 70,130 30,130" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={20} y1={40} x2={20} y2={95} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={80} y1={40} x2={80} y2={95} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={70} y1={75} x2={70} y2={130} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
            <line x1={30} y1={75} x2={30} y2={130} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* Polyhedron & Highlight Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {POLYHEDRA.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => setSelectedIdx(idx)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
              selectedIdx === idx
                ? "bg-white text-black border-white shadow-md scale-105"
                : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Live Euler Typographic Equation Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_WHITE }}>V ({current.V})</span>
          <span className="text-white/60">−</span>
          <span style={{ color: COLOR_GOLD }}>E ({current.E})</span>
          <span className="text-white/60">+</span>
          <span style={{ color: COLOR_CYAN }}>F ({current.F})</span>
          <span className="text-white/60">=</span>
          <span className="text-white font-extrabold text-base">2</span>
        </div>
      </div>
    </div>
  );
}
