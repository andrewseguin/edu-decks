"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEdgeProps = {
  color?: string;
};

type ShapeType = "cube" | "prism" | "pyramid" | "cylinder";

const SVG_H = 225;
const COLOR_EDGE = "#5ee8ff"; // Electric Cyan for Edges
const COLOR_GOLD = "#ffd45e"; // Active Selected / Hovered Edge Highlight

export function InteractiveEdgeExplorer({ color }: InteractiveEdgeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = SVG_H / 2;

  const [shape, setShape] = useState<ShapeType>("cube");
  const [rotationDeg, setRotationDeg] = useState<number>(38); // 0..360
  const [selectedEdge, setSelectedEdge] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const lastDragXRef = useRef(0);
  const dragDistRef = useRef(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const handleShapeChange = (newShape: ShapeType) => {
    setShape(newShape);
    setSelectedEdge(0);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Auto-Rotation Animation Loop
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoRotating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current) {
        const dt = (time - lastTimeRef.current) / 1000;
        setRotationDeg((prev) => (prev + dt * 28) % 360);
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAutoRotating]);

  // ──────────────────────────────────────────────────────────────────────────
  // Canvas Drag to Rotate & Tap to Select
  // ──────────────────────────────────────────────────────────────────────────
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    stop(e);
    isDraggingRef.current = true;
    lastDragXRef.current = e.clientX;
    dragDistRef.current = 0;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}

    // Tap detection for touch/click: if small drag distance, select/toggle nearest edge
    if (dragDistRef.current < 6) {
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      if (svgP) {
        let closestId = 0;
        let minDistSq = Infinity;

        if (shape === "cube") {
          cubeEdges.forEach((edge) => {
            const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
            if (dSq < minDistSq) {
              minDistSq = dSq;
              closestId = edge.id;
            }
          });
        } else if (shape === "prism") {
          prismEdges.forEach((edge) => {
            const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
            if (dSq < minDistSq) {
              minDistSq = dSq;
              closestId = edge.id;
            }
          });
        } else if (shape === "pyramid") {
          pyramidEdges.forEach((edge) => {
            const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
            if (dSq < minDistSq) {
              minDistSq = dSq;
              closestId = edge.id;
            }
          });
        } else if (shape === "cylinder") {
          const thetaTop = Math.atan2((svgP.y - topCenter.y) / cylRy, (svgP.x - topCenter.x) / cylR);
          const topNx = topCenter.x + cylR * Math.cos(thetaTop);
          const topNy = topCenter.y + cylRy * Math.sin(thetaTop);
          const topDistSq = (svgP.x - topNx) * (svgP.x - topNx) + (svgP.y - topNy) * (svgP.y - topNy);

          const thetaBot = Math.atan2((svgP.y - botCenter.y) / cylRy, (svgP.x - botCenter.x) / cylR);
          const botNx = botCenter.x + cylR * Math.cos(thetaBot);
          const botNy = botCenter.y + cylRy * Math.sin(thetaBot);
          const botDistSq = (svgP.x - botNx) * (svgP.x - botNx) + (svgP.y - botNy) * (svgP.y - botNy);

          if (topDistSq < botDistSq) {
            minDistSq = topDistSq;
            closestId = 1;
          } else {
            minDistSq = botDistSq;
            closestId = 2;
          }
        }

        if (minDistSq <= 6400 && closestId > 0) {
          setSelectedEdge((prev) => (prev === closestId ? 0 : closestId));
        }
      }
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Camera & Projection
  // ──────────────────────────────────────────────────────────────────────────
  const yaw = (rotationDeg * Math.PI) / 180;
  const pitchDeg = 24; // Isometric down angle
  const pitch = (pitchDeg * Math.PI) / 180;

  const project = useCallback(
    (x: number, y: number, z: number) => {
      // Rotate around Y-axis (yaw)
      const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
      const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
      // Pitch around X-axis
      const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
      return {
        x: CX + x1,
        y: CY - y2,
        z: z2,
      };
    },
    [yaw, pitch, CX, CY]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Shapes Geometry & Edge Lists
  // ──────────────────────────────────────────────────────────────────────────

  // 1. CUBE (12 Edges)
  const cubeS = 104;
  const hs = cubeS / 2;
  const c_b_fl = project(-hs, -hs, hs);
  const c_b_fr = project(hs, -hs, hs);
  const c_b_br = project(hs, -hs, -hs);
  const c_b_bl = project(-hs, -hs, -hs);

  const c_t_fl = project(-hs, hs, hs);
  const c_t_fr = project(hs, hs, hs);
  const c_t_br = project(hs, hs, -hs);
  const c_t_bl = project(-hs, hs, -hs);

  const cubeEdges = [
    // Bottom Base (4)
    { id: 1, p1: c_b_fl, p2: c_b_fr },
    { id: 2, p1: c_b_fr, p2: c_b_br },
    { id: 3, p1: c_b_br, p2: c_b_bl },
    { id: 4, p1: c_b_bl, p2: c_b_fl },
    // Top Base (4)
    { id: 5, p1: c_t_fl, p2: c_t_fr },
    { id: 6, p1: c_t_fr, p2: c_t_br },
    { id: 7, p1: c_t_br, p2: c_t_bl },
    { id: 8, p1: c_t_bl, p2: c_t_fl },
    // Vertical Pillars (4)
    { id: 9, p1: c_b_fl, p2: c_t_fl },
    { id: 10, p1: c_b_fr, p2: c_t_fr },
    { id: 11, p1: c_b_br, p2: c_t_br },
    { id: 12, p1: c_b_bl, p2: c_t_bl },
  ];

  const cubeFaces = [
    { pts: [c_b_fl, c_b_fr, c_t_fr, c_t_fl], z: (c_b_fl.z + c_b_fr.z + c_t_fr.z + c_t_fl.z) / 4 }, // Front
    { pts: [c_b_fr, c_b_br, c_t_br, c_t_fr], z: (c_b_fr.z + c_b_br.z + c_t_br.z + c_t_fr.z) / 4 }, // Right
    { pts: [c_b_br, c_b_bl, c_t_bl, c_t_br], z: (c_b_br.z + c_b_bl.z + c_t_bl.z + c_t_br.z) / 4 }, // Back
    { pts: [c_b_bl, c_b_fl, c_t_fl, c_t_bl], z: (c_b_bl.z + c_b_fl.z + c_t_fl.z + c_t_bl.z) / 4 }, // Left
    { pts: [c_t_fl, c_t_fr, c_t_br, c_t_bl], z: (c_t_fl.z + c_t_fr.z + c_t_br.z + c_t_bl.z) / 4 }, // Top
    { pts: [c_b_fl, c_b_bl, c_b_br, c_b_fr], z: (c_b_fl.z + c_b_bl.z + c_b_br.z + c_b_fr.z) / 4 }, // Bottom
  ];

  // 2. TRIANGULAR PRISM (9 Edges)
  const pW = 114;
  const pH = 90;
  const pL = 120;
  const pv_fl = project(-pW / 2, -pH / 2, pL / 2);
  const pv_fr = project(pW / 2, -pH / 2, pL / 2);
  const pv_fa = project(0, pH / 2, pL / 2);

  const pv_bl = project(-pW / 2, -pH / 2, -pL / 2);
  const pv_br = project(pW / 2, -pH / 2, -pL / 2);
  const pv_ba = project(0, pH / 2, -pL / 2);

  const prismEdges = [
    // Front Triangle (3)
    { id: 1, p1: pv_fl, p2: pv_fr },
    { id: 2, p1: pv_fr, p2: pv_fa },
    { id: 3, p1: pv_fa, p2: pv_fl },
    // Back Triangle (3)
    { id: 4, p1: pv_bl, p2: pv_br },
    { id: 5, p1: pv_br, p2: pv_ba },
    { id: 6, p1: pv_ba, p2: pv_bl },
    // Lengthwise Edges (3)
    { id: 7, p1: pv_fl, p2: pv_bl },
    { id: 8, p1: pv_fr, p2: pv_br },
    { id: 9, p1: pv_fa, p2: pv_ba },
  ];

  const prismFaces = [
    { pts: [pv_fl, pv_fr, pv_fa], z: (pv_fl.z + pv_fr.z + pv_fa.z) / 3 }, // Front Triangle
    { pts: [pv_bl, pv_ba, pv_br], z: (pv_bl.z + pv_ba.z + pv_br.z) / 3 }, // Back Triangle
    { pts: [pv_fl, pv_bl, pv_br, pv_fr], z: (pv_fl.z + pv_bl.z + pv_br.z + pv_fr.z) / 4 }, // Bottom Base
    { pts: [pv_fl, pv_fa, pv_ba, pv_bl], z: (pv_fl.z + pv_fa.z + pv_ba.z + pv_bl.z) / 4 }, // Left Slant
    { pts: [pv_fr, pv_br, pv_ba, pv_fa], z: (pv_fr.z + pv_br.z + pv_ba.z + pv_fa.z) / 4 }, // Right Slant
  ];

  // 3. SQUARE PYRAMID (8 Edges)
  const pyrW = 118;
  const pyrH = 100;
  const py_fl = project(-pyrW / 2, -pyrH / 3, pyrW / 2);
  const py_fr = project(pyrW / 2, -pyrH / 3, pyrW / 2);
  const py_br = project(pyrW / 2, -pyrH / 3, -pyrW / 2);
  const py_bl = project(-pyrW / 2, -pyrH / 3, -pyrW / 2);
  const py_apex = project(0, (2 * pyrH) / 3, 0);

  const pyramidEdges = [
    // Base Square (4)
    { id: 1, p1: py_fl, p2: py_fr },
    { id: 2, p1: py_fr, p2: py_br },
    { id: 3, p1: py_br, p2: py_bl },
    { id: 4, p1: py_bl, p2: py_fl },
    // Slant Edges to Apex (4)
    { id: 5, p1: py_fl, p2: py_apex },
    { id: 6, p1: py_fr, p2: py_apex },
    { id: 7, p1: py_br, p2: py_apex },
    { id: 8, p1: py_bl, p2: py_apex },
  ];

  const pyramidFaces = [
    { pts: [py_fl, py_fr, py_apex], z: (py_fl.z + py_fr.z + py_apex.z) / 3 }, // Front
    { pts: [py_fr, py_br, py_apex], z: (py_fr.z + py_br.z + py_apex.z) / 3 }, // Right
    { pts: [py_br, py_bl, py_apex], z: (py_br.z + py_bl.z + py_apex.z) / 3 }, // Back
    { pts: [py_bl, py_fl, py_apex], z: (py_bl.z + py_fl.z + py_apex.z) / 3 }, // Left
    { pts: [py_fl, py_bl, py_br, py_fr], z: (py_fl.z + py_bl.z + py_br.z + py_fr.z) / 4 }, // Bottom
  ];

  // 4. CYLINDER (2 Curved Edges)
  const cylR = 56;
  const cylH = 98;
  const topCenter = project(0, cylH / 2, 0);
  const botCenter = project(0, -cylH / 2, 0);
  const cylRy = cylR * Math.sin(pitch); // Vertical ellipse radius in isometric projection

  // Silhouette lines for cylinder outer side walls in 2D projection
  const cylLeftTop = { x: topCenter.x - cylR, y: topCenter.y };
  const cylLeftBot = { x: botCenter.x - cylR, y: botCenter.y };
  const cylRightTop = { x: topCenter.x + cylR, y: topCenter.y };
  const cylRightBot = { x: botCenter.x + cylR, y: botCenter.y };

  // ──────────────────────────────────────────────────────────────────────────
  // Nearest Edge Distance Calculations
  // ──────────────────────────────────────────────────────────────────────────
  const distSqToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lSq = dx * dx + dy * dy;
    if (lSq === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lSq));
    const nx = x1 + t * dx;
    const ny = y1 + t * dy;
    return (px - nx) * (px - nx) + (py - ny) * (py - ny);
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastDragXRef.current;
      lastDragXRef.current = e.clientX;
      dragDistRef.current += Math.abs(dx);
      setRotationDeg((prev) => (prev + dx * 0.75 + 360) % 360);
      return;
    }

    if (e.pointerType !== "mouse") return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgP) return;

    let closestId = 0;
    let minDistSq = Infinity;

    if (shape === "cube") {
      cubeEdges.forEach((edge) => {
        const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = edge.id;
        }
      });
    } else if (shape === "prism") {
      prismEdges.forEach((edge) => {
        const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = edge.id;
        }
      });
    } else if (shape === "pyramid") {
      pyramidEdges.forEach((edge) => {
        const dSq = distSqToSegment(svgP.x, svgP.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = edge.id;
        }
      });
    } else if (shape === "cylinder") {
      // Top rim ellipse
      const thetaTop = Math.atan2((svgP.y - topCenter.y) / cylRy, (svgP.x - topCenter.x) / cylR);
      const topNx = topCenter.x + cylR * Math.cos(thetaTop);
      const topNy = topCenter.y + cylRy * Math.sin(thetaTop);
      const topDistSq = (svgP.x - topNx) * (svgP.x - topNx) + (svgP.y - topNy) * (svgP.y - topNy);

      // Bottom rim ellipse
      const thetaBot = Math.atan2((svgP.y - botCenter.y) / cylRy, (svgP.x - botCenter.x) / cylR);
      const botNx = botCenter.x + cylR * Math.cos(thetaBot);
      const botNy = botCenter.y + cylRy * Math.sin(thetaBot);
      const botDistSq = (svgP.x - botNx) * (svgP.x - botNx) + (svgP.y - botNy) * (svgP.y - botNy);

      if (topDistSq < botDistSq) {
        minDistSq = topDistSq;
        closestId = 1;
      } else {
        minDistSq = botDistSq;
        closestId = 2;
      }
    }

    if (minDistSq > 6400) {
      if (selectedEdge !== 0) setSelectedEdge(0);
      return;
    }

    if (selectedEdge === 0) {
      setSelectedEdge(closestId);
      return;
    }

    if (closestId === selectedEdge) return;

    // Hysteresis calculation
    let currentDistSq = Infinity;
    if (shape === "cube") {
      const cur = cubeEdges.find((edge) => edge.id === selectedEdge);
      if (cur) currentDistSq = distSqToSegment(svgP.x, svgP.y, cur.p1.x, cur.p1.y, cur.p2.x, cur.p2.y);
    } else if (shape === "prism") {
      const cur = prismEdges.find((edge) => edge.id === selectedEdge);
      if (cur) currentDistSq = distSqToSegment(svgP.x, svgP.y, cur.p1.x, cur.p1.y, cur.p2.x, cur.p2.y);
    } else if (shape === "pyramid") {
      const cur = pyramidEdges.find((edge) => edge.id === selectedEdge);
      if (cur) currentDistSq = distSqToSegment(svgP.x, svgP.y, cur.p1.x, cur.p1.y, cur.p2.x, cur.p2.y);
    } else if (shape === "cylinder") {
      if (selectedEdge === 1) {
        const thetaTop = Math.atan2((svgP.y - topCenter.y) / cylRy, (svgP.x - topCenter.x) / cylR);
        const topNx = topCenter.x + cylR * Math.cos(thetaTop);
        const topNy = topCenter.y + cylRy * Math.sin(thetaTop);
        currentDistSq = (svgP.x - topNx) * (svgP.x - topNx) + (svgP.y - topNy) * (svgP.y - topNy);
      } else {
        const thetaBot = Math.atan2((svgP.y - botCenter.y) / cylRy, (svgP.x - botCenter.x) / cylR);
        const botNx = botCenter.x + cylR * Math.cos(thetaBot);
        const botNy = botCenter.y + cylRy * Math.sin(thetaBot);
        currentDistSq = (svgP.x - botNx) * (svgP.x - botNx) + (svgP.y - botNy) * (svgP.y - botNy);
      }
    }

    const currentDist = Math.sqrt(currentDistSq);
    const candidateDist = Math.sqrt(minDistSq);

    // Direct hover override
    if (candidateDist <= 9) {
      setSelectedEdge(closestId);
      return;
    }

    // Gentle 3.5px hysteresis
    if (candidateDist < currentDist - 3.5) {
      setSelectedEdge(closestId);
    }
  };

  const handleSvgPointerLeave = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    if (e.pointerType === "mouse") {
      setSelectedEdge(0);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Shape-specific In-Diagram Header Data
  // ──────────────────────────────────────────────────────────────────────────
  const getShapeSummary = () => {
    switch (shape) {
      case "cube":
        return { label: "Cube", desc: "12 Edges (Straight Segments)" };
      case "prism":
        return { label: "Prism", desc: "9 Edges (6 Base + 3 Side Edges)" };
      case "pyramid":
        return { label: "Pyramid", desc: "8 Edges (4 Base + 4 Slant Edges)" };
      case "cylinder":
        return { label: "Cylinder", desc: "2 Curved Edges (Circular Rims)" };
    }
  };

  const summary = getShapeSummary();

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 w-full pt-0.5 pb-1" onClick={stop} onPointerDown={stop}>
      {/* ── Descriptive Header Badge (Above SVG to prevent overlap) ── */}
      <div className="text-center text-xs sm:text-sm font-bold font-headline tracking-wide select-none" style={{ color: COLOR_EDGE }}>
        {summary.desc}
      </div>

      {/* ── Large & Prominent Interactive 3D Turntable Canvas ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={handleSvgPointerLeave}
        className="w-full touch-none select-none overflow-visible max-h-[225px] cursor-grab active:cursor-grabbing"
      >
        {/* ───────── CUBE RENDERING ───────── */}
        {shape === "cube" && (
          <g>
            {/* Shaded Translucent Faces */}
            {cubeFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base Cyan Edges */}
            {cubeEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke={COLOR_EDGE}
                strokeWidth={2.8}
                strokeLinecap="round"
              />
            ))}

            {/* Selected / Hovered Edge Highlight */}
            {selectedEdge > 0 && (() => {
              const cur = cubeEdges.find((e) => e.id === selectedEdge);
              if (!cur) return null;
              return (
                <line
                  x1={cur.p1.x}
                  y1={cur.p1.y}
                  x2={cur.p2.x}
                  y2={cur.p2.y}
                  stroke={COLOR_GOLD}
                  strokeWidth={4.8}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              );
            })()}
          </g>
        )}

        {/* ───────── PRISM RENDERING ───────── */}
        {shape === "prism" && (
          <g>
            {/* Shaded Translucent Faces */}
            {prismFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base Cyan Edges */}
            {prismEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke={COLOR_EDGE}
                strokeWidth={2.8}
                strokeLinecap="round"
              />
            ))}

            {/* Selected / Hovered Edge Highlight */}
            {selectedEdge > 0 && (() => {
              const cur = prismEdges.find((e) => e.id === selectedEdge);
              if (!cur) return null;
              return (
                <line
                  x1={cur.p1.x}
                  y1={cur.p1.y}
                  x2={cur.p2.x}
                  y2={cur.p2.y}
                  stroke={COLOR_GOLD}
                  strokeWidth={4.8}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              );
            })()}
          </g>
        )}

        {/* ───────── PYRAMID RENDERING ───────── */}
        {shape === "pyramid" && (
          <g>
            {/* Shaded Translucent Faces */}
            {pyramidFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base Cyan Edges */}
            {pyramidEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke={COLOR_EDGE}
                strokeWidth={2.8}
                strokeLinecap="round"
              />
            ))}

            {/* Selected / Hovered Edge Highlight */}
            {selectedEdge > 0 && (() => {
              const cur = pyramidEdges.find((e) => e.id === selectedEdge);
              if (!cur) return null;
              return (
                <line
                  x1={cur.p1.x}
                  y1={cur.p1.y}
                  x2={cur.p2.x}
                  y2={cur.p2.y}
                  stroke={COLOR_GOLD}
                  strokeWidth={4.8}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              );
            })()}
          </g>
        )}

        {/* ───────── CYLINDER RENDERING ───────── */}
        {shape === "cylinder" && (
          <g>
            {/* Shaded Body Fill */}
            <path
              d={`M ${cylLeftTop.x} ${cylLeftTop.y} L ${cylRightTop.x} ${cylRightTop.y} L ${cylRightBot.x} ${cylRightBot.y} A ${cylR} ${cylRy} 0 0 1 ${cylLeftBot.x} ${cylLeftBot.y} Z`}
              fill="rgba(255, 255, 255, 0.08)"
              stroke="none"
            />

            {/* Side Silhouette Wall Lines */}
            <line x1={cylLeftTop.x} y1={cylLeftTop.y} x2={cylLeftBot.x} y2={cylLeftBot.y} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />
            <line x1={cylRightTop.x} y1={cylRightTop.y} x2={cylRightBot.x} y2={cylRightBot.y} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1.5} />

            {/* Dashed Back Half-Rim of Bottom Base (Occluded in 3D) */}
            <path
              d={`M ${botCenter.x - cylR} ${botCenter.y} A ${cylR} ${cylRy} 0 0 1 ${botCenter.x + cylR} ${botCenter.y}`}
              fill="none"
              stroke={selectedEdge === 2 ? COLOR_GOLD : "rgba(94, 232, 255, 0.45)"}
              strokeWidth={selectedEdge === 2 ? 4.8 : 2}
              strokeDasharray={selectedEdge === 2 ? "none" : "4 3"}
            />

            {/* Front Half-Rim of Bottom Base (Visible in 3D) */}
            <path
              d={`M ${botCenter.x - cylR} ${botCenter.y} A ${cylR} ${cylRy} 0 0 0 ${botCenter.x + cylR} ${botCenter.y}`}
              fill="none"
              stroke={selectedEdge === 2 ? COLOR_GOLD : COLOR_EDGE}
              strokeWidth={selectedEdge === 2 ? 4.8 : 2.8}
            />

            {/* Top Circular Rim Edge (Full visible ellipse) */}
            <ellipse
              cx={topCenter.x}
              cy={topCenter.y}
              rx={cylR}
              ry={cylRy}
              fill="rgba(255, 255, 255, 0.12)"
              stroke={selectedEdge === 1 ? COLOR_GOLD : COLOR_EDGE}
              strokeWidth={selectedEdge === 1 ? 4.8 : 2.8}
            />
          </g>
        )}
      </svg>

      {/* ── Minimalist Bottom Controls: Shape Switcher + Auto-Rotate Toggle ── */}
      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none z-30">
        {(["cube", "prism", "pyramid", "cylinder"] as const).map((s) => {
          const isActive = shape === s;
          const label = s.charAt(0).toUpperCase() + s.slice(1);
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleShapeChange(s)}
              className={cn(
                "px-3 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
                isActive
                  ? "bg-white/25 text-white shadow-sm"
                  : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Subtle Vertical Divider */}
        <div className="w-px h-3 bg-white/20 mx-0.5" />

        {/* Play/Pause Auto-Rotate Button */}
        <button
          type="button"
          onClick={() => setIsAutoRotating((prev) => !prev)}
          title={isAutoRotating ? "Pause auto-rotation" : "Play auto-rotation"}
          aria-label={isAutoRotating ? "Pause auto-rotation" : "Play auto-rotation"}
          className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all active:scale-95 border-none flex items-center justify-center"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
