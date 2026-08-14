"use client";

import React, { useState, useEffect, useRef } from "react";

type ScaleneVariant = {
  apexX: number;
  apexY: number;
  sides: [number, number, number]; // [left, right, base]
  angles: [number, number, number]; // [left (Cyan), right (Rose), apex (Gold)]
};

type ScaleneCategory = {
  name: string;
  description: string;
  variants: ScaleneVariant[];
};

const SCALENE_CATEGORIES: ScaleneCategory[] = [
  {
    name: "Acute Scalene",
    description: "3 unequal sides • All 3 angles acute (< 90°)",
    variants: [
      { apexX: 92, apexY: 55, sides: [10, 13, 15], angles: [42, 63, 75] },
      { apexX: 105, apexY: 45, sides: [12, 14, 13], angles: [52, 70, 58] },
      { apexX: 78, apexY: 62, sides: [9, 13, 15], angles: [36, 60, 84] },
      { apexX: 100, apexY: 50, sides: [11, 13, 15], angles: [46, 66, 68] },
    ],
  },
  {
    name: "Right Scalene",
    description: "3 unequal sides • Has 1 right angle (= 90°)",
    variants: [
      { apexX: 89, apexY: 73, sides: [9, 12, 15], angles: [37, 53, 90] },
      { apexX: 62, apexY: 68, sides: [8, 14, 15], angles: [30, 60, 90] },
      { apexX: 108, apexY: 62, sides: [12, 10, 15], angles: [53, 37, 90] },
    ],
  },
  {
    name: "Obtuse Scalene",
    description: "3 unequal sides • Has 1 obtuse angle (> 90°)",
    variants: [
      { apexX: 65, apexY: 92, sides: [6, 13, 16], angles: [22, 35, 123] },
      { apexX: 58, apexY: 82, sides: [7, 14, 16], angles: [24, 38, 118] },
      { apexX: 52, apexY: 88, sides: [6, 14, 15], angles: [21, 34, 125] },
    ],
  },
];

const BASE_Y = 145;
const X1 = 35;
const X2 = 185;
const STROKE_W = 2.5;

export function InteractiveScaleneExplorer({ color }: { color?: string }) {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);

  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick a random variant within a category (ensuring a different variant if available)
  const getRandomVariant = (catIdx: number, currentVarIdx: number) => {
    const category = SCALENE_CATEGORIES[catIdx];
    if (category.variants.length <= 1) return 0;
    let nextVar = currentVarIdx;
    while (nextVar === currentVarIdx) {
      nextVar = Math.floor(Math.random() * category.variants.length);
    }
    return nextVar;
  };

  const handleSelectCategory = (cIdx: number) => {
    setIsUserInteracted(true);
    if (cIdx === categoryIdx) {
      setVariantIdx((prev) => getRandomVariant(cIdx, prev));
    } else {
      setCategoryIdx(cIdx);
      setVariantIdx(Math.floor(Math.random() * SCALENE_CATEGORIES[cIdx].variants.length));
    }
  };

  // Auto-cycle through categories and variants every 3.5 seconds
  useEffect(() => {
    if (!isUserInteracted) {
      timerRef.current = setInterval(() => {
        setCategoryIdx((prevCat) => {
          const nextCat = (prevCat + 1) % SCALENE_CATEGORIES.length;
          setVariantIdx(Math.floor(Math.random() * SCALENE_CATEGORIES[nextCat].variants.length));
          return nextCat;
        });
      }, 3500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isUserInteracted]);

  const currentCategory = SCALENE_CATEGORIES[categoryIdx];
  const variant = currentCategory.variants[variantIdx] || currentCategory.variants[0];
  const { apexX, apexY, sides, angles } = variant;

  const [sideB, sideA, sideC] = sides; // [left leg, right leg, base]
  const [degA, degB, degC] = angles; // [left angle, right angle, apex angle]

  // Midpoints for side labels
  const midLeftX = (X1 + apexX) / 2;
  const midLeftY = (BASE_Y + apexY) / 2;

  const midRightX = (X2 + apexX) / 2;
  const midRightY = (BASE_Y + apexY) / 2;

  const midBaseX = (X1 + X2) / 2;

  // Arc paths
  const radA = Math.atan2(BASE_Y - apexY, apexX - X1);
  const radB = Math.atan2(BASE_Y - apexY, X2 - apexX);

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

  // Outward normal vectors for side length labels
  const leftLegLenPx = Math.sqrt((apexX - X1) ** 2 + (BASE_Y - apexY) ** 2);
  const leftOutwardNx = (apexY - BASE_Y) / leftLegLenPx;
  const leftOutwardNy = (X1 - apexX) / leftLegLenPx;

  const rightLegLenPx = Math.sqrt((X2 - apexX) ** 2 + (BASE_Y - apexY) ** 2);
  const rightOutwardNx = (BASE_Y - apexY) / rightLegLenPx;
  const rightOutwardNy = (apexX - X2) / rightLegLenPx;

  const sideLabelLeftX = midLeftX + 16 * leftOutwardNx;
  const sideLabelLeftY = midLeftY + 16 * leftOutwardNy;

  const sideLabelRightX = midRightX + 16 * rightOutwardNx;
  const sideLabelRightY = midRightY + 16 * rightOutwardNy;

  const sideLabelBaseY = BASE_Y + 16;

  return (
    <div className="w-full flex flex-col items-center select-none pb-1">
      {/* SVG Diagram */}
      <div className="relative w-full max-w-[340px] aspect-[22/14.5] flex items-center justify-center">
        <svg
          viewBox="0 20 220 145"
          className="w-full h-full overflow-visible"
          aria-hidden
        >
          {/* Main Triangle Polygon */}
          <polygon
            points={`${X1},${BASE_Y} ${X2},${BASE_Y} ${apexX},${apexY}`}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
          />

          {/* Side Length Labels (Positioned OUTSIDE near each side in white fill with dark drop shadow) */}
          <text
            x={sideLabelLeftX}
            y={sideLabelLeftY + 3}
            textAnchor="end"
            fontSize={11}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {sideB}
          </text>
          <text
            x={sideLabelRightX}
            y={sideLabelRightY + 3}
            textAnchor="start"
            fontSize={11}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {sideA}
          </text>
          <text
            x={midBaseX}
            y={sideLabelBaseY}
            textAnchor="middle"
            fontSize={11}
            fontWeight="800"
            fill="#ffffff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
          >
            {sideC}
          </text>

          {/* Left Angle Arc A (Cyan) */}
          <path d={arcAPath} fill="none" stroke="#5ee8ff" strokeWidth={2.5} strokeLinecap="round" />
          {/* Right Angle Arc B (Lavender Purple) */}
          <path d={arcBPath} fill="none" stroke="#c084fc" strokeWidth={2.5} strokeLinecap="round" />
          {/* Apex Angle Arc C (Gold) */}
          <path d={arcCPath} fill="none" stroke="#ffd45e" strokeWidth={2.5} strokeLinecap="round" />

          {/* Angle Value Labels (With crisp dark drop-shadow for maximum contrast) */}
          <text
            x={X1 - 8}
            y={BASE_Y + 3}
            textAnchor="end"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {degA}°
          </text>
          <text
            x={X2 + 8}
            y={BASE_Y + 3}
            textAnchor="start"
            fontSize={12}
            fontWeight="800"
            fill="#c084fc"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {degB}°
          </text>
          <text
            x={apexX}
            y={apexY - 10}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fill="#ffd45e"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {degC}°
          </text>
        </svg>
      </div>

      {/* Active Category Definition Caption (Clean text readout, no pill background or border) */}
      <p className="my-1.5 text-xs text-center font-medium text-emerald-100/90 tracking-tight">
        {currentCategory.description}
      </p>

      {/* Interactive Category Chips (Clicking generates a new random variation) */}
      <div className="flex items-center gap-2 mt-0.5">
        {SCALENE_CATEGORIES.map((c, idx) => (
          <button
            key={c.name}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectCategory(idx);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              idx === categoryIdx
                ? "bg-white text-emerald-950 font-black border-white shadow-md scale-105"
                : "bg-black/40 text-white/70 border-white/20 hover:bg-black/60 hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
