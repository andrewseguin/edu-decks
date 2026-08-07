"use client";

import { useState, useEffect, useRef } from "react";
import {
  useWakeLock,
  useAudio,
  useDeckHistory,
  FullscreenToggle,
  LockSnackbar,
  SessionStats,
  DeckControlBar,
  DeckAppShell,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        settings.showFractions
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const isFull = Boolean(
      document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    );

    if (!isFull) {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
      };
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isQuizActive) return;

      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "ArrowDown") {
        e.preventDefault();
        handleCardTap();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuizActive, handleCardTap, handlePrevCard]);

  // Touch Pointer / Swipe Gesture Handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (Date.now() - lastMenuCloseTimeRef.current < 300) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;
    if (Date.now() - lastMenuCloseTimeRef.current < 300) {
      touchStartRef.current = null;
      return;
    }

    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("[role='button']") ||
      target.closest("[data-radix-popper-content-wrapper]")
    ) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    touchStartRef.current = null;

    if (isQuizActive) return;

    // Handle horizontal swipes for card navigation
    if (absDeltaX > 50 && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        handlePrevCard();
      } else {
        handleNextCard();
      }
    } else if (absDeltaX <= 12 && absDeltaY <= 12) {
      // Tap anywhere on screen
      handleCardTap();
    }
  };

  const handleOperationSelectorOpenChange = (open: boolean) => {
    if (!open) {
      lastMenuCloseTimeRef.current = Date.now();
    }
    setIsOperationSelectorOpen(open);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    if (!open) {
      lastMenuCloseTimeRef.current = Date.now();
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
      isFullscreen={isFullscreen}
      onFullscreenToggle={toggleFullscreen}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      topRightControls={
        <>
          <OperationSelector
            activeOperations={settings.activeOperations}
            onOperationToggle={settings.handleOperationToggle}
            minRange={settings.minRange}
            maxRange={settings.maxRange}
            onRangeChange={settings.handleRangeChange}
            showWholeNumbers={settings.showWholeNumbers}
            onShowWholeNumbersChange={settings.setShowWholeNumbers}
            showFractions={settings.showFractions}
            onShowFractionsChange={settings.setShowFractions}
            open={isOperationSelectorOpen}
            onOpenChange={handleOperationSelectorOpenChange}
            onStartQuiz={() => setIsQuizActive(true)}
          />
          <AppSettings
            activeOperations={settings.activeOperations}
            onOperationToggle={settings.handleOperationToggle}
            minRange={settings.minRange}
            maxRange={settings.maxRange}
            onRangeChange={settings.handleRangeChange}
            showWholeNumbers={settings.showWholeNumbers}
            onShowWholeNumbersChange={settings.setShowWholeNumbers}
            showFractions={settings.showFractions}
            onShowFractionsChange={settings.setShowFractions}
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
            autoPlayAudio={settings.autoPlayAudio}
            onSpeak={(text) => speak(text, true)}
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
