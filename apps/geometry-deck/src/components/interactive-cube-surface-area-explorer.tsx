"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveCubeSurfaceAreaProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_SIDE = "#5ee8ff"; // Electric Cyan (s)
const COLOR_SA = "#ffffff";   // Bold Crisp White

export function InteractiveCubeSurfaceAreaExplorer({ color }: InteractiveCubeSurfaceAreaProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [s, setS] = useState(3); // side length [2..5]
  const [step, setStep] = useState<1 | 2>(1);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const faceArea = s * s;
  const totalSA = 6 * faceArea;

  // Step 1: 3D Cube centered at CX
  const cubeW = 68;
  const cubeH = 68;
  const cubeD = 30;
  const ox = CX - cubeW / 2 - 10;
  const oy = 60;

  // Step 2: 2D Net layout (cross shape)
  const netS = 27;
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

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: 3D Cube */
          <g>
            {/* Hidden back edges */}
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeD} y2={oy - cubeD} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox} y2={oy + cubeH} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={ox + cubeD} y1={oy + cubeH - cubeD} x2={ox + cubeW + cubeD} y2={oy + cubeH - cubeD} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Front face */}
            <polygon
              points={`${ox},${oy} ${ox + cubeW},${oy} ${ox + cubeW},${oy + cubeH} ${ox},${oy + cubeH}`}
              fill="rgba(94, 232, 255, 0.45)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth={2}
            />
            {/* Right face */}
            <polygon
              points={`${ox + cubeW},${oy} ${ox + cubeW + cubeD},${oy - cubeD} ${ox + cubeW + cubeD},${oy + cubeH - cubeD} ${ox + cubeW},${oy + cubeH}`}
              fill="rgba(94, 232, 255, 0.25)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth={2}
            />
            {/* Top face */}
            <polygon
              points={`${ox},${oy} ${ox + cubeD},${oy - cubeD} ${ox + cubeW + cubeD},${oy - cubeD} ${ox + cubeW},${oy}`}
              fill="rgba(94, 232, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth={2}
            />

            {/* Vertices */}
            {[
              { x: ox, y: oy }, { x: ox + cubeW, y: oy }, { x: ox + cubeW, y: oy + cubeH }, { x: ox, y: oy + cubeH },
              { x: ox + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy - cubeD }, { x: ox + cubeW + cubeD, y: oy + cubeH - cubeD }
            ].map((v, i) => (
              <circle key={i} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
            ))}

            {/* Side Length Labels */}
            <text x={ox + cubeW / 2} y={oy + cubeH + 14} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fontWeight="800" fill={COLOR_SIDE} fontFamily="var(--font-heading, system-ui)">
              s = {s}
            </text>
            <text x={ox - 12} y={oy + cubeH / 2} textAnchor="end" dominantBaseline="central" fontSize={12.5} fontWeight="800" fill={COLOR_SIDE} fontFamily="var(--font-heading, system-ui)">
              s = {s}
            </text>

            {/* 1 Face Area Highlight */}
            <text x={ox + cubeW / 2} y={oy + cubeH / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="800" fill="#ffffff">
              s² = {faceArea}
            </text>
          </g>
        ) : (
          /* Step 2: 6 Square Faces Net */
          <g>
            {faces2D.map((f) => (
              <g key={f.id}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={netS}
                  height={netS}
                  fill="rgba(94, 232, 255, 0.32)"
                  stroke="rgba(255, 255, 255, 0.95)"
                  strokeWidth={1.5}
                />
                <text
                  x={f.x + netS / 2}
                  y={f.y + netS / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10.5}
                  fontWeight="800"
                  fill="#ffffff"
                  fontFamily="var(--font-heading, system-ui)"
                >
                  {faceArea}
                </text>
              </g>
            ))}
            <text x={CX} y={142} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fill="rgba(255, 255, 255, 0.85)">
              6 Faces × ({s}² = {faceArea})
            </text>
          </g>
        )}
      </svg>

      {/* Step Navigation & Side Stepper Capsules */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-30 select-none">
        {/* Step Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setStep(1)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 1 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            1. 3D Cube
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. 6 Faces Net
          </button>
        </div>

        {/* Side Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setS((p) => Math.max(2, p - 1))}
            disabled={s <= 2}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">Side s = {s}</span>
          <button
            onClick={() => setS((p) => Math.min(6, p + 1))}
            disabled={s >= 6}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">SA</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">6 ·</span>
          <span style={{ color: COLOR_SIDE }}>{s}²</span>
          <span className="text-white/50">=</span>
          <span className="text-white/80">6 · {faceArea}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_SA }} className="font-bold">{totalSA}</span>
        </div>
      </div>
    </div>
  );
}
