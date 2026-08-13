import type { TopicType } from "./types";

/** Amber/geometry theme hex colors per topic */
export const TOPIC_COLORS: Record<TopicType, string> = {
  angles:         "#d97706",   // Amber
  triangles:      "#10b981",   // Emerald
  quadrilaterals: "#6366f1",   // Indigo
  circles:        "#8b5cf6",   // Violet
  polygons:       "#0ea5e9",   // Sky
  "3d-shapes":    "#f43f5e",   // Rose
};

/** Human-readable label for each topic */
export const TOPIC_LABELS: Record<TopicType, string> = {
  angles:         "Angles",
  triangles:      "Triangles",
  quadrilaterals: "Quadrilaterals",
  circles:        "Circles",
  polygons:       "Polygons",
  "3d-shapes":    "3D Shapes",
};
