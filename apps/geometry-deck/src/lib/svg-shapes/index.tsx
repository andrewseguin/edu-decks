"use client";

import React from "react";
import type { SvgDescriptor, SvgMutation } from "../types";
import { WHITE50 } from "./svg-primitives";

// ── Shape modules ────────────────────────────────────────────────────────────
import {
  AngleSingle, AngleSupplementary, AngleComplementary,
  AngleVerticallyOpposite, AngleReflex,
  AngleParallelAlternate, AngleParallelCointerior,
} from "./angle-shapes";
import { Triangle, RightTriangle } from "./triangle-shapes";
import { Rectangle, Parallelogram, Trapezoid } from "./quadrilateral-shapes";
import { Circle } from "./circle-shapes";
import { Polygon } from "./polygon-shapes";
import { Prism, Cylinder, Cone, Sphere } from "./solid-shapes";

// ── Re-exports (public API) ─────────────────────────────────────────────────
export { RightAngleMarker, SvgTriangle, computeRightTriangleVertices } from "./svg-primitives";

// ── Main renderer ───────────────────────────────────────────────────────────

export function renderShapeSvg(descriptor: SvgDescriptor, mutation?: SvgMutation): React.ReactElement {
  const { shape, dimensions } = descriptor;
  switch (shape) {
    // Angles
    case "angle-single":              return <AngleSingle dims={dimensions} mutation={mutation} />;
    case "angle-supplementary":       return <AngleSupplementary dims={dimensions} mutation={mutation} />;
    case "angle-complementary":       return <AngleComplementary dims={dimensions} mutation={mutation} />;
    case "angle-vertically-opposite": return <AngleVerticallyOpposite dims={dimensions} mutation={mutation} />;
    case "angle-reflex":              return <AngleReflex dims={dimensions} />;
    case "angle-parallel-alternate":  return <AngleParallelAlternate dims={dimensions} />;
    case "angle-parallel-cointerior": return <AngleParallelCointerior dims={dimensions} />;
    // Triangles
    case "triangle":      return <Triangle dims={dimensions} mutation={mutation} />;
    case "right-triangle": return <RightTriangle dims={dimensions} mutation={mutation} />;
    // Quadrilaterals
    case "rectangle":     return <Rectangle dims={dimensions} mutation={mutation} />;
    case "parallelogram": return <Parallelogram dims={dimensions} mutation={mutation} />;
    case "trapezoid":     return <Trapezoid dims={dimensions} mutation={mutation} />;
    // Circles
    case "circle":        return <Circle dims={dimensions} mutation={mutation} />;
    // Polygons
    case "polygon":       return <Polygon dims={dimensions} mutation={mutation} />;
    // 3D
    case "prism":         return <Prism dims={dimensions} />;
    case "cylinder":      return <Cylinder dims={dimensions} />;
    case "cone":          return <Cone dims={dimensions} />;
    case "sphere":        return <Sphere dims={dimensions} />;
    default:
      return (
        <svg viewBox="0 0 200 180" className="w-full h-full" aria-hidden>
          <text x="100" y="90" textAnchor="middle" fontSize={14} fill={WHITE50} fontFamily="inherit">{shape}</text>
        </svg>
      );
  }
}
