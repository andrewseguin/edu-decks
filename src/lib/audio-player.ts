"use client";

// High-performance Web Audio API Player for Math Deck
// Features: Buffer preloading, zero-latency gapless scheduling, and smooth natural pacing.

let sharedAudioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
let activeSourceNodes: AudioBufferSourceNode[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function stopCurrentAudio() {
  activeSourceNodes.forEach((node) => {
    try {
      node.stop();
      node.disconnect();
    } catch (_) {}
  });
  activeSourceNodes = [];

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// Convert operation symbol to operator audio key
const OP_AUDIO_MAP: Record<string, string> = {
  "+": "plus",
  "-": "minus",
  "×": "times",
  "÷": "divided_by",
  "=": "equals",
};

export function getAudioPathsForSpeechText(text: string): string[] | null {
  const clean = text
    .replace(/equals/gi, "=")
    .replace(/plus/gi, "+")
    .replace(/minus/gi, "-")
    .replace(/times/gi, "×")
    .replace(/divided by/gi, "÷")
    .replace(/is/gi, "=")
    .trim();

  const parts = clean.split(/\s+/);
  const paths: string[] = [];

  for (const part of parts) {
    if (/^-?\d+$/.test(part)) {
      const num = parseInt(part, 10);
      if (num < 0) {
        paths.push("/audio/numbers/negative.mp3");
        const pos = Math.abs(num);
        if (pos <= 144) {
          paths.push(`/audio/numbers/${pos}.mp3`);
        } else {
          return null;
        }
      } else if (num <= 144) {
        paths.push(`/audio/numbers/${num}.mp3`);
      } else {
        return null;
      }
    } else if (OP_AUDIO_MAP[part]) {
      paths.push(`/audio/operators/${OP_AUDIO_MAP[part]}.mp3`);
    } else if (/^\d+\/\d+$/.test(part)) {
      const fracKey = part.replace("/", "_");
      paths.push(`/audio/fractions/${fracKey}.mp3`);
    } else {
      return null;
    }
  }

  return paths.length > 0 ? paths : null;
}

async function fetchAndDecodeBuffer(path: string, ctx: AudioContext): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(path)) {
    return audioBufferCache.get(path)!;
  }
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(path, audioBuffer);
    return audioBuffer;
  } catch (err) {
    console.warn(`Failed to decode audio at ${path}:`, err);
    return null;
  }
}

export async function playAudioSequence(
  paths: string[],
  onEnd?: () => void,
  fallbackText?: string
) {
  stopCurrentAudio();

  const ctx = getAudioContext();
  if (!ctx) return;

  // Preload and decode all audio buffers in parallel
  const buffers = await Promise.all(paths.map((p) => fetchAndDecodeBuffer(p, ctx)));

  // Check if any buffer failed to load
  const hasFailed = buffers.some((b) => b === null);
  if (hasFailed && fallbackText && "speechSynthesis" in window) {
    fallbackSpeechSynthesis(fallbackText);
    return;
  }

  const validBuffers = buffers.filter((b): b is AudioBuffer => b !== null);
  if (validBuffers.length === 0) return;

  let startTime = ctx.currentTime + 0.03; // Start 30ms from now
  const interWordGap = 0.04; // Natural 40ms inter-word gap

  validBuffers.forEach((buffer, idx) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.start(startTime);
    activeSourceNodes.push(source);

    // If last buffer, trigger onEnd callback when playback completes
    if (idx === validBuffers.length - 1) {
      source.onended = () => {
        activeSourceNodes = activeSourceNodes.filter((n) => n !== source);
        onEnd?.();
      };
    }

    startTime += buffer.duration + interWordGap;
  });
}

function fallbackSpeechSynthesis(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Samantha") ||
          v.name.includes("Siri") ||
          v.name.includes("Karen") ||
          v.name.includes("Daniel"))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("TTS Error:", e);
  }
}

export function playMathSpeech(text: string, enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;

  const paths = getAudioPathsForSpeechText(text);

  if (paths) {
    playAudioSequence(paths, undefined, text);
  } else {
    fallbackSpeechSynthesis(text);
  }
}
