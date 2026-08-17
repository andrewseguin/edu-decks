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
  // animProgress in [0 .. n - 1]:
  // 0: Arc 0 at V1
  // 0 -> 1: Arc 0 translates V1 -> V2 and merges with Arc 1
  // 1 -> 2: [Arc 0 + 1] translates V2 -> V3 and merges with Arc 2
  // ...
  // n - 1: Complete 360 circle formed
  const [animProgress, setAnimProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const animRef = useRef<number | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute vertices (upright with apex at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const eachExteriorAngle = 360 / n;
  const sweepAngle = (2 * Math.PI) / n;
  const arcR = Math.max(16, Math.min(24, 100 / n));
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  // Start continuous cascading snowball slide animation
  const startRoll = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(true);
    setAnimProgress(0);

    const totalSteps = n - 1;
    const totalDuration = totalSteps * 900;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / totalDuration);
      setAnimProgress(t * totalSteps);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setAnimProgress(totalSteps);
        setIsPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(frame);
  }, [n]);

  // When shape changes, reset and auto-play
  useEffect(() => {
    startRoll();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [n, startRoll]);

  // Current step calculation
  const totalSteps = n - 1;
  const currentLeg = Math.min(totalSteps - 1, Math.max(0, Math.floor(animProgress)));
  const rawSubT = Math.max(0, Math.min(1, animProgress - currentLeg));
  // Smooth cubic ease per leg
  const easeT = rawSubT < 0.5 ? 4 * rawSubT * rawSubT * rawSubT : 1 - Math.pow(-2 * rawSubT + 2, 3) / 2;

  // The moving cluster starts at V_{currentLeg + 1} and travels to V_{currentLeg + 2}
  const fromV = vertices[(currentLeg + 1) % n] || vertices[0];
  const toV = vertices[(currentLeg + 2) % n] || vertices[0];

  const clusterX = fromV.x + (toV.x - fromV.x) * easeT;
  const clusterY = fromV.y + (toV.y - fromV.y) * easeT;

  // Sectors in the moving cluster: 0 .. currentLeg
  const movingSectorsCount = animProgress >= totalSteps ? n : currentLeg + 1;

  // Degrees accumulated
  const accumulatedDegrees = Math.min(360, Math.round(movingSectorsCount * eachExteriorAngle));
  const isComplete = animProgress >= totalSteps;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible cursor-pointer"
        onClick={startRoll}
      >
        {/* Base Outer Polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Extended Heading Dashed Rays at Corners */}
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
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
          );
        })}

        {/* Stationary Waiting Arcs (at vertices that haven't been picked up yet) */}
        {vertices.map((v, i) => {
          // Arc i is stationed at vertex (i + 1) % n
          // It is absorbed when animProgress >= i (for i >= 1)
          const isAbsorbed = i === 0 || (i <= currentLeg + 1 && (i <= currentLeg || rawSubT > 0.95)) || isComplete;
          if (isAbsorbed) return null;

          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const arcD = getArcPath(nextV, heading, sweepAngle, arcR);
          const sectorD = getSectorPath(nextV, heading, sweepAngle, arcR);

          return (
            <g key={`waiting-arc-${i}`}>
              <path d={sectorD} fill="rgba(216, 180, 254, 0.25)" stroke="none" />
              <path d={arcD} fill="none" stroke={COLOR_LILAC} strokeWidth={2.5} strokeLinecap="round" />
            </g>
          );
        })}

        {/* The Traveling / Cascading Arc Cluster Snowball */}
        <g style={{ filter: "drop-shadow(0px 2px 5px rgba(216, 180, 254, 0.8))" }}>
          {Array.from({ length: movingSectorsCount }, (_, i) => {
            const heading = Math.atan2(vertices[(i + 1) % n].y - vertices[i].y, vertices[(i + 1) % n].x - vertices[i].x);
            const sectorD = getSectorPath({ x: clusterX, y: clusterY }, heading, sweepAngle, arcR);
            const arcD = getArcPath({ x: clusterX, y: clusterY }, heading, sweepAngle, arcR);

            return (
              <g key={`moving-sector-${i}`}>
                <path d={sectorD} fill="rgba(216, 180, 254, 0.45)" stroke="none" />
                <path d={arcD} fill="none" stroke={COLOR_LILAC} strokeWidth={3} strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        {/* Corner Vertex Dots */}
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

      {/* Row 2: Replay Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={startRoll}
          className="px-4 py-1 rounded-full text-xs font-bold transition-all border bg-white/15 hover:bg-white/25 text-white border-white/30 shadow-sm backdrop-blur-md active:scale-95 select-none flex items-center gap-1.5 cursor-pointer"
        >
          {isPlaying ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              Combining exterior angles...
            </>
          ) : isComplete ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              Replay combination (360°)
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              Combine angles around perimeter
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
