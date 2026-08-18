"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveSolidFeatureProps = {
  feature?: "face" | "edge" | "vertex";
  color?: string;
};

const SVG_H = 150;

const COLOR_CYAN = "#5ee8ff"; // face
const COLOR_GOLD = "#ffd45e"; // edge
const COLOR_WHITE = "#ffffff"; // vertex

export function InteractiveSolidFeatureExplorer({ feature: initialFeature = "face", color }: InteractiveSolidFeatureProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [activeFeature, setActiveFeature] = useState<"face" | "edge" | "vertex">(initialFeature);
  const [viewMode, setViewMode] = useState<"3d" | "net">("3d");

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Cube dimensions centered at CX for 3D mode
  const cubeW = 68;
  const cubeH = 68;
  const cubeD = 30;
  const ox = CX - cubeW / 2 - 10;
  const oy = 56;

  // 2D Net layout (cross shape: top, center 4-row column, left wing, right wing)
  const netS = 28; // square size
  const netCX = CX;
  const netCY = 75;
  const faces2D = [
    { id: 1, name: "Top", x: netCX - netS / 2, y: netCY - 1.5 * netS - netS / 2 },
    { id: 2, name: "Left", x: netCX - 1.5 * netS, y: netCY - netS / 2 },
    { id: 3, name: "Front", x: netCX - netS / 2, y: netCY - netS / 2 },
    { id: 4, name: "Right", x: netCX + netS / 2, y: netCY - netS / 2 },
    { id: 5, name: "Bottom", x: netCX - netS / 2, y: netCY + netS / 2 },
    { id: 6, name: "Back", x: netCX - netS / 2, y: netCY + 1.5 * netS },
  ];

  // 8 Unique vertices on 2D net (with their mapped positions)
  const netVertices = [
    { x: netCX - netS / 2, y: netCY - 1.5 * netS - netS / 2, label: "1" },
    { x: netCX + netS / 2, y: netCY - 1.5 * netS - netS / 2, label: "2" },
    { x: netCX - 1.5 * netS, y: netCY - netS / 2, label: "3" },
    { x: netCX + 1.5 * netS, y: netCY - netS / 2, label: "4" },
    { x: netCX - 1.5 * netS, y: netCY + netS / 2, label: "5" },
    { x: netCX + 1.5 * netS, y: netCY + netS / 2, label: "6" },
    { x: netCX - netS / 2, y: netCY + 2.5 * netS, label: "7" },
    { x: netCX + netS / 2, y: netCY + 2.5 * netS, label: "8" },
  ];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {viewMode === "3d" ? (
          /* 3D Isometric View */
          <g>
            {/* Hidden back edges */}
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeD} y2={oy - cubeD} stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={activeFeature === "edge" ? 2 : 1.5} strokeDasharray="4 3" />
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox} y2={oy + cubeH} stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={activeFeature === "edge" ? 2 : 1.5} strokeDasharray="4 3" />
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeW + cubeD} y2={oy + cubeH - cubeD} stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255,255,255,0.3)"} strokeWidth={activeFeature === "edge" ? 2 : 1.5} strokeDasharray="4 3" />

            {/* Front face */}
            <polygon
              points={`${ox},${oy} ${ox + cubeW},${oy} ${ox + cubeW},${oy + cubeH} ${ox},${oy + cubeH}`}
              fill={activeFeature === "face" ? "rgba(94, 232, 255, 0.45)" : "rgba(255, 255, 255, 0.12)"}
              stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
              strokeWidth={activeFeature === "edge" ? 2.5 : 2}
            />
            {/* Right face */}
            <polygon
              points={`${ox + cubeW},${oy} ${ox + cubeW + cubeD},${oy - cubeD} ${ox + cubeW + cubeD},${oy + cubeH - cubeD} ${ox + cubeW},${oy + cubeH}`}
              fill={activeFeature === "face" ? "rgba(94, 232, 255, 0.25)" : "rgba(255, 255, 255, 0.06)"}
              stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
              strokeWidth={activeFeature === "edge" ? 2.5 : 2}
            />
            {/* Top face */}
            <polygon
              points={`${ox},${oy} ${ox + cubeD},${oy - cubeD} ${ox + cubeW + cubeD},${oy - cubeD} ${ox + cubeW},${oy}`}
              fill={activeFeature === "face" ? "rgba(94, 232, 255, 0.35)" : "rgba(255, 255, 255, 0.18)"}
              stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
              strokeWidth={activeFeature === "edge" ? 2.5 : 2}
            />

            {/* Edge feature highlight on visible edges */}
            {activeFeature === "edge" && (
              <g stroke={COLOR_GOLD} strokeWidth={3.5} strokeLinecap="round">
                <line x1={ox} y1={oy} x2={ox + cubeW} y2={oy} />
                <line x1={ox + cubeW} y1={oy} x2={ox + cubeW} y2={oy + cubeH} />
                <line x1={ox + cubeW} y1={oy + cubeH} x2={ox} y2={oy + cubeH} />
                <line x1={ox} y1={oy + cubeH} x2={ox} y2={oy} />
                <line x1={ox} y1={oy} x2={ox + cubeD} y2={oy - cubeD} />
                <line x1={ox + cubeW} y1={oy} x2={ox + cubeW + cubeD} y2={oy - cubeD} />
                <line x1={ox + cubeD} y1={oy - cubeD} x2={ox + cubeW + cubeD} y2={oy - cubeD} />
                <line x1={ox + cubeW + cubeD} y1={oy - cubeD} x2={ox + cubeW + cubeD} y2={oy + cubeH - cubeD} />
                <line x1={ox + cubeW} y1={oy + cubeH} x2={ox + cubeW + cubeD} y2={oy + cubeH - cubeD} />
              </g>
            )}

            {/* Vertex feature highlight on all vertices */}
            {activeFeature === "vertex" && (
              <g>
                {[
                  { x: ox, y: oy }, { x: ox + cubeW, y: oy }, { x: ox + cubeW, y: oy + cubeH }, { x: ox, y: oy + cubeH },
                  { x: ox + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy + cubeH - cubeD },
                  { x: ox + cubeD, y: oy + cubeH - cubeD }
                ].map((v, i) => (
                  <g key={i}>
                    <circle cx={v.x} cy={v.y} r={7} fill="rgba(255,255,255,0.25)" />
                    <circle cx={v.x} cy={v.y} r={4} fill={COLOR_WHITE} />
                  </g>
                ))}
              </g>
            )}

            {/* Neutral vertex dots when not inspecting vertices */}
            {activeFeature !== "vertex" && (
              <>
                {[
                  { x: ox, y: oy }, { x: ox + cubeW, y: oy }, { x: ox + cubeW, y: oy + cubeH }, { x: ox, y: oy + cubeH },
                  { x: ox + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy + cubeH - cubeD }
                ].map((v, i) => (
                  <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
                ))}
              </>
            )}
          </g>
        ) : (
          /* 2D Net Unfold View */
          <g>
            {/* Draw 6 Net Faces */}
            {faces2D.map((f) => (
              <g key={f.id}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={netS}
                  height={netS}
                  fill={activeFeature === "face" ? "rgba(94, 232, 255, 0.40)" : "rgba(255, 255, 255, 0.12)"}
                  stroke={activeFeature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
                  strokeWidth={activeFeature === "edge" ? 2 : 1.5}
                />
                <text
                  x={f.x + netS / 2}
                  y={f.y + netS / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight="800"
                  fill={activeFeature === "face" ? COLOR_CYAN : "#ffffff"}
                  fontFamily="var(--font-heading, system-ui)"
                >
                  {f.id}
                </text>
              </g>
            ))}

            {/* Vertex Dots on 2D Net */}
            {activeFeature === "vertex" && (
              <g>
                {netVertices.map((v, i) => (
                  <g key={i}>
                    <circle cx={v.x} cy={v.y} r={6} fill="rgba(255,255,255,0.3)" />
                    <circle cx={v.x} cy={v.y} r={3.5} fill={COLOR_WHITE} />
                  </g>
                ))}
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Mode & Feature Controls in Standard Frosted Capsules */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-30 select-none">
        {/* View Toggle */}
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

        {/* Feature Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setActiveFeature("face")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              activeFeature === "face" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Face (6)
          </button>
          <button
            onClick={() => setActiveFeature("edge")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              activeFeature === "edge" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Edge (12)
          </button>
          <button
            onClick={() => setActiveFeature("vertex")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              activeFeature === "vertex" ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Vertex (8)
          </button>
        </div>
      </div>

      {/* Live Typographic Status Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-4 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          {activeFeature === "face" && (
            <>
              <span style={{ color: COLOR_CYAN }}>Face</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Flat planar 2D surface of a solid (Cube has 6 faces)</span>
            </>
          )}
          {activeFeature === "edge" && (
            <>
              <span style={{ color: COLOR_GOLD }}>Edge</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Line segment where two faces meet (Cube has 12 edges)</span>
            </>
          )}
          {activeFeature === "vertex" && (
            <>
              <span style={{ color: COLOR_WHITE }}>Vertex</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Corner point where 3+ edges meet (Cube has 8 vertices)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
