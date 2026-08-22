import type { TopicType } from "./types";

/** Topic hex colors matching canonical EduDecks brand palette */
export const TOPIC_COLORS: Record<TopicType, string> = {
  angles:         "#d97706",  // Amber
  triangles:      "#059669",  // Brand Emerald
  quadrilaterals: "#4f46e5",  // Indigo
  circles:        "#9333ea",  // Purple
  polygons:       "#0284c7",  // Sky
  "3d-shapes":    "#b91c1c",  // Rose
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
