import { DECK_COLORS } from "@decks/core";

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
  '+': { name: 'Addition', bg: DECK_COLORS.emerald.bg, text: DECK_COLORS.emerald.text, border: DECK_COLORS.emerald.border, hex: DECK_COLORS.emerald.hex },
  '-': { name: 'Subtraction', bg: DECK_COLORS.indigo.bg, text: DECK_COLORS.indigo.text, border: DECK_COLORS.indigo.border, hex: DECK_COLORS.indigo.hex },
  '×': { name: 'Multiplication', bg: DECK_COLORS.amber.bg, text: DECK_COLORS.amber.text, border: DECK_COLORS.amber.border, hex: DECK_COLORS.amber.hex },
  '÷': { name: 'Division', bg: DECK_COLORS.purple.bg, text: DECK_COLORS.purple.text, border: DECK_COLORS.purple.border, hex: DECK_COLORS.purple.hex },
};
