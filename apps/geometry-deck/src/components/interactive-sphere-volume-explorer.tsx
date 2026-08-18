"use client";

import React, { useState, useCallback } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { StackedFraction } from "./ui/formatted-math-text";

type InteractiveSphereVolumeProps = {
  color?: string;
};

const SVG_H = 155;

const COLOR_RADIUS = "#5ee8ff"; // Electric Cyan (r)
const COLOR_GOLD = "#ffd45e";   // Warm Gold (pyramid altitude h = r)
const COLOR_VOL = "#ffffff";    // Bold Crisp White

export function InteractiveSphereVolumeExplorer({ color }: InteractiveSphereVolumeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 75;

  const [r, setR] = useState(3); // radius units [2, 3, 6]
  const [step, setStep] = useState<1 | 2>(1);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const cr = 54;
  const rCubed = r * r * r;
  const rSq = r * r;
  const isIntegerVol = rCubed % 3 === 0;
  const volCoeff = (4 * rCubed) / 3;
  const saCoeff = 4 * rSq;

  // Radial pyramid wedges for step 2 (8 wedges around center)
  const numWedges = 8;
  const wedges = Array.from({ length: numWedges }, (_, i) => {
    const a1 = (i * 2 * Math.PI) / numWedges;
    const a2 = ((i + 1) * 2 * Math.PI) / numWedges;
    const midA = (a1 + a2) / 2;
    const p1 = { x: CX + cr * Math.cos(a1), y: CY + cr * Math.sin(a1) };
    const p2 = { x: CX + cr * Math.cos(a2), y: CY + cr * Math.sin(a2) };
    const midP = { x: CX + cr * Math.cos(midA), y: CY + cr * Math.sin(midA) };
    return { p1, p2, midP, isAlt: i % 2 === 1 };
  });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible">
        {step === 1 ? (
          /* Step 1: Standard 3D Sphere */
          <g>
            {/* Sphere Outer Boundary & Shading */}
            <circle cx={CX} cy={CY} r={cr} fill="rgba(94, 232, 255, 0.20)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />

            {/* Equator Ellipse */}
            <ellipse cx={CX} cy={CY} rx={cr} ry={16} fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* Center Dot */}
            <circle cx={CX} cy={CY} r={3.5} fill="#ffffff" />

            {/* Radius 3D ray */}
            <line x1={CX} y1={CY} x2={CX + cr * 0.707} y2={CY - cr * 0.707} stroke={COLOR_RADIUS} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={CX + cr * 0.707} cy={CY - cr * 0.707} r={3} fill={COLOR_RADIUS} />

            {/* Radius Label */}
            <text
              x={CX + cr * 0.45}
              y={CY - cr * 0.45 - 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight="800"
              fill={COLOR_RADIUS}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              {r}
            </text>
          </g>
        ) : (
          /* Step 2: Radial Pyramid Dissection Proof */
          <g>
            {/* Outer boundary */}
            <circle cx={CX} cy={CY} r={cr} fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1.5} strokeDasharray="3 3" />

            {/* Radial Pyramids radiating from center */}
            {wedges.map((w, idx) => (
              <polygon
                key={idx}
                points={`${CX},${CY} ${w.p1.x},${w.p1.y} ${w.p2.x},${w.p2.y}`}
                fill={w.isAlt ? "rgba(94, 232, 255, 0.32)" : "rgba(94, 232, 255, 0.16)"}
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={1.2}
              />
            ))}

            {/* Highlight one sample pyramid altitude line */}
            <line x1={CX} y1={CY} x2={CX + cr * 0.92} y2={CY - cr * 0.38} stroke={COLOR_GOLD} strokeWidth={2} strokeDasharray="3 2" />
            <circle cx={CX + cr * 0.92} cy={CY - cr * 0.38} r={3} fill={COLOR_GOLD} />

            {/* Center Apex Dot */}
            <circle cx={CX} cy={CY} r={4} fill="#ffffff" />

            {/* Height = Radius Label */}
            <text
              x={CX + cr * 0.46}
              y={CY - cr * 0.19 - 9}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11.5}
              fontWeight="800"
              fill={COLOR_GOLD}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              h = r = {r}
            </text>

            {/* Base = Surface Area Label */}
            <text
              x={CX}
              y={CY + cr + 12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight="bold"
              fill="rgba(255, 255, 255, 0.9)"
              fontFamily="var(--font-heading, system-ui)"
            >
              Total Base Area = Surface Area = 4πr²
            </text>
          </g>
        )}
      </svg>

      {/* Step Navigation & Radius Stepper Capsules */}
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
            1. Sphere
          </button>
          <button
            onClick={() => setStep(2)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold transition-all border-none",
              step === 2 ? "bg-white/20 text-white" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            2. Pyramid Proof
          </button>
        </div>

        {/* Radius Stepper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto">
          <button
            onClick={() => setR((prev) => (prev === 6 ? 3 : 2))}
            disabled={r <= 2}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            −
          </button>
          <span className="text-[11px] font-headline font-bold text-white px-1">r = {r}</span>
          <button
            onClick={() => setR((prev) => (prev === 2 ? 3 : 6))}
            disabled={r >= 6}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Typographic Equation Banner */}
      <div className="flex justify-center mt-0.5">
        {step === 1 ? (
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
            <span className="text-white">V</span>
            <span className="text-white/50">=</span>
            <div className="inline-flex items-center"><StackedFraction numerator="4" denominator="3" /></div>
            <span className="text-white/80">· π ·</span>
            <span style={{ color: COLOR_RADIUS }}>{r}³</span>
            <span className="text-white/50">=</span>
            {isIntegerVol ? (
              <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
            ) : (
              <div className="inline-flex items-center text-white font-bold">
                <StackedFraction numerator={`${4 * rCubed}π`} denominator="3" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
            <span className="text-white">V</span>
            <span className="text-white/50">=</span>
            <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
            <span className="text-white/80">· (Base Area) · (h)</span>
            <span className="text-white/50">=</span>
            <div className="inline-flex items-center"><StackedFraction numerator="1" denominator="3" /></div>
            <span className="text-white/80">· ({saCoeff}π) · ({r})</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_VOL }} className="font-bold">{volCoeff}π</span>
          </div>
        )}
      </div>
    </div>
  );
}
