"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveConeVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_HEIGHT = "#ffd45e"; // Warm Gold (h)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveConeVolumeExplorer({ color }: InteractiveConeVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const BOT_CY = 125;
  const RX = 50;
  const RY = 14;

  const r = 3; // radius units
  const [h, setH] = useState(6); // height units [3, 6, 9]
  const [step, setStep] = useState<1 | 2>(1);
  const [pours, setPours] = useState<1 | 2 | 3>(1);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const baseAreaCoeff = r * r; // 9
  const volCoeff = (baseAreaCoeff * h) / 3; // exact integer when h is multiple of 3
  const cylVolCoeff = baseAreaCoeff * h;

  const hPx = Math.min(95, h * 12);
  const apexY = BOT_CY - hPx;

  // For step 2: Cylinder fill height based on number of poured cones
  const fillFrac = pours / 3;
  const liquidTopY = BOT_CY - fillFrac * hPx;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: Cone inside Ghost Equivalent Cylinder */
          <g>
            {/* Ghost Equivalent Cylinder Outline */}
            <g opacity={0.35}>
              <line x1={CX - RX} y1={BOT_CY} x2={CX - RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={CX + RX} y1={BOT_CY} x2={CX + RX} y2={apexY} stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
              <ellipse cx={CX} cy={apexY} rx={RX} ry={RY} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
            </g>

            {/* Base Ellipse */}
            <ellipse cx={CX} cy={BOT_CY} rx={RX} ry={RY} fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Cone Lateral Surface */}
            <path
              d={`M ${CX - RX} ${BOT_CY} L ${CX} ${apexY} L ${CX + RX} ${BOT_CY} A ${RX} ${RY} 0 0 1 ${CX - RX} ${BOT_CY} Z`}
              fill="rgba(94, 232, 255, 0.25)"
            />
            <line x1={CX - RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
            <line x1={CX + RX} y1={BOT_CY} x2={CX} y2={apexY} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2} />

            {/* Apex Point Dot */}
            <circle cx={CX} cy={apexY} r={3.5} fill="#ffffff" />

            {/* Height line inside from apex to base center */}
            <circle cx={CX} cy={BOT_CY} r={3} fill="#ffffff" />
            <line x1={CX} y1={apexY} x2={CX} y2={BOT_CY} stroke={COLOR_HEIGHT} strokeWidth={1.5} strokeDasharray="3 2" />

            {/* Radius line on bottom base */}
            <line x1={CX} y1={BOT_CY} x2={CX + RX} y2={BOT_CY} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={CX + RX} cy={BOT_CY} r={3} fill={COLOR_RADIUS} />

            {/* Radius Label */}
            <text
              x={CX + RX / 2}
              y={BOT_CY + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight="800"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {r}
            </text>

            {/* Height Label */}
            <text
              x={CX - 12}
              y={(apexY + BOT_CY) / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={12}
              fontWeight="800"
              fill={COLOR_HEIGHT}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {h}
            </text>
          </g>
        ) : (
          /* Step 2: 3-Cone Pour Proof into Cylinder */
          <g>
            {/* Cylinder Container on Left: CX - 35 */}
            {(() => {
              const cylX = CX - 35;
              const cylR = 38;
              const cylRy = 11;
              const topY = BOT_CY - hPx;

              return (
                <g>
                  {/* Cylinder Wireframe Container */}
                  <ellipse cx={cylX} cy={BOT_CY} rx={cylR} ry={cylRy} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.95)" strokeWidth={1.8} />
                  <line x1={cylX - cylR} y1={BOT_CY} x2={cylX - cylR} y2={topY} stroke="rgba(255,255,255,0.95)" strokeWidth={1.8} />
                  <line x1={cylX + cylR} y1={BOT_CY} x2={cylX + cylR} y2={topY} stroke="rgba(255,255,255,0.95)" strokeWidth={1.8} />
                  <ellipse cx={cylX} cy={topY} rx={cylR} ry={cylRy} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.95)" strokeWidth={1.8} />

                  {/* 1/3 and 2/3 Marker Tick Lines */}
                  <line x1={cylX - cylR - 4} y1={BOT_CY - hPx / 3} x2={cylX - cylR} y2={BOT_CY - hPx / 3} stroke="#5ee8ff" strokeWidth={2} />
                  <text x={cylX - cylR - 8} y={BOT_CY - hPx / 3} textAnchor="end" dominantBaseline="central" fontSize={9.5} fontWeight="bold" fill="#5ee8ff">⅓</text>

                  <line x1={cylX - cylR - 4} y1={BOT_CY - (2 * hPx) / 3} x2={cylX - cylR} y2={BOT_CY - (2 * hPx) / 3} stroke="#5ee8ff" strokeWidth={2} />
                  <text x={cylX - cylR - 8} y={BOT_CY - (2 * hPx) / 3} textAnchor="end" dominantBaseline="central" fontSize={9.5} fontWeight="bold" fill="#5ee8ff">⅔</text>

                  {/* Liquid Fill Inside Cylinder */}
                  <path
                    d={`M ${cylX - cylR} ${BOT_CY} L ${cylX - cylR} ${liquidTopY} A ${cylR} ${cylRy} 0 0 0 ${cylX + cylR} ${liquidTopY} L ${cylX + cylR} ${BOT_CY} A ${cylR} ${cylRy} 0 0 1 ${cylX - cylR} ${BOT_CY}`}
                    fill="rgba(94, 232, 255, 0.45)"
                  />
                  <ellipse cx={cylX} cy={liquidTopY} rx={cylR} ry={cylRy} fill="rgba(94, 232, 255, 0.65)" stroke="#5ee8ff" strokeWidth={1.5} />

                  {/* Label on cylinder */}
                  <text x={cylX} y={BOT_CY + 15} textAnchor="middle" fontSize={10.5} fontWeight="bold" fill="rgba(255,255,255,0.9)">
                    Cylinder Volume = {cylVolCoeff}π
                  </text>
                </g>
              );
            })()}

            {/* Pouring Cone Icon on Right: CX + 65 */}
            {(() => {
              const coneX = CX + 65;
              const coneR = 26;
              const coneRy = 8;
              const coneApexY = BOT_CY - 50;

              return (
                <g>
                  {/* Inverted cone pouring */}
                  <path
                    d={`M ${coneX - coneR} ${coneApexY} L ${coneX} ${BOT_CY} L ${coneX + coneR} ${coneApexY} A ${coneR} ${coneRy} 0 0 1 ${coneX - coneR} ${coneApexY} Z`}
                    fill="rgba(94, 232, 255, 0.35)"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth={1.6}
                  />
                  <ellipse cx={coneX} cy={coneApexY} rx={coneR} ry={coneRy} fill="rgba(94,232,255,0.2)" stroke="rgba(255,255,255,0.95)" strokeWidth={1.6} />

                  {/* Pouring stream droplet */}
                  <line x1={coneX} y1={BOT_CY + 2} x2={CX + 2} y2={liquidTopY} stroke="#5ee8ff" strokeWidth={2} strokeDasharray="3 3" />

                  {/* Cone label */}
                  <text x={coneX} y={BOT_CY + 15} textAnchor="middle" fontSize={10.5} fontWeight="bold" fill={COLOR_RADIUS}>
                    1 Cone = {volCoeff}π (⅓)
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Mode & Stepper Capsules */}
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
            1. Cone & Cylinder
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. 3× Pour Proof
          </button>
        </div>

        {step === 1 ? (
          /* Height Stepper in Step 1 */
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
            <button
              onClick={() => setH((p) => Math.max(3, p - 3))}
              disabled={h <= 3}
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              −
            </button>
            <span className="text-[11px] font-headline font-bold text-white px-1">Height h = {h}</span>
            <button
              onClick={() => setH((p) => Math.min(9, p + 3))}
              disabled={h >= 9}
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              +
            </button>
          </div>
        ) : (
          /* Cone Pour Stepper in Step 2 */
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
            <button
              onClick={() => setPours(1)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-headline font-bold transition-all border-none",
                pours === 1 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              1 Cone (⅓)
            </button>
            <button
              onClick={() => setPours(2)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-headline font-bold transition-all border-none",
                pours === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              2 Cones (⅔)
            </button>
            <button
              onClick={() => setPours(3)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-headline font-bold transition-all border-none",
                pours === 3 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              3 Cones (Full)
            </button>
          </div>
        )}
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        {step === 1 ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">V</span>
            <span className="text-white/50">=</span>
            <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
            <span className="text-white/80">· π ·</span>
            <span style={{ color: COLOR_RADIUS }}>{r}²</span>
            <span className="text-white/50">·</span>
            <span style={{ color: COLOR_HEIGHT }}>{h}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span className="text-white font-bold">{pours} × Cone ({pours * volCoeff}π)</span>
            <span className="text-white/50">=</span>
            <div className="inline-flex items-center"><StackedFraction numerator={`${pours}`} denominator="3" /></div>
            <span className="text-white/80">of Cylinder ({cylVolCoeff}π)</span>
          </div>
        )}
      </div>
    </div>
  );
}
