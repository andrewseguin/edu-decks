"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEulerProps = {
  color?: string;
};

type ShapeKey = "cube" | "tetra" | "octa" | "pyramid" | "prism5";
type HighlightElement = "all" | "V" | "E" | "F";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface PolyhedronData {
  key: ShapeKey;
  name: string;
  V: number;
  E: number;
  F: number;
  scale: number;
  vertices: Vec3[];
  edges: [number, number][];
  faces: number[][]; // vertex indices in CCW order
}

const COLOR_CYAN = "#5ee8ff"; // Single uniform highlight color

const SVG_H = 205;

// ─────────────────────────────────────────────────────────────────────────────
// 3D Polyhedra Definitions
// ─────────────────────────────────────────────────────────────────────────────

// 1. CUBE (V=8, E=12, F=6)
const S_CUBE = 42;
const CUBE_VERTICES: Vec3[] = [
  { x: -S_CUBE, y: -S_CUBE, z: -S_CUBE }, // 0: bot back-left
  { x:  S_CUBE, y: -S_CUBE, z: -S_CUBE }, // 1: bot back-right
  { x:  S_CUBE, y: -S_CUBE, z:  S_CUBE }, // 2: bot front-right
  { x: -S_CUBE, y: -S_CUBE, z:  S_CUBE }, // 3: bot front-left
  { x: -S_CUBE, y:  S_CUBE, z: -S_CUBE }, // 4: top back-left
  { x:  S_CUBE, y:  S_CUBE, z: -S_CUBE }, // 5: top back-right
  { x:  S_CUBE, y:  S_CUBE, z:  S_CUBE }, // 6: top front-right
  { x: -S_CUBE, y:  S_CUBE, z:  S_CUBE }, // 7: top front-left
];
const CUBE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // Continuous Bottom Loop (4)
  [0, 4], [4, 5], [5, 1],         // Climb 0->4, Across 4->5, Down 5->1 (Back Wall closed)
  [5, 6], [6, 2],                 // Across 5->6, Down 6->2 (Right Wall closed)
  [6, 7], [7, 3], [7, 4],         // Across 6->7, Down 7->3, Across 7->4 (Front, Left, Top closed)
];
const CUBE_FACES: number[][] = [
  [0, 1, 2, 3], // Bottom (y = -S)
  [4, 7, 6, 5], // Top (y = +S)
  [0, 4, 5, 1], // Back (z = -S)
  [3, 2, 6, 7], // Front (z = +S)
  [0, 3, 7, 4], // Left (x = -S)
  [1, 5, 6, 2], // Right (x = +S)
];
// 2. TETRAHEDRON (V=4, E=6, F=4)
const S_TETRA = 56;
const TETRA_VERTICES: Vec3[] = [
  { x:  S_TETRA * 0.9, y:  S_TETRA * 0.9, z:  S_TETRA * 0.9 },
  { x:  S_TETRA * 0.9, y: -S_TETRA * 0.9, z: -S_TETRA * 0.9 },
  { x: -S_TETRA * 0.9, y:  S_TETRA * 0.9, z: -S_TETRA * 0.9 },
  { x: -S_TETRA * 0.9, y: -S_TETRA * 0.9, z:  S_TETRA * 0.9 },
];
const TETRA_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 0], // Base Loop (3)
  [0, 3], [1, 3], [2, 3], // Apex struts (3)
];
const TETRA_FACES: number[][] = [
  [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]
];

// 3. OCTAHEDRON (V=6, E=12, F=8)
const S_OCTA = 58;
const OCTA_VERTICES: Vec3[] = [
  { x: 0, y:  S_OCTA, z: 0 },  // 0: top apex
  { x: 0, y: -S_OCTA, z: 0 },  // 1: bot apex
  { x:  S_OCTA, y: 0, z: 0 },  // 2: right
  { x: 0, y: 0, z:  S_OCTA },  // 3: front
  { x: -S_OCTA, y: 0, z: 0 },  // 4: left
  { x: 0, y: 0, z: -S_OCTA },  // 5: back
];
const OCTA_EDGES: [number, number][] = [
  // Equatorial ring
  [2, 3], [3, 4], [4, 5], [5, 2],
  // Top cone
  [0, 2], [0, 3], [0, 4], [0, 5],
  // Bottom cone
  [1, 2], [1, 3], [1, 4], [1, 5],
];
const OCTA_FACES: number[][] = [
  [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
  [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5],
];

// 4. SQUARE PYRAMID (V=5, E=8, F=5)
const S_PYR_W = 46;
const S_PYR_H = 48;
const PYRAMID_VERTICES: Vec3[] = [
  { x: -S_PYR_W, y: -S_PYR_H * 0.4, z: -S_PYR_W }, // 0
  { x:  S_PYR_W, y: -S_PYR_H * 0.4, z: -S_PYR_W }, // 1
  { x:  S_PYR_W, y: -S_PYR_H * 0.4, z:  S_PYR_W }, // 2
  { x: -S_PYR_W, y: -S_PYR_H * 0.4, z:  S_PYR_W }, // 3
  { x: 0, y: S_PYR_H * 0.8, z: 0 },               // 4: Apex
];
const PYRAMID_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // Base square (4)
  [4, 0], [4, 1], [4, 2], [4, 3], // Slants (4)
];
const PYRAMID_FACES: number[][] = [
  [0, 1, 2, 3], // Base
  [4, 0, 1],    // Back
  [4, 1, 2],    // Right
  [4, 2, 3],    // Front
  [4, 3, 0],    // Left
];

// 5. PENTAGONAL PRISM (V=10, E=15, F=7)
const R_PRISM5 = 44;
const H_PRISM5 = 38;
const PRISM5_VERTICES: Vec3[] = (() => {
  const verts: Vec3[] = [];
  // Bottom pentagon (0..4)
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    verts.push({
      x: R_PRISM5 * Math.cos(angle),
      y: -H_PRISM5,
      z: R_PRISM5 * Math.sin(angle),
    });
  }
  // Top pentagon (5..9)
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    verts.push({
      x: R_PRISM5 * Math.cos(angle),
      y: H_PRISM5,
      z: R_PRISM5 * Math.sin(angle),
    });
  }
  return verts;
})();

const PRISM5_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], // Bottom loop (5)
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 5], // Top loop (5)
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], // Vertical struts (5)
];

const PRISM5_FACES: number[][] = [
  [0, 1, 2, 3, 4], // Bottom
  [9, 8, 7, 6, 5], // Top
  [0, 1, 6, 5],    // Side 1
  [1, 2, 7, 6],    // Side 2
  [2, 3, 8, 7],    // Side 3
  [3, 4, 9, 8],    // Side 4
  [4, 0, 5, 9],    // Side 5
];

const POLYHEDRA_MAP: Record<ShapeKey, PolyhedronData> = {
  cube: {
    key: "cube",
    name: "Cube",
    V: 8,
    E: 12,
    F: 6,
    scale: 1.05,
    vertices: CUBE_VERTICES,
    edges: CUBE_EDGES,
    faces: CUBE_FACES,
  },
  tetra: {
    key: "tetra",
    name: "Tetrahedron",
    V: 4,
    E: 6,
    F: 4,
    scale: 1.0,
    vertices: TETRA_VERTICES,
    edges: TETRA_EDGES,
    faces: TETRA_FACES,
  },
  octa: {
    key: "octa",
    name: "Octahedron",
    V: 6,
    E: 12,
    F: 8,
    scale: 1.0,
    vertices: OCTA_VERTICES,
    edges: OCTA_EDGES,
    faces: OCTA_FACES,
  },
  pyramid: {
    key: "pyramid",
    name: "Pyramid",
    V: 5,
    E: 8,
    F: 5,
    scale: 1.0,
    vertices: PYRAMID_VERTICES,
    edges: PYRAMID_EDGES,
    faces: PYRAMID_FACES,
  },
  prism5: {
    key: "prism5",
    name: "Pentagonal Prism",
    V: 10,
    E: 15,
    F: 7,
    scale: 0.95,
    vertices: PRISM5_VERTICES,
    edges: PRISM5_EDGES,
    faces: PRISM5_FACES,
  },
};

export function InteractiveEulerExplorer({ color }: InteractiveEulerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 95;

  const [shapeKey, setShapeKey] = useState<ShapeKey>("cube");
  const [highlight, setHighlight] = useState<HighlightElement>("all");
  const [explodeProgress, setExplodeProgress] = useState(0); // 0..1

  // 2-Axis Orbit Camera: Yaw (around Y axis) & Pitch (elevation angle)
  const [yawDeg, setYawDeg] = useState(36);
  const [pitchDeg, setPitchDeg] = useState(24);

  const isDraggingRef = useRef(false);
  const lastDragPosRef = useRef({ x: 0, y: 0 });

  const poly = POLYHEDRA_MAP[shapeKey];

  const handleShapeSelect = (key: ShapeKey) => {
    setShapeKey(key);
  };

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // ──────────────────────────────────────────────────────────────────────────
  // 2-Axis Pointer Drag Controls (Yaw & Pitch)
  // ──────────────────────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = true;
    lastDragPosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastDragPosRef.current.x;
    const dy = e.clientY - lastDragPosRef.current.y;
    lastDragPosRef.current = { x: e.clientX, y: e.clientY };

    // Horizontal drag -> Yaw (0..360)
    setYawDeg((prev) => (prev + dx * 0.75 + 360) % 360);
    // Vertical drag -> Pitch (-80..+80)
    setPitchDeg((prev) => Math.max(-80, Math.min(80, prev - dy * 0.65)));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Math & Projection
  // ──────────────────────────────────────────────────────────────────────────
  const yawRad = (yawDeg * Math.PI) / 180;
  const pitchRad = (pitchDeg * Math.PI) / 180;

  const projectVec = useCallback(
    (v: Vec3, offset: Vec3 = { x: 0, y: 0, z: 0 }) => {
      const vx = (v.x + offset.x) * poly.scale;
      const vy = (v.y + offset.y) * poly.scale;
      const vz = (v.z + offset.z) * poly.scale;

      // 1. Yaw rotation (around Y axis)
      const x1 = vx * Math.cos(yawRad) + vz * Math.sin(yawRad);
      const z1 = -vx * Math.sin(yawRad) + vz * Math.cos(yawRad);

      // 2. Pitch rotation (around X axis)
      const y2 = vy * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
      const z2 = vy * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

      return {
        x: CX + x1,
        y: CY - y2,
        z: z2, // Depth for z-sorting
      };
    },
    [CX, CY, yawRad, pitchRad, poly.scale]
  );

  // Compute Face Center Normal for Explode offsets
  const faceCenters = useMemo(() => {
    return poly.faces.map((fVerts) => {
      let cx = 0, cy = 0, cz = 0;
      fVerts.forEach((idx) => {
        cx += poly.vertices[idx].x;
        cy += poly.vertices[idx].y;
        cz += poly.vertices[idx].z;
      });
      const len = fVerts.length;
      const center = { x: cx / len, y: cy / len, z: cz / len };
      const mag = Math.hypot(center.x, center.y, center.z) || 1;
      return {
        unit: { x: center.x / mag, y: center.y / mag, z: center.z / mag },
      };
    });
  }, [poly]);

  // Render Projected Faces with Depth Sorting
  const renderedFaces = useMemo(() => {
    const explodeDist = explodeProgress * 32;

    return poly.faces
      .map((fVerts, fIdx) => {
        const norm = faceCenters[fIdx].unit;
        const offset = {
          x: norm.x * explodeDist,
          y: norm.y * explodeDist,
          z: norm.z * explodeDist,
        };
        const projVerts = fVerts.map((vIdx) => projectVec(poly.vertices[vIdx], offset));
        const avgZ = projVerts.reduce((acc, p) => acc + p.z, 0) / projVerts.length;
        const pointsStr = projVerts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

        return {
          fIdx,
          avgZ,
          pointsStr,
        };
      })
      .sort((a, b) => a.avgZ - b.avgZ); // Sort back to front
  }, [poly, explodeProgress, faceCenters, projectVec]);

  // Render Projected Edges (Solid struts)
  const renderedEdges = useMemo(() => {
    const explodeDist = explodeProgress * 32;

    return poly.edges.map(([i1, i2], eIdx) => {
      const v1 = poly.vertices[i1];
      const v2 = poly.vertices[i2];
      const mid = {
        x: (v1.x + v2.x) / 2,
        y: (v1.y + v2.y) / 2,
        z: (v1.z + v2.z) / 2,
      };
      const mag = Math.hypot(mid.x, mid.y, mid.z) || 1;
      const offset = {
        x: (mid.x / mag) * explodeDist,
        y: (mid.y / mag) * explodeDist,
        z: (mid.z / mag) * explodeDist,
      };

      const p1 = projectVec(v1, offset);
      const p2 = projectVec(v2, offset);
      const avgZ = (p1.z + p2.z) / 2;

      return {
        eIdx,
        p1,
        p2,
        avgZ,
      };
    });
  }, [poly, explodeProgress, projectVec]);

  // Render Projected Vertices
  const renderedVertices = useMemo(() => {
    const explodeDist = explodeProgress * 32;

    return poly.vertices.map((v, vIdx) => {
      const mag = Math.hypot(v.x, v.y, v.z) || 1;
      const offset = {
        x: (v.x / mag) * explodeDist,
        y: (v.y / mag) * explodeDist,
        z: (v.z / mag) * explodeDist,
      };
      const p = projectVec(v, offset);
      return {
        vIdx,
        p,
      };
    });
  }, [poly, explodeProgress, projectVec]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full pt-0.5 pb-1 select-none" onClick={stop} onPointerDown={stop}>
      
      {/* ── Subtitle / Invariant Status Indicator ── */}
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold font-headline select-none">
        <div className="flex items-center gap-2 text-white/90">
          <span style={{ color: highlight === "V" ? COLOR_CYAN : highlight === "all" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.45)" }}>
            {poly.V} Vertices
          </span>
          <span className="text-white/40">•</span>
          <span style={{ color: highlight === "E" ? COLOR_CYAN : highlight === "all" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.45)" }}>
            {poly.E} Edges
          </span>
          <span className="text-white/40">•</span>
          <span style={{ color: highlight === "F" ? COLOR_CYAN : highlight === "all" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.45)" }}>
            {poly.F} Faces
          </span>
        </div>
      </div>

      {/* ── 2-Axis Interactive 3D Canvas ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full touch-none select-none overflow-visible max-h-[205px] cursor-grab active:cursor-grabbing"
      >
        {/* Render Shaded Faces */}
        {renderedFaces.map(({ fIdx, pointsStr, avgZ }) => {
          const isFaceHighlighted = highlight === "F";
          const isAll = highlight === "all";
          const fill = isFaceHighlighted
            ? `rgba(94, 232, 255, ${avgZ > 0 ? 0.55 : 0.38})`
            : isAll
            ? `rgba(94, 232, 255, ${avgZ > 0 ? 0.32 : 0.18})`
            : `rgba(255, 255, 255, ${avgZ > 0 ? 0.08 : 0.04})`;

          return (
            <polygon
              key={`face-${fIdx}`}
              points={pointsStr}
              fill={fill}
              stroke={isFaceHighlighted ? COLOR_CYAN : isAll ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth={isFaceHighlighted ? 2.2 : 1.0}
              className="pointer-events-none"
            />
          );
        })}

        {/* Render Edges (Solid wireframe struts) */}
        {renderedEdges.map(({ eIdx, p1, p2 }) => {
          const isEdgeHighlighted = highlight === "E";
          const isAll = highlight === "all";

          return (
            <line
              key={`edge-${eIdx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={
                isEdgeHighlighted
                  ? COLOR_CYAN
                  : isAll
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.3)"
              }
              strokeWidth={isEdgeHighlighted ? 2.8 : isAll ? 1.8 : 1.2}
              strokeLinecap="round"
              className="pointer-events-none"
            />
          );
        })}

        {/* Render Vertices (Anchor Nodes) */}
        {renderedVertices.map(({ vIdx, p }) => {
          const isVertHighlighted = highlight === "V";
          const isAll = highlight === "all";

          return (
            <circle
              key={`vert-${vIdx}`}
              cx={p.x}
              cy={p.y}
              r={isVertHighlighted ? 4.8 : isAll ? 3.5 : 2.8}
              fill={
                isVertHighlighted
                  ? COLOR_CYAN
                  : isAll
                  ? "#ffffff"
                  : "rgba(255, 255, 255, 0.35)"
              }
              stroke={isVertHighlighted ? "#ffffff" : isAll ? "rgba(0, 0, 0, 0.4)" : "transparent"}
              strokeWidth={isVertHighlighted ? 1.5 : 1.0}
              className="pointer-events-none"
            />
          );
        })}
      </svg>

      {/* ── Mode Toolbar & Shape Selector ── */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm px-2 select-none z-30 pointer-events-auto">
        
        {/* Shape Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          {Object.values(POLYHEDRA_MAP).map((p) => (
            <button
              key={p.key}
              onClick={() => handleShapeSelect(p.key)}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                shapeKey === p.key ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Combined Controls Capsule: Spotlight (All | V | E | F) + Explode Slider */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 shadow-sm">
          
          {/* Element Highlights: All | V | E | F */}
          <div className="flex items-center gap-1">
            {(["all", "V", "E", "F"] as HighlightElement[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setHighlight(mode)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                  highlight === mode
                    ? mode === "all"
                      ? "bg-white/30 text-white shadow-sm"
                      : "bg-[#5ee8ff] text-black shadow-sm"
                    : "bg-transparent text-white/70 hover:text-white"
                )}
              >
                {mode === "all" ? "All" : mode}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-px bg-white/25 mx-0.5" />

          {/* Explode Slider */}
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="text-xs font-headline font-bold text-white/80 select-none">
              Explode
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodeProgress}
              onChange={(e) => setExplodeProgress(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-white h-1.5 rounded-full cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* ── Live Euler Typographic Equation Banner ── */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <button
            onClick={() => setHighlight(highlight === "V" ? "all" : "V")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: highlight === "V" ? COLOR_CYAN : "rgba(255, 255, 255, 0.9)" }}
          >
            V ({poly.V})
          </button>
          <span className="text-white/50">−</span>
          <button
            onClick={() => setHighlight(highlight === "E" ? "all" : "E")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: highlight === "E" ? COLOR_CYAN : "rgba(255, 255, 255, 0.9)" }}
          >
            E ({poly.E})
          </button>
          <span className="text-white/50">+</span>
          <button
            onClick={() => setHighlight(highlight === "F" ? "all" : "F")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: highlight === "F" ? COLOR_CYAN : "rgba(255, 255, 255, 0.9)" }}
          >
            F ({poly.F})
          </button>
          <span className="text-white/50">=</span>
          <span className="text-white font-extrabold text-base">2</span>
        </div>
      </div>

    </div>
  );
}
