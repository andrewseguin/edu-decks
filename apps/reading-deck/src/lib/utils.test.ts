import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("reading-deck: utils", () => {
  it("merges Tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "bg-red-500", { "text-white": true })).toBe(
      "px-2 py-1 bg-red-500 text-white"
    );
  });
});
