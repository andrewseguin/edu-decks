"use client";

/**
 * Geometry-deck TTS speech player.
 *
 * Pronunciation rules applied before speaking:
 *   π        → "pi"
 *   ²        → " squared"
 *   ³        → " cubed"
 *   ½        → "one half"
 *   ⅓        → "one third"
 *   ⁴⁄₃      → "four thirds"
 *   √n       → "root n"
 *   ÷        → "divided by"
 *   ×        → "times"
 *   =        → "equals"
 *   →        → (removed)
 *   °        → " degrees"
 */
export function playGeometrySpeech(
  text: string,
  _enabled?: boolean,
  onEnd?: () => void
): void {
  const cleaned = text
    .replace(/π/g, "pi")
    .replace(/²/g, " squared")
    .replace(/³/g, " cubed")
    .replace(/½/g, "one half")
    .replace(/⅓/g, "one third")
    .replace(/⁴⁄₃/g, "four thirds")
    .replace(/√(\d+)/g, "root $1")
    .replace(/÷/g, "divided by")
    .replace(/×/g, "times")
    .replace(/=/g, "equals")
    .replace(/→/g, "")
    .replace(/°/g, " degrees")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}
