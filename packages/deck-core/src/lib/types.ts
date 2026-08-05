import * as React from "react";

export interface DeckCategory {
  id: string;
  label: string;
  color?: string;
}

export interface DeckCardItem<T = unknown> {
  id: string;
  category: string;
  speechPrompt: string;
  speechAnswer: string;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  quizPrompt?: React.ReactNode;
  quizAnswerText?: string;
  quizOptions?: string[];
  raw: T;
}

export interface DeckAdapter<T = unknown> {
  id: string;
  name: string;
  categories: DeckCategory[];
  generateDeck: (activeCategories: string[], settings: unknown) => DeckCardItem<T>[];
}
