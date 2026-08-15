"use client";

import React, { useCallback } from "react";

type InteractiveSolidFeatureProps = {
  feature: "face" | "edge" | "vertex";
  color?: string;
};

const SVG_W = 240;
const SVG_H = 145;

const COLOR_CYAN = "#5ee8ff"; // face
const COLOR_GOLD = "#ffd45e"; // edge
const COLOR_WHITE = "#ffffff"; // vertex

export function InteractiveSolidFeatureExplorer({ feature, color }: InteractiveSolidFeatureProps) {
  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div className="flex flex-col items-center gap-2 w-full pb-2" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[280px] sm:max-w-[320px] touch-none select-none overflow-visible">
        <g transform="translate(70, 20)">
          {/* Hidden back edges */}
          <line x1={25} y1={85} x2={25} y2={15} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={25} y1={85} x2={0} y2={95} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={25} y1={85} x2={95} y2={85} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="3 3" />

          {/* Front face */}
          <polygon
            points="0,35 70,35 70,105 0,105"
            fill={feature === "face" ? "rgba(94, 232, 255, 0.45)" : "rgba(255, 255, 255, 0.12)"}
            stroke={feature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
            strokeWidth={2}
          />
          {/* Right face */}
          <polygon
            points="70,35 95,15 95,85 70,105"
            fill="rgba(255, 255, 255, 0.06)"
            stroke={feature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
            strokeWidth={2}
          />
          {/* Top face */}
          <polygon
            points="0,35 25,15 95,15 70,35"
            fill="rgba(255, 255, 255, 0.18)"
            stroke={feature === "edge" ? COLOR_GOLD : "rgba(255, 255, 255, 0.95)"}
            strokeWidth={2}
          />

          {/* Edge feature highlight on front-top horizontal edge */}
          {feature === "edge" && (
            <line x1={0} y1={35} x2={70} y2={35} stroke={COLOR_GOLD} strokeWidth={4.5} strokeLinecap="round" />
          )}

          {/* Vertex feature highlight on top-front-left corner */}
          {feature === "vertex" && (
            <g>
              <circle cx={0} cy={35} r={8} fill="rgba(255,255,255,0.3)" />
              <circle cx={0} cy={35} r={4.5} fill={COLOR_WHITE} />
            </g>
          )}

          {/* Neutral vertex dots */}
          {feature !== "vertex" && (
            <>
              {[
                { x: 0, y: 35 }, { x: 70, y: 35 }, { x: 70, y: 105 }, { x: 0, y: 105 },
                { x: 25, y: 15 }, { x: 95, y: 15 }, { x: 95, y: 85 }
              ].map((v, i) => (
                <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
              ))}
            </>
          )}
        </g>
      </svg>

      {/* Live Status Banner */}
      <div className="flex justify-center my-0.5">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          {feature === "face" && (
            <>
              <span style={{ color: COLOR_CYAN }}>Face</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Flat planar 2D surface of a 3D solid</span>
            </>
          )}
          {feature === "edge" && (
            <>
              <span style={{ color: COLOR_GOLD }}>Edge</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Straight line segment where two faces meet</span>
            </>
          )}
          {feature === "vertex" && (
            <>
              <span style={{ color: COLOR_WHITE }}>Vertex</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">Corner point where 3 or more edges meet</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
