import { useLocalStorage } from "@decks/core";
import type { TopicType, CardType, MeasurementUnit } from "@/lib/types";

/**
 * Persists all geometry-deck user preferences via localStorage.
 * Mirror pattern of useDeckSettings in arithmetic-deck.
 */
export function useGeometrySettings() {
  const [activeTopics, setActiveTopics] = useLocalStorage<TopicType[]>(
    "geometry-deck-topics",
    ["angles", "triangles", "quadrilaterals", "circles", "polygons", "3d-shapes"]
  );
  const [activeCardTypes, setActiveCardTypes] = useLocalStorage<CardType[]>(
    "geometry-deck-card-types",
    ["term", "formula", "calculation"]
  );
  const [measurementUnit, setMeasurementUnit] = useLocalStorage<MeasurementUnit>(
    "geometry-deck-unit",
    "cm"
  );
  const [includeReverseProblems, setIncludeReverseProblems] = useLocalStorage<boolean>(
    "geometry-deck-reverse",
    false
  );
  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>(
    "geometry-deck-show-card-count",
    true
  );
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    "geometry-deck-show-timer",
    true
  );
  const [autoPlayAudio, setAutoPlayAudio] = useLocalStorage<boolean>(
    "geometry-deck-autoplay-audio",
    false
  );
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>(
    "geometry-deck-keep-awake",
    true
  );
  const [isLocked, setIsLocked] = useLocalStorage<boolean>(
    "geometry-deck-locked",
    false
  );

  // ── Topic toggle ────────────────────────────────────────────────────────────
  function handleTopicToggle(topic: TopicType) {
    if (activeTopics.includes(topic)) {
      if (activeTopics.length === 1) return; // always keep at least one
      setActiveTopics(activeTopics.filter((t) => t !== topic));
    } else {
      setActiveTopics([...activeTopics, topic]);
    }
  }

  function handleTopicSelectExclusive(topic: TopicType) {
    setActiveTopics([topic]);
  }

  // ── Card type toggle ────────────────────────────────────────────────────────
  function handleCardTypeToggle(type: CardType) {
    if (activeCardTypes.includes(type)) {
      if (activeCardTypes.length === 1) return; // always keep at least one
      setActiveCardTypes(activeCardTypes.filter((t) => t !== type));
    } else {
      setActiveCardTypes([...activeCardTypes, type]);
    }
  }

  return {
    activeTopics,
    handleTopicToggle,
    handleTopicSelectExclusive,
    activeCardTypes,
    handleCardTypeToggle,
    measurementUnit,
    setMeasurementUnit,
    includeReverseProblems,
    setIncludeReverseProblems,
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
  };
}
