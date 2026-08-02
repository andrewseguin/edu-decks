export type MathOperation = '+' | '-' | '×' | '÷';

export type MathProblem = {
  id: string;
  num1: number;
  num2: number;
  operation: MathOperation;
  answer: number;
  displayText: string;
  answerText: string;
  problemSpeechText: string; // e.g. "7 plus 5"
  fullSpeechText: string;    // e.g. "7 plus 5 equals 12"
  speechText: string;        // fallback alias
};

export type AppSettingsState = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  autoPlayAudio: boolean;
  showCardCount: boolean;
  showTimer: boolean;
  keepScreenAwake: boolean;
  quizOptionCount: number; // 4, 6, or 8
};

export const OPERATION_COLORS: Record<MathOperation, {
  hex: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  bgGlow: string;
  accent: string;
  name: string;
}> = {
  '+': {
    hex: '#047857',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/10',
    bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
    accent: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    name: 'Addition',
  },
  '-': {
    hex: '#B45309',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    badgeText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30 dark:border-amber-500/40 shadow-amber-500/10',
    bgGlow: 'from-amber-500/10 via-transparent to-transparent',
    accent: 'bg-amber-600 hover:bg-amber-700 text-white',
    name: 'Subtraction',
  },
  '×': {
    hex: '#6D28D9',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    badgeText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30 dark:border-purple-500/40 shadow-purple-500/10',
    bgGlow: 'from-purple-500/10 via-transparent to-transparent',
    accent: 'bg-purple-600 hover:bg-purple-700 text-white',
    name: 'Multiplication',
  },
  '÷': {
    hex: '#0369A1',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    badgeText: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30 dark:border-sky-500/40 shadow-sky-500/10',
    bgGlow: 'from-sky-500/10 via-transparent to-transparent',
    accent: 'bg-sky-600 hover:bg-sky-700 text-white',
    name: 'Division',
  },
};
