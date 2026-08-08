import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

// Robust LocalStorage Mock
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(window, "localStorage", {
  value: mockStorage,
  writable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: mockStorage,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock SpeechSynthesis
const mockVoices = [
  { name: "Google US English", lang: "en-US", default: true },
  { name: "Samantha", lang: "en-US", default: false },
];
const mockSpeechSynthesis = {
  speak: vi.fn((utterance) => {
    setTimeout(() => utterance.onend?.(), 0);
  }),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn().mockReturnValue(mockVoices),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};
Object.defineProperty(window, "speechSynthesis", {
  writable: true,
  value: mockSpeechSynthesis,
});

class MockSpeechSynthesisUtterance {
  text: string;
  rate: number = 1;
  pitch: number = 1;
  voice: unknown = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text = "") {
    this.text = text;
  }
}
Object.defineProperty(window, "SpeechSynthesisUtterance", {
  writable: true,
  value: MockSpeechSynthesisUtterance,
});

// Mock Web Audio Context
class MockAudioContext {
  currentTime = 0;
  createOscillator() {
    return {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  destination = {};
}
Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: MockAudioContext,
});

// Mock WakeLock
Object.defineProperty(navigator, "wakeLock", {
  writable: true,
  value: {
    request: vi.fn().mockResolvedValue({
      release: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  },
});

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Clear localStorage before each test
beforeEach(() => {
  mockStorage.clear();
  vi.clearAllMocks();
});
