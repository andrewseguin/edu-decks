"use client";

import { useCallback } from "react";

export type UseAudioOptions = {
  customSpeak?: (text: string, enabled?: boolean, onEnd?: () => void) => void;
};

export function useAudio(options?: UseAudioOptions | ((text: string, enabled?: boolean, onEnd?: () => void) => void)) {
  const customSpeak =
    typeof options === "function" ? options : options?.customSpeak;

  const speak = useCallback(
    (text: string, enabled: boolean = true, onEnd?: () => void) => {
      if (!enabled || typeof window === "undefined") {
        onEnd?.();
        return;
      }
      if (customSpeak) {
        customSpeak(text, enabled, onEnd);
        return;
      }
      if (!("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }
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

        utterance.onend = () => {
          onEnd?.();
        };
        utterance.onerror = () => {
          onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS Error:", e);
        onEnd?.();
      }
    },
    [customSpeak]
  );

  const playChime = useCallback((correct: boolean) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();

      if (correct) {
        // Multi-frequency success chord (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);

          gain.gain.setValueAtTime(0, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.18, audioCtx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(audioCtx.currentTime + idx * 0.08);
          osc.stop(audioCtx.currentTime + idx * 0.08 + 0.5);
        });
      } else {
        // Warm low try-again tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext unavailable
    }
  }, []);

  return { speak, playChime };
}
