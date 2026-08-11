export type LetterCase = "lower" | "upper" | "mixed";

export type DisplayContent = {
  key: string;
  type: "letter" | "message" | "word";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
  isHardWord?: boolean;
};

export type ReadingDeckSettings = {
  letterCase: LetterCase;
  setLetterCase: (val: LetterCase | ((val: LetterCase) => LetterCase)) => void;
  selectedLetters: string[];
  setSelectedLetters: React.Dispatch<React.SetStateAction<string[]>>;
  gameMode: string;
  setGameMode: (val: string | ((val: string) => string)) => void;
  wordDifficulty: string;
  setWordDifficulty: (val: string | ((val: string) => string)) => void;
  selectedWordLengths: number[];
  setSelectedWordLengths: (val: number[] | ((val: number[]) => number[])) => void;
  showCardCount: boolean;
  setShowCardCount: (val: boolean | ((val: boolean) => boolean)) => void;
  showTimer: boolean;
  setShowTimer: (val: boolean | ((val: boolean) => boolean)) => void;
  enableRecordings: boolean;
  setEnableRecordings: (val: boolean | ((val: boolean) => boolean)) => void;
  quizOptionCount: number;
  setQuizOptionCount: (val: number | ((val: number) => number)) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean | ((val: boolean) => boolean)) => void;
  enableTracing: boolean;
  setEnableTracing: (val: boolean | ((val: boolean) => boolean)) => void;
  autoPlaySound: boolean;
  setAutoPlaySound: (val: boolean | ((val: boolean) => boolean)) => void;
  keepScreenAwake: boolean;
  setKeepScreenAwake: (val: boolean | ((val: boolean) => boolean)) => void;
  enableHaptic: boolean;
  setEnableHaptic: (val: boolean | ((val: boolean) => boolean)) => void;
};
