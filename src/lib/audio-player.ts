"use client";

// High-performance Web Audio API Player for Math Deck
// Features: Full-expression Google AI Neural Voice streaming, buffer preloading, and 100% continuous natural speech pacing.

let sharedAudioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
let activeSourceNodes: { source: AudioBufferSourceNode; gain: GainNode }[] = [];

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
  activeSourceNodes.forEach(({ source, gain }) => {
    try {
      gain.gain.linearRampToValueAtTime(0, (sharedAudioCtx?.currentTime || 0) + 0.02);
      setTimeout(() => {
        try {
          source.stop();
          source.disconnect();
          gain.disconnect();
        } catch (_) {}
      }, 25);
    } catch (_) {}
  });
  activeSourceNodes = [];

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function getGoogleTtsUrl(text: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
}

async function fetchAndDecodeBuffer(text: string, ctx: AudioContext): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(text)) {
    return audioBufferCache.get(text)!;
  }
  try {
    const url = getGoogleTtsUrl(text);
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(text, audioBuffer);
    return audioBuffer;
  } catch (err) {
    console.warn(`Failed to fetch/decode audio for "${text}":`, err);
    return null;
  }
}

export async function playMathSpeech(text: string, enabled: boolean = true) {
  if (!enabled || typeof window === "undefined" || !text) return;

  stopCurrentAudio();

  const ctx = getAudioContext();
  if (!ctx) {
    fallbackSpeechSynthesis(text);
    return;
  }

  // Fetch/decode full expression as a single continuous natural AI speech stream
  const buffer = await fetchAndDecodeBuffer(text, ctx);

  if (!buffer) {
    fallbackSpeechSynthesis(text);
    return;
  }

  const startTime = ctx.currentTime + 0.02;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;

  // Smooth envelope to prevent audio pops
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(1, startTime + 0.015);
  gain.gain.setValueAtTime(1, startTime + buffer.duration - 0.015);
  gain.gain.linearRampToValueAtTime(0, startTime + buffer.duration);

  source.connect(gain);
  gain.connect(ctx.destination);

  source.start(startTime);
  activeSourceNodes.push({ source, gain });

  source.onended = () => {
    activeSourceNodes = activeSourceNodes.filter((n) => n.source !== source);
  };
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
