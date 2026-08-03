import { MathProblem, Operation, Fraction } from './types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Greatest Common Divisor helper
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Helper: Least Common Multiple
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// Simplify a fraction
function simplifyFraction(n: number, d: number): Fraction {
  const g = gcd(n, d);
  return {
    n: n / g,
    d: d / g,
  };
}

// Clean fraction generator (produces intuitive, visually clear fractions)
function generateFractionProblem(op: Operation): MathProblem {
  const denominators = [2, 3, 4, 6, 8];
  
  let f1: Fraction = { n: 1, d: 2 };
  let f2: Fraction = { n: 1, d: 2 };
  let fracAnswer: Fraction = { n: 1, d: 1 };
  let convertedFrac1: Fraction | undefined;
  let convertedFrac2: Fraction | undefined;
  let rawFracAnswer: Fraction | undefined;
  let hasConversion = false;

  if (op === '+') {
    let d1 = denominators[getRandomInt(0, denominators.length - 1)];
    let d2 = denominators[getRandomInt(0, denominators.length - 1)];
    
    while (lcm(d1, d2) > 12) {
      d1 = denominators[getRandomInt(0, denominators.length - 1)];
      d2 = denominators[getRandomInt(0, denominators.length - 1)];
    }

    const n1 = getRandomInt(1, d1 - 1);
    const n2 = getRandomInt(1, d2 - 1);

    f1 = { n: n1, d: d1 };
    f2 = { n: n2, d: d2 };

    const commonD = lcm(d1, d2);
    const c1 = n1 * (commonD / d1);
    const c2 = n2 * (commonD / d2);
    const rawN = c1 + c2;

    fracAnswer = simplifyFraction(rawN, commonD);

    if (d1 !== d2 || fracAnswer.n !== rawN || fracAnswer.d !== commonD) {
      hasConversion = true;
      convertedFrac1 = { n: c1, d: commonD };
      convertedFrac2 = { n: c2, d: commonD };
      rawFracAnswer = { n: rawN, d: commonD };
    }
  } else if (op === '-') {
    let d1 = denominators[getRandomInt(0, denominators.length - 1)];
    let d2 = denominators[getRandomInt(0, denominators.length - 1)];

    while (lcm(d1, d2) > 12) {
      d1 = denominators[getRandomInt(0, denominators.length - 1)];
      d2 = denominators[getRandomInt(0, denominators.length - 1)];
    }

    const commonD = lcm(d1, d2);
    let c1 = getRandomInt(2, commonD);
    let c2 = getRandomInt(1, c1 - 1);

    const n1 = (c1 * d1) / commonD;
    const n2 = (c2 * d2) / commonD;

    if (!Number.isInteger(n1) || !Number.isInteger(n2) || n1 <= 0 || n2 <= 0) {
      d1 = 4;
      d2 = 4;
      c1 = 3;
      c2 = 1;
      f1 = { n: 3, d: 4 };
      f2 = { n: 1, d: 4 };
    } else {
      f1 = { n: n1, d: d1 };
      f2 = { n: n2, d: d2 };
    }

    const finalCommonD = lcm(f1.d, f2.d);
    const finalC1 = f1.n * (finalCommonD / f1.d);
    const finalC2 = f2.n * (finalCommonD / f2.d);
    const rawN = finalC1 - finalC2;

    fracAnswer = simplifyFraction(rawN, finalCommonD);

    if (f1.d !== f2.d || fracAnswer.n !== rawN || fracAnswer.d !== finalCommonD) {
      hasConversion = true;
      convertedFrac1 = { n: finalC1, d: finalCommonD };
      convertedFrac2 = { n: finalC2, d: finalCommonD };
      rawFracAnswer = { n: rawN, d: finalCommonD };
    }
  } else if (op === '×') {
    const d1 = denominators[getRandomInt(0, 3)];
    const d2 = denominators[getRandomInt(0, 3)];
    const n1 = getRandomInt(1, d1);
    const n2 = getRandomInt(1, d2);

    f1 = { n: n1, d: d1 };
    f2 = { n: n2, d: d2 };

    const rawN = n1 * n2;
    const rawD = d1 * d2;

    fracAnswer = simplifyFraction(rawN, rawD);
    rawFracAnswer = { n: rawN, d: rawD };

    if (rawN !== fracAnswer.n || rawD !== fracAnswer.d) {
      hasConversion = true;
      convertedFrac1 = f1;
      convertedFrac2 = f2;
    }
  } else if (op === '÷') {
    const d1 = denominators[getRandomInt(0, 3)];
    const d2 = denominators[getRandomInt(0, 3)];
    const n1 = getRandomInt(1, d1);
    const n2 = getRandomInt(1, d2);

    f1 = { n: n1, d: d1 };
    f2 = { n: n2, d: d2 };

    const rawN = n1 * f2.d;
    const rawD = d1 * f2.n;

    fracAnswer = simplifyFraction(rawN, rawD);
    rawFracAnswer = { n: rawN, d: rawD };

    if (rawN !== fracAnswer.n || rawD !== fracAnswer.d) {
      hasConversion = true;
      convertedFrac1 = f1;
      convertedFrac2 = { n: f2.d, d: f2.n };
    }
  }

  const opWordMap: Record<Operation, string> = {
    '+': 'plus',
    '-': 'minus',
    '×': 'times',
    '÷': 'divided by',
  };

  const f1Text = f1.d === 1 ? `${f1.n}` : `${f1.n} ${f1.d === 2 ? 'half' : f1.d === 4 ? 'quarter' : 'over ' + f1.d}`;
  const f2Text = f2.d === 1 ? `${f2.n}` : `${f2.n} ${f2.d === 2 ? 'half' : f2.d === 4 ? 'quarter' : 'over ' + f2.d}`;
  const ansText = fracAnswer.d === 1 ? `${fracAnswer.n}` : `${fracAnswer.n} over ${fracAnswer.d}`;

  return {
    id: `frac-${op}-${f1.n}-${f1.d}-${f2.n}-${f2.d}-${Math.random().toString(36).substring(2, 7)}`,
    num1: f1.n,
    num2: f2.n,
    operation: op,
    answer: fracAnswer.n / fracAnswer.d,
    options: [],
    spokenText: `${f1Text} ${opWordMap[op]} ${f2Text} equals ${ansText}`,
    isFraction: true,
    frac1: f1,
    frac2: f2,
    fracAnswer,
    convertedFrac1,
    convertedFrac2,
    rawFracAnswer,
    hasConversion,
  };
}

export function generateMathProblem(
  operations: Operation[],
  min: number,
  max: number,
  allowNegatives: boolean,
  showWholeNumbers: boolean = true,
  showFractions: boolean = false
): MathProblem {
  if (showFractions && (!showWholeNumbers || Math.random() < 0.5)) {
    const validFractionOps = operations.filter((op) => op === '+' || op === '-' || op === '×' || op === '÷');
    const selectedOp = validFractionOps.length > 0 
      ? validFractionOps[getRandomInt(0, validFractionOps.length - 1)]
      : operations[getRandomInt(0, operations.length - 1)];

    return generateFractionProblem(selectedOp);
  }

  const operation = operations[getRandomInt(0, operations.length - 1)];
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  switch (operation) {
    case '+': {
      num1 = getRandomInt(min, max);
      num2 = getRandomInt(min, max);
      answer = num1 + num2;
      break;
    }
    case '-': {
      num1 = getRandomInt(min, max);
      if (allowNegatives) {
        num2 = getRandomInt(min, max);
      } else {
        num2 = getRandomInt(min, num1);
      }
      answer = num1 - num2;
      break;
    }
    case '×': {
      const maxFactor = Math.min(max, 12);
      const minFactor = Math.max(min, 0);
      num1 = getRandomInt(minFactor, maxFactor);
      num2 = getRandomInt(minFactor, maxFactor);
      answer = num1 * num2;
      break;
    }
    case '÷': {
      const maxDivisor = Math.min(max, 12);
      const minDivisor = Math.max(min, 1);
      num2 = getRandomInt(minDivisor, maxDivisor);
      answer = getRandomInt(1, 12);
      num1 = num2 * answer;
      break;
    }
  }

  const optionsSet = new Set<number>();
  optionsSet.add(answer);

  const range = Math.max(5, Math.abs(answer));
  let attempts = 0;
  while (optionsSet.size < 4 && attempts < 50) {
    attempts++;
    const offset = getRandomInt(-4, 4);
    if (offset === 0) continue;
    const wrongOpt = answer + offset;

    if (!allowNegatives && wrongOpt < 0) continue;
    optionsSet.add(wrongOpt);
  }

  while (optionsSet.size < 4) {
    const wrongOpt = answer + optionsSet.size + 1;
    optionsSet.add(wrongOpt);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  const opWordMap: Record<Operation, string> = {
    '+': 'plus',
    '-': 'minus',
    '×': 'times',
    '÷': 'divided by',
  };

  const spokenText = `${num1} ${opWordMap[operation]} ${num2} equals ${answer}`;

  return {
    id: `${operation}-${num1}-${num2}-${Math.random().toString(36).substring(2, 7)}`,
    num1,
    num2,
    operation,
    answer,
    options,
    spokenText,
    isFraction: false,
  };
}

export function generateDeck(
  count: number,
  operations: Operation[],
  min: number,
  max: number,
  allowNegatives: boolean,
  showWholeNumbers: boolean = true,
  showFractions: boolean = false
): MathProblem[] {
  const deck: MathProblem[] = [];
  for (let i = 0; i < count; i++) {
    deck.push(generateMathProblem(operations, min, max, allowNegatives, showWholeNumbers, showFractions));
  }
  return deck;
}
