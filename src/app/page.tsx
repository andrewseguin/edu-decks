"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useAudio } from "@/hooks/use-audio";

import { MathCard } from "@/components/math-card";
import { AppSettings } from "@/components/app-settings";
import { OperationSelector } from "@/components/operation-selector";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { SessionStats } from "@/components/session-stats";
import { QuizDisplay } from "@/components/quiz-display";

import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MathDeckPage() {
  const [hydrated, setHydrated] = useState(false);

  // Settings State with LocalStorage Persistence
  const [activeOperations, setActiveOperations] = useLocalStorage<MathOperation[]>(
    "math-deck-operations",
    ["+", "-"]
  );
  const [minRange, setMinRange] = useLocalStorage<number>("math-deck-min-range", 1);
  const [maxRange, setMaxRange] = useLocalStorage<number>("math-deck-max-range", 10);
  const [allowNegatives, setAllowNegatives] = useLocalStorage<boolean>("math-deck-allow-negatives", false);
  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>("math-deck-show-card-count", true);
  const [showTimer, setShowTimer] = useLocalStorage<boolean>("math-deck-show-timer", true);
  const [autoPlayAudio, setAutoPlayAudio] = useLocalStorage<boolean>("math-deck-autoplay-audio", true);
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>("math-deck-keep-awake", true);
  const [quizOptionCount, setQuizOptionCount] = useLocalStorage<number>("math-deck-quiz-options", 4);
  const [isLocked, setIsLocked] = useLocalStorage<boolean>("math-deck-locked", false);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOperationSelectorOpen, setIsOperationSelectorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showLockSnackbar, setShowLockSnackbar] = useState(false);

  // Deck state
  const [history, setHistory] = useState<MathProblem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cardCount, setCardCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const { speak, playChime } = useAudio();
  useWakeLock(keepScreenAwake);

  // Client hydration check
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Timer counter
  useEffect(() => {
    if (!showTimer || isQuizActive) return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimer, isQuizActive]);

  // Lock Snackbar auto-dismiss
  useEffect(() => {
    if (isLocked) {
      setShowLockSnackbar(true);
      const timer = setTimeout(() => {
        setShowLockSnackbar(false);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowLockSnackbar(false);
    }
  }, [isLocked]);

  // Generate next card problem
  const nextCard = useCallback(() => {
    const newProblem = generateMathProblem(
      activeOperations,
      minRange,
      maxRange,
      allowNegatives
    );
    setHistory((prev) => {
      const nextHist = [...prev, newProblem];
      setHistoryIndex(nextHist.length - 1);
      return nextHist;
    });
    setCardCount((c) => c + 1);

    if (autoPlayAudio && !isQuizActive) {
      speak(newProblem.speechText);
    }
  }, [activeOperations, minRange, maxRange, allowNegatives, autoPlayAudio, isQuizActive, speak]);

  // Initial card deck generation
  useEffect(() => {
    if (hydrated && history.length === 0) {
      nextCard();
    }
  }, [hydrated, history.length, nextCard]);

  // Handle operation toggles safely (at least one operation active)
  const handleOperationToggle = (op: MathOperation) => {
    let nextOps: MathOperation[];
    if (activeOperations.includes(op)) {
      if (activeOperations.length === 1) return; // Keep at least one active
      nextOps = activeOperations.filter((o) => o !== op);
    } else {
      nextOps = [...activeOperations, op];
    }
    setActiveOperations(nextOps);
  };

  const handleRangeChange = (min: number, max: number) => {
    setMinRange(min);
    setMaxRange(max);
  };

  const handlePrevCard = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      if (autoPlayAudio && !isQuizActive) {
        speak(history[prevIdx].speechText);
      }
    }
  };

  const handleNextCard = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      if (autoPlayAudio && !isQuizActive) {
        speak(history[nextIdx].speechText);
      }
    } else {
      nextCard();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isQuizActive) return;

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      } else if (e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "Space") {
        e.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuizActive, historyIndex, history, handleNextCard, handlePrevCard]);

  // Touch Swipe Gesture Handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    touchStartRef.current = null;

    // Swipe horizontal threshold
    if (absDeltaX > 50 && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        handlePrevCard();
      } else {
        handleNextCard();
      }
    }
  };

  if (!hydrated) {
    return null;
  }

  const currentProblem = history[historyIndex];

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      tabIndex={-1}
    >
      {/* Background Accent Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Flashcard Component */}
      {currentProblem && (
        <MathCard
          problem={currentProblem}
          onSpeak={(text) => speak(text, true)}
          onNext={handleNextCard}
          onPrev={handlePrevCard}
          hasPrev={historyIndex > 0}
        />
      )}

      {/* Top Header Controls (Hidden when in Fullscreen or when App is Locked) */}
      {!isFullscreen && !isLocked && (
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-30 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <OperationSelector
            activeOperations={activeOperations}
            onOperationToggle={handleOperationToggle}
            minRange={minRange}
            maxRange={maxRange}
            onRangeChange={handleRangeChange}
            open={isOperationSelectorOpen}
            onOpenChange={setIsOperationSelectorOpen}
            onStartQuiz={() => setIsQuizActive(true)}
          />
          <AppSettings
            activeOperations={activeOperations}
            onOperationToggle={handleOperationToggle}
            minRange={minRange}
            maxRange={maxRange}
            onRangeChange={handleRangeChange}
            allowNegatives={allowNegatives}
            onAllowNegativesChange={setAllowNegatives}
            showCardCount={showCardCount}
            onShowCardCountChange={setShowCardCount}
            showTimer={showTimer}
            onShowTimerChange={setShowTimer}
            autoPlayAudio={autoPlayAudio}
            onAutoPlayAudioChange={setAutoPlayAudio}
            quizOptionCount={quizOptionCount}
            onQuizOptionCountChange={setQuizOptionCount}
            keepScreenAwake={keepScreenAwake}
            onKeepScreenAwakeChange={setKeepScreenAwake}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            onLockApp={() => setIsLocked(true)}
          />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        </div>
      )}

      {/* Settings Locked Snackbar (3-second auto-dismiss or manual unlock) */}
      {!isFullscreen && isLocked && showLockSnackbar && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-foreground/90 text-background px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3.5 text-sm font-medium whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-background" />
              <span>Settings Locked</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-3 text-xs font-bold rounded-full bg-background/20 hover:bg-background/30 text-background border-none flex items-center gap-1"
              onClick={() => {
                setIsLocked(false);
                setShowLockSnackbar(false);
              }}
            >
              <Unlock className="w-3 h-3" />
              <span>Unlock</span>
            </Button>
          </div>
        </div>
      )}

      {/* Floating Session Stats Bar (Card Count & Timer) */}
      {!isQuizActive && (
        <SessionStats
          cardCount={cardCount}
          timeElapsed={timeElapsed}
          showCardCount={showCardCount}
          showTimer={showTimer}
        />
      )}

      {/* Interactive Quiz Mode Modal Overlay */}
      {isQuizActive && (
        <QuizDisplay
          activeOperations={activeOperations}
          minRange={minRange}
          maxRange={maxRange}
          allowNegatives={allowNegatives}
          optionCount={quizOptionCount}
          autoPlayAudio={autoPlayAudio}
          onSpeak={(text) => speak(text, true)}
          onPlayChime={playChime}
          onExit={() => setIsQuizActive(false)}
        />
      )}
    </main>
  );
}
