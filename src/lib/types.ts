export type Operation = '+' | '-' | '×' | '÷';
export type MathOperation = Operation;

export type NumberType = 'whole' | 'fractions';

export type Fraction = {
  n: number;
  d: number;
};

export type MathProblem = {
  id: string;
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
  spokenText: string;
  problemSpeechText?: string;
  fullSpeechText?: string;
  answerText?: string;
  // Fraction fields
  isFraction?: boolean;
  frac1?: Fraction;
  frac2?: Fraction;
  fracAnswer?: Fraction;
  // Equivalent common denominator or unsimplified intermediate step
  convertedFrac1?: Fraction;
  convertedFrac2?: Fraction;
  rawFracAnswer?: Fraction;
  hasConversion?: boolean;
};

export const OPERATION_COLORS: Record<Operation, { name: string; hex: string; bg: string; border: string; text: string }> = {
  '+': { name: 'cyan', hex: '#06b6d4', bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-300' },
  '-': { name: 'pink', hex: '#ec4899', bg: 'bg-pink-500/20', border: 'border-pink-400', text: 'text-pink-300' },
  '×': { name: 'amber', hex: '#f59e0b', bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-300' },
  '÷': { name: 'purple', hex: '#a855f7', bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-300' },
};

export type DeckSettings = {
  operations: Operation[];
  showWholeNumbers: boolean;
  showFractions: boolean;
  minNumber: number;
  maxNumber: number;
  allowNegatives: boolean;
  cardCount: number;
};

export type AppMode = 'deck' | 'quiz';

export type QuizStats = {
  totalAnswered: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
};
