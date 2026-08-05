import { MathOperation } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useDeckSettings() {
  const [activeOperations, setActiveOperations] = useLocalStorage<MathOperation[]>(
    "math-deck-operations",
    ["+", "-"]
  );
  const [minRange, setMinRange] = useLocalStorage<number>("math-deck-min-range", 1);
  const [maxRange, setMaxRange] = useLocalStorage<number>("math-deck-max-range", 10);
  const [showWholeNumbers, setShowWholeNumbers] = useLocalStorage<boolean>("math-deck-show-whole-numbers", true);
  const [showFractions, setShowFractions] = useLocalStorage<boolean>("math-deck-show-fractions", false);
  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>("math-deck-show-card-count", true);
  const [showTimer, setShowTimer] = useLocalStorage<boolean>("math-deck-show-timer", true);
  const [autoPlayAudio, setAutoPlayAudio] = useLocalStorage<boolean>("math-deck-autoplay-audio", false);
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>("math-deck-keep-awake", true);
  const [isLocked, setIsLocked] = useLocalStorage<boolean>("math-deck-locked", false);

  const handleOperationToggle = (op: MathOperation) => {
    if (activeOperations.includes(op)) {
      if (activeOperations.length === 1) return;
      setActiveOperations(activeOperations.filter((o) => o !== op));
    } else {
      setActiveOperations([...activeOperations, op]);
    }
  };

  const handleRangeChange = (min: number, max: number) => {
    setMinRange(min);
    setMaxRange(max);
  };

  return {
    activeOperations,
    setActiveOperations,
    minRange,
    setMinRange,
    maxRange,
    setMaxRange,
    showWholeNumbers,
    setShowWholeNumbers,
    showFractions,
    setShowFractions,
    showCardCount,
    setShowCardCount,
    showTimer,
    setShowTimer,
    autoPlayAudio,
    setAutoPlayAudio,
    keepScreenAwake,
    setKeepScreenAwake,
    isLocked,
    setIsLocked,
    handleOperationToggle,
    handleRangeChange,
  };
}
