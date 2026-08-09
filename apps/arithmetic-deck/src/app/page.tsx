"use client";

import { useState, useEffect, useRef } from "react";
import {
  useWakeLock,
  useAudio,
  useDeckHistory,
  LockSnackbar,
  SessionStats,
  DeckControlBar,
  DeckAppShell,
  useDeckGestures,
} from "@decks/core";
import { useDeckSettings } from "@/hooks/use-deck-settings";
import { generateMathProblem } from "@/lib/math-generator";
import { MathProblem } from "@/lib/types";
import { playMathSpeech } from "@/lib/audio-player";

import { MathCard } from "@/components/math-card";
import { AppSettings } from "@/components/app-settings";
import { OperationSelector } from "@/components/operation-selector";
import { QuizDisplay } from "@/components/quiz-display";

export default function MathDeckPage() {
  const [hydrated, setHydrated] = useState(false);

  // Settings State via Hook
  const settings = useDeckSettings();

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOperationSelectorOpen, setIsOperationSelectorOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const lastMenuCloseTimeRef = useRef<number>(0);
  const { speak, playChime } = useAudio(playMathSpeech);

  useWakeLock(settings.keepScreenAwake);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Deck History via Shared Hook
  const {
    currentProblem,
    cardCount,
    isFlipped,
    showHint,
    setShowHint,
    slideDirection,
    handlePrevCard,
    handleNextCard,
    handleCardTap,
  } = useDeckHistory<MathProblem>({
    generateNext: () =>
      generateMathProblem(
        settings.activeOperations,
        settings.minRange,
        settings.maxRange,
        settings.showWholeNumbers,
        settings.showFractions,
        settings.fractionDenominatorMode,
        settings.fractionMaxDenominator
      ),
    autoPlayAudio: settings.autoPlayAudio,
    isQuizActive,
    speak: (problem, isFlipped) => {
      if (isFlipped) {
        speak(problem.answerSpeechText, true);
      } else {
        speak(problem.problemSpeechText, true);
      }
    },
    hydrated,
  });

  // Timer effect
  useEffect(() => {
    if (!settings.showTimer || isQuizActive) return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.showTimer, isQuizActive]);

  // Gesture & Keyboard Handling via Shared Hook
  const { handlePointerDown, handlePointerUp, notifyMenuClosed } = useDeckGestures({
    onNext: handleNextCard,
    onPrev: handlePrevCard,
    onTap: handleCardTap,
    isMenuOpen: isQuizActive || isSettingsOpen || isOperationSelectorOpen,
  });

  const handleOperationSelectorOpenChange = (open: boolean) => {
    if (!open) {
      notifyMenuClosed();
    }
    setIsOperationSelectorOpen(open);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    if (!open) {
      notifyMenuClosed();
    }
    setIsSettingsOpen(open);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <DeckAppShell
      isLocked={settings.isLocked}
      onUnlock={() => settings.setIsLocked(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      topRightControls={
        <>
          <OperationSelector
            activeOperations={settings.activeOperations}
            onOperationToggle={settings.handleOperationToggle}
            onOperationSelectExclusive={settings.handleOperationSelectExclusive}
            minRange={settings.minRange}
            maxRange={settings.maxRange}
            onRangeChange={settings.handleRangeChange}
            showWholeNumbers={settings.showWholeNumbers}
            onShowWholeNumbersChange={settings.setShowWholeNumbers}
            showFractions={settings.showFractions}
            onShowFractionsChange={settings.setShowFractions}
            fractionDenominatorMode={settings.fractionDenominatorMode}
            onFractionDenominatorModeChange={settings.setFractionDenominatorMode}
            fractionMaxDenominator={settings.fractionMaxDenominator}
            onFractionMaxDenominatorChange={settings.setFractionMaxDenominator}
            open={isOperationSelectorOpen}
            onOpenChange={handleOperationSelectorOpenChange}
            onStartQuiz={() => setIsQuizActive(true)}
          />
          <AppSettings
            showCardCount={settings.showCardCount}
            onShowCardCountChange={settings.setShowCardCount}
            showTimer={settings.showTimer}
            onShowTimerChange={settings.setShowTimer}
            autoPlayAudio={settings.autoPlayAudio}
            onAutoPlayAudioChange={settings.setAutoPlayAudio}
            keepScreenAwake={settings.keepScreenAwake}
            onKeepScreenAwakeChange={settings.setKeepScreenAwake}
            open={isSettingsOpen}
            onOpenChange={handleSettingsOpenChange}
            onLockApp={() => settings.setIsLocked(true)}
          />
        </>
      }
      bottomStats={
        (settings.showCardCount || settings.showTimer) && !isQuizActive ? (
          <SessionStats
            cardCount={cardCount}
            timeElapsed={timeElapsed}
            showCardCount={settings.showCardCount}
            showTimer={settings.showTimer}
            position="bottom-center"
          />
        ) : undefined
      }
      quizOverlay={
        isQuizActive ? (
          <QuizDisplay
            activeOperations={settings.activeOperations}
            minRange={settings.minRange}
            maxRange={settings.maxRange}
            showWholeNumbers={settings.showWholeNumbers}
            showFractions={settings.showFractions}
            fractionDenominatorMode={settings.fractionDenominatorMode}
            fractionMaxDenominator={settings.fractionMaxDenominator}
            autoPlayAudio={settings.autoPlayAudio}
            onSpeak={(text, onEnd) => speak(text, true, onEnd)}
            onPlayChime={playChime}
            onExit={() => setIsQuizActive(false)}
          />
        ) : undefined
      }
    >
      {currentProblem && (
        <MathCard
          problem={currentProblem}
          isFlipped={isFlipped}
          showHint={showHint}
          onToggleHint={() => setShowHint((h) => !h)}
          slideDirection={slideDirection}
          onSpeak={(text) => speak(text, true)}
        />
      )}
    </DeckAppShell>
  );
}
