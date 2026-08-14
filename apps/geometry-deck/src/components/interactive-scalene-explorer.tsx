"use client";

import React, { useState, useEffect, useRef } from "react";

type ScalenePreset = {
  name: string;
  apexX: number;
  apexY: number;
  sides: [number, number, number]; // [left, right, base]
  angles: [number, number, number]; // [left (Cyan), right (Rose), apex (Gold)]
};

// Hand-curated presets with 100% distinct whole integers (no decimals, no equal sides, no equal angles)
const SCALENE_PRESETS: ScalenePreset[] = [
  {
    name: "Acute Scalene",
    apexX: 92,
    apexY: 55,
    sides: [10, 13, 15],
    angles: [42, 63, 75],
  },
  {
    name: "Obtuse Scalene",
    apexX: 68,
    apexY: 82,
    sides: [7, 12, 15],
    angles: [26, 46, 108],
  },
  {
    name: "Right Scalene",
    apexX: 89,
    apexY: 73,
    sides: [9, 12, 15],
    angles: [37, 53, 90],
  },
  {
    name: "Wide Scalene",
    apexX: 65,
    apexY: 92,
    sides: [6, 13, 16],
    angles: [22, 35, 123],
  },
];

const BASE_Y = 145;
const X1 = 35;
const X2 = 185;
const STROKE_W = 2.5;

export function InteractiveScaleneExplorer({ color }: { color?: string }) {
  const [presetIdx, setPresetIdx] = useState(0);

  // Auto-cycle through presets every 3.5 seconds unless user manually interacts
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextPreset = () => {
    setPresetIdx((prev) => (prev + 1) % SCALENE_PRESETS.length);
  };

  const handleManualNext = () => {
    setIsUserInteracted(true);
    nextPreset();
  };

  useEffect(() => {
    if (!isUserInteracted) {
      timerRef.current = setInterval(() => {
        setPresetIdx((prev) => (prev + 1) % SCALENE_PRESETS.length);
      }, 3500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isUserInteracted]);

  const preset = SCALENE_PRESETS[presetIdx];
  const { apexX, apexY, sides, angles } = preset;

  const [sideB, sideA, sideC] = sides; // [left leg, right leg, base]
  const [degA, degB, degC] = angles; // [left angle, right angle, apex angle]

  // Midpoints for tick marks
  const midLeftX = (X1 + apexX) / 2;
  const midLeftY = (BASE_Y + apexY) / 2;

  const midRightX = (X2 + apexX) / 2;
  const midRightY = (BASE_Y + apexY) / 2;

  const midBaseX = (X1 + X2) / 2;

  // Tick mark vectors
  const tickLen = 6;

  // Left leg tick (1 tick |)
  const radA = Math.atan2(BASE_Y - apexY, apexX - X1);
  const leftNx = -Math.sin(radA);
  const leftNy = Math.cos(radA);
  const tickLeft1 = { x: midLeftX - tickLen * leftNx, y: midLeftY - tickLen * leftNy };
  const tickLeft2 = { x: midLeftX + tickLen * leftNx, y: midLeftY + tickLen * leftNy };

  // Right leg ticks (2 ticks ||)
  const radB = Math.atan2(BASE_Y - apexY, X2 - apexX);
  const rightNx = -Math.sin(radB);
  const rightNy = Math.cos(radB);
  const rightAlongX = Math.cos(radB);
  const rightAlongY = Math.sin(radB);
  const rSpacing = 3.5;

  const centerA = { x: midRightX - rSpacing * rightAlongX, y: midRightY - rSpacing * rightAlongY };
  const tickRightA1 = { x: centerA.x - tickLen * rightNx, y: centerA.y - tickLen * rightNy };
  const tickRightA2 = { x: centerA.x + tickLen * rightNx, y: centerA.y + tickLen * rightNy };

  const centerB = { x: midRightX + rSpacing * rightAlongX, y: midRightY + rSpacing * rightAlongY };
  const tickRightB1 = { x: centerB.x - tickLen * rightNx, y: centerB.y - tickLen * rightNy };
  const tickRightB2 = { x: centerB.x + tickLen * rightNx, y: centerB.y + tickLen * rightNy };

  // Base ticks (3 ticks |||)
  const bGap = 4;
  const tickBaseA1 = { x: midBaseX - bGap, y: BASE_Y - tickLen };
  const tickBaseA2 = { x: midBaseX - bGap, y: BASE_Y + tickLen };

  const tickBaseB1 = { x: midBaseX, y: BASE_Y - tickLen };
  const tickBaseB2 = { x: midBaseX, y: BASE_Y + tickLen };

  const tickBaseC1 = { x: midBaseX + bGap, y: BASE_Y - tickLen };
  const tickBaseC2 = { x: midBaseX + bGap, y: BASE_Y + tickLen };

  // Angle Arcs
  const arcRA = Math.min(22, Math.max(12, (apexX - X1) * 0.35));
  const arcAEnd = { x: X1 + arcRA * Math.cos(radA), y: BASE_Y - arcRA * Math.sin(radA) };
  const arcAPath = `M ${X1 + arcRA} ${BASE_Y} A ${arcRA} ${arcRA} 0 0 0 ${arcAEnd.x} ${arcAEnd.y}`;

  const arcRB = Math.min(22, Math.max(12, (X2 - apexX) * 0.35));
  const arcBEnd = { x: X2 - arcRB * Math.cos(radB), y: BASE_Y - arcRB * Math.sin(radB) };
  const arcBPath = `M ${X2 - arcRB} ${BASE_Y} A ${arcRB} ${arcRB} 0 0 1 ${arcBEnd.x} ${arcBEnd.y}`;

  const arcRC = 24;
  const radDownL = Math.atan2(BASE_Y - apexY, X1 - apexX);
  const radDownR = Math.atan2(BASE_Y - apexY, X2 - apexX);
  const arcCEndL = { x: apexX + arcRC * Math.cos(radDownL), y: apexY + arcRC * Math.sin(radDownL) };
  const arcCEndR = { x: apexX + arcRC * Math.cos(radDownR), y: apexY + arcRC * Math.sin(radDownR) };
  const arcCPath = `M ${arcCEndL.x} ${arcCEndL.y} A ${arcRC} ${arcRC} 0 0 0 ${arcCEndR.x} ${arcCEndR.y}`;

  return (
    <div className="w-full flex flex-col items-center select-none pb-1">
      {/* SVG Diagram */}
      <div className="relative w-full max-w-[340px] aspect-[22/13.5] flex items-center justify-center">
        <svg
          viewBox="0 25 220 135"
          className="w-full h-full overflow-visible transition-all duration-500 ease-out"
          aria-hidden
        >
          {/* Main Triangle Polygon */}
          <polygon
            points={`${X1},${BASE_Y} ${X2},${BASE_Y} ${apexX},${apexY}`}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Equal Legs Tick Marks */}
          <g stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round" className="transition-all duration-500 ease-out">
            {/* Left Leg: 1 tick */}
            <line x1={tickLeft1.x} y1={tickLeft1.y} x2={tickLeft2.x} y2={tickLeft2.y} />
            {/* Right Leg: 2 ticks */}
            <line x1={tickRightA1.x} y1={tickRightA1.y} x2={tickRightA2.x} y2={tickRightA2.y} />
            <line x1={tickRightB1.x} y1={tickRightB1.y} x2={tickRightB2.x} y2={tickRightB2.y} />
            {/* Base: 3 ticks */}
            <line x1={tickBaseA1.x} y1={tickBaseA1.y} x2={tickBaseA2.x} y2={tickBaseA2.y} />
            <line x1={tickBaseB1.x} y1={tickBaseB1.y} x2={tickBaseB2.x} y2={tickBaseB2.y} />
            <line x1={tickBaseC1.x} y1={tickBaseC1.y} x2={tickBaseC2.x} y2={tickBaseC2.y} />
          </g>

          {/* Left Angle Arc A (Cyan) */}
          <path d={arcAPath} fill="none" stroke="#5ee8ff" strokeWidth={2.5} strokeLinecap="round" className="transition-all duration-500 ease-out" />
          {/* Right Angle Arc B (Rose) */}
          <path d={arcBPath} fill="none" stroke="#ff6b8b" strokeWidth={2.5} strokeLinecap="round" className="transition-all duration-500 ease-out" />
          {/* Apex Angle Arc C (Gold) */}
          <path d={arcCPath} fill="none" stroke="#ffd45e" strokeWidth={2.5} strokeLinecap="round" className="transition-all duration-500 ease-out" />

          {/* Angle Value Labels */}
          <text x={X1 - 8} y={BASE_Y + 3} textAnchor="end" fontSize={12} fontWeight="800" fill="#5ee8ff" fontFamily="var(--font-heading, system-ui)">
            {degA}°
          </text>
          <text x={X2 + 8} y={BASE_Y + 3} textAnchor="start" fontSize={12} fontWeight="800" fill="#ff6b8b" fontFamily="var(--font-heading, system-ui)">
            {degB}°
          </text>
          <text x={apexX} y={apexY - 10} textAnchor="middle" fontSize={12} fontWeight="800" fill="#ffd45e" fontFamily="var(--font-heading, system-ui)" className="transition-all duration-500 ease-out">
            {degC}°
          </text>
        </svg>
      </div>

      {/* Legend / Status Badges */}
      <div className="flex flex-wrap justify-center items-center gap-2 my-2 text-xs font-mono">
        <span className="px-3 py-1 rounded-full bg-black/40 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm backdrop-blur">
          Sides: <span className="text-emerald-200">{sideB} • {sideA} • {sideC}</span> (All Different)
        </span>
        <span className="px-3 py-1 rounded-full bg-black/40 text-purple-300 border border-purple-500/40 font-bold shadow-sm backdrop-blur">
          Angles: <span className="text-purple-200">{degA}° • {degB}° • {degC}°</span> (All Different)
        </span>
      </div>

      {/* Interactive Preset Chips / Randomizer Button */}
      <div className="flex items-center gap-2 mt-1">
        {SCALENE_PRESETS.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => {
              setIsUserInteracted(true);
              setPresetIdx(idx);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              idx === presetIdx
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                : "bg-black/30 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
