import { MathOperation, MathProblem } from "./types";

function getRandomInt(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function generateMathProblem(
  activeOperations: MathOperation[],
  minRange: number,
  maxRange: number,
  allowNegatives: boolean = false
): MathProblem {
  const operations: MathOperation[] = activeOperations.length > 0 ? activeOperations : ['+'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1 = 0;
  let num2 = 0;
  let answer = 0;
  let speechText = '';
  let displayText = '';

  const safeMin = Math.max(0, minRange);
  const safeMax = Math.max(safeMin + 1, maxRange);

  switch (operation) {
    case '+': {
      num1 = getRandomInt(safeMin, safeMax);
      num2 = getRandomInt(safeMin, safeMax);
      answer = num1 + num2;
      displayText = `${num1} + ${num2}`;
      speechText = `${num1} plus ${num2} equals ${answer}`;
      break;
    }
    case '-': {
      num1 = getRandomInt(safeMin, safeMax);
      num2 = getRandomInt(safeMin, safeMax);
      if (!allowNegatives && num1 < num2) {
        // Swap so answer is non-negative
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      answer = num1 - num2;
      displayText = `${num1} - ${num2}`;
      speechText = `${num1} minus ${num2} equals ${answer}`;
      break;
    }
    case '×': {
      // Limit range slightly for kids multiplication to keep it manageable if maxRange > 12
      const multMax = Math.min(safeMax, 12);
      const multMin = Math.min(safeMin, multMax);
      num1 = getRandomInt(multMin, multMax);
      num2 = getRandomInt(multMin, multMax);
      answer = num1 * num2;
      displayText = `${num1} × ${num2}`;
      speechText = `${num1} times ${num2} equals ${answer}`;
      break;
    }
    case '÷': {
      // Ensure whole-number quotient and non-zero divisor
      const divMax = Math.min(safeMax, 12);
      const divMin = Math.max(1, Math.min(safeMin, divMax));
      num2 = getRandomInt(divMin, divMax); // Divisor
      const quotient = getRandomInt(0, divMax); // Answer
      num1 = num2 * quotient; // Dividend
      answer = quotient;
      displayText = `${num1} ÷ ${num2}`;
      speechText = `${num1} divided by ${num2} equals ${answer}`;
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
    speechText,
  };
}

export function generateQuizOptions(
  problem: MathProblem,
  count: number,
  minRange: number,
  maxRange: number
): number[] {
  const correctAnswer = problem.answer;
  const optionsSet = new Set<number>([correctAnswer]);

  const candidates: number[] = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 10,
    correctAnswer - 10,
    correctAnswer + 5,
    correctAnswer - 5,
    problem.num1 + problem.num2,
    Math.abs(problem.num1 - problem.num2),
  ];

  // Filter valid candidate numbers
  for (const c of candidates) {
    if (optionsSet.size >= count) break;
    if (!Number.isNaN(c) && (c >= 0 || problem.answer < 0)) {
      optionsSet.add(c);
    }
  }

  // If we still need more options, generate random nearby numbers
  let attempts = 0;
  while (optionsSet.size < count && attempts < 100) {
    attempts++;
    const delta = getRandomInt(-10, 10);
    const randAns = correctAnswer + delta;
    if (randAns !== correctAnswer && randAns >= 0) {
      optionsSet.add(randAns);
    }
  }

  // Convert to array and shuffle
  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}
