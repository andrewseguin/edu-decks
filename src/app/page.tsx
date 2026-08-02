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

import { Lock } from "lucide-react";
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

  const lastMenuCloseTimeRef = useRef<number>(0);
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
  const nextCard = useCallback((autoPlay: boolean = true) => {
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

    if (autoPlayAudio && !isQuizActive && autoPlay) {
      speak(newProblem.speechText);
    }
  }, [activeOperations, minRange, maxRange, allowNegatives, autoPlayAudio, isQuizActive, speak]);

  // Initial card deck generation
  useEffect(() => {
    if (hydrated && history.length === 0) {
      nextCard(true);
    }
  }, [hydrated, history.length, nextCard]);

  // Handle operation toggles safely
  const handleOperationToggle = (op: MathOperation) => {
    let nextOps: MathOperation[];
    if (activeOperations.includes(op)) {
      if (activeOperations.length === 1) return;
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
      nextCard(true);
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

  // Keyboard navigation matching First Read
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isQuizActive) return;

      if (e.code === "Space" || e.code === "ArrowDown") {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuizActive, historyIndex, history.length, handleNextCard, handlePrevCard]);

  // Touch Pointer / Swipe Gesture Handling matching First Read
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

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    touchStartRef.current = null;

    // Check tap vs swipe
    if (absDeltaX < 10 && absDeltaY < 10) {
      if (Date.now() - lastMenuCloseTimeRef.current < 300) return;
      handleNextCard();
      return;
    }

    if (absDeltaX > 50 && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        handlePrevCard();
      } else {
        handleNextCard();
      }
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

  const currentProblem = history[historyIndex];

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      tabIndex={-1}
    >
      {currentProblem && (
        <MathCard
          problem={currentProblem}
          onSpeak={(text) => speak(text, true)}
          onNext={handleNextCard}
          onPrev={handlePrevCard}
          hasPrev={historyIndex > 0}
        />
      )}

      {/* Top Bar Controls matching First Read */}
      {!isFullscreen && !isLocked && (
        <div
          className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <OperationSelector
            activeOperations={activeOperations}
            onOperationToggle={handleOperationToggle}
            minRange={minRange}
            maxRange={maxRange}
            onRangeChange={handleRangeChange}
            open={isOperationSelectorOpen}
            onOpenChange={handleOperationSelectorOpenChange}
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
            onOpenChange={handleSettingsOpenChange}
            onLockApp={() => setIsLocked(true)}
          />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        </div>
      )}

      {/* Quiz Display Overlay */}
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

      {/* Locked Snackbar matching First Read */}
      {!isFullscreen && isLocked && showLockSnackbar && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-foreground/90 text-background px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3.5 text-sm font-medium whitespace-nowrap w-max font-headline">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-background" />
              <span>Settings Locked</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-3 text-xs font-semibold rounded-full bg-background/20 hover:bg-background/30 text-background border-none"
              onClick={() => {
                setIsLocked(false);
                setShowLockSnackbar(false);
              }}
            >
              Unlock
            </Button>
          </div>
        </div>
      )}

      {/* Session Stats Counter matching First Read */}
      {(showCardCount || showTimer) && !isQuizActive && (
        <SessionStats
          cardCount={cardCount}
          timeElapsed={timeElapsed}
          showCardCount={showCardCount}
          showTimer={showTimer}
        />
      )}
    </main>
  );
}
