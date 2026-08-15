"use client";

import React, { useState, useEffect, useRef } from "react";

type RightTrianglePreset = {
  name: string;
  a: number;
  b: number;
  c: number | string;
  angA: number; // Base angle (Cyan)
  angB: number; // Top angle (Rose)
  description: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
};

const RIGHT_TRIANGLE_PRESETS: RightTrianglePreset[] = [
  {
    name: "3 - 4 - 5",
    a: 3,
    b: 4,
    c: 5,
    angA: 53,
    angB: 37,
    description: "Pythagorean Triple • 3² + 4² = 9 + 16 = 25 = 5²",
    x1: 65,
    y1: 108,
    x2: 185,
    y2: 108,
    x3: 65,
    y3: 18,
  },
  {
    name: "5 - 12 - 13",
    a: 5,
    b: 12,
    c: 13,
    angA: 67,
    angB: 23,
    description: "Pythagorean Triple • 5² + 12² = 25 + 144 = 169 = 13²",
    x1: 65,
    y1: 108,
    x2: 190,
    y2: 108,
    x3: 65,
    y3: 56,
  },
  {
    name: "8 - 15 - 17",
    a: 8,
    b: 15,
    c: 17,
    angA: 62,
    angB: 28,
    description: "Pythagorean Triple • 8² + 15² = 64 + 225 = 289 = 17²",
    x1: 65,
    y1: 108,
    x2: 190,
    y2: 108,
    x3: 65,
    y3: 42,
  },
  {
    name: "45° - 45° - 90°",
    a: 1,
    b: 1,
    c: "1.4",
    angA: 45,
    angB: 45,
    description: "Isosceles Right Triangle • 1² + 1² = 2 = (√2)²",
    x1: 65,
    y1: 108,
    x2: 180,
    y2: 108,
    x3: 65,
    y3: 18,
  },
];

const STROKE_W = 2.5;

export function InteractiveRightTriangleExplorer({ color }: { color?: string }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectPreset = (idx: number) => {
    setIsUserInteracted(true);
    setPresetIdx(idx);
  };

  // Auto-cycle through presets every 3.5 seconds
  useEffect(() => {
    if (!isUserInteracted) {
      timerRef.current = setInterval(() => {
        setPresetIdx((prev) => (prev + 1) % RIGHT_TRIANGLE_PRESETS.length);
      }, 3500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isUserInteracted]);

  const preset = RIGHT_TRIANGLE_PRESETS[presetIdx];
  const { a, b, c, angA, angB, description, x1, y1, x2, y2, x3, y3 } = preset;

  // Arc calculations
  const arcR = 22;

  // Base angle arc at x2, y2 (from leftwards horizontal up to hypotenuse)
  const radA = (angA * Math.PI) / 180;
  const arcA_x = x2 - arcR * Math.cos(radA);
  const arcA_y = y2 - arcR * Math.sin(radA);
  const pathArcA = `M ${x2 - arcR} ${y2} A ${arcR} ${arcR} 0 0 1 ${arcA_x} ${arcA_y}`;

  // Top angle arc at x3, y3 (from downwards vertical right to hypotenuse)
  const radB = ((90 - angB) * Math.PI) / 180;
  const arcB_x = x3 + arcR * Math.cos(radB);
  const arcB_y = y3 + arcR * Math.sin(radB);
  const pathArcB = `M ${x3} ${y3 + arcR} A ${arcR} ${arcR} 0 0 0 ${arcB_x} ${arcB_y}`;

  // Angle label positions
  const labelA_x = x2 - arcR - 10;
  const labelA_y = y2 - 6;

  const labelB_x = x3 + 14;
  const labelB_y = y3 + arcR + 12;

  // Side label positions with generous outward offsets
  const sideA_x = x1 - 12; // Leg a (vertical left, textAnchor="end")
  const sideA_y = (y1 + y3) / 2 + 4;

  const sideB_x = (x1 + x2) / 2; // Leg b (base bottom, textAnchor="middle")
  const sideB_y = y1 + 17;

  const sideC_x = (x2 + x3) / 2 + 14; // Hypotenuse c (top-right normal, textAnchor="start")
  const sideC_y = (y2 + y3) / 2 - 4;

  return (
    <div className="flex flex-col items-center w-full max-w-[320px] select-none">
      {/* SVG Triangle Display */}
      <div className="relative w-full aspect-[23/13.5] flex items-center justify-center">
        <svg viewBox="0 0 230 135" className="w-full h-full" aria-hidden>
          {/* Subtle interior fill */}
          <polygon
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            fill="rgba(255, 255, 255, 0.08)"
          />

          {/* Triangle outline */}
          <polygon
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
          />

          {/* Right Angle Corner Square Marker (Lavender Purple) */}
          <rect
            x={x1}
            y={y1 - 15}
            width={15}
            height={15}
            fill="rgba(192, 132, 252, 0.25)"
            stroke="#c084fc"
            strokeWidth={2}
            rx={1}
          />

          {/* Angle Arc A (Cyan) */}
          <path
            d={pathArcA}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Angle Arc B (Rose) */}
          <path
            d={pathArcB}
            fill="none"
            stroke="#f472b6"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Angle Degrees Readouts */}
          <text
            x={labelA_x}
            y={labelA_y}
            textAnchor="end"
            fontSize={11}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {angA}°
          </text>
          <text
            x={labelB_x}
            y={labelB_y}
            textAnchor="start"
            fontSize={11}
            fontWeight="800"
            fill="#f472b6"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {angB}°
          </text>

          {/* Side Length Labels (Bold White with dark drop-shadow) */}
          <text
            x={sideA_x}
            y={sideA_y}
            textAnchor="end"
            fontSize={13}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            a = {a}
          </text>
          <text
            x={sideB_x}
            y={sideB_y}
            textAnchor="middle"
            fontSize={13}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            b = {b}
          </text>
          <text
            x={sideC_x}
            y={sideC_y}
            textAnchor="start"
            fontSize={13}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            c = {c}
          </text>
        </svg>
      </div>

      {/* Active Preset Definition Caption */}
      <p className="my-1.5 text-xs text-center font-medium text-emerald-100/90 tracking-tight">
        {description}
      </p>

      {/* Preset Chips */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 mt-0.5">
        {RIGHT_TRIANGLE_PRESETS.map((p, idx) => (
          <button
            key={p.name}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectPreset(idx);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              idx === presetIdx
                ? "bg-white text-emerald-950 font-black border-white shadow-md scale-105"
                : "bg-black/40 text-white/70 border-white/20 hover:bg-black/60 hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
