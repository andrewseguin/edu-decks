"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, X, Sparkles, CheckCircle2 } from "lucide-react";
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
      const validWords = wordPool.filter((word) => {
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

      if (validWords.length > 0) {
        return validWords.map((w) => {
          const isHard = HARD_WORDS.includes(w);
          return {
            value: w,
            displayValue: formatText(w),
            isHardWord: isHard,
            color: isHard ? "#8B5CF6" : "#059669",
            textColor: "#FFFFFF",
          };
        });
      }
    }

    // Default to letters mode
    const letterPool = selectedLetters.length > 0 ? selectedLetters : ALL_LETTERS;
    return letterPool.map((char) => {
      const data = getLetterInfo(char);
      return {
        value: char,
        displayValue: formatText(char),
        color: data?.color || "#F9991F",
        textColor: data?.textColor || "#FFFFFF",
      };
    });
  }, [gameMode, selectedLetters, selectedWordLengths, wordDifficulty, formatText]);

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
        const utterance = new SpeechSynthesisUtterance(item.value);
        utterance.onend = () => setIsPlayingSound(false);
        utterance.onerror = () => setIsPlayingSound(false);
        window.speechSynthesis.speak(utterance);
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

    // Pick 3 distractors
    const remaining = pool.filter((i) => i.value !== target.value);
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);

    // If pool is small (< 4), fallback to general letters for distractors
    let distractors = shuffledRemaining.slice(0, 3);
    if (distractors.length < 3) {
      const extraLetters = ALL_LETTERS.filter(
        (char) => char !== target.value && !distractors.some((d) => d.value === char)
      )
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - distractors.length)
        .map((char) => {
          const info = getLetterInfo(char);
          return {
            value: char,
            displayValue: formatText(char),
            color: info?.color || "#F9991F",
            textColor: info?.textColor || "#FFFFFF",
          };
        });
      distractors = [...distractors, ...extraLetters];
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
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-300 select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
          onPointerDown={(e) => {
            e.stopPropagation();
            onExit();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Quiz</span>
        </Button>

        {/* Compact Center Replay Button */}
        <Button
          size="sm"
          variant="default"
          className={cn(
            "rounded-full gap-2 px-4 py-1.5 font-headline font-bold text-sm shadow-md transition-transform active:scale-95 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
            isPlayingSound ? "animate-pulse bg-primary scale-105" : "bg-primary hover:bg-primary/90"
          )}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (targetItem) playAudio(targetItem);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (targetItem) playAudio(targetItem);
          }}
          aria-label="Replay sound"
        >
          <Volume2 className="w-4 h-4 text-primary-foreground" />
          <span>Replay Sound</span>
        </Button>

        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-bold text-sm shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>{score}</span>
          {streak > 1 && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* 2x2 Options Grid - balanced aspect ratio with giant letter scaling */}
      <div className="w-full max-w-2xl mx-auto flex-1 grid grid-cols-2 gap-3 sm:gap-6 my-auto max-h-[72vh] p-2 min-h-0 items-center">
        {options.map((item) => {
          const isSelected = selectedOption === item.value;
          const isSelectedCorrect = isSelected && isCorrect === true;
          const isSelectedIncorrect = isSelected && isCorrect === false;
          const isSingleChar = item.displayValue.length === 1;

          return (
            <button
              key={item.value}
              className={cn(
                "h-full w-full rounded-3xl flex items-center justify-center font-headline font-bold shadow-lg transition-all active:scale-95 relative overflow-hidden border-4 border-transparent p-2 min-h-[22vh] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none",
                !isSingleChar && "text-3xl sm:text-5xl md:text-6xl",
                isSelectedCorrect && "bg-emerald-500 text-white scale-105 border-emerald-400 z-10 shadow-2xl shadow-emerald-500/30",
                isSelectedIncorrect && "bg-destructive/20 text-destructive border-destructive",
                !isSelected && "bg-card text-card-foreground hover:border-primary/40 hover:scale-[1.01]"
              )}
              style={{
                fontSize: isSingleChar ? "clamp(6rem, 22vh, 16rem)" : undefined,
                fontWeight: isSingleChar ? 300 : 700,
                lineHeight: 1,
                backgroundColor: !isSelected && item.color ? `${item.color}15` : undefined,
                color: !isSelected && item.color ? item.color : undefined,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleSelectOption(item);
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
    </div>
  );
}
