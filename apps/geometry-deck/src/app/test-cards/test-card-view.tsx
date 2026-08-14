"use client";

/**
 * TestCardView — Client Component
 *
 * Index view: streamlined interactive card catalogue with Primary/Reveal flip controls and Desktop/Mobile viewport toggles.
 * Single-card view: full-page rendering of one card at a specific state (used by visual regression tests).
 */

import { useState } from "react";
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
const ALL_CARD_TYPES: CardType[] = ["term", "formula", "calculation"];
const CARD_TYPE_LABELS: Record<CardType, string> = { term: "Terms", formula: "Formulas", calculation: "Calculations" };

// ─────────────────────────────────────────────────────────────────────────────
// InteractiveCardItem
// Renders the actual card directly. Tapping the card or state buttons toggles
// between Primary (Front) and Reveal (Back). Supports Desktop vs Mobile viewports.
// ─────────────────────────────────────────────────────────────────────────────
function InteractiveCardItem({
  card,
  id,
  overrideState,
  globalViewport,
}: {
  card: GeometryCardType;
  id: string;
  overrideState: "front" | "back" | null;
  globalViewport: "desktop" | "mobile";
}) {
  const [localFlipped, setLocalFlipped] = useState<boolean | null>(null);
  const [localViewport, setLocalViewport] = useState<"desktop" | "mobile" | null>(null);

  // Use local toggle if user explicitly clicked, otherwise follow global overrides
  const isFlipped = localFlipped !== null ? localFlipped : overrideState === "back";
  const viewport = localViewport ?? globalViewport;

  const typeTag = card.cardType === "term" ? "Term" : card.cardType === "formula" ? "Formula" : "Calculation";
  const typeBadgeColor =
    card.cardType === "term"
      ? "bg-cyan-950/80 text-cyan-300 border-cyan-800/60"
      : card.cardType === "formula"
      ? "bg-purple-950/80 text-purple-300 border-purple-800/60"
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

        {/* Controls Bar: Viewport + State */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Viewport Toggle */}
          <div className="flex items-center bg-gray-950/80 p-1 rounded-xl border border-gray-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setLocalViewport("desktop")}
              className={`px-2.5 py-0.5 rounded-lg transition-all ${
                viewport === "desktop"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setLocalViewport("mobile")}
              className={`px-2.5 py-0.5 rounded-lg transition-all ${
                viewport === "mobile"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Mobile
            </button>
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
function GalleryView() {
  const [activeTopics, setActiveTopics] = useState<TopicType[]>(ALL_TOPICS);
  const [activeCardTypes, setActiveCardTypes] = useState<CardType[]>(ALL_CARD_TYPES);
  const [globalState, setGlobalState] = useState<"front" | "back" | null>(null);
  const [globalViewport, setGlobalViewport] = useState<"desktop" | "mobile">("desktop");

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
    return activeTopics.includes(card.topic as TopicType) && activeCardTypes.includes(card.cardType as CardType);
  });

  const grouped = filteredIds.reduce<Record<string, string[]>>((acc, id) => {
    const card = TEST_CARDS[id];
    if (!acc[card.topic]) acc[card.topic] = [];
    acc[card.topic].push(id);
    return acc;
  }, {});

  return (
    <main className="h-screen overflow-y-auto bg-gray-950 text-white">
      {/* Sticky filter & control bar */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 sm:px-8 py-4 flex flex-wrap gap-6 items-start shadow-md">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTopic(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeTopics.includes(t)
                    ? "bg-emerald-700 text-white font-semibold"
                    : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}
              >
                {TOPIC_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Card Types</p>
          <div className="flex gap-1.5">
            {ALL_CARD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleCardType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeCardTypes.includes(t)
                    ? "bg-emerald-700 text-white font-semibold"
                    : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}
              >
                {CARD_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Viewport</p>
          <div className="flex gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setGlobalViewport("desktop")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                globalViewport === "desktop"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setGlobalViewport("mobile")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                globalViewport === "mobile"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Bulk Flip</p>
          <div className="flex gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setGlobalState("front")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                globalState === "front"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              All Primary
            </button>
            <button
              type="button"
              onClick={() => setGlobalState("back")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                globalState === "back"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              All Reveal
            </button>
          </div>
        </div>

        <div className="ml-auto self-center text-right">
          <p className="text-xs text-gray-400 font-mono">{filteredIds.length} / {TEST_CARD_IDS.length} cards</p>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Geometry Deck — Test Card Catalogue</h1>
        <p className="text-gray-400 text-sm mb-8">
          Interactive live card catalogue · Click any card or toggle Primary/Reveal and Desktop/Mobile viewports
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {ids.map((id) => {
                    const card = TEST_CARDS[id];
                    return (
                      <InteractiveCardItem
                        key={id}
                        card={card}
                        id={id}
                        overrideState={globalState}
                        globalViewport={globalViewport}
                      />
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
