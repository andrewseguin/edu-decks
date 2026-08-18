"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveVertexProps = {
  color?: string;
};

const SVG_H = 150;

const COLOR_CYAN = "#5ee8ff";
const COLOR_GOLD = "#ffd45e";
const COLOR_VERTEX = "#ffffff"; // Bold Glowing White

export function InteractiveVertexExplorer({ color }: InteractiveVertexProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [selectedV, setSelectedV] = useState<"apex" | "base1" | "base2" | "base3" | "base4" | "all">("apex");
  const [viewMode, setViewMode] = useState<"3d" | "net">("3d");

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // 3D Square Pyramid Coordinates
  const W = 85, H = 75, D = 44;
  const ox = CX - 48;
  const oy = 125;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  const fl = { x: ox, y: oy, id: "base1", name: "Front Left Corner", edgesCount: 3 };
  const fr = { x: ox + W, y: oy, id: "base2", name: "Front Right Corner", edgesCount: 3 };
  const bl = { x: ox + dxD, y: oy + dyD, id: "base4", name: "Back Left Corner", edgesCount: 3 };
  const br = { x: ox + W + dxD, y: oy + dyD, id: "base3", name: "Back Right Corner", edgesCount: 3 };
  const baseMid = { x: (fl.x + fr.x + bl.x + br.x) / 4, y: (fl.y + fr.y + bl.y + br.y) / 4 };
  const apex = { x: baseMid.x, y: baseMid.y - H, id: "apex", name: "Top Apex Vertex", edgesCount: 4 };

  const allVertices = [apex, fl, fr, br, bl];

  // 2D Net layout (square base in center + 4 triangle flaps)
  const netS = 38;
  const netCX = CX;
  const netCY = 75;
  const flapH = 26;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {viewMode === "3d" ? (
          /* 3D Square Pyramid with Vertex Corner Highlighting */
          <g>
            {/* Hidden back edges */}
            <line x1={bl.x} y1={bl.y} x2={apex.x} y2={apex.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Pyramid Base Fill */}
            <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${br.x},${br.y} ${bl.x},${bl.y}`} fill="rgba(255,255,255,0.06)" />

            {/* Front Face */}
            <polygon
              points={`${apex.x},${apex.y} ${fl.x},${fl.y} ${fr.x},${fr.y}`}
              fill="rgba(94, 232, 255, 0.30)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth={1.8}
            />
            {/* Right Face */}
            <polygon
              points={`${apex.x},${apex.y} ${fr.x},${fr.y} ${br.x},${br.y}`}
              fill="rgba(94, 232, 255, 0.15)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth={1.8}
            />

            {/* Converging Rays for Selected Vertex */}
            {selectedV === "apex" && (
              <g stroke={COLOR_CYAN} strokeWidth={2.5} strokeLinecap="round">
                <line x1={fl.x} y1={fl.y} x2={apex.x} y2={apex.y} />
                <line x1={fr.x} y1={fr.y} x2={apex.x} y2={apex.y} />
                <line x1={br.x} y1={br.y} x2={apex.x} y2={apex.y} />
                <line x1={bl.x} y1={bl.y} x2={apex.x} y2={apex.y} strokeDasharray="4 3" />
              </g>
            )}

            {/* Vertex Dots */}
            {allVertices.map((v) => {
              const isSel = selectedV === "all" || selectedV === v.id;
              return (
                <g key={v.id}>
                  {isSel && (
                    <circle cx={v.x} cy={v.y} r={8} fill="none" stroke={COLOR_VERTEX} strokeWidth={1.5} opacity={0.6} className="animate-ping" />
                  )}
                  <circle cx={v.x} cy={v.y} r={isSel ? 5 : 3.5} fill={isSel ? COLOR_VERTEX : "rgba(255,255,255,0.6)"} />
                  {isSel && selectedV !== "all" && (
                    <text
                      x={v.x}
                      y={v.y - 10}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="900"
                      fill={COLOR_VERTEX}
                      fontFamily="var(--font-heading, system-ui)"
                    >
                      {v.name} ({v.edgesCount} edges meet)
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ) : (
          /* 2D Net View showing outer apex points converging */
          <g>
            {/* Center Base Square */}
            <rect
              x={netCX - netS / 2}
              y={netCY - netS / 2}
              width={netS}
              height={netS}
              fill="rgba(255, 255, 255, 0.12)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
            />

            {/* 4 Triangular Flaps */}
            {/* Top Flap */}
            <polygon
              points={`${netCX - netS / 2},${netCY - netS / 2} ${netCX + netS / 2},${netCY - netS / 2} ${netCX},${netCY - netS / 2 - flapH}`}
              fill="rgba(94, 232, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
            />
            <circle cx={netCX} cy={netCY - netS / 2 - flapH} r={3.5} fill={COLOR_VERTEX} />

            {/* Bottom Flap */}
            <polygon
              points={`${netCX - netS / 2},${netCY + netS / 2} ${netCX + netS / 2},${netCY + netS / 2} ${netCX},${netCY + netS / 2 + flapH}`}
              fill="rgba(94, 232, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
            />
            <circle cx={netCX} cy={netCY + netS / 2 + flapH} r={3.5} fill={COLOR_VERTEX} />

            {/* Left Flap */}
            <polygon
              points={`${netCX - netS / 2},${netCY - netS / 2} ${netCX - netS / 2},${netCY + netS / 2} ${netCX - netS / 2 - flapH},${netCY}`}
              fill="rgba(94, 232, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
            />
            <circle cx={netCX - netS / 2 - flapH} cy={netCY} r={3.5} fill={COLOR_VERTEX} />

            {/* Right Flap */}
            <polygon
              points={`${netCX + netS / 2},${netCY - netS / 2} ${netCX + netS / 2},${netCY + netS / 2} ${netCX + netS / 2 + flapH},${netCY}`}
              fill="rgba(94, 232, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
            />
            <circle cx={netCX + netS / 2 + flapH} cy={netCY} r={3.5} fill={COLOR_VERTEX} />

            <text x={CX} y={142} textAnchor="middle" fontSize={11} fontWeight="bold" fill="rgba(255, 255, 255, 0.85)">
              4 Outer Tips Fold Together to Form the Single 3D Apex Vertex
            </text>
          </g>
        )}
      </svg>

      {/* Mode & Vertex Selector Capsules */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-30 select-none">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setViewMode("3d")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              viewMode === "3d" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            1. 3D Solid
          </button>
          <button
            onClick={() => setViewMode("net")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              viewMode === "net" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. Unfold 2D Net
          </button>
        </div>

        {/* Vertex Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setSelectedV("apex")}
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              selectedV === "apex" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Apex (4 edges)
          </button>
          <button
            onClick={() => setSelectedV("base1")}
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              selectedV === "base1" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Base Corner (3 edges)
          </button>
          <button
            onClick={() => setSelectedV("all")}
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              selectedV === "all" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            All 5 Vertices
          </button>
        </div>
      </div>

      {/* Live Pedagogical Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-4 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_VERTEX }}>Vertex:</span>
          <span className="text-white">
            {selectedV === "apex"
              ? "Corner point where 4 edges meet at 1 peak"
              : selectedV === "all"
              ? "5 Corner Vertices on a Square Pyramid"
              : "Corner point where 3 edges meet at 1 corner"}
          </span>
        </div>
      </div>
    </div>
  );
}
