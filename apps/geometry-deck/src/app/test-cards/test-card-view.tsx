"use client";

/**
 * TestCardView — Client Component
 *
 * Index view: live thumbnail gallery of every card × every state.
 * Single-card view: full-page rendering of one card at a specific state/step.
 */

import Link from "next/link";
import { GeometryCard } from "@/components/geometry-card";
import { TEST_CARDS, TEST_CARD_IDS } from "@/lib/test-card-catalogue";
import type { GeometryCard as GeometryCardType } from "@/lib/types";

type Props = {
  cardId: string | undefined;
  state: "front" | "back";
  step: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Thumbnail constants
// The card renders at 700 × 360 in a Desktop-width viewport.
// We scale it down to a thumbnail size for the gallery.
// ─────────────────────────────────────────────────────────────────────────────
const CARD_W = 700;
const CARD_H = 360;
const SCALE = 0.27;
const THUMB_W = Math.round(CARD_W * SCALE); // ~189px
const THUMB_H = Math.round(CARD_H * SCALE); // ~97px

// ─────────────────────────────────────────────────────────────────────────────
// CardThumbnail
// Uses position:absolute + scale so the full-size card renders at pixel-perfect
// quality and is visually clipped to thumbnail size by overflow:hidden.
// ─────────────────────────────────────────────────────────────────────────────
function CardThumbnail({
  card,
  isFlipped,
  step,
  label,
  href,
}: {
  card: GeometryCardType;
  isFlipped: boolean;
  step: number;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex flex-col gap-1 group">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ width: THUMB_W, height: THUMB_H }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* Centering wrapper so the card component is visible */}
          <div className="flex items-center justify-center w-full h-full bg-gray-950">
            <GeometryCard
              card={card}
              isFlipped={isFlipped}
              forcedStepIndex={isFlipped ? step : undefined}
              slideDirection="next"
              onSpeak={() => {}}
              onTap={() => {}}
            />
          </div>
        </div>
      </div>
      <span className="text-gray-500 text-[10px] font-mono text-center leading-tight group-hover:text-gray-300 transition-colors">
        {label}
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function TestCardView({ cardId, state, step }: Props) {

  // ── Single-card view ────────────────────────────────────────────────────
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

    const stepCount = card.backSteps?.length ?? 0;

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
          data-step={step}
          data-step-count={stepCount}
          className="sr-only"
          aria-hidden="true"
        />

        <GeometryCard
          card={card}
          isFlipped={state === "back"}
          forcedStepIndex={state === "back" ? step : undefined}
          slideDirection="next"
          onSpeak={() => {}}
          onTap={() => {}}
        />

        {/* Step nav */}
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
          {Array.from({ length: stepCount }, (_, i) => (
            <Link
              key={i}
              href={`/test-cards?card=${cardId}&state=back&step=${i}`}
              className={`px-2 py-1 rounded ${
                state === "back" && step === i
                  ? "bg-white text-gray-900 font-bold"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              back·{i}
            </Link>
          ))}
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
// GalleryView — separate component so it can use hooks
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { TOPIC_LABELS } from "@/lib/colors";
import type { TopicType, CardType } from "@/lib/types";

const ALL_TOPICS: TopicType[] = ["angles", "triangles", "quadrilaterals", "circles", "polygons", "3d-shapes"];
const ALL_CARD_TYPES: CardType[] = ["term", "formula", "calculation"];
const CARD_TYPE_LABELS: Record<CardType, string> = { term: "Terms", formula: "Formulas", calculation: "Calculations" };

function GalleryView() {
  const [activeTopics, setActiveTopics] = useState<TopicType[]>(ALL_TOPICS);
  const [activeCardTypes, setActiveCardTypes] = useState<CardType[]>(ALL_CARD_TYPES);

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
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-8 py-4 flex flex-wrap gap-6 items-start">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeTopics.includes(t)
                    ? "bg-emerald-700 text-white"
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
                onClick={() => toggleCardType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeCardTypes.includes(t)
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}
              >
                {CARD_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto self-center text-right">
          <p className="text-xs text-gray-500 font-mono">{filteredIds.length} / {TEST_CARD_IDS.length} cards</p>
        </div>
      </div>

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-1">Geometry Deck — Test Card Catalogue</h1>
        <p className="text-gray-400 text-sm mb-10">
          Click any thumbnail to open full view · development only
        </p>

        {filteredIds.length === 0 ? (
          <p className="text-gray-600 font-mono text-sm">No cards match the current filters.</p>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([topic, ids]) => (
              <section key={topic}>
                <h2 className="text-base font-semibold uppercase tracking-widest mb-4 text-gray-400 border-b border-gray-800 pb-2">
                  {topic}
                </h2>

                <div className="flex flex-col gap-8">
                  {ids.map((id) => {
                    const card = TEST_CARDS[id];
                    const stepCount = card.backSteps?.length ?? 0;
                    const typeTag = card.cardType === "term" ? "T" : card.cardType === "formula" ? "F" : "C";

                    return (
                      <div key={id} className="flex items-start gap-5">
                        <div className="w-48 shrink-0 pt-1">
                          <span className="text-[10px] font-mono text-gray-600 uppercase">{typeTag}</span>
                          <p className="text-xs font-mono text-gray-300 break-all leading-snug mt-0.5">{id}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <CardThumbnail card={card} isFlipped={false} step={-1} label="front" href={`/test-cards?card=${id}&state=front`} />
                          {stepCount > 0 && (
                            <CardThumbnail card={card} isFlipped={true} step={-1} label="back·∅" href={`/test-cards?card=${id}&state=back&step=-1`} />
                          )}
                          {Array.from({ length: stepCount }, (_, i) => (
                            <CardThumbnail key={i} card={card} isFlipped={true} step={i}
                              label={i === stepCount - 1 ? "answer" : `step·${i}`}
                              href={`/test-cards?card=${id}&state=back&step=${i}`}
                            />
                          ))}
                        </div>
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
