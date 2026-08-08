import { describe, it, expect, beforeEach, vi } from "vitest";
import { AudioStorage } from "./audio-storage";

describe("reading-deck: AudioStorage", () => {
  let storage: AudioStorage;

  beforeEach(() => {
    storage = new AudioStorage();
  });

  it("instantiates AudioStorage without crashing", () => {
    expect(storage).toBeDefined();
    expect(typeof storage.init).toBe("function");
    expect(typeof storage.saveRecording).toBe("function");
    expect(typeof storage.getRecording).toBe("function");
    expect(typeof storage.deleteRecording).toBe("function");
    expect(typeof storage.getAllRecordings).toBe("function");
    expect(typeof storage.clearAllRecordings).toBe("function");
  });
});
