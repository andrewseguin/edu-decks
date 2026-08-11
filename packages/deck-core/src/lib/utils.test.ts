import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, isDevSite } from "./utils";

describe("deck-core: cn utility", () => {
  it("merges class names properly", () => {
    expect(cn("base-class", "another-class")).toBe("base-class another-class");
  });

  it("handles conditional class names correctly", () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn("base", isTrue && "active", isFalse && "inactive")).toBe("base active");
  });

  it("resolves tailwind conflict overrides", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-white text-black", "bg-black")).toBe("text-black bg-black");
  });

  it("handles arrays and object arguments", () => {
    expect(cn(["class-a", "class-b"], { "class-c": true, "class-d": false })).toBe(
      "class-a class-b class-c"
    );
  });

  it("handles empty or falsy inputs", () => {
    expect(cn("", null, undefined, false)).toBe("");
  });
});

describe("deck-core: isDevSite utility", () => {
  const mockHostname = (hostname: string) => {
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: {
        hostname,
      },
    });
  };

  it("returns true on localhost", () => {
    mockHostname("localhost");
    expect(isDevSite()).toBe(true);
  });

  it("returns true on 127.0.0.1", () => {
    mockHostname("127.0.0.1");
    expect(isDevSite()).toBe(true);
  });

  it("returns true on -dev. subdomains", () => {
    mockHostname("reading-dev.edudecks.org");
    expect(isDevSite()).toBe(true);
    mockHostname("arithmetic-dev.edudecks.org");
    expect(isDevSite()).toBe(true);
  });

  it("returns false on staging and production subdomains", () => {
    mockHostname("reading-staging.edudecks.org");
    expect(isDevSite()).toBe(false);
    mockHostname("reading.edudecks.org");
    expect(isDevSite()).toBe(false);
  });
});


