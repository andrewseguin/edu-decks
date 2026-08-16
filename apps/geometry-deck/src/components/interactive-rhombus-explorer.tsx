"use client";

import React, { useState, useCallback, useRef } from "react";
import { RightAngleMarker } from "@/lib/svg-shapes/svg-primitives";
import { useContainerWidth } from "@/hooks/use-container-width";

type InteractiveRhombusExplorerProps = {
  mode?: "properties" | "perimeter";
  color?: string;
};

const SVG_H = 160;

const COLOR_SIDE = "#ffd45e";               // Warm Gold
const COLOR_DIAG = "rgba(255, 255, 255, 0.55)"; // Neutral White Diagonals
const COLOR_CYAN = "#5ee8ff";               // Electric Cyan (Top/Bottom angles)
const COLOR_LILAC = "#d8b4fe";              // Neon Lilac (Left/Right angles)
const COLOR_AREA = "#ffffff";

export function InteractiveRhombusExplorer({ mode = "properties", color }: InteractiveRhombusExplorerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);

  const SVG_W = Math.max(260, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = SVG_H / 2;
  const isPerimeter = mode === "perimeter";

  // Side length scales with card width
  const sideLen = Math.max(55, Math.min(72, Math.round(SVG_W * 0.22)));
  const sideUnits = 6;
  const perimeter = 4 * sideUnits;

  // Half apex angle in degrees [18°..72°]
  const [halfAngleDeg, setHalfAngleDeg] = useState(38);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const rad = (halfAngleDeg * Math.PI) / 180;
  const rx = Math.round(sideLen * Math.sin(rad));
  const ry = Math.round(sideLen * Math.cos(rad));

  const apexAngle = halfAngleDeg * 2;
  const obtuseAngle = 180 - apexAngle;

  const topV = { x: CX, y: CY - ry };
  const rightV = { x: CX + rx, y: CY };
  const botV = { x: CX, y: CY + ry };
  const leftV = { x: CX - rx, y: CY };

  const pts = `${topV.x},${topV.y} ${rightV.x},${rightV.y} ${botV.x},${botV.y} ${leftV.x},${leftV.y}`;

  // Helper for polar coordinates and SVG arc paths
  const polar = (cx: number, cy: number, deg: number, len: number) => {
    const r = (deg * Math.PI) / 180;
    return { x: cx + len * Math.cos(r), y: cy - len * Math.sin(r) };
  };

  const makeArc = (cx: number, cy: number, fromDeg: number, toDeg: number, r: number) => {
    const s = polar(cx, cy, fromDeg, r);
    const e = polar(cx, cy, toDeg, r);
    const span = ((toDeg - fromDeg) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
  };

  const makeArcStroke = (cx: number, cy: number, fromDeg: number, toDeg: number, r: number) => {
    const s = polar(cx, cy, fromDeg, r);
    const e = polar(cx, cy, toDeg, r);
    const span = ((toDeg - fromDeg) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  const ARC_R = 15;

  // Arc angles for all 4 vertices:
  const topArcFrom = 270 - halfAngleDeg;
  const topArcTo = 270 + halfAngleDeg;
  const topArcD = makeArc(topV.x, topV.y, topArcFrom, topArcTo, ARC_R);
  const topArcStroke = makeArcStroke(topV.x, topV.y, topArcFrom, topArcTo, ARC_R);

  const botArcFrom = 90 - halfAngleDeg;
  const botArcTo = 90 + halfAngleDeg;
  const botArcD = makeArc(botV.x, botV.y, botArcFrom, botArcTo, ARC_R);
  const botArcStroke = makeArcStroke(botV.x, botV.y, botArcFrom, botArcTo, ARC_R);

  const rightHalf = (180 - apexAngle) / 2;
  const rightArcFrom = 180 - rightHalf;
  const rightArcTo = 180 + rightHalf;
  const rightArcD = makeArc(rightV.x, rightV.y, rightArcFrom, rightArcTo, ARC_R);
  const rightArcStroke = makeArcStroke(rightV.x, rightV.y, rightArcFrom, rightArcTo, ARC_R);

  const leftArcFrom = 360 - rightHalf;
  const leftArcTo = rightHalf;
  const leftArcD = makeArc(leftV.x, leftV.y, leftArcFrom, leftArcTo, ARC_R);
  const leftArcStroke = makeArcStroke(leftV.x, leftV.y, leftArcFrom, leftArcTo, ARC_R);

  // Midpoints for 4 side tick marks
  const midTopLeft = { x: (leftV.x + topV.x) / 2, y: (leftV.y + topV.y) / 2 };
  const midTopRight = { x: (topV.x + rightV.x) / 2, y: (topV.y + rightV.y) / 2 };
  const midBotRight = { x: (rightV.x + botV.x) / 2, y: (rightV.y + botV.y) / 2 };
  const midBotLeft = { x: (botV.x + leftV.x) / 2, y: (botV.y + leftV.y) / 2 };

  const topRAngDeg = (Math.atan2(ry, rx) * 180) / Math.PI;

  const handlePointerDown = useCallback((which: "top" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scX = SVG_W / rect.width;
    const scY = SVG_H / rect.height;

    const onMove = (ev: PointerEvent) => {
      const px = (ev.clientX - rect.left) * scX;
      const py = (ev.clientY - rect.top) * scY;

      if (which === "top") {
        const curRy = Math.max(15, Math.min(sideLen - 8, CY - py));
        const computedDeg = Math.round(Math.acos(Math.min(1, Math.max(0.1, curRy / sideLen))) * (180 / Math.PI));
        setHalfAngleDeg(Math.max(18, Math.min(72, computedDeg)));
      } else {
        const curRx = Math.max(15, Math.min(sideLen - 8, px - CX));
        const computedDeg = Math.round(Math.asin(Math.min(1, Math.max(0.1, curRx / sideLen))) * (180 / Math.PI));
        setHalfAngleDeg(Math.max(18, Math.min(72, computedDeg)));
      }
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [CX, CY, SVG_H, SVG_W, sideLen]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full pb-3" onClick={stop} onPointerDown={stop}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full touch-none select-none overflow-visible"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Rhombus Interior */}
        <polygon points={pts} fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} strokeLinejoin="round" />

        {/* Diagonals (Only on Properties mode) */}
        {!isPerimeter && (
          <>
            <line x1={topV.x} y1={topV.y} x2={botV.x} y2={botV.y} stroke={COLOR_DIAG} strokeWidth={1.5} strokeDasharray="4 3" />
            <line x1={leftV.x} y1={leftV.y} x2={rightV.x} y2={rightV.y} stroke={COLOR_DIAG} strokeWidth={1.5} strokeDasharray="4 3" />
            <RightAngleMarker x={CX} y={CY} size={7} orientation="top-right" strokeWidth={1.5} color="rgba(255, 255, 255, 0.75)" />

            {/* 4 Equal-Side Tick Marks on Properties mode */}
            <g stroke={COLOR_SIDE} strokeWidth={2.2} strokeLinecap="round">
              <line
                x1={midTopLeft.x - 4 * Math.cos(((topRAngDeg + 90) * Math.PI) / 180)}
                y1={midTopLeft.y - 4 * Math.sin(((topRAngDeg + 90) * Math.PI) / 180)}
                x2={midTopLeft.x + 4 * Math.cos(((topRAngDeg + 90) * Math.PI) / 180)}
                y2={midTopLeft.y + 4 * Math.sin(((topRAngDeg + 90) * Math.PI) / 180)}
              />
              <line
                x1={midTopRight.x - 4 * Math.cos(((-topRAngDeg + 90) * Math.PI) / 180)}
                y1={midTopRight.y - 4 * Math.sin(((-topRAngDeg + 90) * Math.PI) / 180)}
                x2={midTopRight.x + 4 * Math.cos(((-topRAngDeg + 90) * Math.PI) / 180)}
                y2={midTopRight.y + 4 * Math.sin(((-topRAngDeg + 90) * Math.PI) / 180)}
              />
              <line
                x1={midBotRight.x - 4 * Math.cos(((topRAngDeg + 90) * Math.PI) / 180)}
                y1={midBotRight.y - 4 * Math.sin(((topRAngDeg + 90) * Math.PI) / 180)}
                x2={midBotRight.x + 4 * Math.cos(((topRAngDeg + 90) * Math.PI) / 180)}
                y2={midBotRight.y + 4 * Math.sin(((topRAngDeg + 90) * Math.PI) / 180)}
              />
              <line
                x1={midBotLeft.x - 4 * Math.cos(((-topRAngDeg + 90) * Math.PI) / 180)}
                y1={midBotLeft.y - 4 * Math.sin(((-topRAngDeg + 90) * Math.PI) / 180)}
                x2={midBotLeft.x + 4 * Math.cos(((-topRAngDeg + 90) * Math.PI) / 180)}
                y2={midBotLeft.y + 4 * Math.sin(((-topRAngDeg + 90) * Math.PI) / 180)}
              />
            </g>
          </>
        )}

        {/* Perimeter Labels on all 4 sides */}
        {isPerimeter && (() => {
          const normAng = ((90 - topRAngDeg) * Math.PI) / 180;
          const offX = 14 * Math.sin((topRAngDeg * Math.PI) / 180);
          const offY = 14 * Math.cos((topRAngDeg * Math.PI) / 180);
          return (
            <g
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13.5}
              fontWeight="800"
              fill={COLOR_SIDE}
              fontFamily="var(--font-heading, system-ui)"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))" }}
            >
              <text x={midTopRight.x + offX} y={midTopRight.y - offY}>{sideUnits}</text>
              <text x={midTopLeft.x - offX} y={midTopLeft.y - offY}>{sideUnits}</text>
              <text x={midBotRight.x + offX} y={midBotRight.y + offY}>{sideUnits}</text>
              <text x={midBotLeft.x - offX} y={midBotLeft.y + offY}>{sideUnits}</text>
            </g>
          );
        })()}

        {/* Angle Arcs on Properties mode */}
        {!isPerimeter && (
          <>
            <path d={topArcD} fill="rgba(94, 232, 255, 0.22)" />
            <path d={topArcStroke} fill="none" stroke={COLOR_CYAN} strokeWidth={2} />
            <path d={botArcD} fill="rgba(94, 232, 255, 0.22)" />
            <path d={botArcStroke} fill="none" stroke={COLOR_CYAN} strokeWidth={2} />
            <path d={rightArcD} fill="rgba(216, 180, 254, 0.22)" />
            <path d={rightArcStroke} fill="none" stroke={COLOR_LILAC} strokeWidth={2} />
            <path d={leftArcD} fill="rgba(216, 180, 254, 0.22)" />
            <path d={leftArcStroke} fill="none" stroke={COLOR_LILAC} strokeWidth={2} />
          </>
        )}

        {/* Vertex Dots */}
        {[rightV, botV, leftV].map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={3.5} fill="#ffffff" />
        ))}

        {/* Drag Handle on Top Vertex */}
        <g
          transform={`translate(${topV.x}, ${topV.y})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown("top")}
        >
          <circle r={26} fill="transparent" />
          <circle r={9} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
          <circle r={4.5} fill="#ffffff" />
        </g>
      </svg>

      {/* Live Typographic Equation Banner on Perimeter Mode */}
      {isPerimeter && (
        <div className="flex justify-center mt-1">
          <div className="flex items-center gap-1.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-sm sm:text-base font-bold font-headline select-none">
            <span className="text-white">P</span>
            <span className="text-white/50">=</span>
            <span className="text-white">4 · </span>
            <span style={{ color: COLOR_SIDE }}>{sideUnits}</span>
            <span className="text-white/50">=</span>
            <span style={{ color: COLOR_AREA }} className="font-bold">{perimeter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
