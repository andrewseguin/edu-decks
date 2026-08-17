import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { RotateCcw } from "lucide-react";

type InteractivePolygonInteriorSumProps = {
  color?: string;
};

const SVG_H = 175;
const R = 68;

const POLY_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
  11: "Hendecagon",
  12: "Dodecagon",
};

const COLOR_GOLD = "#ffd45e";
const COLOR_LILAC = "#d8b4fe";
const COLOR_WHITE = "#ffffff";

export function InteractivePolygonInteriorSumExplorer({ color }: InteractivePolygonInteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 84;

  const [n, setN] = useState(5); // n in [3..12]
  const numTriangles = n - 2;

  // Animation state: number of triangles currently revealed (0 to numTriangles)
  const [revealedCount, setRevealedCount] = useState(numTriangles);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    animTimeoutRef.current.forEach((t) => clearTimeout(t));
    animTimeoutRef.current = [];
  };

  const playFanCutAnimation = useCallback((targetCount: number) => {
    clearTimeouts();
    setIsAnimating(true);
    setRevealedCount(0);

    const stepInterval = Math.max(260, Math.min(420, 1800 / targetCount));

    for (let step = 1; step <= targetCount; step++) {
      const timer = setTimeout(() => {
        setRevealedCount(step);
        if (step === targetCount) {
          setIsAnimating(false);
        }
      }, step * stepInterval);
      animTimeoutRef.current.push(timer);
    }
  }, []);

  // Trigger fan-cut animation when n changes
  useEffect(() => {
    playFanCutAnimation(numTriangles);
    return () => clearTimeouts();
  }, [n, numTriangles, playFanCutAnimation]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Compute vertices (upright with apex hub at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const totalSum = numTriangles * 180;
  const currentSum = revealedCount * 180;
  const polyName = POLY_NAMES[n] || `${n}-gon`;
  const hubV = vertices[0];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible"
      >
        {/* Base polygon outline & faint interior */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.07)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Sequentially revealed triangles with clean Lilac wash */}
        {Array.from({ length: numTriangles }, (_, i) => {
          const v0 = hubV;
          const v1 = vertices[i + 1];
          const v2 = vertices[i + 2];
          const pathD = `M ${v0.x} ${v0.y} L ${v1.x} ${v1.y} L ${v2.x} ${v2.y} Z`;
          const isRevealed = i < revealedCount;
          const isLatest = i === revealedCount - 1;
          const triCenter = {
            x: (v0.x + v1.x + v2.x) / 3,
            y: (v0.y + v1.y + v2.y) / 3,
          };

          return (
            <g
              key={`tri-${i}`}
              style={{
                opacity: isRevealed ? 1 : 0,
                transition: "opacity 0.28s ease-out, transform 0.28s ease-out",
              }}
            >
              <path
                d={pathD}
                fill={isLatest && isAnimating ? "rgba(216, 180, 254, 0.42)" : "rgba(216, 180, 254, 0.24)"}
                stroke={isLatest && isAnimating ? COLOR_GOLD : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isLatest && isAnimating ? 2 : 1.5}
                strokeDasharray="4 3"
              />
              <text
                x={triCenter.x}
                y={triCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={n >= 9 ? 9 : 11.5}
                fontWeight="900"
                fill="rgba(255,255,255,0.95)"
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.85))" }}
              >
                180°
              </text>
            </g>
          );
        })}

        {/* Animated Diagonals shooting from Hub */}
        {Array.from({ length: numTriangles - 1 }, (_, i) => {
          const toV = vertices[i + 2];
          const isDrawn = i + 1 < revealedCount;
          return (
            <line
              key={`diag-${i}`}
              x1={hubV.x}
              y1={hubV.y}
              x2={toV.x}
              y2={toV.y}
              stroke={COLOR_GOLD}
              strokeWidth={2}
              strokeDasharray="4 3"
              style={{
                opacity: isDrawn ? 0.9 : 0,
                transition: "opacity 0.25s ease-out",
              }}
            />
          );
        })}

        {/* Non-hub Vertex Corner Dots */}
        {vertices.slice(1).map((v, i) => (
          <circle key={`v-${i + 1}`} cx={v.x} cy={v.y} r={n > 8 ? 2.5 : 3.5} fill="#ffffff" />
        ))}

        {/* Golden Hub Apex Vertex */}
        <circle cx={hubV.x} cy={hubV.y} r={n > 8 ? 5 : 6} fill={COLOR_GOLD} stroke="#ffffff" strokeWidth={2} />
      </svg>

      {/* Stepper & Replay Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-between w-[280px] sm:w-[300px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
          <button
            onClick={() => setN((prev) => Math.max(3, prev - 1))}
            disabled={n <= 3}
            className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            aria-label="Decrease sides"
          >
            −
          </button>
          <div className="flex-1 text-center px-1 text-xs sm:text-sm font-headline font-bold text-white whitespace-nowrap">
            {polyName} ({n} sides · {numTriangles} triangles)
          </div>
          <button
            onClick={() => setN((prev) => Math.min(12, prev + 1))}
            disabled={n >= 12}
            className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            aria-label="Increase sides"
          >
            +
          </button>
        </div>

        {/* Replay Slicing Animation Button */}
        <button
          onClick={() => playFanCutAnimation(numTriangles)}
          disabled={isAnimating}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 backdrop-blur-md shadow-sm transition-all disabled:opacity-40 cursor-pointer"
          title="Replay triangle cuts"
          aria-label="Replay triangle cuts"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Live Synchronized Equation Banner */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span className="text-white">Sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white/90">
            (<span style={{ color: COLOR_GOLD }}>{n}</span> − 2) · 180°
          </span>
          <span className="text-white/50">=</span>
          <span style={{ color: COLOR_LILAC }}>{revealedCount} · 180°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{currentSum}°</span>
        </div>
      </div>
    </div>
  );
}
