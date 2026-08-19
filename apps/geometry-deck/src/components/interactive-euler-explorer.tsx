"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEulerProps = {
  color?: string;
};

type ShapeKey = "cube" | "tetra" | "octa" | "pyramid" | "prism5";
type ViewMode = "inspect" | "explode" | "build";
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
  // Step-by-step construction sequence for the "Build" mode
  buildSteps: {
    edge: [number, number];
    isNewVertex: boolean; // if true, introduces a new vertex
    newFaceName?: string; // if present, closes a new face
    stepV: number;
    stepE: number;
    stepF: number;
  }[];
}

const COLOR_CYAN = "#5ee8ff"; // Faces
const COLOR_GOLD = "#ffd45e"; // Edges
const COLOR_VERTEX = "#ffffff"; // Vertices

const SVG_H = 205;

// ─────────────────────────────────────────────────────────────────────────────
// 3D Polyhedra Definitions
// ─────────────────────────────────────────────────────────────────────────────

// 1. CUBE (V=8, E=12, F=6)
const S_CUBE = 42;
const CUBE_VERTICES: Vec3[] = [
  { x: -S_CUBE, y: -S_CUBE, z: -S_CUBE }, // 0
  { x:  S_CUBE, y: -S_CUBE, z: -S_CUBE }, // 1
  { x:  S_CUBE, y: -S_CUBE, z:  S_CUBE }, // 2
  { x: -S_CUBE, y: -S_CUBE, z:  S_CUBE }, // 3
  { x: -S_CUBE, y:  S_CUBE, z: -S_CUBE }, // 4
  { x:  S_CUBE, y:  S_CUBE, z: -S_CUBE }, // 5
  { x:  S_CUBE, y:  S_CUBE, z:  S_CUBE }, // 6
  { x: -S_CUBE, y:  S_CUBE, z:  S_CUBE }, // 7
];
const CUBE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // bottom loop (4)
  [4, 5], [5, 6], [6, 7], [7, 4], // top loop (4)
  [0, 4], [1, 5], [2, 6], [3, 7], // verticals (4)
];
const CUBE_FACES: number[][] = [
  [0, 1, 2, 3], // Bottom (y = -S)
  [4, 7, 6, 5], // Top (y = +S)
  [0, 4, 5, 1], // Back (z = -S)
  [3, 2, 6, 7], // Front (z = +S)
  [0, 3, 7, 4], // Left (x = -S)
  [1, 5, 6, 2], // Right (x = +S)
];
const CUBE_BUILD_STEPS = [
  { edge: [0, 1] as [number, number], isNewVertex: true, stepV: 2, stepE: 1, stepF: 1 },
  { edge: [1, 2] as [number, number], isNewVertex: true, stepV: 3, stepE: 2, stepF: 1 },
  { edge: [2, 3] as [number, number], isNewVertex: true, stepV: 4, stepE: 3, stepF: 1 },
  { edge: [3, 0] as [number, number], isNewVertex: false, newFaceName: "Bottom Face", stepV: 4, stepE: 4, stepF: 2 },
  { edge: [0, 4] as [number, number], isNewVertex: true, stepV: 5, stepE: 5, stepF: 2 },
  { edge: [1, 5] as [number, number], isNewVertex: true, stepV: 6, stepE: 6, stepF: 2 },
  { edge: [4, 5] as [number, number], isNewVertex: false, newFaceName: "Back Face", stepV: 6, stepE: 7, stepF: 3 },
  { edge: [2, 6] as [number, number], isNewVertex: true, stepV: 7, stepE: 8, stepF: 3 },
  { edge: [5, 6] as [number, number], isNewVertex: false, newFaceName: "Right Face", stepV: 7, stepE: 9, stepF: 4 },
  { edge: [3, 7] as [number, number], isNewVertex: true, stepV: 8, stepE: 10, stepF: 4 },
  { edge: [6, 7] as [number, number], isNewVertex: false, newFaceName: "Front Face", stepV: 8, stepE: 11, stepF: 5 },
  { edge: [7, 4] as [number, number], isNewVertex: false, newFaceName: "Top Face", stepV: 8, stepE: 12, stepF: 6 },
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
  [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]
];
const TETRA_FACES: number[][] = [
  [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]
];
const TETRA_BUILD_STEPS = [
  { edge: [0, 1] as [number, number], isNewVertex: true, stepV: 2, stepE: 1, stepF: 1 },
  { edge: [1, 2] as [number, number], isNewVertex: true, stepV: 3, stepE: 2, stepF: 1 },
  { edge: [2, 0] as [number, number], isNewVertex: false, newFaceName: "Face 1", stepV: 3, stepE: 3, stepF: 2 },
  { edge: [0, 3] as [number, number], isNewVertex: true, stepV: 4, stepE: 4, stepF: 2 },
  { edge: [2, 3] as [number, number], isNewVertex: false, newFaceName: "Face 2", stepV: 4, stepE: 5, stepF: 3 },
  { edge: [3, 1] as [number, number], isNewVertex: false, newFaceName: "Final Closure", stepV: 4, stepE: 6, stepF: 4 },
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
const OCTA_BUILD_STEPS = [
  { edge: [2, 3] as [number, number], isNewVertex: true, stepV: 2, stepE: 1, stepF: 1 },
  { edge: [3, 4] as [number, number], isNewVertex: true, stepV: 3, stepE: 2, stepF: 1 },
  { edge: [4, 5] as [number, number], isNewVertex: true, stepV: 4, stepE: 3, stepF: 1 },
  { edge: [5, 2] as [number, number], isNewVertex: false, newFaceName: "Equator Cycle", stepV: 4, stepE: 4, stepF: 2 },
  { edge: [0, 2] as [number, number], isNewVertex: true, stepV: 5, stepE: 5, stepF: 2 },
  { edge: [0, 3] as [number, number], isNewVertex: false, newFaceName: "Top Face 1", stepV: 5, stepE: 6, stepF: 3 },
  { edge: [0, 4] as [number, number], isNewVertex: false, newFaceName: "Top Face 2", stepV: 5, stepE: 7, stepF: 4 },
  { edge: [0, 5] as [number, number], isNewVertex: false, newFaceName: "Top Face 3", stepV: 5, stepE: 8, stepF: 5 },
  { edge: [1, 2] as [number, number], isNewVertex: true, stepV: 6, stepE: 9, stepF: 5 },
  { edge: [1, 3] as [number, number], isNewVertex: false, newFaceName: "Bot Face 1", stepV: 6, stepE: 10, stepF: 6 },
  { edge: [1, 4] as [number, number], isNewVertex: false, newFaceName: "Bot Face 2", stepV: 6, stepE: 11, stepF: 7 },
  { edge: [1, 5] as [number, number], isNewVertex: false, newFaceName: "Final 3D Octahedron", stepV: 6, stepE: 12, stepF: 8 },
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
  [0, 1], [1, 2], [2, 3], [3, 0], // Base (4)
  [4, 0], [4, 1], [4, 2], [4, 3], // Slants (4)
];
const PYRAMID_FACES: number[][] = [
  [0, 1, 2, 3], // Base
  [4, 0, 1],    // Back
  [4, 1, 2],    // Right
  [4, 2, 3],    // Front
  [4, 3, 0],    // Left
];
const PYRAMID_BUILD_STEPS = [
  { edge: [0, 1] as [number, number], isNewVertex: true, stepV: 2, stepE: 1, stepF: 1 },
  { edge: [1, 2] as [number, number], isNewVertex: true, stepV: 3, stepE: 2, stepF: 1 },
  { edge: [2, 3] as [number, number], isNewVertex: true, stepV: 4, stepE: 3, stepF: 1 },
  { edge: [3, 0] as [number, number], isNewVertex: false, newFaceName: "Base Face", stepV: 4, stepE: 4, stepF: 2 },
  { edge: [4, 0] as [number, number], isNewVertex: true, stepV: 5, stepE: 5, stepF: 2 },
  { edge: [4, 1] as [number, number], isNewVertex: false, newFaceName: "Slant Face 1", stepV: 5, stepE: 6, stepF: 3 },
  { edge: [4, 2] as [number, number], isNewVertex: false, newFaceName: "Slant Face 2", stepV: 5, stepE: 7, stepF: 4 },
  { edge: [4, 3] as [number, number], isNewVertex: false, newFaceName: "Final Pyramid", stepV: 5, stepE: 8, stepF: 5 },
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
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], // Verticals (5)
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

const PRISM5_BUILD_STEPS = [
  { edge: [0, 1] as [number, number], isNewVertex: true, stepV: 2, stepE: 1, stepF: 1 },
  { edge: [1, 2] as [number, number], isNewVertex: true, stepV: 3, stepE: 2, stepF: 1 },
  { edge: [2, 3] as [number, number], isNewVertex: true, stepV: 4, stepE: 3, stepF: 1 },
  { edge: [3, 4] as [number, number], isNewVertex: true, stepV: 5, stepE: 4, stepF: 1 },
  { edge: [4, 0] as [number, number], isNewVertex: false, newFaceName: "Bottom Pentagon", stepV: 5, stepE: 5, stepF: 2 },
  { edge: [0, 5] as [number, number], isNewVertex: true, stepV: 6, stepE: 6, stepF: 2 },
  { edge: [1, 6] as [number, number], isNewVertex: true, stepV: 7, stepE: 7, stepF: 2 },
  { edge: [5, 6] as [number, number], isNewVertex: false, newFaceName: "Side Face 1", stepV: 7, stepE: 8, stepF: 3 },
  { edge: [2, 7] as [number, number], isNewVertex: true, stepV: 8, stepE: 9, stepF: 3 },
  { edge: [6, 7] as [number, number], isNewVertex: false, newFaceName: "Side Face 2", stepV: 8, stepE: 10, stepF: 4 },
  { edge: [3, 8] as [number, number], isNewVertex: true, stepV: 9, stepE: 11, stepF: 4 },
  { edge: [7, 8] as [number, number], isNewVertex: false, newFaceName: "Side Face 3", stepV: 9, stepE: 12, stepF: 5 },
  { edge: [4, 9] as [number, number], isNewVertex: true, stepV: 10, stepE: 13, stepF: 5 },
  { edge: [8, 9] as [number, number], isNewVertex: false, newFaceName: "Side Face 4", stepV: 10, stepE: 14, stepF: 6 },
  { edge: [9, 5] as [number, number], isNewVertex: false, newFaceName: "Top Pentagon Closure", stepV: 10, stepE: 15, stepF: 7 },
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
    buildSteps: CUBE_BUILD_STEPS,
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
    buildSteps: TETRA_BUILD_STEPS,
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
    buildSteps: OCTA_BUILD_STEPS,
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
    buildSteps: PYRAMID_BUILD_STEPS,
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
    buildSteps: PRISM5_BUILD_STEPS,
  },
};

export function InteractiveEulerExplorer({ color }: InteractiveEulerProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 95;

  const [shapeKey, setShapeKey] = useState<ShapeKey>("cube");
  const [viewMode, setViewMode] = useState<ViewMode>("inspect");
  const [highlight, setHighlight] = useState<HighlightElement>("all");
  const [explodeProgress, setExplodeProgress] = useState(0); // 0..1
  const [buildStepIndex, setBuildStepIndex] = useState(12); // step 0..E
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // 2-Axis Orbit Camera: Yaw (around Y axis) & Pitch (elevation angle)
  const [yawDeg, setYawDeg] = useState(36);
  const [pitchDeg, setPitchDeg] = useState(24);

  const isDraggingRef = useRef(false);
  const lastDragPosRef = useRef({ x: 0, y: 0 });
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const poly = POLYHEDRA_MAP[shapeKey];

  // Sync default build step when shape changes
  const handleShapeSelect = (key: ShapeKey) => {
    setShapeKey(key);
    setBuildStepIndex(POLYHEDRA_MAP[key].edges.length);
    setIsAutoPlaying(false);
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
  // Build Animation Auto-Play Loop
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAutoPlaying && viewMode === "build") {
      playTimerRef.current = setInterval(() => {
        setBuildStepIndex((prev) => {
          if (prev >= poly.edges.length) {
            return 0;
          }
          return prev + 1;
        });
      }, 750);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isAutoPlaying, viewMode, poly.edges.length]);

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

  // ──────────────────────────────────────────────────────────────────────────
  // Active Counts & Tallies
  // ──────────────────────────────────────────────────────────────────────────
  const activeStep = viewMode === "build" ? poly.buildSteps[Math.max(0, Math.min(buildStepIndex - 1, poly.buildSteps.length - 1))] : null;
  const currentV = viewMode === "build" ? (buildStepIndex === 0 ? 1 : activeStep?.stepV ?? poly.V) : poly.V;
  const currentE = viewMode === "build" ? buildStepIndex : poly.E;
  const currentF = viewMode === "build" ? (buildStepIndex === 0 ? 1 : activeStep?.stepF ?? poly.F) : poly.F;

  // Helper: check if an edge [a, b] is built up to current buildStepIndex
  const isEdgeBuilt = useCallback(
    (a: number, b: number, builtCount: number) => {
      return poly.edges.slice(0, builtCount).some(
        ([e1, e2]) => (e1 === a && e2 === b) || (e1 === b && e2 === a)
      );
    },
    [poly.edges]
  );

  // Helper: check if all boundary edges of a face are built
  const isFaceBuilt = useCallback(
    (fVerts: number[], builtCount: number) => {
      const len = fVerts.length;
      for (let i = 0; i < len; i++) {
        const v1 = fVerts[i];
        const v2 = fVerts[(i + 1) % len];
        if (!isEdgeBuilt(v1, v2, builtCount)) {
          return false;
        }
      }
      return true;
    },
    [isEdgeBuilt]
  );

  // Render Projected Faces with Depth Sorting (dynamically shows completed faces in Build mode)
  const renderedFaces = useMemo(() => {
    const explodeDist = viewMode === "explode" ? explodeProgress * 42 : 0;
    const maxEdges = viewMode === "build" ? buildStepIndex : poly.edges.length;

    return poly.faces
      .map((fVerts, fIdx) => {
        const completed = viewMode === "build" ? isFaceBuilt(fVerts, maxEdges) : true;
        if (!completed) return null;

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
          completed,
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .sort((a, b) => a.avgZ - b.avgZ); // Sort back to front
  }, [poly, viewMode, buildStepIndex, explodeProgress, faceCenters, isFaceBuilt, projectVec]);

  // Render Projected Edges (Solid struts with clean highlighting)
  const renderedEdges = useMemo(() => {
    const maxEdges = viewMode === "build" ? buildStepIndex : poly.edges.length;
    const explodeDist = viewMode === "explode" ? explodeProgress * 22 : 0;

    return poly.edges.slice(0, maxEdges).map(([i1, i2], eIdx) => {
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
  }, [poly, viewMode, buildStepIndex, explodeProgress, projectVec]);

  // Render Projected Vertices
  const renderedVertices = useMemo(() => {
    const explodeDist = viewMode === "explode" ? explodeProgress * 12 : 0;
    const maxV = viewMode === "build" ? currentV : poly.V;

    return poly.vertices.slice(0, maxV).map((v, vIdx) => {
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
  }, [poly, viewMode, currentV, explodeProgress, projectVec]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1.5 w-full pt-0.5 pb-1 select-none" onClick={stop} onPointerDown={stop}>
      
      {/* ── Subtitle / Invariant Status Indicator ── */}
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold font-headline select-none">
        {viewMode === "build" ? (
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
            <span className="text-white/70">Step {buildStepIndex}/{poly.edges.length}:</span>
            {buildStepIndex === 0 ? (
              <span className="text-cyan-300">1 Vertex on Surface (1 - 0 + 1 = 2)</span>
            ) : activeStep?.isNewVertex ? (
              <span className="text-amber-300 font-semibold">+1 Vertex & +1 Edge (Δ=0 → Balance stays 2)</span>
            ) : (
              <span className="text-cyan-300 font-semibold">+1 Edge & +1 Face (Δ=0 → Balance stays 2)</span>
            )}
          </div>
        ) : viewMode === "explode" ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/90">
            <span>Concentric Layer Explosion</span>
            <span className="text-white/50">({Math.round(explodeProgress * 100)}%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/90">
            <span style={{ color: COLOR_VERTEX }}>{poly.V} Vertices</span>
            <span className="text-white/40">•</span>
            <span style={{ color: COLOR_GOLD }}>{poly.E} Edges</span>
            <span className="text-white/40">•</span>
            <span style={{ color: COLOR_CYAN }}>{poly.F} Faces</span>
          </div>
        )}
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
          const isHighlighted = highlight === "all" || highlight === "F";
          const fillOpacity = isHighlighted ? (avgZ > 0 ? 0.45 : 0.28) : 0.12;
          return (
            <polygon
              key={`face-${fIdx}`}
              points={pointsStr}
              fill={isHighlighted ? `rgba(94, 232, 255, ${fillOpacity})` : `rgba(255, 255, 255, ${fillOpacity})`}
              stroke={highlight === "F" ? "rgba(94, 232, 255, 0.9)" : "rgba(255, 255, 255, 0.35)"}
              strokeWidth={highlight === "F" ? 2.0 : 1.2}
              className="transition-colors pointer-events-none"
            />
          );
        })}

        {/* Render Edges (Solid wireframe struts with active build glow) */}
        {renderedEdges.map(({ eIdx, p1, p2 }) => {
          const isHighlighted = highlight === "all" || highlight === "E";
          const isCurrentBuildEdge = viewMode === "build" && eIdx === buildStepIndex - 1;

          return (
            <line
              key={`edge-${eIdx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={
                isCurrentBuildEdge
                  ? COLOR_GOLD
                  : highlight === "E"
                  ? COLOR_GOLD
                  : "rgba(255, 255, 255, 0.9)"
              }
              strokeWidth={isCurrentBuildEdge ? 3.4 : highlight === "E" ? 2.6 : 1.8}
              className="pointer-events-none transition-colors"
            />
          );
        })}

        {/* Render Vertices (Anchor Nodes) */}
        {renderedVertices.map(({ vIdx, p }) => {
          const isHighlighted = highlight === "all" || highlight === "V";
          const isCurrentBuildVert = viewMode === "build" && (buildStepIndex === 0 ? vIdx === 0 : vIdx === currentV - 1);
          const r = isCurrentBuildVert ? 5.0 : highlight === "V" ? 4.5 : 3.2;

          return (
            <circle
              key={`vert-${vIdx}`}
              cx={p.x}
              cy={p.y}
              r={r}
              fill={isCurrentBuildVert ? "#ffffff" : isHighlighted ? COLOR_VERTEX : "rgba(255, 255, 255, 0.5)"}
              stroke={isCurrentBuildVert ? COLOR_GOLD : "rgba(0, 0, 0, 0.4)"}
              strokeWidth={isCurrentBuildVert ? 1.8 : 1.0}
              className="pointer-events-none transition-all"
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

        {/* Mode Selector Capsule: Inspect | Explode | Build */}
        <div className="flex items-center justify-between gap-2 w-full bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 shadow-sm">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setViewMode("inspect"); setIsAutoPlaying(false); }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                viewMode === "inspect" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              Inspect
            </button>
            <button
              onClick={() => { setViewMode("explode"); setIsAutoPlaying(false); }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                viewMode === "explode" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              Explode
            </button>
            <button
              onClick={() => { setViewMode("build"); setBuildStepIndex(0); }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                viewMode === "build" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              Build
            </button>
          </div>

          {/* Mode-Specific Interaction Widgets */}
          {viewMode === "inspect" && (
            <div className="flex items-center gap-1">
              {(["all", "V", "E", "F"] as HighlightElement[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setHighlight(mode)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                    highlight === mode
                      ? mode === "V"
                        ? "bg-white text-black shadow-sm"
                        : mode === "E"
                        ? "bg-[#ffd45e] text-black shadow-sm"
                        : mode === "F"
                        ? "bg-[#5ee8ff] text-black shadow-sm"
                        : "bg-white/30 text-white shadow-sm"
                      : "bg-transparent text-white/70 hover:text-white"
                  )}
                >
                  {mode === "all" ? "All" : mode}
                </button>
              ))}
            </div>
          )}

          {viewMode === "explode" && (
            <div className="flex items-center gap-2 flex-1 max-w-[150px] pl-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeProgress}
                onChange={(e) => setExplodeProgress(parseFloat(e.target.value))}
                className="w-full accent-white h-1.5 rounded-full cursor-pointer"
              />
            </div>
          )}

          {viewMode === "build" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 border-none"
              >
                {isAutoPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => setBuildStepIndex((prev) => Math.min(poly.edges.length, prev + 1))}
                disabled={buildStepIndex >= poly.edges.length}
                className="px-2 py-0.5 rounded-full text-xs font-headline font-bold bg-white/15 hover:bg-white/25 disabled:opacity-30 text-white transition-all border-none"
              >
                Step +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Live Euler Typographic Equation Banner ── */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/35 border-y border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <button
            onClick={() => setHighlight(highlight === "V" ? "all" : "V")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: COLOR_VERTEX }}
          >
            V ({currentV})
          </button>
          <span className="text-white/50">−</span>
          <button
            onClick={() => setHighlight(highlight === "E" ? "all" : "E")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: COLOR_GOLD }}
          >
            E ({currentE})
          </button>
          <span className="text-white/50">+</span>
          <button
            onClick={() => setHighlight(highlight === "F" ? "all" : "F")}
            className="hover:scale-105 transition-transform border-none bg-transparent"
            style={{ color: COLOR_CYAN }}
          >
            F ({currentF})
          </button>
          <span className="text-white/50">=</span>
          <span className="text-white font-extrabold text-base">2</span>
        </div>
      </div>

    </div>
  );
}
