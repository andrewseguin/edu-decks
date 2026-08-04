"use client";

// Audio player for Math Deck recorded MP3 sound clips

let currentAudio: HTMLAudioElement | null = null;
let currentPlaylist: string[] = [];
let playlistIndex = 0;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  currentPlaylist = [];
  playlistIndex = 0;
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
  // Normalize text tokens
  // E.g., "7 plus 3 equals 10" -> ["numbers/7", "operators/plus", "numbers/3", "operators/equals", "numbers/10"]
  // E.g., "7 plus 3" -> ["numbers/7", "operators/plus", "numbers/3"]
  // E.g., "1/2 plus 1/4" -> ["fractions/1_2", "operators/plus", "fractions/1_4"]
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
          return null; // Fallback to SpeechSynthesis for numbers > 144
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
      return null; // Unknown word -> fallback to TTS
    }
  }

  return paths.length > 0 ? paths : null;
}

export function playAudioSequence(
  paths: string[],
  onEnd?: () => void,
  fallbackText?: string
) {
  stopCurrentAudio();

  if (typeof window === "undefined") return;

  if (fallbackText && ("speechSynthesis" in window)) {
    window.speechSynthesis.cancel();
  }

  currentPlaylist = paths;
  playlistIndex = 0;

  function playNext() {
    if (playlistIndex >= currentPlaylist.length) {
      currentAudio = null;
      onEnd?.();
      return;
    }

    const nextPath = currentPlaylist[playlistIndex];
    playlistIndex++;

    const audio = new Audio(nextPath);
    currentAudio = audio;

    audio.onended = () => {
      playNext();
    };

    audio.onerror = () => {
      // If an MP3 fails to load, fallback to browser TTS if provided
      if (fallbackText && ("speechSynthesis" in window)) {
        stopCurrentAudio();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } else {
        playNext();
      }
    };

    audio.play().catch(() => {
      // Browser autoplay policy catch -> try next or fallback
      if (fallbackText && ("speechSynthesis" in window)) {
        stopCurrentAudio();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    });
  }

  playNext();
}

export function playMathSpeech(text: string, enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;

  const paths = getAudioPathsForSpeechText(text);

  if (paths) {
    playAudioSequence(paths, undefined, text);
  } else if ("speechSynthesis" in window) {
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
}
