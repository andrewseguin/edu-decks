"use client";

import { useState, useEffect } from "react";
import {
  useWakeLock,
  useAudio,
  useDeckHistory,
  SessionStats,
  DeckAppShell,
  useDeckGestures,
} from "@decks/core";
import { useGeometrySettings } from "@/hooks/use-geometry-settings";
import { generateGeometryCard } from "@/lib/card-generator";
import { playGeometrySpeech } from "@/lib/audio-player";
import type { GeometryCard as GeometryCardType } from "@/lib/types";

import { GeometryCard } from "@/components/geometry-card";
import { AppSettings } from "@/components/app-settings";
import { TopicSelector } from "@/components/topic-selector";

export default function GeometryDeckPage() {
  const [hydrated, setHydrated] = useState(false);

  // Settings
  const settings = useGeometrySettings();

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Audio & screen wake-lock
  const { speak } = useAudio(playGeometrySpeech);
  useWakeLock(settings.keepScreenAwake);

  // Hydration guard (avoids SSR/localStorage mismatch)
  useEffect(() => {
    setHydrated(true);
  }, []);

  // ── Deck history ────────────────────────────────────────────────────────────
  const {
    currentProblem: currentCard,
    cardCount,
    isFlipped,
    slideDirection,
    handlePrevCard,
    handleNextCard,
    handleCardTap,
  } = useDeckHistory<GeometryCardType>({
    generateNext: () =>
      generateGeometryCard({
        activeTopics: settings.activeTopics,
        activeCardTypes: settings.activeCardTypes,
        includeReverseProblems: settings.includeReverseProblems,
        measurementUnit: settings.measurementUnit,
      }),
    autoPlayAudio: settings.autoPlayAudio,
    isQuizActive: false,
    speak: (card, flipped) =>
      speak(flipped ? card.backSpeechText : card.frontSpeechText, true),
    hydrated,
    isItemValid: (card) =>
      settings.activeTopics.includes(card.topic) &&
      settings.activeCardTypes.includes(card.cardType),
    validationKey: JSON.stringify({
      topics: settings.activeTopics,
      cardTypes: settings.activeCardTypes,
    }),
  });

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!settings.showTimer) return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.showTimer]);

  // ── Gesture & keyboard ───────────────────────────────────────────────────
  const { handlePointerDown, handlePointerUp, notifyMenuClosed } =
    useDeckGestures({
      onNext: handleNextCard,
      onPrev: handlePrevCard,
      onTap: handleCardTap,
      isMenuOpen: isSettingsOpen || isTopicSelectorOpen,
    });

  const handleTopicSelectorOpenChange = (open: boolean) => {
    if (!open) notifyMenuClosed();
    setIsTopicSelectorOpen(open);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    if (!open) notifyMenuClosed();
    setIsSettingsOpen(open);
  };

  if (!hydrated) return null;

  return (
    <DeckAppShell
      isLocked={settings.isLocked}
      onUnlock={() => settings.setIsLocked(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      topRightControls={
        <>
          <TopicSelector
            activeTopics={settings.activeTopics}
            onTopicToggle={settings.handleTopicToggle}
            onTopicSelectExclusive={settings.handleTopicSelectExclusive}
            activeCardTypes={settings.activeCardTypes}
            onCardTypeToggle={settings.handleCardTypeToggle}
            open={isTopicSelectorOpen}
            onOpenChange={handleTopicSelectorOpenChange}
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
        (settings.showCardCount || settings.showTimer) ? (
          <SessionStats
            cardCount={cardCount}
            timeElapsed={timeElapsed}
            showCardCount={settings.showCardCount}
            showTimer={settings.showTimer}
            position="bottom-center"
          />
        ) : undefined
      }
    >
      {currentCard && (
        <GeometryCard
          card={currentCard}
          isFlipped={isFlipped}
          slideDirection={slideDirection}
          onSpeak={(text) => speak(text, true)}
        />
      )}
    </DeckAppShell>
  );
}
