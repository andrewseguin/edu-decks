"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractivePyramidVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_BASE = "#5ee8ff"; // Electric Cyan (B, b)
const COLOR_HEIGHT = "#ffd45e"; // Warm Gold (h)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractivePyramidVolumeExplorer({ color }: InteractivePyramidVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;

  const [b, setB] = useState(4); // base side [2..6]
  const [h, setH] = useState(6); // height [3, 6, 9] (multiples of 3)
  const [step, setStep] = useState<1 | 2>(1);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseArea = b * b;
  const prismVol = baseArea * h;
  const pyramidVol = prismVol / 3;

  // Geometry coordinates
  const W = 80, D = 40;
  const hPx = Math.min(85, h * 12);
  const ox = CX - 48, oy = 135;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  const fl = { x: ox, y: oy };
  const fr = { x: ox + W, y: oy };
  const bl = { x: ox + dxD, y: oy + dyD };
  const br = { x: ox + W + dxD, y: oy + dyD };
  const baseMid = { x: (fl.x + fr.x + bl.x + br.x) / 4, y: (fl.y + fr.y + bl.y + br.y) / 4 };
  const apex = { x: baseMid.x, y: baseMid.y - hPx };

  // Prism top vertices for ghost container
  const ftl = { x: fl.x, y: fl.y - hPx };
  const ftr = { x: fr.x, y: fr.y - hPx };
  const btl = { x: bl.x, y: bl.y - hPx };
  const btr = { x: br.x, y: br.y - hPx };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: Pyramid inside Ghost Equivalent Prism */
          <g>
            {/* Ghost Equivalent Prism */}
            <g opacity={0.35}>
              <line x1={fl.x} y1={fl.y} x2={ftl.x} y2={ftl.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={fr.x} y1={fr.y} x2={ftr.x} y2={ftr.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={br.x} y1={br.y} x2={btr.x} y2={btr.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 3" />
            </g>

            {/* Hidden back edges of pyramid */}
            <line x1={bl.x} y1={bl.y} x2={apex.x} y2={apex.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Pyramid Base Fill */}
            <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${br.x},${br.y} ${bl.x},${bl.y}`} fill="rgba(94, 232, 255, 0.15)" />

            {/* Front Face */}
            <polygon points={`${apex.x},${apex.y} ${fl.x},${fl.y} ${fr.x},${fr.y}`} fill="rgba(94, 232, 255, 0.35)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
            {/* Right Face */}
            <polygon points={`${apex.x},${apex.y} ${fr.x},${fr.y} ${br.x},${br.y}`} fill="rgba(94, 232, 255, 0.20)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Altitude Height Line */}
            <line x1={apex.x} y1={apex.y} x2={baseMid.x} y2={baseMid.y} stroke={COLOR_HEIGHT} strokeWidth={1.5} strokeDasharray="3 2" />
            <circle cx={baseMid.x} cy={baseMid.y} r={2.5} fill={COLOR_HEIGHT} />
            <circle cx={apex.x} cy={apex.y} r={3.5} fill="#ffffff" />

            {/* Labels */}
            <text x={(fl.x + fr.x) / 2} y={fl.y + 14} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="800" fill={COLOR_BASE} fontFamily="var(--font-heading, system-ui)">
              b = {b} (Base Area B = {baseArea})
            </text>
            <text x={apex.x - 14} y={(apex.y + baseMid.y) / 2} textAnchor="end" dominantBaseline="central" fontSize={12} fontWeight="800" fill={COLOR_HEIGHT} fontFamily="var(--font-heading, system-ui)">
              h = {h}
            </text>
          </g>
        ) : (
          /* Step 2: 3x Dissection Demonstration */
          <g>
            {/* 3 Smaller Pyramid Icons showing 3 Pyramids = 1 Prism */}
            {[
              { offX: CX - 80, label: "Pyramid 1" },
              { offX: CX - 10, label: "Pyramid 2" },
              { offX: CX + 60, label: "Pyramid 3" },
            ].map((p, i) => (
              <g key={i}>
                <polygon
                  points={`${p.offX},45 ${p.offX - 25},105 ${p.offX + 25},105`}
                  fill="rgba(94, 232, 255, 0.30)"
                  stroke="rgba(255, 255, 255, 0.95)"
                  strokeWidth={1.8}
                />
                <circle cx={p.offX} cy={45} r={3} fill="#ffffff" />
                <text x={p.offX} y={120} textAnchor="middle" fontSize={10} fontWeight="bold" fill={COLOR_BASE}>
                  ⅓ Prism ({pyramidVol})
                </text>
              </g>
            ))}
            <text x={CX} y={142} textAnchor="middle" fontSize={11} fontWeight="bold" fill="rgba(255, 255, 255, 0.9)">
              3 Pyramids of Equal Base & Height Exactly Fill 1 Prism ({prismVol})
            </text>
          </g>
        )}
      </svg>

      {/* Step Navigation & Dimension Steppers in Frosted Capsules */}
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
            1. Pyramid & Prism
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. 3× Dissection Proof
          </button>
        </div>

        {/* Base Side Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setB((p) => Math.max(2, p - 1))}
            disabled={b <= 2}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">b = {b}</span>
          <button
            onClick={() => setB((p) => Math.min(6, p + 1))}
            disabled={b >= 6}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>

        {/* Height Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setH((p) => Math.max(3, p - 3))}
            disabled={h <= 3}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">h = {h}</span>
          <button
            onClick={() => setH((p) => Math.min(9, p + 3))}
            disabled={h >= 9}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span className="text-white">V</span>
          <span className="text-white/50">=</span>
          <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
          <span className="text-white/80">·</span>
          <span style={{ color: COLOR_BASE }}>B ({baseArea})</span>
          <span className="text-white/50">·</span>
          <span style={{ color: COLOR_HEIGHT }}>{h}</span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_VOL }} className="font-bold">{pyramidVol}</span>
        </div>
      </div>
    </div>
  );
}
