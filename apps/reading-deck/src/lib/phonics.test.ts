import { describe, it, expect } from "vitest";
import { splitIntoPhonicsSegments, getSoundKeyForSegment } from "./phonics";

describe("reading-deck: phonics", () => {
  describe("splitIntoPhonicsSegments", () => {
    it("splits simple CVC words into individual phonics letters", () => {
      expect(splitIntoPhonicsSegments("cat")).toEqual(["c", "a", "t"]);
      expect(splitIntoPhonicsSegments("dog")).toEqual(["d", "o", "g"]);
      expect(splitIntoPhonicsSegments("sun")).toEqual(["s", "u", "n"]);
    });

    it("groups double consonants (ll, tt, ss, ff, zz, ck)", () => {
      expect(splitIntoPhonicsSegments("ball")).toEqual(["b", "a", "ll"]);
      expect(splitIntoPhonicsSegments("butter")).toEqual(["b", "u", "tt", "er"]);
      expect(splitIntoPhonicsSegments("duck")).toEqual(["d", "u", "ck"]);
      expect(splitIntoPhonicsSegments("grass")).toEqual(["g", "r", "a", "ss"]);
      expect(splitIntoPhonicsSegments("cliff")).toEqual(["c", "l", "i", "ff"]);
      expect(splitIntoPhonicsSegments("fizz")).toEqual(["f", "i", "zz"]);
    });

    it("groups digraphs (sh, ch, th, wh, ph, oo, ee, ea, oa, ai, ay)", () => {
      expect(splitIntoPhonicsSegments("ship")).toEqual(["sh", "i", "p"]);
      expect(splitIntoPhonicsSegments("chat")).toEqual(["ch", "a", "t"]);
      expect(splitIntoPhonicsSegments("that")).toEqual(["th", "a", "t"]);
      expect(splitIntoPhonicsSegments("moon")).toEqual(["m", "oo", "n"]);
      expect(splitIntoPhonicsSegments("rain")).toEqual(["r", "ai", "n"]);
      expect(splitIntoPhonicsSegments("boat")).toEqual(["b", "oa", "t"]);
    });

    it("groups r-controlled combinations (ar, er, ir, or, ur)", () => {
      expect(splitIntoPhonicsSegments("star")).toEqual(["s", "t", "ar"]);
      expect(splitIntoPhonicsSegments("bird")).toEqual(["b", "ir", "d"]);
      expect(splitIntoPhonicsSegments("fork")).toEqual(["f", "or", "k"]);
      expect(splitIntoPhonicsSegments("surf")).toEqual(["s", "ur", "f"]);
    });
  });

  describe("getSoundKeyForSegment", () => {
    it("maps double letters to single phonics keys", () => {
      expect(getSoundKeyForSegment("ll")).toBe("l");
      expect(getSoundKeyForSegment("tt")).toBe("t");
      expect(getSoundKeyForSegment("ck")).toBe("k");
      expect(getSoundKeyForSegment("ss")).toBe("s");
      expect(getSoundKeyForSegment("ff")).toBe("f");
      expect(getSoundKeyForSegment("zz")).toBe("z");
      expect(getSoundKeyForSegment("ph")).toBe("f");
    });

    it("returns lowercased segment for standard phonics", () => {
      expect(getSoundKeyForSegment("SH")).toBe("sh");
      expect(getSoundKeyForSegment("CH")).toBe("ch");
      expect(getSoundKeyForSegment("A")).toBe("a");
    });
  });
});
