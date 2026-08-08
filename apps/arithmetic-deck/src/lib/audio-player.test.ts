import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAudioPathsForSpeechText,
  playMathSpeech,
  stopCurrentAudio,
} from "./audio-player";

describe("arithmetic-deck: audio-player", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAudioPathsForSpeechText", () => {
    it("returns audio paths for simple addition expression", () => {
      const paths = getAudioPathsForSpeechText("5 plus 3 equals 8");
      expect(paths).toEqual([
        "/audio/numbers/5.mp3",
        "/audio/operators/plus.mp3",
        "/audio/numbers/3.mp3",
        "/audio/operators/equals.mp3",
        "/audio/numbers/8.mp3",
      ]);
    });

    it("returns audio paths for multiplication and division operators", () => {
      const multPaths = getAudioPathsForSpeechText("4 times 6");
      expect(multPaths).toEqual([
        "/audio/numbers/4.mp3",
        "/audio/operators/times.mp3",
        "/audio/numbers/6.mp3",
      ]);

      const divPaths = getAudioPathsForSpeechText("12 divided by 3");
      expect(divPaths).toEqual([
        "/audio/numbers/12.mp3",
        "/audio/operators/divided_by.mp3",
        "/audio/numbers/3.mp3",
      ]);
    });

    it("returns audio paths for fractions", () => {
      const fracPaths = getAudioPathsForSpeechText("1/2 plus 1/4");
      expect(fracPaths).toEqual([
        "/audio/fractions/1_2.mp3",
        "/audio/operators/plus.mp3",
        "/audio/fractions/1_4.mp3",
      ]);
    });

    it("returns null for numbers outside bounds or complex phrases to fallback to TTS", () => {
      const outOfBounds = getAudioPathsForSpeechText("500 plus 200");
      expect(outOfBounds).toBeNull();
    });
  });

  describe("playMathSpeech", () => {
    it("does nothing when enabled is false", () => {
      const onEnd = vi.fn();
      playMathSpeech("5 plus 5", false, onEnd);
      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it("falls back to speech synthesis for unmapped phrases", () => {
      const onEnd = vi.fn();
      playMathSpeech("Random English sentence that is not a formula", true, onEnd);
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it("stops audio without error", () => {
      expect(() => stopCurrentAudio()).not.toThrow();
    });
  });
});
