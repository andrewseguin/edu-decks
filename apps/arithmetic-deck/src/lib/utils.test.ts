import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("arithmetic-deck: utils", () => {
  it("merges Tailwind classes and resolves conflicts", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
