import { DECK_COLORS } from "@decks/core";
import type { TopicType } from "./types";

/** Topic hex colors matching canonical EduDecks brand palette */
export const TOPIC_COLORS: Record<TopicType, string> = {
  angles:         DECK_COLORS.amber.hex,    // #d97706
  triangles:      DECK_COLORS.emerald.hex,  // #059669 (Brand Emerald)
  quadrilaterals: DECK_COLORS.indigo.hex,   // #4f46e5
  circles:        DECK_COLORS.purple.hex,   // #9333ea
  polygons:       DECK_COLORS.sky.hex,      // #0284c7
  "3d-shapes":    DECK_COLORS.rose.hex,     // #b91c1c
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
