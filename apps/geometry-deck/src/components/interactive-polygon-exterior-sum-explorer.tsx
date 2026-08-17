import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { Play, RotateCcw } from "lucide-react";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_H = 175;
const R = 64;

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

const COLOR_LILAC = "#d8b4fe"; // Exterior angle color
const COLOR_GOLD = "#ffd45e";

function getSectorPath(
  center: { x: number; y: number },
  startAngle: number,
  sweepAngle: number,
  r: number
): string {
  const steps = 16;
  const pts: string[] = [`M ${center.x.toFixed(2)} ${center.y.toFixed(2)}`];
  for (let s = 0; s <= steps; s++) {
    const a = startAngle + (sweepAngle * s) / steps;
    const px = center.x + r * Math.cos(a);
    const py = center.y + r * Math.sin(a);
    pts.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

function getArcPath(
  center: { x: number; y: number },
  startAngle: number,
  sweepAngle: number,
  r: number
): string {
  const steps = 16;
  const pts: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = startAngle + (sweepAngle * s) / steps;
    const px = center.x + r * Math.cos(a);
    const py = center.y + r * Math.sin(a);
    pts.push(`${s === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function InteractivePolygonExteriorSumExplorer({ color }: InteractivePolygonExteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 84;

  const [n, setN] = useState(5); // n in [3..12]
  const [gatherProg, setGatherProg] = useState(0); // 0 (at corners) to 1 (gathered at center)
  const [isGathered, setIsGathered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const animRef = useRef<number | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute vertices (upright with apex at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const eachExteriorAngle = 360 / n;
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  // Reset when n changes
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setGatherProg(0);
    setIsGathered(false);
    setIsAnimating(false);
  }, [n]);

  const animateTo = (target: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAnimating(true);
    const startVal = gatherProg;
    const startTime = performance.now();
    const duration = 1200;

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic in-out ease
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const current = startVal + (target - startVal) * ease;
      setGatherProg(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setGatherProg(target);
        setIsGathered(target === 1);
        setIsAnimating(false);
      }
    };
    animRef.current = requestAnimationFrame(frame);
  };

  const toggleGather = () => {
    if (isAnimating) return;
    if (isGathered || gatherProg > 0.5) {
      animateTo(0);
    } else {
      animateTo(1);
    }
  };

  const centerDiscR = 26;
  const cornerArcR = Math.max(14, Math.min(22, 90 / n));
  const sweepAngle = (2 * Math.PI) / n;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible cursor-pointer"
        onClick={toggleGather}
      >
        {/* Base Outer Polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Extended Heading Dashed Rays (fade out slightly as arcs gather) */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const extLen = Math.max(20, Math.min(30, 120 / n));
          const rayEndX = nextV.x + Math.cos(heading) * extLen;
          const rayEndY = nextV.y + Math.sin(heading) * extLen;

          return (
            <line
              key={`ray-${i}`}
              x1={nextV.x}
              y1={nextV.y}
              x2={rayEndX}
              y2={rayEndY}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={1 - gatherProg * 0.7}
            />
          );
        })}

        {/* Faint Ghost Arcs Left at Corners when gathered */}
        {gatherProg > 0.1 &&
          vertices.map((v, i) => {
            const nextV = vertices[(i + 1) % n];
            const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
            const ghostD = getArcPath(nextV, heading, sweepAngle, cornerArcR);
            return (
              <path
                key={`ghost-${i}`}
                d={ghostD}
                fill="none"
                stroke="rgba(216, 180, 254, 0.25)"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            );
          })}

        {/* Converging Purple Exterior Angle Arcs / Wedges (Pure Translation, No Rotation) */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);

          // Pure straight-line translation from corner vertex to center (Zero Rotation)
          const currX = nextV.x + (CX - nextV.x) * gatherProg;
          const currY = nextV.y + (CY - nextV.y) * gatherProg;
          const currR = cornerArcR + (centerDiscR - cornerArcR) * gatherProg;

          const sectorD = getSectorPath({ x: currX, y: currY }, heading, sweepAngle, currR);
          const arcD = getArcPath({ x: currX, y: currY }, heading, sweepAngle, currR);

          return (
            <g key={`arc-wedge-${i}`}>
              {/* Wedge Fill (illuminates as it converges into center) */}
              <path
                d={sectorD}
                fill="rgba(216, 180, 254, 0.35)"
                opacity={0.2 + gatherProg * 0.7}
                stroke="none"
              />

              {/* Wedge Outer Arc Border */}
              <path
                d={arcD}
                fill="none"
                stroke={COLOR_LILAC}
                strokeWidth={2.5}
                strokeLinecap="round"
                style={{
                  filter: gatherProg > 0.8 ? "drop-shadow(0px 0px 3px rgba(216, 180, 254, 0.8))" : "none",
                }}
              />
            </g>
          );
        })}

        {/* Central 360° Total Badge when Gathered */}
        {gatherProg > 0.6 && (
          <g style={{ opacity: (gatherProg - 0.6) / 0.4 }}>
            <circle cx={CX} cy={CY} r={12} fill="rgba(0, 0, 0, 0.7)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} />
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8.5}
              fontWeight="900"
              fill="#ffffff"
              fontFamily="var(--font-heading, system-ui)"
            >
              360°
            </text>
          </g>
        )}

        {/* Vertex Corner Dots */}
        {vertices.map((v, i) => (
          <circle key={`v-${i}`} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
        ))}
      </svg>

      {/* Row 1: Number of Sides Stepper */}
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
          {polyName} ({n} sides · {Number(eachExteriorAngle.toFixed(1))}°)
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

      {/* Row 2: Gather Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleGather}
          className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/15 hover:bg-white/25 text-white border-white/30 shadow-sm backdrop-blur-md active:scale-95 select-none flex items-center gap-1.5 cursor-pointer"
        >
          {isGathered || gatherProg > 0.5 ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              Return to corners
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              Gather arcs into 360° circle
            </>
          )}
        </button>
      </div>

      {/* Live Synchronized Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_LILAC }}>Exterior angle sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white/90">
            <span style={{ color: COLOR_GOLD }}>{n}</span> × {Number(eachExteriorAngle.toFixed(1))}°
          </span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold text-base">360°</span>
        </div>
      </div>
    </div>
  );
}
