export type MathOperation = '+' | '-' | '×' | '÷';

export type Fraction = {
  n: number; // Numerator
  d: number; // Denominator
};

export type MathProblem = {
  id: string;
  num1: number;
  num2: number;
  operation: MathOperation;
  answer: number;
  displayText: string;
  answerText: string;
  problemSpeechText: string; // e.g. "7 plus 5" or "1 half plus 1 fourth"
  answerSpeechText: string;  // e.g. "equals 12" or "equals 1 half"
  fullSpeechText: string;    // e.g. "7 plus 5 equals 12"
  speechText: string;        // fallback alias

  // Fraction fields (when isFraction === true)
  isFraction?: boolean;
  frac1?: Fraction;
  frac2?: Fraction;
  fracAnswer?: Fraction;
  convertedFrac1?: Fraction;
  convertedFrac2?: Fraction;
  hasConversion?: boolean;
};

export type AppSettingsState = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  showWholeNumbers: boolean;
  showFractions: boolean;
  autoPlayAudio: boolean;
  showCardCount: boolean;
  showTimer: boolean;
  keepScreenAwake: boolean;
  quizOptionCount: number;
  isLocked: boolean;
};

export const OPERATION_COLORS: Record<
  MathOperation,
  { name: string; bg: string; text: string; border: string; hex: string }
> = {
  '+': { name: 'Addition', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', hex: '#10b981' },
  '-': { name: 'Subtraction', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', hex: '#6366f1' },
  '×': { name: 'Multiplication', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', hex: '#f59e0b' },
  '÷': { name: 'Division', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', hex: '#a855f7' },
};
