import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAudioRecorder } from "./use-audio-recorder";

describe("reading-deck: useAudioRecorder", () => {
  it("initializes in idle non-recording state", () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.stream).toBeNull();
    expect(typeof result.current.startRecording).toBe("function");
    expect(typeof result.current.stopRecording).toBe("function");
  });
});
