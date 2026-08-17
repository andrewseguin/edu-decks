import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { Play, RotateCcw } from "lucide-react";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_H = 175;
const R = 62;

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
const COLOR_GOLD = "#ffd45e";  // Walker & accent color

function getExteriorArcD(
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
  const [walkProgress, setWalkProgress] = useState(0); // 0 to n
  const [isPlaying, setIsPlaying] = useState(false);

  const animRef = useRef<number | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute vertices (upright with apex at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const eachExteriorAngle = 360 / n;
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  // Start continuous perimeter walk animation
  const startWalk = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(true);
    setWalkProgress(0);

    const totalDuration = Math.max(3200, n * 800);
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const prog = Math.min(1, elapsed / totalDuration);
      setWalkProgress(prog * n);

      if (prog < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setWalkProgress(n);
        setIsPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(frame);
  }, [n]);

  // When shape changes, reset and auto-play
  useEffect(() => {
    startWalk();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [n, startWalk]);

  // Compute current position and orientation of the walking arrow
  const currentLeg = Math.max(0, Math.min(n - 1, Math.floor(walkProgress || 0)));
  const legProgress = Math.max(0, Math.min(1, (walkProgress || 0) - currentLeg));

  const fromV = vertices[currentLeg] || vertices[0] || { x: CX, y: CY };
  const toV = vertices[(currentLeg + 1) % n] || vertices[0] || { x: CX, y: CY };
  const nextToV = vertices[(currentLeg + 2) % n] || vertices[0] || { x: CX, y: CY };

  // Headings
  const currentHeading = Math.atan2(toV.y - fromV.y, toV.x - fromV.x);
  const nextHeading = Math.atan2(nextToV.y - toV.y, nextToV.x - toV.x);

  let arrowX = toV.x;
  let arrowY = toV.y;
  let arrowAngle = (currentHeading * 180) / Math.PI;

  if (legProgress < 0.65) {
    // Walking straight along edge
    const tWalk = legProgress / 0.65;
    arrowX = fromV.x + (toV.x - fromV.x) * tWalk;
    arrowY = fromV.y + (toV.y - fromV.y) * tWalk;
    arrowAngle = (currentHeading * 180) / Math.PI;
  } else {
    // Pivoting around vertex corner
    const tPivot = (legProgress - 0.65) / 0.35;
    arrowX = toV.x;
    arrowY = toV.y;
    const angleDiff = ((nextHeading - currentHeading + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    const interpolated = currentHeading + angleDiff * tPivot;
    arrowAngle = (interpolated * 180) / Math.PI;
  }

  // Accumulated turned degrees
  const completedTurns = Math.min(n, Math.max(0, walkProgress >= n ? n : legProgress >= 0.65 ? currentLeg + (legProgress - 0.65) / 0.35 : currentLeg));
  const accumulatedDegrees = Math.min(360, Math.round(completedTurns * eachExteriorAngle));

  // Compass pie arc radius
  const compassR = 20;
  const compassSweepRad = (accumulatedDegrees * Math.PI) / 180;
  const compassEndX = CX + compassR * Math.sin(compassSweepRad);
  const compassEndY = CY - compassR * Math.cos(compassSweepRad);
  const largeArcFlag = accumulatedDegrees > 180 ? 1 : 0;
  const compassD =
    accumulatedDegrees >= 360
      ? `M ${CX} ${CY - compassR} A ${compassR} ${compassR} 0 1 1 ${CX - 0.01} ${CY - compassR} Z`
      : accumulatedDegrees > 0
      ? `M ${CX} ${CY} L ${CX} ${CY - compassR} A ${compassR} ${compassR} 0 ${largeArcFlag} 1 ${compassEndX} ${compassEndY} Z`
      : "";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible"
      >
        {/* Central Compass Accumulator Dial */}
        <circle cx={CX} cy={CY} r={compassR + 2} fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />
        {compassD && <path d={compassD} fill="rgba(216, 180, 254, 0.35)" stroke={COLOR_LILAC} strokeWidth={1.5} />}
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10.5}
          fontWeight="900"
          fill="#ffffff"
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.8))" }}
        >
          {accumulatedDegrees}°
        </text>

        {/* Extended Perimeter Rays & Exterior Angle Arcs */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const sweepAngle = (2 * Math.PI) / n;

          const extLen = Math.max(20, Math.min(30, 120 / n));
          const rayEndX = nextV.x + Math.cos(heading) * extLen;
          const rayEndY = nextV.y + Math.sin(heading) * extLen;

          // Corner exterior arc
          const arcR = Math.max(14, Math.min(22, 90 / n));
          const arcD = getExteriorArcD(nextV, heading, sweepAngle, arcR);

          const isPassed = walkProgress >= i + 1 || (currentLeg === i && legProgress >= 0.65);

          return (
            <g key={`ext-${i}`}>
              {/* Dashed Heading Extension Ray */}
              <line
                x1={nextV.x}
                y1={nextV.y}
                x2={rayEndX}
                y2={rayEndY}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />

              {/* Exterior Angle Arc */}
              <path
                d={arcD}
                fill="none"
                stroke={isPassed ? COLOR_LILAC : "rgba(255, 255, 255, 0.3)"}
                strokeWidth={isPassed ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Outer boundary polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Vertex Dots */}
        {vertices.map((v, i) => (
          <circle key={`v-${i}`} cx={v.x} cy={v.y} r={3} fill="#ffffff" />
        ))}

        {/* The Walking Tracker Arrow with Exaggerated Trailing Line */}
        <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})`}>
          {/* Extended Trailing Line (Needle Tail) to Exaggerate Corner Turning */}
          <line
            x1={-32}
            y1={0}
            x2={10}
            y2={0}
            stroke={COLOR_GOLD}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0px 0px 3px rgba(255, 212, 94, 0.8))" }}
          />

          {/* Trailing Dashed Accent */}
          <line
            x1={-46}
            y1={0}
            x2={-34}
            y2={0}
            stroke={COLOR_GOLD}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Central Pivot Hub Dot */}
          <circle cx={0} cy={0} r={4.5} fill={COLOR_GOLD} stroke="#ffffff" strokeWidth={1.5} />

          {/* Forward Chevron Arrowhead */}
          <path
            d="M 14 0 L 2 -6 L 5 0 L 2 6 Z"
            fill={COLOR_GOLD}
            stroke="#ffffff"
            strokeWidth={1.2}
            style={{ filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.8))" }}
          />
        </g>
      </svg>

      {/* Controls Row: Shape Stepper & Replay Button */}
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
            {polyName} ({n} sides · {Number(eachExteriorAngle.toFixed(1))}° turns)
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

        {/* Replay Walk Button */}
        <button
          onClick={startWalk}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 backdrop-blur-md shadow-sm transition-all cursor-pointer"
          title="Re-walk perimeter"
          aria-label="Re-walk perimeter"
        >
          {isPlaying ? <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" /> : <Play className="w-3.5 h-3.5 fill-white" />}
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
