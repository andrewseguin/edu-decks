"use client";

import { useState, useEffect } from "react";
import { useWakeLock, SessionStats, DeckAppShell, useDeckGestures } from "@decks/core";
import { useToast } from "@/hooks/use-toast";
import { useReadingSettings } from "@/hooks/use-reading-settings";
import { useReadingDeck } from "@/hooks/use-reading-deck";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { AppSettings } from "@/components/app-settings";
import { RecordingsModal } from "@/components/recordings-modal";
import { QuizDisplay } from "@/components/quiz-display";

export default function Home() {
  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const settings = useReadingSettings();
  useWakeLock(settings.keepScreenAwake);

  const isAnyModalOpen =
    isQuizActive || isMenuOpen || isSettingsOpen || isRecordingsModalOpen;

  const {
    displayContent,
    cardCount,
    handleNextCard,
    handlePrevCard,
    handleTap,
  } = useReadingDeck({
    settings,
    isMenuOpen: isAnyModalOpen,
  });

  const { handlePointerDown, handlePointerUp, notifyMenuClosed } =
    useDeckGestures({
      onNext: handleNextCard,
      onPrev: handlePrevCard,
      onTap: handleTap,
      isMenuOpen: isAnyModalOpen,
    });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlockApp = () => {
    settings.setIsLocked(false);
    toast({
      description: "App Unlocked. Settings restored.",
    });
  };

  const handleMenuOpenChange = (open: boolean) => {
    if (!open) {
      notifyMenuClosed();
    }
    setIsMenuOpen(open);
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
      className="cursor-pointer"
      isLocked={settings.isLocked}
      onUnlock={handleUnlockApp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      topRightControls={
        <>
          <LetterSelector
            open={isMenuOpen}
            selectedLetters={settings.selectedLetters}
            setSelectedLetters={settings.setSelectedLetters}
            onOpenChange={handleMenuOpenChange}
            gameMode={settings.gameMode}
            onGameModeChange={settings.setGameMode}
            wordDifficulty={settings.wordDifficulty}
            onWordDifficultyChange={settings.setWordDifficulty}
            selectedWordLengths={settings.selectedWordLengths}
            onSelectedWordLengthsChange={settings.setSelectedWordLengths}
            letterCase={settings.letterCase}
            onLetterCaseChange={settings.setLetterCase}
            quizOptionCount={settings.quizOptionCount}
            onQuizOptionCountChange={settings.setQuizOptionCount}
            onStartQuiz={() => setIsQuizActive(true)}
          />
          <AppSettings
            showCardCount={settings.showCardCount}
            onShowCardCountChange={settings.setShowCardCount}
            showTimer={settings.showTimer}
            onShowTimerChange={settings.setShowTimer}
            enableRecordings={settings.enableRecordings}
            onEnableRecordingsChange={settings.setEnableRecordings}
            enableTracing={settings.enableTracing}
            onEnableTracingChange={settings.setEnableTracing}
            autoPlaySound={settings.autoPlaySound}
            onAutoPlaySoundChange={settings.setAutoPlaySound}
            keepScreenAwake={settings.keepScreenAwake}
            onKeepScreenAwakeChange={settings.setKeepScreenAwake}
            open={isSettingsOpen}
            onOpenChange={handleSettingsOpenChange}
            onOpenRecordings={() => setIsRecordingsModalOpen(true)}
            onLockApp={() => settings.setIsLocked(true)}
          />
        </>
      }
      bottomStats={
        settings.showCardCount || settings.showTimer ? (
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
            gameMode={settings.gameMode}
            selectedLetters={settings.selectedLetters}
            selectedWordLengths={settings.selectedWordLengths}
            wordDifficulty={settings.wordDifficulty}
            letterCase={settings.letterCase}
            optionCount={settings.quizOptionCount}
            onExit={() => setIsQuizActive(false)}
          />
        ) : undefined
      }
    >
      <LetterDisplay
        content={displayContent}
        enableRecordings={settings.enableRecordings}
        enableTracing={settings.enableTracing}
        letterCase={settings.letterCase}
        autoPlaySound={isQuizActive ? false : settings.autoPlaySound}
      />
      <RecordingsModal
        open={isRecordingsModalOpen}
        onOpenChange={setIsRecordingsModalOpen}
      />
    </DeckAppShell>
  );
}
