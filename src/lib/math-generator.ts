import { Fraction, MathOperation, MathProblem } from "./types";

function getRandomInt(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

// Helper: Greatest Common Divisor
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Simplify fraction
export function simplifyFraction(n: number, d: number): Fraction {
  if (d === 0) return { n: 0, d: 1 };
  const common = gcd(n, d);
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  return {
    n: sign * Math.abs(n / common),
    d: Math.abs(d / common),
  };
}

// Convert fraction to spoken text (e.g. 1/2 -> "one half", 3/4 -> "three fourths")
export function fractionToWords(f: Fraction): string {
  if (f.d === 1) return `${f.n}`;
  const numNames = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const denSingular = ["", "whole", "half", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  const denPlural = ["", "wholes", "halves", "thirds", "fourths", "fifths", "sixths", "sevenths", "eighths", "ninths", "tenths"];

  const nStr = f.n <= 12 ? numNames[f.n] || `${f.n}` : `${f.n}`;
  const dStr = f.n === 1 ? (denSingular[f.d] || `${f.d}th`) : (denPlural[f.d] || `${f.d}ths`);
  return `${nStr} ${dStr}`;
}

export function formatFractionText(f: Fraction): string {
  if (f.d === 1) return `${f.n}`;
  return `${f.n}/${f.d}`;
}

export function generateMathProblem(
  activeOperations: MathOperation[],
  minRange: number,
  maxRange: number,
  allowNegatives: boolean = false,
  showWholeNumbers: boolean = true,
  showFractions: boolean = false
): MathProblem {
  const operations: MathOperation[] = activeOperations.length > 0 ? activeOperations : ['+'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  // Determine if this problem should be a fraction problem
  let isFraction = false;
  if (showFractions && !showWholeNumbers) {
    isFraction = true;
  } else if (showFractions && showWholeNumbers) {
    isFraction = Math.random() < 0.5;
  } else {
    isFraction = false;
  }

  if (isFraction) {
    return generateFractionProblem(operation, allowNegatives);
  }

  let num1 = 0;
  let num2 = 0;
  let answer = 0;
  let problemSpeechText = '';
  let fullSpeechText = '';
  let displayText = '';

  const safeMin = Math.max(0, minRange);
  const safeMax = Math.max(safeMin + 1, maxRange);

  switch (operation) {
    case '+': {
      num1 = getRandomInt(safeMin, safeMax);
      num2 = getRandomInt(safeMin, safeMax);
      answer = num1 + num2;
      displayText = `${num1} + ${num2}`;
      problemSpeechText = `${num1} plus ${num2}`;
      fullSpeechText = `${num1} plus ${num2} equals ${answer}`;
      break;
    }
    case '-': {
      num1 = getRandomInt(safeMin, safeMax);
      num2 = getRandomInt(safeMin, safeMax);
      if (!allowNegatives && num1 < num2) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      answer = num1 - num2;
      displayText = `${num1} - ${num2}`;
      problemSpeechText = `${num1} minus ${num2}`;
      fullSpeechText = `${num1} minus ${num2} equals ${answer}`;
      break;
    }
    case '×': {
      const multMax = Math.min(safeMax, 12);
      const multMin = Math.min(safeMin, multMax);
      num1 = getRandomInt(multMin, multMax);
      num2 = getRandomInt(multMin, multMax);
      answer = num1 * num2;
      displayText = `${num1} × ${num2}`;
      problemSpeechText = `${num1} times ${num2}`;
      fullSpeechText = `${num1} times ${num2} equals ${answer}`;
      break;
    }
    case '÷': {
      const divMax = Math.min(safeMax, 12);
      const divMin = Math.max(1, Math.min(safeMin, divMax));
      num2 = getRandomInt(divMin, divMax);
      const quotient = getRandomInt(0, divMax);
      num1 = num2 * quotient;
      answer = quotient;
      displayText = `${num1} ÷ ${num2}`;
      problemSpeechText = `${num1} divided by ${num2}`;
      fullSpeechText = `${num1} divided by ${num2} equals ${answer}`;
      break;
    }
  }

  const id = `${operation}-${num1}-${num2}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    num1,
    num2,
    operation,
    answer,
    displayText,
    answerText: `${answer}`,
    problemSpeechText,
    fullSpeechText,
    speechText: problemSpeechText,
    isFraction: false,
  };
}

function generateFractionProblem(
  operation: MathOperation,
  allowNegatives: boolean
): MathProblem {
  const denominators = [2, 3, 4, 6, 8];

  if (operation === '+' || operation === '-') {
    // Pick SAME denominator for clean, intuitive pie visualizers (e.g. 1/4 + 2/4 = 3/4)
    const d = denominators[Math.floor(Math.random() * denominators.length)];
    let n1 = getRandomInt(1, d - 1);
    let n2 = getRandomInt(1, d - 1);

    if (operation === '-' && !allowNegatives && n1 < n2) {
      const temp = n1;
      n1 = n2;
      n2 = temp;
    }

    const frac1: Fraction = { n: n1, d };
    const frac2: Fraction = { n: n2, d };
    const fracAnswer: Fraction = operation === '+'
      ? simplifyFraction(n1 + n2, d)
      : simplifyFraction(n1 - n2, d);

    const text1 = formatFractionText(frac1);
    const text2 = formatFractionText(frac2);
    const textAns = formatFractionText(fracAnswer);

    const words1 = fractionToWords(frac1);
    const words2 = fractionToWords(frac2);
    const wordsAns = fractionToWords(fracAnswer);

    const opWord = operation === '+' ? "plus" : "minus";
    const problemSpeechText = `${words1} ${opWord} ${words2}`;
    const fullSpeechText = `${words1} ${opWord} ${words2} equals ${wordsAns}`;
    const displayText = `${text1} ${operation} ${text2}`;

    const id = `frac-${operation}-${text1}-${text2}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      id,
      num1: frac1.n,
      num2: frac2.n,
      operation,
      answer: fracAnswer.n / fracAnswer.d,
      displayText,
      answerText: textAns,
      problemSpeechText,
      fullSpeechText,
      speechText: problemSpeechText,
      isFraction: true,
      frac1,
      frac2,
      fracAnswer,
    };
  }

  // For Multiplication and Division, pick small clean denominators (2, 3, 4)
  const multDenominators = [2, 3, 4];
  const d1 = multDenominators[Math.floor(Math.random() * multDenominators.length)];
  const d2 = multDenominators[Math.floor(Math.random() * multDenominators.length)];

  let n1 = getRandomInt(1, d1 - 1);
  let n2 = getRandomInt(1, d2 - 1);

  let frac1: Fraction = { n: n1, d: d1 };
  let frac2: Fraction = { n: n2, d: d2 };
  let fracAnswer: Fraction = { n: 1, d: 1 };

  if (operation === '×') {
    fracAnswer = simplifyFraction(frac1.n * frac2.n, frac1.d * frac2.d);
  } else {
    fracAnswer = simplifyFraction(frac1.n * frac2.d, frac1.d * frac2.n);
  }

  const text1 = formatFractionText(frac1);
  const text2 = formatFractionText(frac2);
  const textAns = formatFractionText(fracAnswer);

  const words1 = fractionToWords(frac1);
  const words2 = fractionToWords(frac2);
  const wordsAns = fractionToWords(fracAnswer);

  const opWord = operation === '×' ? "times" : "divided by";
  const problemSpeechText = `${words1} ${opWord} ${words2}`;
  const fullSpeechText = `${words1} ${opWord} ${words2} equals ${wordsAns}`;
  const displayText = `${text1} ${operation} ${text2}`;

  const id = `frac-${operation}-${text1}-${text2}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    num1: frac1.n,
    num2: frac2.n,
    operation,
    answer: fracAnswer.n / fracAnswer.d,
    displayText,
    answerText: textAns,
    problemSpeechText,
    fullSpeechText,
    speechText: problemSpeechText,
    isFraction: true,
    frac1,
    frac2,
    fracAnswer,
  };
}
