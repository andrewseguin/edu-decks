import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  test: {
    name: "arithmetic-deck",
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "./test/setup.ts")],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@decks/core": path.resolve(__dirname, "../../packages/deck-core/src"),
    },
  },
});
