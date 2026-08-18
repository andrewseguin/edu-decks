"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEdgeProps = {
  color?: string;
};

const SVG_H = 150;

const COLOR_FACE_A = "#5ee8ff"; // Electric Cyan (First intersecting face)
const COLOR_FACE_B = "#d8b4fe"; // Soft Lilac (Second intersecting face)
const COLOR_EDGE = "#ffd45e";   // Glowing Warm Gold (Intersection edge)

export function InteractiveEdgeExplorer({ color }: InteractiveEdgeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [selectedEdge, setSelectedEdge] = useState<number>(1); // 1..12 or 0 (all)
  const [viewMode, setViewMode] = useState<"3d" | "net">("3d");

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // 3D Prism Coordinates
  const W = 70, H = 65, D = 32;
  const ox = CX - W / 2 - 12;
  const oy = 60;

  // 8 Vertices
  const v0 = { x: ox, y: oy };                   // Front Top Left
  const v1 = { x: ox + W, y: oy };               // Front Top Right
  const v2 = { x: ox + W, y: oy + H };           // Front Bot Right
  const v3 = { x: ox, y: oy + H };               // Front Bot Left
  const v4 = { x: ox + D, y: oy - D };           // Back Top Left
  const v5 = { x: ox + W + D, y: oy - D };       // Back Top Right
  const v6 = { x: ox + W + D, y: oy + H - D };   // Back Bot Right
  const v7 = { x: ox + D, y: oy + H - D };       // Back Bot Left

  // 12 Edges with their 2 endpoints and the 2 intersecting faces
  const edges = [
    { id: 1, name: "Top Front", p1: v0, p2: v1, face1: "Top", face2: "Front" },
    { id: 2, name: "Right Front", p1: v1, p2: v2, face1: "Front", face2: "Right" },
    { id: 3, name: "Bottom Front", p1: v2, p2: v3, face1: "Front", face2: "Bottom" },
    { id: 4, name: "Left Front", p1: v3, p2: v0, face1: "Front", face2: "Left" },
    { id: 5, name: "Top Right", p1: v1, p2: v5, face1: "Top", face2: "Right" },
    { id: 6, name: "Top Back", p1: v5, p2: v4, face1: "Top", face2: "Back" },
    { id: 7, name: "Top Left", p1: v4, p2: v0, face1: "Top", face2: "Left" },
    { id: 8, name: "Right Back", p1: v5, p2: v6, face1: "Right", face2: "Back" },
    { id: 9, name: "Bottom Right", p1: v2, p2: v6, face1: "Right", face2: "Bottom" },
    { id: 10, name: "Bottom Back", p1: v6, p2: v7, face1: "Bottom", face2: "Back" },
    { id: 11, name: "Left Back", p1: v7, p2: v4, face1: "Left", face2: "Back" },
    { id: 12, name: "Bottom Left", p1: v3, p2: v7, face1: "Bottom", face2: "Left" },
  ];

  const curr = edges[(selectedEdge === 0 ? 1 : selectedEdge) - 1];

  // 2D Net layout
  const netS = 28;
  const netCX = CX;
  const netCY = 75;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {viewMode === "3d" ? (
          /* 3D Prism highlighting 2 intersecting faces + edge */
          <g>
            {/* Hidden back edges */}
            <line x1={v7.x} y1={v7.y} x2={v4.x} y2={v4.y} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={v7.x} y1={v7.y} x2={v3.x} y2={v3.y} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={v7.x} y1={v7.y} x2={v6.x} y2={v6.y} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Top Face */}
            <polygon
              points={`${v0.x},${v0.y} ${v4.x},${v4.y} ${v5.x},${v5.y} ${v1.x},${v1.y}`}
              fill={curr.face1 === "Top" ? "rgba(94, 232, 255, 0.45)" : curr.face2 === "Top" ? "rgba(216, 180, 254, 0.45)" : "rgba(255, 255, 255, 0.12)"}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth={1.5}
            />

            {/* Right Face */}
            <polygon
              points={`${v1.x},${v1.y} ${v5.x},${v5.y} ${v6.x},${v6.y} ${v2.x},${v2.y}`}
              fill={curr.face1 === "Right" ? "rgba(94, 232, 255, 0.45)" : curr.face2 === "Right" ? "rgba(216, 180, 254, 0.45)" : "rgba(255, 255, 255, 0.08)"}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth={1.5}
            />

            {/* Front Face */}
            <polygon
              points={`${v0.x},${v0.y} ${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`}
              fill={curr.face1 === "Front" ? "rgba(94, 232, 255, 0.45)" : curr.face2 === "Front" ? "rgba(216, 180, 254, 0.45)" : "rgba(255, 255, 255, 0.15)"}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth={1.5}
            />

            {/* Draw All 12 Edges */}
            {edges.map((e) => {
              const isSelected = selectedEdge === 0 || selectedEdge === e.id;
              return (
                <line
                  key={e.id}
                  x1={e.p1.x}
                  y1={e.p1.y}
                  x2={e.p2.x}
                  y2={e.p2.y}
                  stroke={isSelected ? COLOR_EDGE : "rgba(255,255,255,0.4)"}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Highlighted Edge Endpoints */}
            {selectedEdge !== 0 && (
              <g>
                <circle cx={curr.p1.x} cy={curr.p1.y} r={4} fill={COLOR_EDGE} />
                <circle cx={curr.p2.x} cy={curr.p2.y} r={4} fill={COLOR_EDGE} />
                <text
                  x={(curr.p1.x + curr.p2.x) / 2}
                  y={(curr.p1.y + curr.p2.y) / 2 - 8}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight="900"
                  fill={COLOR_EDGE}
                  fontFamily="var(--font-heading, system-ui)"
                >
                  Edge {curr.id}
                </text>
              </g>
            )}
          </g>
        ) : (
          /* 2D Net View highlighting all 12 edge fold seams */
          <g>
            {/* 6 Square Faces Net */}
            {[
              { id: "top", x: netCX - netS / 2, y: netCY - 1.5 * netS - netS / 2 },
              { id: "left", x: netCX - 1.5 * netS, y: netCY - netS / 2 },
              { id: "front", x: netCX - netS / 2, y: netCY - netS / 2 },
              { id: "right", x: netCX + netS / 2, y: netCY - netS / 2 },
              { id: "bottom", x: netCX - netS / 2, y: netCY + netS / 2 },
              { id: "back", x: netCX - netS / 2, y: netCY + 1.5 * netS },
            ].map((f) => (
              <rect
                key={f.id}
                x={f.x}
                y={f.y}
                width={netS}
                height={netS}
                fill="rgba(255, 255, 255, 0.08)"
                stroke={COLOR_EDGE}
                strokeWidth={2}
              />
            ))}
            <text x={CX} y={142} textAnchor="middle" fontSize={11} fontWeight="bold" fill="rgba(255, 255, 255, 0.85)">
              12 Gold Edge Seams on Unfolded 2D Net
            </text>
          </g>
        )}
      </svg>

      {/* Mode & Edge Selector Capsules */}
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

        {/* Edge Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setSelectedEdge((p) => (p <= 1 ? 12 : p - 1))}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white active:scale-95"
          >
            ◀
          </button>
          <button
            onClick={() => setSelectedEdge((p) => (p === 0 ? 1 : 0))}
            className="text-[11px] font-headline font-bold text-white px-1.5 py-0.5 bg-transparent border-none hover:underline"
          >
            {selectedEdge === 0 ? "All 12 Edges" : `Edge ${curr.id}: ${curr.name}`}
          </button>
          <button
            onClick={() => setSelectedEdge((p) => (p >= 12 ? 1 : p + 1))}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white active:scale-95"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Live Pedagogical Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-4 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_EDGE }}>Edge {curr.id}:</span>
          <span className="text-white">Intersection of</span>
          <span style={{ color: COLOR_FACE_A }}>{curr.face1}</span>
          <span className="text-white/50">&</span>
          <span style={{ color: COLOR_FACE_B }}>{curr.face2} Faces</span>
        </div>
      </div>
    </div>
  );
}
