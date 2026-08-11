"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, X, Sparkles, CheckCircle2 } from "lucide-react";
import { DeckQuizManager, DECK_COLORS, triggerHaptic } from "@decks/core";
import { Button } from "@/components/ui/button";
import { getLetterInfo, ALL_LETTERS } from "@/lib/letters";
import { EASY_WORDS, HARD_WORDS } from "@/lib/words";
import { splitIntoPhonicsSegments, getSoundKeyForSegment } from "@/lib/phonics";
import { useAudio } from "@/components/AudioProvider";
import { cn } from "@/lib/utils";

type QuizDisplayProps = {
  gameMode: string;
  selectedLetters: string[];
  selectedWordLengths: number[];
  wordDifficulty: string;
  letterCase: "lower" | "upper" | "mixed";
  optionCount?: number;
  onExit: () => void;
};

type QuizItem = {
  value: string;
  displayValue: string;
  color?: string;
  textColor?: string;
  isHardWord?: boolean;
};

export function QuizDisplay({
  gameMode,
  selectedLetters,
  selectedWordLengths,
  wordDifficulty,
  letterCase,
  optionCount = 4,
  onExit,
}: QuizDisplayProps) {
  const audioData = useAudio();
  const audioContext = audioData?.audioContext;
  const buffers = audioData?.buffers;

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetItem, setTargetItem] = useState<QuizItem | null>(null);
  const [options, setOptions] = useState<QuizItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format casing
  const formatText = useCallback(
    (text: string) => {
      if (letterCase === "upper") return text.toUpperCase();
      if (letterCase === "mixed") {
        return Math.random() > 0.5 ? text.toUpperCase() : text.toLowerCase();
      }
      return text.toLowerCase();
    },
    [letterCase]
  );

  // Generate available items pool based on current settings
  const getPool = useCallback((): QuizItem[] => {
    if (gameMode === "words") {
      const available = selectedLetters.length > 0 ? selectedLetters : ALL_LETTERS;
      const wordPool = wordDifficulty === "easy" ? EASY_WORDS : [...EASY_WORDS, ...HARD_WORDS];
      let validWords = wordPool.filter((word) => {
        if (!selectedWordLengths.includes(word.length)) return false;
        let i = 0;
        while (i < word.length) {
          let matched = false;
          if (i + 1 < word.length) {
            const pair = word.substring(i, i + 2);
            if (available.includes(pair)) {
              matched = true;
              i += 2;
              continue;
            }
          }
          if (available.includes(word[i])) {
            matched = true;
            i += 1;
            continue;
          }
          if (!matched) return false;
        }
        return true;
      });

      // If validWords is smaller than optionCount, expand with other words matching selected lengths
      if (validWords.length < optionCount) {
        const matchingLengthWords = wordPool.filter(
          (w) => selectedWordLengths.includes(w.length) && !validWords.includes(w)
        );
        validWords = [...validWords, ...matchingLengthWords];
      }

      // If still smaller than optionCount, fill with any available words in wordPool
      if (validWords.length < optionCount) {
        const extraPoolWords = wordPool.filter((w) => !validWords.includes(w));
        validWords = [...validWords, ...extraPoolWords];
      }

      return validWords.map((w) => {
        const isHard = HARD_WORDS.includes(w);
        return {
          value: w,
          displayValue: formatText(w),
          isHardWord: isHard,
          color: isHard ? DECK_COLORS.purple.hex : DECK_COLORS.emerald.hex,
          textColor: "#FFFFFF",
        };
      });
    }

    // Default to letters mode
    const letterPool = selectedLetters.length > 0 ? selectedLetters : ALL_LETTERS;
    return letterPool.map((char) => {
      const data = getLetterInfo(char);
      return {
        value: char,
        displayValue: formatText(char),
        color: data?.color || DECK_COLORS.amber.hex,
        textColor: data?.textColor || "#FFFFFF",
      };
    });
  }, [gameMode, selectedLetters, selectedWordLengths, wordDifficulty, optionCount, formatText]);

  const stopAudio = useCallback(() => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null;
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current.disconnect();
      currentSourceRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSound(false);
  }, []);

  // Play audio for a target item
  const playAudio = useCallback(
    async (item: QuizItem) => {
      stopAudio();
      if (!audioContext || !buffers) return;

      setIsPlayingSound(true);

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (gameMode === "letters") {
        const soundKey = getSoundKeyForSegment(item.value);
        const buffer = buffers[soundKey];
        if (buffer) {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          currentSourceRef.current = source;
          source.onended = () => {
            setIsPlayingSound(false);
            currentSourceRef.current = null;
          };
          source.start(0);
        } else {
          setIsPlayingSound(false);
        }
      } else {
        // Words mode: Speak full word cleanly for Quiz prompt
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const mp3Url = `${basePath}/sounds/words/${item.value.toLowerCase()}.mp3`;
        const audio = new Audio(mp3Url);

        audio.onended = () => setIsPlayingSound(false);
        audio.onerror = () => {
          const utterance = new SpeechSynthesisUtterance(item.value);
          utterance.onend = () => setIsPlayingSound(false);
          utterance.onerror = () => setIsPlayingSound(false);
          window.speechSynthesis.speak(utterance);
        };

        audio.play().catch(() => {
          const utterance = new SpeechSynthesisUtterance(item.value);
          utterance.onend = () => setIsPlayingSound(false);
          utterance.onerror = () => setIsPlayingSound(false);
          window.speechSynthesis.speak(utterance);
        });
      }
    },
    [audioContext, buffers, gameMode, stopAudio]
  );

  // Generate new question round
  const nextQuestion = useCallback(() => {
    stopAudio();
    setSelectedOption(null);
    setIsCorrect(null);

    const pool = getPool();
    if (pool.length === 0) return;

    // Pick 1 target
    const target = pool[Math.floor(Math.random() * pool.length)];

    // Pick distractors based on optionCount
    const requiredDistractorCount = Math.max(1, optionCount - 1);
    const remaining = pool.filter((i) => i.value !== target.value);
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);

    // If pool is small, fallback to general items for distractors
    let distractors = shuffledRemaining.slice(0, requiredDistractorCount);
    if (distractors.length < requiredDistractorCount) {
      if (gameMode === "words") {
        const wordPool = wordDifficulty === "easy" ? EASY_WORDS : [...EASY_WORDS, ...HARD_WORDS];
        const extraWords = wordPool
          .filter(
            (w) => w !== target.value && !distractors.some((d) => d.value === w)
          )
          .sort(() => Math.random() - 0.5)
          .slice(0, requiredDistractorCount - distractors.length)
          .map((w) => {
            const isHard = HARD_WORDS.includes(w);
            return {
              value: w,
              displayValue: formatText(w),
              isHardWord: isHard,
              color: isHard ? DECK_COLORS.purple.hex : DECK_COLORS.emerald.hex,
              textColor: "#FFFFFF",
            };
          });
        distractors = [...distractors, ...extraWords];
      } else {
        const extraLetters = ALL_LETTERS.filter(
          (char) => char !== target.value && !distractors.some((d) => d.value === char)
        )
          .sort(() => Math.random() - 0.5)
          .slice(0, requiredDistractorCount - distractors.length)
          .map((char) => {
            const info = getLetterInfo(char);
            return {
              value: char,
              displayValue: formatText(char),
              color: info?.color || DECK_COLORS.amber.hex,
              textColor: info?.textColor || "#FFFFFF",
            };
          });
        distractors = [...distractors, ...extraLetters];
      }
    }

    const roundOptions = [target, ...distractors].sort(() => Math.random() - 0.5);

    setTargetItem(target);
    setOptions(roundOptions);

    // Auto-play sound after 500ms delay
    playTimeoutRef.current = setTimeout(() => {
      playAudio(target);
    }, 500);
  }, [getPool, playAudio, stopAudio, formatText]);

  // Initial load
  useEffect(() => {
    nextQuestion();
    return () => stopAudio();
  }, []);

  // Handle user selecting an option card
  const handleSelectOption = (item: QuizItem) => {
    if (!targetItem || selectedOption !== null) return;

    // Trigger haptic IMMEDIATELY within active touch gesture
    if (item.value === targetItem.value) {
      triggerHaptic("success");
    } else {
      triggerHaptic("warning");
    }

    stopAudio(); // Stop any prompt sound immediately!
    setSelectedOption(item.value);

    if (item.value === targetItem.value) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setStreak((s) => s + 1);

      // Play success chime
      if (audioContext) {
        try {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.15, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start();
          osc.stop(audioContext.currentTime + 0.3);
        } catch (e) {}
      }

      // Advance after 1 second
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setIsCorrect(false);
      setStreak(0);
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 800);
    }
  };

  return (
    <DeckQuizManager
      score={score}
      streak={streak}
      onExit={onExit}
      onReplayAudio={() => {
        if (targetItem) playAudio(targetItem);
      }}
      isPlayingSound={isPlayingSound}
      replayLabel="Replay Sound"
      contentClassName="max-w-6xl"
      prompt={null}
      input={
        /* Dynamic Options Grid - 4, 6, or 8 options layout */
        <div
          className={cn(
            "w-full mx-auto flex-1 grid my-auto p-2 min-h-0 items-center",
            options.length <= 4
              ? "max-w-2xl grid-cols-2 gap-3 sm:gap-6 max-h-[72vh]"
              : options.length <= 6
              ? "max-w-4xl grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 max-h-[78vh]"
              : "max-w-5xl grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-h-[82vh]"
          )}
        >
          {options.map((item) => {
            const isSelected = selectedOption === item.value;
            const isSelectedCorrect = isSelected && isCorrect === true;
            const isSelectedIncorrect = isSelected && isCorrect === false;
            const isSingleChar = item.displayValue.length === 1;
            const count = options.length;

            const minCardHeight =
              count <= 4 ? "min-h-[22vh]" : count <= 6 ? "min-h-[16vh]" : "min-h-[12vh]";

            const fontSizeClamp =
              count <= 4
                ? "clamp(5.5rem, 20vh, 15rem)"
                : count <= 6
                ? "clamp(4rem, 14vh, 9rem)"
                : "clamp(2.8rem, 11vh, 7.5rem)";

            const wordFontSizeClass =
              count <= 4
                ? "text-3xl sm:text-5xl md:text-6xl"
                : count <= 6
                ? "text-2xl sm:text-4xl md:text-5xl"
                : "text-xl sm:text-2xl md:text-3xl";

            return (
              <button
                key={item.value}
                className={cn(
                  "h-full w-full rounded-3xl flex items-center justify-center font-headline font-bold shadow-lg transition-all active:scale-95 relative overflow-hidden border-4 border-transparent p-2 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none",
                  minCardHeight,
                  !isSingleChar && wordFontSizeClass,
                  isSelectedCorrect && "bg-emerald-500 text-white scale-105 border-emerald-400 z-10 shadow-2xl shadow-emerald-500/30",
                  isSelectedIncorrect && "bg-destructive/20 text-destructive border-destructive",
                  !isSelected && "bg-card text-card-foreground hover:bg-accent/30 hover:scale-[1.01]"
                )}
                style={{
                  fontSize: isSingleChar ? fontSizeClamp : undefined,
                  fontWeight: isSingleChar ? 300 : 700,
                  lineHeight: 1,
                  backgroundColor: !isSelected && item.color ? `${item.color}15` : undefined,
                  color: !isSelected && item.color ? item.color : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption(item);
                }}
              >
                <span className="select-none inline-block leading-none transform translate-y-[2%]">{item.displayValue}</span>
                {isSelectedCorrect && (
                  <CheckCircle2 className="absolute top-3 right-3 w-8 h-8 text-white animate-in zoom-in" />
                )}
              </button>
            );
          })}
        </div>
      }
    />
  );
}
