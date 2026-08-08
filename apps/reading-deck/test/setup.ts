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

// Mock matchMedia
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

// Mock AudioContext
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

// Mock HTMLMediaElement.prototype.play and pause
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

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

// Mock Canvas 2D Context
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
  if (contextId === "2d") {
    return {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(100),
      }),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      closePath: vi.fn(),
      strokeStyle: "#000",
      fillStyle: "#000",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as any;

// Mock MediaRecorder
class MockMediaRecorder {
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(["fake-audio"], { type: "audio/webm" }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}
Object.defineProperty(window, "MediaRecorder", {
  writable: true,
  value: MockMediaRecorder,
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
    }),
  },
});

// Mock indexedDB
const createIndexedDBMock = () => {
  const stores: Record<string, Map<string, any>> = {};

  return {
    open: vi.fn().mockImplementation((name: string, version: number) => {
      const request: any = {
        result: {
          objectStoreNames: {
            contains: (storeName: string) => Boolean(stores[storeName]),
          },
          createObjectStore: (storeName: string) => {
            if (!stores[storeName]) stores[storeName] = new Map();
          },
          transaction: (storeName: string, mode: string) => {
            if (!stores[storeName]) stores[storeName] = new Map();
            const storeMap = stores[storeName];
            return {
              objectStore: () => ({
                get: (key: string) => {
                  const req: any = { result: storeMap.get(key) || null };
                  setTimeout(() => req.onsuccess?.(), 0);
                  return req;
                },
                put: (value: any, key: string) => {
                  storeMap.set(key, value);
                  const req: any = {};
                  setTimeout(() => req.onsuccess?.(), 0);
                  return req;
                },
                delete: (key: string) => {
                  storeMap.delete(key);
                  const req: any = {};
                  setTimeout(() => req.onsuccess?.(), 0);
                  return req;
                },
                getAllKeys: () => {
                  const req: any = { result: Array.from(storeMap.keys()) };
                  setTimeout(() => req.onsuccess?.(), 0);
                  return req;
                },
                clear: () => {
                  storeMap.clear();
                  const req: any = {};
                  setTimeout(() => req.onsuccess?.(), 0);
                  return req;
                },
              }),
            };
          },
        },
      };
      setTimeout(() => {
        request.onupgradeneeded?.();
        request.onsuccess?.();
      }, 0);
      return request;
    }),
  };
};

const mockIndexedDB = createIndexedDBMock();
Object.defineProperty(window, "indexedDB", {
  writable: true,
  value: mockIndexedDB,
});
Object.defineProperty(globalThis, "indexedDB", {
  writable: true,
  value: mockIndexedDB,
});

beforeEach(() => {
  mockStorage.clear();
  vi.clearAllMocks();
});
