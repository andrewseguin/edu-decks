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
      const available = selectedLetters.length > 0 ? selectedLetters : ALL_LETTERS.map((l) => l.char);
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
    const letterPool = selectedLetters.length > 0 ? selectedLetters : ALL_LETTERS.map((l) => l.char);
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
        // Words mode
        if (item.isHardWord) {
          const utterance = new SpeechSynthesisUtterance(item.value);
          utterance.onend = () => setIsPlayingSound(false);
          window.speechSynthesis.speak(utterance);
          return;
        }

        const segments = splitIntoPhonicsSegments(item.value);
        let index = 0;

        const playNext = () => {
          if (index < segments.length) {
            const seg = segments[index];
            const soundKey = getSoundKeyForSegment(seg);
            const buffer = buffers[soundKey];

            if (buffer) {
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              currentSourceRef.current = source;
              source.onended = () => {
                index++;
                playNext();
              };
              source.start(0);
            } else {
              index++;
              playNext();
            }
          } else {
            // After phonics, speak full word
            const utterance = new SpeechSynthesisUtterance(item.value);
            utterance.onend = () => setIsPlayingSound(false);
            window.speechSynthesis.speak(utterance);
          }
        };

        playNext();
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
        (l) => l.char !== target.value && !distractors.some((d) => d.value === l.char)
      )
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - distractors.length)
        .map((l) => ({
          value: l.char,
          displayValue: formatText(l.char),
          color: l.color,
          textColor: l.textColor,
        }));
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
    <div className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onExit}
        >
          <X className="w-4 h-4" />
          <span>Exit Quiz</span>
        </Button>

        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Score: {score}</span>
          {streak > 1 && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Center Audio Target Replay */}
      <div className="flex flex-col items-center justify-center my-4 gap-3">
        <p className="text-muted-foreground font-headline text-lg sm:text-xl font-medium">
          Which one matches the sound?
        </p>

        <Button
          size="lg"
          variant="default"
          className={cn(
            "h-20 w-20 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center",
            isPlayingSound ? "animate-pulse ring-4 ring-primary/40 bg-primary" : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => targetItem && playAudio(targetItem)}
          aria-label="Replay sound"
        >
          <Volume2 className="h-10 w-10 text-primary-foreground" />
        </Button>
        <span className="text-xs text-muted-foreground font-medium">Tap to hear sound again</span>
      </div>

      {/* 2x2 Options Grid */}
      <div className="w-full max-w-xl mx-auto grid grid-cols-2 gap-4 mb-4">
        {options.map((item) => {
          const isSelected = selectedOption === item.value;
          const isSelectedCorrect = isSelected && isCorrect === true;
          const isSelectedIncorrect = isSelected && isCorrect === false;

          return (
            <button
              key={item.value}
              className={cn(
                "h-28 sm:h-36 rounded-2xl flex items-center justify-center text-4xl sm:text-6xl font-headline font-bold shadow-md transition-all active:scale-95 relative overflow-hidden border-2 border-transparent",
                isSelectedCorrect && "bg-emerald-500 text-white scale-105 ring-4 ring-emerald-400/50 border-emerald-400",
                isSelectedIncorrect && "bg-destructive/20 text-destructive border-destructive",
                !isSelected && "bg-card text-card-foreground hover:border-primary/40 hover:scale-[1.02]"
              )}
              style={
                !isSelected && item.color
                  ? { backgroundColor: `${item.color}15`, color: item.color }
                  : undefined
              }
              onClick={() => handleSelectOption(item)}
            >
              {item.displayValue}
              {isSelectedCorrect && (
                <CheckCircle2 className="absolute top-2 right-2 w-6 h-6 text-white animate-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
