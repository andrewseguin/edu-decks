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

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Cube dimensions centered at CX
  const cubeW = 70;
  const cubeH = 70;
  const cubeD = 30;
  const ox = CX - cubeW / 2 - 10;
  const oy = 55;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        <g>
          {/* Hidden back edges */}
          <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeD} y2={oy - cubeD} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox} y2={oy + cubeH} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeW + cubeD} y2={oy + cubeH - cubeD} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

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

          {/* Edge feature highlight on front-top horizontal edge */}
          {activeFeature === "edge" && (
            <line x1={ox} y1={oy} x2={ox + cubeW} y2={oy} stroke={COLOR_GOLD} strokeWidth={4.5} strokeLinecap="round" />
          )}

          {/* Vertex feature highlight on top-front-left corner */}
          {activeFeature === "vertex" && (
            <g>
              <circle cx={ox} cy={oy} r={9} fill="rgba(255,255,255,0.3)" />
              <circle cx={ox} cy={oy} r={4.5} fill={COLOR_WHITE} />
            </g>
          )}

          {/* Neutral vertex dots */}
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
      </svg>

      {/* Feature Selector Tabs in Standard Frosted Capsule */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setActiveFeature("face")}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            activeFeature === "face" ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          Face (6)
        </button>
        <button
          onClick={() => setActiveFeature("edge")}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            activeFeature === "edge" ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          Edge (12)
        </button>
        <button
          onClick={() => setActiveFeature("vertex")}
          className={cn(
            "px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-all border-none",
            activeFeature === "vertex" ? "bg-white/20 text-white shadow-none" : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          Vertex (8)
        </button>
      </div>

      {/* Live Typographic Status Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          {activeFeature === "face" && (
            <>
              <span style={{ color: COLOR_CYAN }}>Face</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Flat planar 2D surface of a 3D solid (Cube has 6)</span>
            </>
          )}
          {activeFeature === "edge" && (
            <>
              <span style={{ color: COLOR_GOLD }}>Edge</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Line segment where two faces meet (Cube has 12)</span>
            </>
          )}
          {activeFeature === "vertex" && (
            <>
              <span style={{ color: COLOR_WHITE }}>Vertex</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Corner point where 3+ edges meet (Cube has 8)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
