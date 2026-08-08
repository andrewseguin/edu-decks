import { getLetterInfo, LETTER_LEVELS } from "./letters";
import { EASY_WORDS, HARD_WORDS } from "./words";
import { splitIntoPhonicsSegments } from "./phonics";
import { DisplayContent } from "./types";

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  let currentIndex = result.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [result[currentIndex], result[randomIndex]] = [
      result[randomIndex],
      result[currentIndex],
    ];
  }
  return result;
}

export function getHighestLevelInfoForWord(word: string): { color: string; textColor: string } {
  let highestLevel = -1;
  let color = "#000000";
  let textColor = "#FFFFFF";

  const segments = splitIntoPhonicsSegments(word);

  // Check individual chars
  for (const char of word) {
    const letterInfo = getLetterInfo(char);
    if (letterInfo) {
      const level = LETTER_LEVELS.findIndex((lvl) => lvl.letters.some((l) => l.char === char));
      if (level > highestLevel) {
        highestLevel = level;
        color = letterInfo.color || color;
        textColor = letterInfo.textColor || textColor;
      }
    }
  }

  // Check segments
  for (const segment of segments) {
    if (segment.length > 1) {
      const letterInfo = getLetterInfo(segment);
      if (letterInfo) {
        const level = LETTER_LEVELS.findIndex((lvl) => lvl.letters.some((l) => l.char === segment));
        if (level > highestLevel) {
          highestLevel = level;
          color = letterInfo.color || color;
          textColor = letterInfo.textColor || textColor;
        }
      }
    }
  }

  return { color, textColor };
}

export function canFormWord(word: string, availableLetters: string[]): boolean {
  let i = 0;
  while (i < word.length) {
    let matched = false;
    // Try 2-letter segment
    if (i + 1 < word.length) {
      const pair = word.substring(i, i + 2);
      if (availableLetters.includes(pair)) {
        matched = true;
        i += 2;
        continue;
      }
    }
    // Try 1-letter segment
    if (availableLetters.includes(word[i])) {
      matched = true;
      i += 1;
      continue;
    }
    if (!matched) return false;
  }
  return true;
}

export function getPossibleWords(
  availableLetters: string[],
  wordDifficulty: string,
  selectedWordLengths: number[]
): string[] {
  const wordPool =
    wordDifficulty === "easy" ? EASY_WORDS : [...EASY_WORDS, ...HARD_WORDS];

  return wordPool.filter((word) => {
    if (!selectedWordLengths.includes(word.length)) {
      return false;
    }
    return canFormWord(word, availableLetters);
  });
}

export function createInitialLetterCard(availableLetters: string[]): DisplayContent {
  const letter = availableLetters.length > 0 ? availableLetters[0] : "a";
  const data = getLetterInfo(letter);
  return {
    key: "initial",
    type: "letter",
    value: letter,
    color: data?.color,
    textColor: data?.textColor,
    verticalOffset: data?.verticalOffset,
  };
}

export function createLetterCard(letter: string, key?: string): DisplayContent {
  const letterData = getLetterInfo(letter);
  return {
    key: key || Date.now().toString(),
    type: "letter",
    value: letter,
    color: letterData?.color,
    textColor: letterData?.textColor,
    verticalOffset: letterData?.verticalOffset,
  };
}

export function createWordCard(word: string, key?: string): DisplayContent {
  const { color, textColor } = getHighestLevelInfoForWord(word);
  const isHard = HARD_WORDS.includes(word);

  return {
    key: key || Date.now().toString(),
    type: "word",
    value: word,
    color,
    textColor,
    isHardWord: isHard,
  };
}
