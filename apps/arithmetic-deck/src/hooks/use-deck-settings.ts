import { FractionDenominatorMode, FractionMaxDenominator, MathOperation } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useDeckSettings() {
  const [activeOperations, setActiveOperations] = useLocalStorage<MathOperation[]>(
    "math-deck-operations",
    ["+", "-"]
  );
  const [minRange, setMinRange] = useLocalStorage<number>("math-deck-min-range", 1);
  const [maxRange, setMaxRange] = useLocalStorage<number>("math-deck-max-range", 10);
  const [numberType, setNumberType] = useLocalStorage<"whole" | "fractions">(
    "math-deck-number-type",
    () => {
      if (typeof window !== "undefined") {
        const legacyFrac = window.localStorage.getItem("math-deck-show-fractions");
        const legacyWhole = window.localStorage.getItem("math-deck-show-whole-numbers");
        if (legacyFrac === "true" && legacyWhole === "false") {
          return "fractions";
        }
      }
      return "whole";
    }
  );
  const [fractionDenominatorMode, setFractionDenominatorMode] = useLocalStorage<FractionDenominatorMode>(
    "math-deck-fraction-mode",
    "all"
  );
  const [fractionMaxDenominator, setFractionMaxDenominator] = useLocalStorage<FractionMaxDenominator>(
    "math-deck-fraction-max-denominator",
    8
  );
  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>("math-deck-show-card-count", true);
  const [showTimer, setShowTimer] = useLocalStorage<boolean>("math-deck-show-timer", true);
  const [autoPlayAudio, setAutoPlayAudio] = useLocalStorage<boolean>("math-deck-autoplay-audio", false);
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>("math-deck-keep-awake", true);
  const [isLocked, setIsLocked] = useLocalStorage<boolean>("math-deck-locked", false);

  const showWholeNumbers = numberType === "whole";
  const showFractions = numberType === "fractions";

  const setShowWholeNumbers = (show: boolean) => {
    setNumberType(show ? "whole" : "fractions");
  };

  const setShowFractions = (show: boolean) => {
    setNumberType(show ? "fractions" : "whole");
  };

  const handleOperationToggle = (op: MathOperation) => {
    if (activeOperations.includes(op)) {
      if (activeOperations.length === 1) return;
      setActiveOperations(activeOperations.filter((o) => o !== op));
    } else {
      setActiveOperations([...activeOperations, op]);
    }
  };

  const handleOperationSelectExclusive = (op: MathOperation) => {
    setActiveOperations([op]);
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
    numberType,
    setNumberType,
    showWholeNumbers,
    setShowWholeNumbers,
    showFractions,
    setShowFractions,
    fractionDenominatorMode,
    setFractionDenominatorMode,
    fractionMaxDenominator,
    setFractionMaxDenominator,
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
    handleOperationSelectExclusive,
    handleRangeChange,
  };
}
