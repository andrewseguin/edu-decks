"use client";

import React, { useState } from "react";
import { FlashCardShell, FrostedBadge } from "@decks/core";
import {
  Layers,
  Sparkles,
  Eye,
  Volume2,
  Info,
  Activity,
} from "lucide-react";

type CardPreset =
  | "math-basic"
  | "math-fraction"
  | "reading-letter"
  | "reading-word"
  | "geometry-term"
  | "geometry-proof"
  | "custom";

export default function DevShowcasePage() {
  const [selectedCard, setSelectedCard] = useState<CardPreset>("math-fraction");
  const [isRevealed, setIsRevealed] = useState(false);
  const [transitionSpeed, setTransitionSpeed] = useState<"1x" | "0.5x" | "0.25x" | "0.1x">("1x");
  const [showDebugBorders, setShowDebugBorders] = useState(true);
  const [currentProofStep, setCurrentProofStep] = useState(0);
  const [itemsList, setItemsList] = useState<string[]>([
    "Item 1: Primary concept explanation",
    "Item 2: Interactive step guide",
    "Item 3: Practical example case",
  ]);

  // Transition duration mapping for slow-mo testing
  const durationMs =
    transitionSpeed === "1x"
      ? 500
      : transitionSpeed === "0.5x"
      ? 1000
      : transitionSpeed === "0.25x"
      ? 2000
      : 5000;

  const proofSteps = [
    { eq: "a² + b² = c²", reason: "Pythagorean Theorem Formula" },
    { eq: "3² + 4² = c²", reason: "Substitute given sides a=3, b=4" },
    { eq: "9 + 16 = c²", reason: "Calculate squares" },
    { eq: "25 = c²", reason: "Simplify sum" },
    { eq: "c = √25 = 5", reason: "Take square root to find hypotenuse" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              EduDecks Dev Showcase
              <span className="px-2 py-0.5 text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                Internal Test Site
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Core card combinations & auto 3-way equal padding reveal lab
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-medium shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            {isRevealed ? "Unreveal Card" : "Reveal Card"}
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar Controls + Central Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-96 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen">
          {/* Card Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Supported Card Types
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "math-fraction", label: "Math Fraction + Conversion", deck: "Arithmetic" },
                { id: "math-basic", label: "Basic Arithmetic (7 + 5)", deck: "Arithmetic" },
                { id: "reading-word", label: "Phonics & Word Reading", deck: "Reading" },
                { id: "reading-letter", label: "Letter & Tracing Card", deck: "Reading" },
                { id: "geometry-term", label: "Geometry Term + Diagram", deck: "Geometry" },
                { id: "geometry-proof", label: "Geometry Proof Steps", deck: "Geometry" },
                { id: "custom", label: "Custom Playground Card", deck: "Dev Lab" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCard(c.id as CardPreset)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-sm ${
                    selectedCard === c.id
                      ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-200 font-medium"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {c.deck}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Slow-Motion Inspection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Transition Timing (Slow-Motion)
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { id: "1x", label: "1x (500ms)" },
                { id: "0.5x", label: "0.5x (1s)" },
                { id: "0.25x", label: "0.25x (2s)" },
                { id: "0.1x", label: "0.1x (5s)" },
              ].map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setTransitionSpeed(sp.id as any)}
                  className={`py-1.5 px-2 rounded border text-center font-mono text-[11px] transition-all ${
                    transitionSpeed === sp.id
                      ? "bg-purple-950/80 border-purple-500 text-purple-200 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  {sp.id}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Inspect how front content smoothly moves up while reveal content fades in with equal padding.
            </p>
          </div>

          <hr className="border-slate-800" />

          {/* Debug Overlays */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              Debug Alignment Borders
            </span>
            <input
              type="checkbox"
              checked={showDebugBorders}
              onChange={(e) => setShowDebugBorders(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 p-6 md:p-10 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Card Container Canvas */}
          <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">
            {/* Status Bar */}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isRevealed ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                  State: <strong className="text-slate-200">{isRevealed ? "REVEALED" : "UNREVEALED"}</strong>
                </span>
                <span>
                  Layout: <code className="text-cyan-400">Auto 3-Way Equal Padding</code>
                </span>
                <span>
                  Duration: <code className="text-purple-400">{durationMs}ms</code>
                </span>
              </div>
              <div className="text-slate-500">Click card body to toggle reveal state</div>
            </div>

            {/* Render Selected Card */}
            <div className="w-full flex justify-center py-6">
              <FlashCardShell
                isFlipped={isRevealed}
                backgroundColor={
                  selectedCard.startsWith("math")
                    ? "#0e7490"
                    : selectedCard.startsWith("reading")
                    ? "#047857"
                    : selectedCard.startsWith("geometry")
                    ? "#4338ca"
                    : "#6b21a8"
                }
                onCardTap={() => setIsRevealed(!isRevealed)}
                style={{
                  transitionDuration: `${durationMs}ms`,
                }}
                frontContent={
                  <div className={showDebugBorders ? "outline-1 outline-dashed outline-cyan-400/60 p-2" : "p-2"}>
                    <CardPrimaryContent
                      preset={selectedCard}
                      isRevealed={isRevealed}
                      itemsCount={itemsList.length}
                    />
                  </div>
                }
                revealContent={
                  <div className={showDebugBorders ? "outline-1 outline-dashed outline-emerald-400/60 p-2" : "p-2"}>
                    <CardDetailContent
                      preset={selectedCard}
                      isRevealed={isRevealed}
                      proofStep={currentProofStep}
                      setProofStep={setCurrentProofStep}
                      proofSteps={proofSteps}
                      itemsList={itemsList}
                      setItemsList={setItemsList}
                    />
                  </div>
                }
              />
            </div>

            {/* Explanatory Info Card */}
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">How Auto Equal-Padding Cards Work</p>
                <p className="text-slate-400 leading-relaxed">
                  Front content starts centered at rest. On reveal, the card automatically computes equal 3-way vertical padding (top, middle, bottom). ResizeObserver continuously monitors reveal content height changes and expands card container height if needed. No manual height flags or top-offset parameters required!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Render primary front content for different card types
function CardPrimaryContent({
  preset,
  isRevealed,
  itemsCount,
}: {
  preset: CardPreset;
  isRevealed: boolean;
  itemsCount: number;
}) {
  if (preset === "math-fraction") {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-3 text-4xl sm:text-6xl font-bold font-headline text-white select-none">
          <div className="inline-flex flex-col items-center">
            <span>3</span>
            <div className="w-full h-0.5 bg-white my-0.5" />
            <span>4</span>
          </div>
          <span>+</span>
          <div className="inline-flex flex-col items-center">
            <span>2</span>
            <div className="w-full h-0.5 bg-white my-0.5" />
            <span>4</span>
          </div>
          <span>=</span>
          <div className="relative inline-flex items-center justify-center min-w-[2.5rem]">
            {isRevealed ? (
              <div className="inline-flex flex-col items-center text-cyan-300 animate-fade-in-zoom">
                <span>5</span>
                <div className="w-full h-0.5 bg-cyan-300 my-0.5" />
                <span>4</span>
              </div>
            ) : (
              <FrostedBadge isFlipped={isRevealed} />
            )}
          </div>
        </div>

        {/* Subtitle conversion pill badge — only rendered when revealed to avoid inflating measurements */}
        {isRevealed && (
          <div
            className="px-3 py-1 bg-black/40 border border-white/20 rounded-full text-xs font-semibold text-white/90 whitespace-nowrap shadow-sm animate-fade-in-zoom pointer-events-none"
          >
            Converted to Mixed Number: <span className="text-amber-300 font-bold">1 1/4</span>
          </div>
        )}
      </div>
    );
  }

  if (preset === "math-basic") {
    return (
      <div className="flex items-center gap-3 text-5xl sm:text-7xl font-bold font-headline text-white select-none">
        <span>7</span>
        <span>+</span>
        <span>5</span>
        <span>=</span>
        <div className="relative inline-flex items-center justify-center min-w-[3rem]">
          {isRevealed ? (
            <span className="text-amber-300 animate-fade-in-zoom">12</span>
          ) : (
            <FrostedBadge isFlipped={isRevealed} />
          )}
        </div>
      </div>
    );
  }

  if (preset === "reading-letter") {
    return (
      <div className="flex flex-col items-center select-none">
        <span className="text-7xl sm:text-9xl font-bold font-headline text-white drop-shadow-md">
          A a
        </span>
        <span className="text-lg text-emerald-200 font-medium mt-1">
          /æ/ as in Apple
        </span>
      </div>
    );
  }

  if (preset === "reading-word") {
    return (
      <div className="flex flex-col items-center select-none">
        <span className="text-6xl sm:text-8xl font-bold font-headline text-white tracking-wide">
          apple
        </span>
        <div className="flex gap-2 mt-2">
          {["ap", "ple"].map((seg, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded bg-white/20 text-white font-semibold text-sm border border-white/30"
            >
              {seg}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (preset === "geometry-term") {
    return (
      <div className="flex flex-col items-center text-center select-none px-4">
        <span className="font-headline font-bold text-white text-3xl sm:text-4xl leading-tight">
          Right Triangle
        </span>
        <span
          className={`italic text-white/60 text-center text-base sm:text-lg block overflow-hidden transition-all duration-500 ease-in-out ${
            isRevealed ? "max-h-0 opacity-0 mt-0" : "max-h-[60px] opacity-100 mt-1"
          }`}
        >
          A triangle with one 90-degree angle
        </span>
      </div>
    );
  }

  if (preset === "geometry-proof") {
    return (
      <div className="flex flex-col items-center text-center select-none px-4">
        <span className="text-2xl sm:text-3xl font-bold text-white font-headline">
          Pythagorean Theorem
        </span>
        <span className="text-sm text-indigo-200 font-semibold mt-0.5">
          Find hypotenuse (c) for a=3, b=4
        </span>
      </div>
    );
  }

  // Custom Playground
  return (
    <div className="flex flex-col items-center text-center select-none">
      <span className="text-3xl sm:text-4xl font-bold text-white font-headline">
        Dynamic Item List Card
      </span>
      <span className="text-xs text-purple-200 font-semibold mt-1">
        {itemsCount} {itemsCount === 1 ? "Item" : "Items"} in Detail Container ({isRevealed ? "Revealed" : "Centered"})
      </span>
    </div>
  );
}

// Render detail content slid up when card is revealed
function CardDetailContent({
  preset,
  isRevealed,
  proofStep,
  setProofStep,
  proofSteps,
  itemsList,
  setItemsList,
}: {
  preset: CardPreset;
  isRevealed: boolean;
  proofStep: number;
  setProofStep: (i: number) => void;
  proofSteps: { eq: string; reason: string }[];
  itemsList: string[];
  setItemsList: (items: string[]) => void;
}) {
  if (preset === "math-fraction" || preset === "math-basic") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
        <div className="bg-black/30 border border-white/20 rounded-2xl p-4 w-full max-w-md flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase text-cyan-200 tracking-wider">
            Visual Math Hint & Representation
          </span>
          <div className="flex items-center justify-center gap-2 py-2">
            {/* Grid items visual */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div
                  key={n}
                  className="w-6 h-6 rounded-md bg-cyan-400 border border-white/40 flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm"
                >
                  {n}
                </div>
              ))}
            </div>
            <span className="text-white font-bold">+</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-6 h-6 rounded-md bg-amber-400 border border-white/40 flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
          <span className="text-xs text-white/80">Total 12 units counted</span>
        </div>
      </div>
    );
  }

  if (preset === "reading-letter" || preset === "reading-word") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
        <div className="bg-black/30 border border-white/20 rounded-2xl p-4 w-full max-w-md flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-emerald-200">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Audio Audio Pronunciation</div>
              <div className="text-xs text-emerald-200">Phonics audio & tracing guide active</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (preset === "geometry-term") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
        <div className="bg-black/30 border border-white/20 rounded-2xl p-4 w-full max-w-md flex flex-col items-center gap-3">
          <p className="text-sm text-white leading-relaxed font-medium">
            A right triangle is a polygon with three sides and three angles, where one angle is exactly 90 degrees (a right angle).
          </p>
          <div className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/40">
            Property: hypotenuse² = sideA² + sideB²
          </div>
        </div>
      </div>
    );
  }

  if (preset === "geometry-proof") {
    return (
      <div className="flex-1 flex flex-col items-center justify-between p-2">
        <div className="w-full max-w-md space-y-1.5 my-auto">
          {proofSteps.slice(0, proofStep + 1).map((s, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                i === proofStep
                  ? "bg-indigo-950/80 border-indigo-400 text-white font-bold shadow-md"
                  : "bg-black/20 border-white/10 text-white/70"
              }`}
            >
              <span className="font-mono text-sm">{s.eq}</span>
              <span className="text-[11px] text-indigo-200/80 italic">{s.reason}</span>
            </div>
          ))}
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setProofStep(Math.max(0, proofStep - 1));
            }}
            disabled={proofStep === 0}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs rounded font-medium"
          >
            Prev Step
          </button>
          <span className="text-xs text-white/70 font-mono">
            {proofStep + 1} / {proofSteps.length}
          </span>
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setProofStep(Math.min(proofSteps.length - 1, proofStep + 1));
            }}
            disabled={proofStep === proofSteps.length - 1}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs rounded font-medium"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-2 w-full">
      {/* Dynamic item list */}
      <div className="w-full max-w-md space-y-1.5 p-1">
        {itemsList.map((item, index) => (
          <div
            key={index}
            className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/40 text-xs text-white font-medium flex items-center justify-between shadow-sm animate-fade-in-zoom"
          >
            <span>{item}</span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-900/80 px-2 py-0.5 rounded">
              #{index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive controls — shrink-0 guarantees buttons stay pinned at bottom */}
      <div className="flex flex-nowrap items-center justify-center gap-2 pt-2 border-t border-white/10 w-full max-w-md shrink-0">
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setItemsList([...itemsList, `Item ${itemsList.length + 1}: Dynamic list content`]);
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow active:scale-95 flex items-center gap-1"
        >
          + Add Item
        </button>
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (itemsList.length > 1) setItemsList(itemsList.slice(0, -1));
          }}
          disabled={itemsList.length <= 1}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition-all shadow active:scale-95 flex items-center gap-1"
        >
          - Remove Item
        </button>
        <div className="flex gap-1">
          {[1, 3, 6, 10].map((count) => (
            <button
              key={count}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setItemsList(
                  Array.from({ length: count }, (_, i) => `Item ${i + 1}: Dynamic step line`)
                );
              }}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-all ${
                itemsList.length === count
                  ? "bg-purple-600 border-purple-300 text-white font-bold"
                  : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
              }`}
            >
              {count}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
