"use client";

/**
 * TestCardView — Client Component
 *
 * Index view: streamlined interactive card catalogue with Primary/Reveal flip controls and Desktop/Mobile viewport toggles.
 * Single-card view: full-page rendering of one card at a specific state (used by visual regression tests).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { GeometryCard } from "@/components/geometry-card";
import { TEST_CARDS, TEST_CARD_IDS } from "@/lib/test-card-catalogue";
import { TOPIC_LABELS } from "@/lib/colors";
import type { GeometryCard as GeometryCardType, TopicType, CardType } from "@/lib/types";

type Props = {
  cardId: string | undefined;
  state: "front" | "back";
};

const ALL_TOPICS: TopicType[] = ["angles", "triangles", "quadrilaterals", "circles", "polygons", "3d-shapes"];
const ALL_CARD_TYPES: CardType[] = ["term", "calculation"];
const CARD_TYPE_LABELS: Record<CardType, string> = { term: "Terms & Formulas", calculation: "Calculations" };

// ─────────────────────────────────────────────────────────────────────────────
// InteractiveCardItem
// Renders the actual card directly. Tapping the card or state buttons toggles
// between Primary (Front) and Reveal (Back). Supports Desktop vs Mobile viewports.
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function InteractiveCardItem({
  card,
  id,
  overrideState,
  globalViewport,
  showOutlines,
}: {
  card: GeometryCardType;
  id: string;
  overrideState: "front" | "back" | null;
  globalViewport: "desktop" | "mobile";
  showOutlines?: boolean;
}) {
  const [localFlipped, setLocalFlipped] = useState<boolean | null>(null);

  // Use local toggle if user explicitly clicked, otherwise follow global override
  const isFlipped = localFlipped !== null ? localFlipped : overrideState === "back";
  const viewport = globalViewport;

  const typeTag = card.cardType === "term" ? "Term" : "Calculation";
  const typeBadgeColor =
    card.cardType === "term"
      ? "bg-cyan-950/80 text-cyan-300 border-cyan-800/60"
      : "bg-amber-950/80 text-amber-300 border-amber-800/60";

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700/80 transition-all shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/60 pb-3">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase border ${typeBadgeColor}`}>
            {typeTag}
          </span>
          <span className="text-sm font-mono text-gray-200 font-bold">{id}</span>
        </div>

        {/* State Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-gray-950/80 p-1 rounded-xl border border-gray-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setLocalFlipped(false)}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isFlipped
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Primary (Front)
          </button>
          <button
            type="button"
            onClick={() => setLocalFlipped(true)}
            className={`px-3 py-1 rounded-lg transition-all ${
              isFlipped
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Reveal (Back)
          </button>
          <Link
            href={`/test-cards?card=${id}&state=${isFlipped ? "back" : "front"}`}
            target="_blank"
            className="ml-1 px-2 py-1 text-gray-500 hover:text-gray-300 text-[11px] rounded hover:bg-gray-800"
            title="Open isolated view in new tab"
          >
            ↗
          </Link>
        </div>
      </div>

      {/* Direct Interactive Card Component */}
      <div className="flex items-center justify-center py-2 transition-all">
        <div
          className={`transition-all duration-300 ${
            viewport === "mobile"
              ? "w-[360px] max-w-full p-2.5 bg-gray-950/70 rounded-3xl border border-gray-800/80 shadow-2xl"
              : "w-full max-w-[700px]"
          }`}
        >
          <GeometryCard
            card={card}
            isFlipped={isFlipped}
            slideDirection="next"
            className="w-full border-none"
            showDebugOutlines={showOutlines}
            onSpeak={() => {}}
            onTap={() => setLocalFlipped(!isFlipped)}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function TestCardView({ cardId, state }: Props) {
  // ── Single-card view (used by Playwright visual regression tests) ────────
  if (cardId) {
    const card = TEST_CARDS[cardId];

    if (!card) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-4 p-8">
          <p className="text-red-400 text-lg font-mono">
            Unknown card ID: &quot;{cardId}&quot;
          </p>
          <Link href="/test-cards" className="underline text-blue-400 text-sm">
            ← Back to index
          </Link>
        </main>
      );
    }

    const isBack = state === "back";

    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-6 p-4"
        data-testid="test-card-root"
      >
        {/* Machine-readable metadata for the Playwright spec */}
        <div
          id="card-meta"
          data-card-id={cardId}
          data-state={state}
          className="sr-only"
          aria-hidden="true"
        />

        <GeometryCard
          card={card}
          isFlipped={isBack}
          slideDirection="next"
          onSpeak={() => {}}
          onTap={() => {}}
        />

        {/* State nav */}
        <nav className="flex flex-wrap gap-2 justify-center text-xs font-mono text-gray-400 select-none">
          <Link
            href={`/test-cards?card=${cardId}&state=front`}
            className={`px-2 py-1 rounded ${
              state === "front"
                ? "bg-white text-gray-900 font-bold"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            front
          </Link>
          <Link
            href={`/test-cards?card=${cardId}&state=back`}
            className={`px-2 py-1 rounded ${
              state === "back"
                ? "bg-white text-gray-900 font-bold"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            back
          </Link>
        </nav>

        <Link
          href="/test-cards"
          className="text-gray-600 hover:text-gray-400 text-xs font-mono"
        >
          ← index
        </Link>
      </main>
    );
  }

  // ── Gallery index view ────────────────────────────────────────────────────
  return <GalleryView />;
}

// ─────────────────────────────────────────────────────────────────────────────
// GalleryView
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_STORAGE_KEY = "edu-decks-geometry-catalogue-view";

function GalleryView() {
  const [activeTopics, setActiveTopics] = useState<TopicType[]>(ALL_TOPICS);
  const [activeCardTypes, setActiveCardTypes] = useState<CardType[]>(ALL_CARD_TYPES);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [globalState, setGlobalState] = useState<"front" | "back" | null>(null);
  const [globalViewport, setGlobalViewport] = useState<"desktop" | "mobile">("desktop");
  const [showOutlines, setShowOutlines] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── 1. Load initial view state from URL query params or localStorage ───────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlTopics = params.get("topics");
    const urlTypes = params.get("types");
    const urlSearch = params.get("q") || params.get("search");
    const urlViewport = params.get("viewport");
    const urlFlip = params.get("flip");
    const urlOutlines = params.get("outlines");

    let topics = ALL_TOPICS;
    let types = ALL_CARD_TYPES;
    let search = "";
    let viewport: "desktop" | "mobile" = "desktop";
    let flip: "front" | "back" | null = null;
    let outlines = false;

    if (urlTopics || urlTypes || urlSearch || urlViewport || urlFlip || urlOutlines !== null) {
      if (urlTopics) {
        const parsed = urlTopics.split(",").filter((t) => ALL_TOPICS.includes(t as TopicType)) as TopicType[];
        if (parsed.length > 0) topics = parsed;
      }
      if (urlTypes) {
        const parsed = urlTypes.split(",").filter((t) => ALL_CARD_TYPES.includes(t as CardType)) as CardType[];
        if (parsed.length > 0) types = parsed;
      }
      if (urlSearch) {
        search = urlSearch;
      }
      if (urlViewport === "desktop" || urlViewport === "mobile") {
        viewport = urlViewport;
      }
      if (urlFlip === "front" || urlFlip === "back") {
        flip = urlFlip;
      }
      if (urlOutlines === "true") {
        outlines = true;
      }
    } else {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (Array.isArray(data.topics) && data.topics.length > 0) {
            topics = data.topics.filter((t: string) => ALL_TOPICS.includes(t as TopicType));
          }
          if (Array.isArray(data.types) && data.types.length > 0) {
            types = data.types.filter((t: string) => ALL_CARD_TYPES.includes(t as CardType));
          }
          if (typeof data.search === "string") {
            search = data.search;
          }
          if (data.viewport === "desktop" || data.viewport === "mobile") {
            viewport = data.viewport;
          }
          if (data.flip === "front" || data.flip === "back") {
            flip = data.flip;
          }
          if (typeof data.outlines === "boolean") {
            outlines = data.outlines;
          }
        }
      } catch {
        // Ignore
      }
    }

    setActiveTopics(topics);
    setActiveCardTypes(types);
    setSearchQuery(search);
    setGlobalViewport(viewport);
    setGlobalState(flip);
    setShowOutlines(outlines);
    setIsInitialized(true);
  }, []);

  // ── 2. Sync state changes to URL query params and localStorage ─────────────
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;

    const isDefaultTopics = activeTopics.length === ALL_TOPICS.length;
    const isDefaultTypes = activeCardTypes.length === ALL_CARD_TYPES.length;
    const isDefaultSearch = !searchQuery.trim();
    const isDefaultViewport = globalViewport === "desktop";
    const isDefaultFlip = globalState === null;
    const isDefaultOutlines = showOutlines === false;

    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          topics: activeTopics,
          types: activeCardTypes,
          search: searchQuery,
          viewport: globalViewport,
          flip: globalState,
          outlines: showOutlines,
        })
      );
    } catch {
      // Ignore
    }

    const params = new URLSearchParams();
    if (!isDefaultTopics) params.set("topics", activeTopics.join(","));
    if (!isDefaultTypes) params.set("types", activeCardTypes.join(","));
    if (!isDefaultSearch) params.set("q", searchQuery.trim());
    if (!isDefaultViewport) params.set("viewport", globalViewport);
    if (!isDefaultFlip) params.set("flip", globalState);
    if (!isDefaultOutlines) params.set("outlines", "true");

    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [activeTopics, activeCardTypes, searchQuery, globalViewport, globalState, showOutlines, isInitialized]);

  // ── 3. Reset filters ───────────────────────────────────────────────────────
  const isCustomized =
    activeTopics.length !== ALL_TOPICS.length ||
    activeCardTypes.length !== ALL_CARD_TYPES.length ||
    searchQuery.trim() !== "" ||
    globalViewport !== "desktop" ||
    globalState !== null ||
    showOutlines !== false;

  function resetFilters() {
    setActiveTopics(ALL_TOPICS);
    setActiveCardTypes(ALL_CARD_TYPES);
    setSearchQuery("");
    setGlobalViewport("desktop");
    setGlobalState(null);
    setShowOutlines(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function toggleTopic(t: TopicType) {
    setActiveTopics((prev) =>
      prev.includes(t) ? (prev.length > 1 ? prev.filter((x) => x !== t) : prev) : [...prev, t]
    );
  }
  function toggleCardType(t: CardType) {
    setActiveCardTypes((prev) =>
      prev.includes(t) ? (prev.length > 1 ? prev.filter((x) => x !== t) : prev) : [...prev, t]
    );
  }

  const filteredIds = TEST_CARD_IDS.filter((id) => {
    const card = TEST_CARDS[id];
    const matchesTopic = activeTopics.includes(card.topic as TopicType);
    const matchesType = activeCardTypes.includes(card.cardType as CardType);
    if (!matchesTopic || !matchesType) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      id.toLowerCase().includes(q) ||
      (card.frontLabel && card.frontLabel.toLowerCase().includes(q)) ||
      (card.backDefinition && card.backDefinition.toLowerCase().includes(q)) ||
      (card.frontPrompt && card.frontPrompt.toLowerCase().includes(q))
    );
  });

  const grouped = filteredIds.reduce<Record<string, string[]>>((acc, id) => {
    const card = TEST_CARDS[id];
    if (!acc[card.topic]) acc[card.topic] = [];
    acc[card.topic].push(id);
    return acc;
  }, {});

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <main className="h-screen overflow-y-auto bg-gray-950 text-white">
      {/* Ultra-compact Sticky filter & control bar */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/80 px-3 sm:px-6 py-2 shadow-lg transition-all">
        {/* Row 1: Search and Right Actions (Always single row) */}
        <div className="flex items-center justify-between gap-2">
          {/* Search input */}
          <div className="relative flex-1 max-w-[280px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="w-full bg-gray-900/90 border border-gray-700/80 hover:border-gray-600 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none font-mono transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Side Actions: Count, Reset, More/Less */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-[11px] text-gray-400 font-mono whitespace-nowrap bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
              <strong className="text-white">{filteredIds.length}</strong> / {TEST_CARD_IDS.length}
            </span>

            {isCustomized && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-600/90 hover:bg-amber-500 text-white transition-all shadow-sm flex items-center gap-1"
                title="Reset all filters"
              >
                ↺ Reset
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors flex items-center gap-1"
              title={isCollapsed ? "Show secondary filters" : "Hide secondary filters"}
            >
              {isCollapsed ? "More ▾" : "Less ▴"}
            </button>
          </div>
        </div>

        {/* Row 2: Horizontally Scrollable Topic Chips (Always single row) */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 mt-1.5 no-scrollbar flex-nowrap border-t border-gray-800/40">
          <button
            type="button"
            onClick={() => setActiveTopics(activeTopics.length === ALL_TOPICS.length ? ["circles"] : ALL_TOPICS)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex-shrink-0 ${
              activeTopics.length === ALL_TOPICS.length
                ? "bg-emerald-600 text-white font-bold"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All Topics
          </button>
          {ALL_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTopic(t)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTopics.includes(t) && activeTopics.length !== ALL_TOPICS.length
                  ? "bg-emerald-700 text-white font-bold border border-emerald-500/50"
                  : activeTopics.includes(t)
                  ? "bg-gray-800 text-gray-300 hover:text-white"
                  : "bg-gray-900/60 border border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              {TOPIC_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Row 3: Secondary Controls (Segmented toggles, collapsible) */}
        {!isCollapsed && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 mt-1 border-t border-gray-800/60 text-xs">
            {/* Card Types */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Types:</span>
              <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-mono">
                {ALL_CARD_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleCardType(t)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      activeCardTypes.includes(t)
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {CARD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport (Desktop / Mobile) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">View:</span>
              <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setGlobalViewport("desktop")}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    globalViewport === "desktop"
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalViewport("mobile")}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    globalViewport === "mobile"
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Bulk Flip */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Flip All:</span>
              <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setGlobalState(globalState === "front" ? null : "front")}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    globalState === "front"
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Primary
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalState(globalState === "back" ? null : "back")}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    globalState === "back"
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Reveal
                </button>
              </div>
            </div>

            {/* Outlines Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Outlines:</span>
              <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setShowOutlines(false)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    !showOutlines
                      ? "bg-slate-700 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => setShowOutlines(true)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    showOutlines
                      ? "bg-cyan-600 text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  On
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Geometry Deck — Test Card Catalogue</h1>
        <p className="text-gray-400 text-sm mb-8">
          Interactive live card catalogue · Click any card or toggle Primary/Reveal, Desktop/Mobile viewports, and Outlines
        </p>

        {filteredIds.length === 0 ? (
          <p className="text-gray-600 font-mono text-sm">No cards match the current filters.</p>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([topic, ids]) => (
              <section key={topic}>
                <h2 className="text-base font-semibold uppercase tracking-widest mb-6 text-gray-400 border-b border-gray-800 pb-2">
                  {TOPIC_LABELS[topic as TopicType] || topic}
                </h2>

                <div className="flex flex-col items-center gap-8">
                  {ids.map((id) => {
                    const card = TEST_CARDS[id];
                    return (
                      <div key={id} className="w-full max-w-[750px]">
                        <InteractiveCardItem
                          card={card}
                          id={id}
                          overrideState={globalState}
                          globalViewport={globalViewport}
                          showOutlines={showOutlines}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
