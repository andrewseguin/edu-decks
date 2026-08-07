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
  answerSpeechText: string;  // e.g. "12" or "1 half"
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

export type NumberType = 'whole' | 'fractions';

export type AppSettingsState = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  numberType: NumberType;
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
  '+': { name: 'Addition', bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', hex: '#059669' },
  '-': { name: 'Subtraction', bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-600', hex: '#4f46e5' },
  '×': { name: 'Multiplication', bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-600', hex: '#d97706' },
  '÷': { name: 'Division', bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-600', hex: '#9333ea' },
};
