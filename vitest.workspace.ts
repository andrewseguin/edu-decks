import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/deck-core/vitest.config.ts",
  "apps/arithmetic-deck/vitest.config.ts",
  "apps/reading-deck/vitest.config.ts",
  "apps/landing-page/vitest.config.ts",
]);
