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

const TRI_PALETTE = [
  { fill: "rgba(216, 180, 254, 0.25)", stroke: COLOR_LILAC }, // Lilac
  { fill: "rgba(255, 212, 94, 0.25)",  stroke: COLOR_GOLD },  // Warm Gold
];

function getCornerArc(
  center: { x: number; y: number },
  pt1: { x: number; y: number },
  pt2: { x: number; y: number },
  r: number
): string {
  const d1x = pt1.x - center.x;
  const d1y = pt1.y - center.y;
  const len1 = Math.hypot(d1x, d1y);
  if (len1 === 0) return "";
  const u1x = d1x / len1;
  const u1y = d1y / len1;

  const d2x = pt2.x - center.x;
  const d2y = pt2.y - center.y;
  const len2 = Math.hypot(d2x, d2y);
  if (len2 === 0) return "";
  const u2x = d2x / len2;
  const u2y = d2y / len2;

  const p1x = center.x + r * u1x;
  const p1y = center.y + r * u1y;
  const p2x = center.x + r * u2x;
  const p2y = center.y + r * u2y;

  const cross = u1x * u2y - u1y * u2x;
  const sweep = cross > 0 ? 1 : 0;

  return `M ${p1x} ${p1y} A ${r} ${r} 0 0 ${sweep} ${p2x} ${p2y}`;
}

export function InteractivePolygonInteriorSumExplorer({ color }: InteractivePolygonInteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 84;

  const [n, setN] = useState(5); // n in [3..12]
  const numTriangles = n - 2;

  // Animation state:
  // revealedTriangles: number of fully completed triangle slices
  // activeDiagonalProgress: progress (0 to 1) of the currently extending diagonal beam from apex
  const [revealedTriangles, setRevealedTriangles] = useState(numTriangles);
  const [activeDrawingCut, setActiveDrawingCut] = useState<number | null>(null);
  const [diagonalProgress, setDiagonalProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const animFrameRef = useRef<number | null>(null);

  const clearAnim = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const playFanCutSequence = useCallback((targetTriangles: number) => {
    clearAnim();
    setIsAnimating(true);
    setRevealedTriangles(0);
    setActiveDrawingCut(null);
    setDiagonalProgress(0);

    let currentStep = 0; // step index 0 .. targetTriangles - 1

    const runNextStep = () => {
      if (currentStep >= targetTriangles) {
        setRevealedTriangles(targetTriangles);
        setActiveDrawingCut(null);
        setDiagonalProgress(1);
        setIsAnimating(false);
        return;
      }

      // If this triangle requires a diagonal cut (triangles 0 to targetTriangles - 2)
      if (currentStep < targetTriangles - 1) {
        setActiveDrawingCut(currentStep);
        const cutStartTime = performance.now();
        const cutDuration = Math.max(240, Math.min(380, 1400 / targetTriangles));

        const animateDiagonal = (now: number) => {
          const elapsed = now - cutStartTime;
          const prog = Math.min(1, elapsed / cutDuration);
          setDiagonalProgress(prog);

          if (prog < 1) {
            animFrameRef.current = requestAnimationFrame(animateDiagonal);
          } else {
            // Cut finished! Reveal the triangle and move to next
            currentStep++;
            setRevealedTriangles(currentStep);
            setActiveDrawingCut(null);
            setTimeout(() => {
              runNextStep();
            }, 120);
          }
        };
        animFrameRef.current = requestAnimationFrame(animateDiagonal);
      } else {
        // Last triangle fills the remaining slice
        currentStep++;
        setRevealedTriangles(currentStep);
        setActiveDrawingCut(null);
        setIsAnimating(false);
      }
    };

    // Small initial delay before first diagonal starts
    setTimeout(() => {
      runNextStep();
    }, 100);
  }, []);

  // Trigger fan-cut sequence when n changes
  useEffect(() => {
    playFanCutSequence(numTriangles);
    return () => clearAnim();
  }, [n, numTriangles, playFanCutSequence]);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Compute vertices (upright with apex hub at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const totalSum = numTriangles * 180;
  const currentSum = revealedTriangles * 180;
  const polyName = POLY_NAMES[n] || `${n}-gon`;
  const hubV = vertices[0];

  const arcR = Math.max(8, Math.min(15, 64 / n));

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
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Sequentially revealed triangles with 3 matching corner angle arcs */}
        {Array.from({ length: numTriangles }, (_, i) => {
          const v0 = hubV;
          const v1 = vertices[i + 1];
          const v2 = vertices[i + 2];
          const pathD = `M ${v0.x} ${v0.y} L ${v1.x} ${v1.y} L ${v2.x} ${v2.y} Z`;
          const isRevealed = i < revealedTriangles;
          const theme = TRI_PALETTE[i % TRI_PALETTE.length];
          const triCenter = {
            x: (v0.x + v1.x + v2.x) / 3,
            y: (v0.y + v1.y + v2.y) / 3,
          };

          // 3 Corner Angle Arcs for this triangle
          const arcHub = getCornerArc(v0, v1, v2, arcR);
          const arcV1 = getCornerArc(v1, v2, v0, arcR);
          const arcV2 = getCornerArc(v2, v0, v1, arcR);

          return (
            <g
              key={`tri-${i}`}
              style={{
                opacity: isRevealed ? 1 : 0,
                transition: "opacity 0.24s ease-out",
              }}
            >
              {/* Triangle Tint Fill */}
              <path
                d={pathD}
                fill={theme.fill}
                stroke="none"
              />

              {/* Triangle 3 Corner Angle Arcs in Matching Theme Color */}
              {arcHub && <path d={arcHub} fill="none" stroke={theme.stroke} strokeWidth={2} strokeLinecap="round" />}
              {arcV1 && <path d={arcV1} fill="none" stroke={theme.stroke} strokeWidth={2} strokeLinecap="round" />}
              {arcV2 && <path d={arcV2} fill="none" stroke={theme.stroke} strokeWidth={2} strokeLinecap="round" />}

              {/* Triangle 180° Label */}
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

        {/* Established Static Diagonals (fully cut) */}
        {Array.from({ length: numTriangles - 1 }, (_, i) => {
          const toV = vertices[i + 2];
          const isDrawn = i + 1 <= revealedTriangles;
          if (!isDrawn) return null;
          return (
            <line
              key={`diag-done-${i}`}
              x1={hubV.x}
              y1={hubV.y}
              x2={toV.x}
              y2={toV.y}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          );
        })}

        {/* Live Animating Diagonal Beam shooting from Hub */}
        {activeDrawingCut !== null && activeDrawingCut < numTriangles - 1 && (
          (() => {
            const destV = vertices[activeDrawingCut + 2];
            const currentX = hubV.x + (destV.x - hubV.x) * diagonalProgress;
            const currentY = hubV.y + (destV.y - hubV.y) * diagonalProgress;
            return (
              <g>
                <line
                  x1={hubV.x}
                  y1={hubV.y}
                  x2={currentX}
                  y2={currentY}
                  stroke={COLOR_GOLD}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {/* Laser Tip Spark */}
                <circle cx={currentX} cy={currentY} r={3} fill={COLOR_GOLD} />
              </g>
            );
          })()
        )}

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
          onClick={() => playFanCutSequence(numTriangles)}
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
          <span className="text-white/90">{revealedTriangles} · 180°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">{currentSum}°</span>
        </div>
      </div>
    </div>
  );
}
