"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw } from "lucide-react";

type InteractivePiProps = {
  color?: string;
};

const COLOR_D1 = "#ffd45e";     // Warm Gold (1st Diameter)
const COLOR_D2 = "#5ee8ff";     // Electric Cyan (2nd Diameter)
const COLOR_D3 = "#34d399";     // Vibrant Emerald Mint (3rd Diameter)
const COLOR_GAP = "#fb7185";    // Vibrant Rose (0.14159d Remainder)
const COLOR_DIAMETER = "#ffd45e";// Warm Gold for center diameter dial

// 1 diameter wrapped on circle circumference subtends exactly 2 radians (114.59156 degrees)
const RAD_PER_D = 2.0;
const DEG_PER_D = (180 / Math.PI) * RAD_PER_D; // ~114.59156 deg
const DEG_D1 = DEG_PER_D;                      // ~114.59 deg
const DEG_D2 = 2 * DEG_PER_D;                  // ~229.18 deg
const DEG_D3 = 3 * DEG_PER_D;                  // ~343.77 deg
const DEG_GAP = 360 - DEG_D3;                  // ~16.23 deg

// Sector midpoint angles in degrees (where 0 deg = 12 o'clock):
const MID1 = DEG_D1 / 2;             // ~57.3 deg
const MID2 = DEG_D1 + DEG_PER_D / 2; // ~171.9 deg
const MID3 = DEG_D2 + DEG_PER_D / 2; // ~286.5 deg
const MID_GAP = DEG_D3 + DEG_GAP / 2;// ~351.9 deg

// Tangent dial angles for the center diameter chord:
const ANGLE_D1 = MID1 - 90 + 90;     // 57.3 deg
const ANGLE_D2 = MID2 - 90 + 90;     // 171.9 deg
const ANGLE_D3 = MID3 - 90 + 90;     // 286.5 deg
const ANGLE_GAP = MID_GAP - 90 + 90; // 351.9 deg

// 4 discrete equal-duration stages across [0 .. 4.0]:
// 0.0: Start (diameter in center)
// 1.0: 1st Diameter wrapped (1d)
// 2.0: 2nd Diameter wrapped (2d)
// 3.0: 3rd Diameter wrapped (3d)
// 4.0: Remainder wrapped (π ≈ 3.14159d)
const CHECKPOINTS = [
  { val: 0.0, label: "0", color: "#ffffff" },
  { val: 1.0, label: "1d", color: COLOR_D1 },
  { val: 2.0, label: "2d", color: COLOR_D2 },
  { val: 3.0, label: "3d", color: COLOR_D3 },
  { val: 4.0, label: "π (3.14d)", color: COLOR_GAP },
] as const;

function describeArc(cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number): string {
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const diff = endAngleDeg - startAngleDeg;
  const largeArcFlag = diff > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

// Morphing clone that peels directly off the center dial once it finishes rotating
function morphingClonePath(
  cx: number,
  cy: number,
  cr: number,
  sectorMidDeg: number, // degrees from 12 o'clock
  t: number              // progress [0..1]
): { path: string; endP1: [number, number]; endP2: [number, number]; opacity: number } {
  const thetaMid = ((sectorMidDeg - 90) * Math.PI) / 180;
  const tangentAngle = thetaMid + Math.PI / 2;

  const moveEase = 0.5 * (1 - Math.cos(t * Math.PI));
  const bendT = Math.min(1, Math.max(0, (t - 0.15) / 0.85));
  const bendEase = 0.5 * (1 - Math.cos(bendT * Math.PI));

  // Center of rod translates radially outward from (cx, cy)
  const curDist = moveEase * cr;
  const midX = cx + curDist * Math.cos(thetaMid);
  const midY = cy + curDist * Math.sin(thetaMid);

  const opacity = Math.min(1, t * 6);

  if (bendEase < 0.02) {
    const p1x = midX - cr * Math.cos(tangentAngle);
    const p1y = midY - cr * Math.sin(tangentAngle);
    const p2x = midX + cr * Math.cos(tangentAngle);
    const p2y = midY + cr * Math.sin(tangentAngle);

    return {
      path: `M ${p1x} ${p1y} L ${p2x} ${p2y}`,
      endP1: [p1x, p1y],
      endP2: [p2x, p2y],
      opacity,
    };
  }

  // Constant-length bending arc
  const deltaRad = bendEase * RAD_PER_D;
  const Rb = cr / bendEase;

  const centerCurvX = midX - Rb * Math.cos(thetaMid);
  const centerCurvY = midY - Rb * Math.sin(thetaMid);

  const startAng = thetaMid - deltaRad / 2;
  const endAng = thetaMid + deltaRad / 2;

  const p1x = centerCurvX + Rb * Math.cos(startAng);
  const p1y = centerCurvY + Rb * Math.sin(startAng);
  const p2x = centerCurvX + Rb * Math.cos(endAng);
  const p2y = centerCurvY + Rb * Math.sin(endAng);

  const largeArcFlag = deltaRad > Math.PI ? 1 : 0;
  return {
    path: `M ${p1x} ${p1y} A ${Rb} ${Rb} 0 ${largeArcFlag} 1 ${p2x} ${p2y}`,
    endP1: [p1x, p1y],
    endP2: [p2x, p2y],
    opacity,
  };
}

// Remainder piece path (0.14159d)
function morphingGapPath(
  cx: number,
  cy: number,
  cr: number,
  t: number // [0..1]
): { path: string; opacity: number } {
  const startAngleDeg = DEG_D3;
  const gapAngleDeg = DEG_GAP;
  const midAngleDeg = startAngleDeg + gapAngleDeg / 2;
  const midRad = ((midAngleDeg - 90) * Math.PI) / 180;
  const tangentAngle = midRad + Math.PI / 2;

  const moveEase = 0.5 * (1 - Math.cos(t * Math.PI));
  const curDist = moveEase * cr;
  const midX = cx + curDist * Math.cos(midRad);
  const midY = cy + curDist * Math.sin(midRad);

  const halfGapLen = cr * (Math.PI - 3);

  if (moveEase < 0.1) {
    const p1x = midX - halfGapLen * Math.cos(tangentAngle);
    const p1y = midY - halfGapLen * Math.sin(tangentAngle);
    const p2x = midX + halfGapLen * Math.cos(tangentAngle);
    const p2y = midY + halfGapLen * Math.sin(tangentAngle);
    return {
      path: `M ${p1x} ${p1y} L ${p2x} ${p2y}`,
      opacity: Math.min(1, t * 6),
    };
  }

  if (moveEase >= 0.95) {
    return {
      path: describeArc(cx, cy, cr, startAngleDeg, startAngleDeg + gapAngleDeg),
      opacity: 1,
    };
  }

  const rad1 = ((startAngleDeg - 90) * Math.PI) / 180;
  const rad2 = (((startAngleDeg + gapAngleDeg) - 90) * Math.PI) / 180;
  const targetX1 = cx + cr * Math.cos(rad1);
  const targetY1 = cy + cr * Math.sin(rad1);
  const targetX2 = cx + cr * Math.cos(rad2);
  const targetY2 = cy + cr * Math.sin(rad2);

  const startX1 = cx - halfGapLen * Math.cos(tangentAngle);
  const startY1 = cy - halfGapLen * Math.sin(tangentAngle);
  const startX2 = cx + halfGapLen * Math.cos(tangentAngle);
  const startY2 = cy + halfGapLen * Math.sin(tangentAngle);

  const curX1 = startX1 + (targetX1 - startX1) * moveEase;
  const curY1 = startY1 + (targetY1 - startY1) * moveEase;
  const curX2 = startX2 + (targetX2 - startX2) * moveEase;
  const curY2 = startY2 + (targetY2 - startY2) * moveEase;

  const ctrlX = (curX1 + curX2) / 2 + moveEase * 6 * Math.cos(midRad);
  const ctrlY = (curY1 + curY2) / 2 + moveEase * 6 * Math.sin(midRad);

  return {
    path: `M ${curX1} ${curY1} Q ${ctrlX} ${ctrlY} ${curX2} ${curY2}`,
    opacity: Math.min(1, t * 6),
  };
}

export function InteractivePiExplorer({ color }: InteractivePiProps) {
  const { containerRef, width: rawW } = useContainerWidth(360);
  const containerW = Math.max(340, Math.min(650, rawW - 16));
  const SVG_W = containerW;
  const SVG_H = 162;
  const CX = SVG_W / 2;
  const CY = 80;
  const CR = 50;

  // Stage Progress: [0.0 .. 4.0] (Equal 1.0 duration for each of the 4 segments!)
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Continuous animation loop across 0 -> 4 with generous, smooth pacing (~5.6s total, ~1.4s per stage)
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setProgress((prev) => {
        const speed = 4.0 / 5.6; // 4 stages in 5.6s
        const next = prev + speed * delta;
        if (next >= 4.0) {
          setIsPlaying(false);
          return 4.0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (progress >= 3.96) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Jump to a specific checkpoint [0, 1, 2, 3, 4]
  const jumpToCheckpoint = (val: number) => {
    setIsPlaying(false);
    setProgress(val);
  };

  // Slider Scrubbing Pointer Handlers
  const handleSliderPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    setIsScrubbing(true);

    const track = sliderTrackRef.current;
    if (!track) return;

    const updateFromPointer = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setProgress(fraction * 4.0);
    };

    updateFromPointer(e.clientX);

    const onMove = (ev: PointerEvent) => {
      updateFromPointer(ev.clientX);
    };

    const onUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const p = progress;

  // Center dotted diameter dial rotation angle across the 4 stages:
  let dialAngleDeg = 0; // horizontal initially
  if (p > 0 && p <= 1) {
    const rotT = Math.min(1, p / 0.32);
    const rotEase = 0.5 * (1 - Math.cos(rotT * Math.PI));
    dialAngleDeg = 0 + (ANGLE_D1 - 0) * rotEase;
  } else if (p > 1 && p <= 2) {
    const rotT = Math.min(1, (p - 1) / 0.32);
    const rotEase = 0.5 * (1 - Math.cos(rotT * Math.PI));
    dialAngleDeg = ANGLE_D1 + (ANGLE_D2 - ANGLE_D1) * rotEase;
  } else if (p > 2 && p <= 3) {
    const rotT = Math.min(1, (p - 2) / 0.32);
    const rotEase = 0.5 * (1 - Math.cos(rotT * Math.PI));
    dialAngleDeg = ANGLE_D2 + (ANGLE_D3 - ANGLE_D2) * rotEase;
  } else if (p > 3) {
    const rotT = Math.min(1, (p - 3) / 0.32);
    const rotEase = 0.5 * (1 - Math.cos(rotT * Math.PI));
    dialAngleDeg = ANGLE_D3 + (ANGLE_GAP - ANGLE_D3) * rotEase;
  }

  const dialRad = (dialAngleDeg * Math.PI) / 180;
  const dialX1 = CX - CR * Math.cos(dialRad);
  const dialY1 = CY - CR * Math.sin(dialRad);
  const dialX2 = CX + CR * Math.cos(dialRad);
  const dialY2 = CY + CR * Math.sin(dialRad);

  // Sub-progress for each clone peeling off (starts after rotation completes: in range [0.30 .. 1.0])
  const p1 = Math.min(1, Math.max(0, (p - 0.30) / 0.70));
  const p2 = Math.min(1, Math.max(0, (p - 1.30) / 0.70));
  const p3 = Math.min(1, Math.max(0, (p - 2.30) / 0.70));
  const pGap = Math.min(1, Math.max(0, (p - 3.30) / 0.70));

  // Individual fill fractions for each of the 4 segments for equation & track [0..1]
  const seg1Fill = Math.min(1, Math.max(0, p));
  const seg2Fill = Math.min(1, Math.max(0, p - 1.0));
  const seg3Fill = Math.min(1, Math.max(0, p - 2.0));
  const seg4Fill = Math.min(1, Math.max(0, p - 3.0));

  // Label positions radially outside circle perimeter
  const labelR = CR + 15;
  const radLabel1 = ((MID1 - 90) * Math.PI) / 180;
  const lx1 = CX + labelR * Math.cos(radLabel1);
  const ly1 = CY + labelR * Math.sin(radLabel1);

  const radLabel2 = ((MID2 - 90) * Math.PI) / 180;
  const lx2 = CX + labelR * Math.cos(radLabel2);
  const ly2 = CY + labelR * Math.sin(radLabel2);

  const radLabel3 = ((MID3 - 90) * Math.PI) / 180;
  const lx3 = CX + (labelR + 4) * Math.cos(radLabel3);
  const ly3 = CY + (labelR + 4) * Math.sin(radLabel3);

  const radLabelGap = ((MID_GAP - 90) * Math.PI) / 180;
  const lxGap = CX + (labelR + 2) * Math.cos(radLabelGap);
  const lyGap = CY + (labelR + 2) * Math.sin(radLabelGap);

  // Active smooth morphing clone paths
  const rod1 = morphingClonePath(CX, CY, CR, MID1, p1);
  const rod2 = morphingClonePath(CX, CY, CR, MID2, p2);
  const rod3 = morphingClonePath(CX, CY, CR, MID3, p3);
  const gap = morphingGapPath(CX, CY, CR, pGap);

  // Slider progress percent [0..100%]
  const progressPct = (progress / 4.0) * 100;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full max-w-[650px] mx-auto select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 155 }}
        className="w-full touch-none select-none overflow-visible"
      >
        {/* Ghost Reference Circle Disc */}
        <circle cx={CX} cy={CY} r={CR} fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.22)" strokeWidth={1.8} strokeDasharray="3 3" />

        {/* Rotating Center Dotted Diameter Dial (Aims at each sector and spawns the clone) */}
        <g opacity={0.75}>
          <line
            x1={dialX1}
            y1={dialY1}
            x2={dialX2}
            y2={dialY2}
            stroke={COLOR_DIAMETER}
            strokeWidth={2.4}
            strokeDasharray="4 3"
          />
          <circle cx={dialX1} cy={dialY1} r={3} fill={COLOR_DIAMETER} />
          <circle cx={dialX2} cy={dialY2} r={3} fill={COLOR_DIAMETER} />
        </g>

        {/* Fixed Horizontal Center Label */}
        <text
          x={CX}
          y={CY - 13}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight="900"
          fill={COLOR_DIAMETER}
          fontFamily="var(--font-heading, system-ui)"
          style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
        >
          diameter (d)
        </text>

        {/* Center Point Hub Dot */}
        <circle cx={CX} cy={CY} r={3.2} fill="#ffffff" />

        {/* 1st Cloned Diameter (Gold: spawns off rotated dial, glides outward & curls into 0 -> 114.6 deg) */}
        {p1 > 0 && (
          <g opacity={rod1.opacity}>
            <path
              d={p1 >= 0.999 ? describeArc(CX, CY, CR, 0, DEG_D1) : rod1.path}
              fill="none"
              stroke={COLOR_D1}
              strokeWidth={3.8}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 5px rgba(255, 212, 94, 0.7))" }}
            />
            <circle cx={rod1.endP1[0]} cy={rod1.endP1[1]} r={3.5} fill={COLOR_D1} />
            <circle cx={rod1.endP2[0]} cy={rod1.endP2[1]} r={3.5} fill={COLOR_D1} />
            {p1 > 0.45 && (
              <text
                x={lx1}
                y={ly1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13.5}
                fontWeight="900"
                fill={COLOR_D1}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
              >
                1d
              </text>
            )}
          </g>
        )}

        {/* 2nd Cloned Diameter (Cyan: spawns off rotated dial, glides outward & curls into 114.6 -> 229.2 deg) */}
        {p2 > 0 && (
          <g opacity={rod2.opacity}>
            <path
              d={p2 >= 0.999 ? describeArc(CX, CY, CR, DEG_D1, DEG_D2) : rod2.path}
              fill="none"
              stroke={COLOR_D2}
              strokeWidth={3.8}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 5px rgba(94, 232, 255, 0.7))" }}
            />
            <circle cx={rod2.endP1[0]} cy={rod2.endP1[1]} r={3.5} fill={COLOR_D2} />
            <circle cx={rod2.endP2[0]} cy={rod2.endP2[1]} r={3.5} fill={COLOR_D2} />
            {p2 > 0.45 && (
              <text
                x={lx2}
                y={ly2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13.5}
                fontWeight="900"
                fill={COLOR_D2}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
              >
                2d
              </text>
            )}
          </g>
        )}

        {/* 3rd Cloned Diameter (Emerald Mint: spawns off rotated dial, glides outward & curls into 229.2 -> 343.8 deg) */}
        {p3 > 0 && (
          <g opacity={rod3.opacity}>
            <path
              d={p3 >= 0.999 ? describeArc(CX, CY, CR, DEG_D2, DEG_D3) : rod3.path}
              fill="none"
              stroke={COLOR_D3}
              strokeWidth={3.8}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 5px rgba(52, 211, 153, 0.75))" }}
            />
            <circle cx={rod3.endP1[0]} cy={rod3.endP1[1]} r={3.5} fill={COLOR_D3} />
            <circle cx={rod3.endP2[0]} cy={rod3.endP2[1]} r={3.5} fill={COLOR_D3} />
            {p3 > 0.45 && (
              <text
                x={lx3}
                y={ly3}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13.5}
                fontWeight="900"
                fill={COLOR_D3}
                fontFamily="var(--font-heading, system-ui)"
                style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
              >
                3d
              </text>
            )}
          </g>
        )}

        {/* Remainder Gap Piece (+0.14159d closes 343.8 -> 360 deg) */}
        {pGap > 0 && (
          <g opacity={gap.opacity}>
            <path
              d={gap.path}
              fill="none"
              stroke={COLOR_GAP}
              strokeWidth={4.2}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0px 0px 6px rgba(251, 113, 133, 0.9))" }}
            />
            {/* +0.14d Label */}
            <text
              x={lxGap}
              y={lyGap}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight="900"
              fill={COLOR_GAP}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.9))" }}
            >
              +0.14d
            </text>
          </g>
        )}
      </svg>

      {/* Scrubbable Checkpoint Slider Control Bar */}
      <div className="w-full max-w-[480px] px-4 flex flex-col gap-1 select-none">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Play / Pause / Replay Action Button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all border bg-white/10 hover:bg-white/20 text-white/90 border-white/25 shadow-sm backdrop-blur-md active:scale-95 shrink-0"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current text-white/90" />
            ) : progress >= 3.96 ? (
              <RotateCcw className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-white/90 translate-x-0.5" />
            )}
          </button>

          {/* Slider track + labels column (ensures 100% perfect 1:1 alignment) */}
          <div className="flex-1 flex flex-col select-none">
            {/* Interactive Scrub Track */}
            <div
              ref={sliderTrackRef}
              onPointerDown={handleSliderPointerDown}
              className="relative w-full h-7 flex items-center cursor-pointer group"
            >
              {/* Seamless 4-segment filled track (Frosted glass groove) */}
              <div className="w-full h-2 rounded-full bg-white/15 border border-white/25 shadow-inner overflow-hidden relative flex backdrop-blur-sm">
                {/* 1st Quarter: 0 -> 1d (Gold) */}
                <div className="w-1/4 h-full relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(1, Math.max(0, p)) * 100}%`,
                      backgroundColor: COLOR_D1,
                    }}
                  />
                </div>

                {/* 2nd Quarter: 1d -> 2d (Cyan) */}
                <div className="w-1/4 h-full relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(1, Math.max(0, p - 1.0)) * 100}%`,
                      backgroundColor: COLOR_D2,
                    }}
                  />
                </div>

                {/* 3rd Quarter: 2d -> 3d (Emerald Mint) */}
                <div className="w-1/4 h-full relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(1, Math.max(0, p - 2.0)) * 100}%`,
                      backgroundColor: COLOR_D3,
                    }}
                  />
                </div>

                {/* 4th Quarter: 3d -> π (Rose) */}
                <div className="w-1/4 h-full relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(1, Math.max(0, p - 3.0)) * 100}%`,
                      backgroundColor: COLOR_GAP,
                    }}
                  />
                </div>
              </div>

              {/* Checkpoint Dots & Tick Markers (0, 1d, 2d, 3d, π at 0%, 25%, 50%, 75%, 100%) */}
              {CHECKPOINTS.map((cp) => {
                const cpPct = (cp.val / 4.0) * 100;
                const isPassed = progress >= cp.val - 0.05;
                const isCurrent = Math.abs(progress - cp.val) < 0.20;

                return (
                  <div
                    key={cp.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToCheckpoint(cp.val);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer z-10 p-1"
                    style={{ left: `${cpPct}%` }}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shadow-sm",
                        isCurrent
                          ? "scale-125 border-white bg-white shadow-md ring-2 ring-white/50"
                          : isPassed
                          ? "border-white/90 bg-white/90"
                          : "border-white/50 bg-white/20 backdrop-blur-sm hover:scale-110"
                      )}
                      style={{ borderColor: isPassed ? cp.color : undefined }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isPassed ? cp.color : "transparent" }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Draggable Scrubber Thumb */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-white shadow-lg pointer-events-none transition-transform z-20",
                  isScrubbing ? "scale-125 ring-4 ring-white/40" : "scale-100"
                )}
                style={{
                  left: `${progressPct}%`,
                  filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8))",
                }}
              />
            </div>

            {/* Checkpoint Labels Row (nested inside slider column for 1:1 alignment with dots) */}
            <div className="relative w-full h-4 mt-1">
              {CHECKPOINTS.map((cp, idx) => {
                const cpPct = (cp.val / 4.0) * 100;
                const isCurrent = Math.abs(progress - cp.val) < 0.20;
                const isFirst = idx === 0;
                const isLast = idx === CHECKPOINTS.length - 1;

                return (
                  <button
                    key={cp.label}
                    onClick={() => jumpToCheckpoint(cp.val)}
                    className={cn(
                      "absolute top-0 text-xs font-headline font-bold transition-all border-none bg-transparent cursor-pointer whitespace-nowrap",
                      isCurrent ? "font-bold" : "text-white/80 hover:text-white",
                      isFirst ? "translate-x-0" : isLast ? "-translate-x-full" : "-translate-x-1/2"
                    )}
                    style={{
                      left: `${cpPct}%`,
                      color: isCurrent ? cp.color : undefined,
                    }}
                  >
                    {cp.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Frosted Typographic Equation Banner with Progressive Text Color Fill */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2 px-5 py-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
          <span className="text-white">Circumference</span>
          <span className="text-white/50">=</span>

          <span
            className="transition-colors duration-150"
            style={{
              color: seg1Fill > 0.05 ? COLOR_D1 : "rgba(255, 255, 255, 0.28)",
            }}
          >
            1d
          </span>

          <span className="text-white/40">+</span>

          <span
            className="transition-colors duration-150"
            style={{
              color: seg2Fill > 0.05 ? COLOR_D2 : "rgba(255, 255, 255, 0.28)",
            }}
          >
            1d
          </span>

          <span className="text-white/40">+</span>

          <span
            className="transition-colors duration-150"
            style={{
              color: seg3Fill > 0.05 ? COLOR_D3 : "rgba(255, 255, 255, 0.28)",
            }}
          >
            1d
          </span>

          <span className="text-white/40">+</span>

          <span
            className="transition-colors duration-150"
            style={{
              color: seg4Fill > 0.05 ? COLOR_GAP : "rgba(255, 255, 255, 0.28)",
            }}
          >
            0.14159d
          </span>

          <span className="text-white/50">≈</span>

          <span
            className={cn(
              "transition-all duration-200",
              progress >= 3.95
                ? "text-white font-bold"
                : "text-white/30 font-semibold"
            )}
          >
            3.14159 · d
          </span>
        </div>
      </div>
    </div>
  );
}
