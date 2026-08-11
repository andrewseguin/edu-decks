import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS } from "@/lib/letters";
import { LetterCase, ReadingDeckSettings } from "@/lib/types";

export function useReadingSettings(): ReadingDeckSettings {
  const [letterCase, setLetterCase] = useLocalStorage<LetterCase>(
    "first-read-letter-case",
    "lower"
  );
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "first-read-selection",
    DEFAULT_LETTERS
  );
  const [gameMode, setGameMode] = useLocalStorage<string>(
    "first-read-gamemode",
    "letters"
  );
  const [wordDifficulty, setWordDifficulty] = useLocalStorage<string>(
    "first-read-word-difficulty",
    "easy"
  );
  const [selectedWordLengths, setSelectedWordLengths] = useLocalStorage<number[]>(
    "first-read-word-lengths",
    [3, 4, 5]
  );
  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>(
    "first-read-show-count",
    true
  );
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    "first-read-show-timer",
    true
  );
  const [enableRecordings, setEnableRecordings] = useLocalStorage<boolean>(
    "first-read-enable-recordings",
    true
  );
  const [quizOptionCount, setQuizOptionCount] = useLocalStorage<number>(
    "first-read-quiz-option-count",
    4
  );
  const [isLocked, setIsLocked] = useLocalStorage<boolean>(
    "first-read-app-locked",
    false
  );
  const [enableTracing, setEnableTracing] = useLocalStorage<boolean>(
    "first-read-enable-tracing",
    true
  );
  const [autoPlaySound, setAutoPlaySound] = useLocalStorage<boolean>(
    "first-read-auto-play-sound",
    false
  );
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>(
    "first-read-keep-awake",
    true
  );
  const [enableHaptic, setEnableHaptic] = useLocalStorage<boolean>(
    "first-read-enable-haptic",
    true
  );

  return {
    letterCase,
    setLetterCase,
    selectedLetters,
    setSelectedLetters,
    gameMode,
    setGameMode,
    wordDifficulty,
    setWordDifficulty,
    selectedWordLengths,
    setSelectedWordLengths,
    showCardCount,
    setShowCardCount,
    showTimer,
    setShowTimer,
    enableRecordings,
    setEnableRecordings,
    quizOptionCount,
    setQuizOptionCount,
    isLocked,
    setIsLocked,
    enableTracing,
    setEnableTracing,
    autoPlaySound,
    setAutoPlaySound,
    keepScreenAwake,
    setKeepScreenAwake,
    enableHaptic,
    setEnableHaptic,
  };
}
