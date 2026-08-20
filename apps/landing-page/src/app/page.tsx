"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, CheckCircle2, HeartHandshake } from "lucide-react";
import { DECK_COLORS } from "@decks/core";
import { ThemeToggle } from "../components/theme-toggle";

const TRUST_BADGES = [
  "100% Free",
  "Zero Ads or Trackers",
  "No Account Required",
  "Open Source",
];

interface AppScreenshot {
  label: string;
  src: string;
  srcDark?: string;
}

interface AppInfo {
  id: string;
  title: string;
  subtitle: string;
  ageRange: string;
  description: string;
  webUrl: string;
  playStoreUrl?: string;
  primaryButtonClass: string;
  accentBorder: string;
  screenshots: AppScreenshot[];
}

const APPS: AppInfo[] = [
  {
    id: "arithmetic",
    title: "Arithmetic Deck",
    subtitle: "Mental Arithmetic & Number Sense",
    ageRange: "Ages 4–10 (Pre-K to 4th)",
    description:
      "Build mental math fluency across operations (+, −, ×, ÷), fractions, and 10-frame visual models with step-by-step strategy hints.",
    webUrl: "https://arithmetic.edudecks.org/?ref=landing",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=org.edudecks.arithmetic",
    primaryButtonClass: DECK_COLORS.emerald.btn,
    accentBorder: "border-t-emerald-500",
    screenshots: [
      {
        label: "Front",
        src: "/screenshots/arithmetic/landscape-1-card-front.png",
        srcDark: "/screenshots/arithmetic/landscape-1-card-front-dark.png",
      },
      {
        label: "Visuals",
        src: "/screenshots/arithmetic/landscape-2-card-back.png",
        srcDark: "/screenshots/arithmetic/landscape-2-card-back-dark.png",
      },
      {
        label: "Quiz",
        src: "/screenshots/arithmetic/landscape-3-quiz-mode.png",
        srcDark: "/screenshots/arithmetic/landscape-3-quiz-mode-dark.png",
      },
    ],
  },
  {
    id: "reading",
    title: "Reading Deck",
    subtitle: "Phonics, Letters & Reading Fluency",
    ageRange: "Ages 3–8 (Pre-K to 2nd)",
    description:
      "Learn the alphabet, letter-sound phonics, animated stroke handwriting guides, and 1,000+ sight words with crystal-clear voice audio.",
    webUrl: "https://reading.edudecks.org/?ref=landing",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=org.edudecks.reading",
    primaryButtonClass: DECK_COLORS.emerald.btn,
    accentBorder: "border-t-emerald-500",
    screenshots: [
      {
        label: "Letters",
        src: "/screenshots/reading/landscape-1-card-front.png",
        srcDark: "/screenshots/reading/landscape-1-card-front-dark.png",
      },
      {
        label: "Words",
        src: "/screenshots/reading/landscape-2-card-back.png",
        srcDark: "/screenshots/reading/landscape-2-card-back-dark.png",
      },
      {
        label: "Quiz",
        src: "/screenshots/reading/landscape-3-quiz-mode.png",
        srcDark: "/screenshots/reading/landscape-3-quiz-mode-dark.png",
      },
    ],
  },
  {
    id: "geometry",
    title: "Geometry Deck",
    subtitle: "Formulas, Properties & Theorems",
    ageRange: "Ages 9–14 (4th to 8th)",
    description:
      "Explore geometric proofs, angle rules, the Pythagorean theorem, area formulas, 3D solids, and polygon properties with interactive visual models.",
    webUrl: "https://geometry.edudecks.org/?ref=landing",
    primaryButtonClass: DECK_COLORS.emerald.btn,
    accentBorder: "border-t-emerald-500",
    screenshots: [
      {
        label: "Concepts",
        src: "/screenshots/geometry/landscape-1-card-front.png",
        srcDark: "/screenshots/geometry/landscape-1-card-front-dark.png",
      },
      {
        label: "Proofs",
        src: "/screenshots/geometry/landscape-2-card-back.png",
        srcDark: "/screenshots/geometry/landscape-2-card-back-dark.png",
      },
      {
        label: "Quiz",
        src: "/screenshots/geometry/landscape-3-quiz-mode.png",
        srcDark: "/screenshots/geometry/landscape-3-quiz-mode-dark.png",
      },
    ],
  },
];

export default function HomePage() {
  const [selectedScreenshots, setSelectedScreenshots] = React.useState<
    Record<string, number>
  >({
    arithmetic: 0,
    reading: 0,
    geometry: 0,
  });

  const handleSelectScreenshot = (appId: string, index: number) => {
    setSelectedScreenshots((prev) => ({ ...prev, [appId]: index }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="EduDecks"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain select-none shrink-0"
              priority
            />
            <span className="font-headline font-bold text-xl sm:text-2xl tracking-tight text-foreground">
              EduDecks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/edu-decks/edu-decks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex"
            >
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10 my-auto">
        {/* 1. Hero & Trust Badge Strip */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-foreground sm:whitespace-nowrap leading-tight">
            Simple learning cards.
          </h1>

          {/* Clean Neutral Trust Badge Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-5">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/70"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* 2. Deck Cards Showcase */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {APPS.map((app) => {
            const currentIdx = selectedScreenshots[app.id] ?? 0;
            const currentScreenshot =
              app.screenshots[currentIdx] || app.screenshots[0];

            return (
              <div
                key={app.id}
                className={`group flex flex-col bg-card border border-border/80 rounded-3xl p-6 sm:p-7 pt-7 sm:pt-8 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden border-t-4 ${app.accentBorder}`}
              >
                {/* Top Bar: Large App Title & Subtitle */}
                <div className="mb-3 pt-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground tracking-tight">
                    {app.title}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {app.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground/90 mt-1.5 font-medium">
                    {app.ageRange}
                  </p>
                </div>

                {/* Actual Screenshot Frame (Native 16:10 Aspect Ratio) */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border/80 bg-card shadow-xs my-3 select-none">
                  {/* Light Mode Screenshot (or single fallback) */}
                  <Image
                    src={currentScreenshot.src}
                    alt={`${app.title} - ${currentScreenshot.label}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-opacity duration-300 ${currentScreenshot.srcDark ? "dark:hidden" : ""}`}
                    priority
                  />
                  {/* Dark Mode Screenshot */}
                  {currentScreenshot.srcDark && (
                    <Image
                      src={currentScreenshot.srcDark}
                      alt={`${app.title} - ${currentScreenshot.label} (Dark Mode)`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-opacity duration-300 hidden dark:block"
                    />
                  )}
                </div>

                {/* Interactive Screenshot Selector Pill Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 mb-4">
                  {app.screenshots.map((s, idx) => {
                    const isSelected = currentIdx === idx;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => handleSelectScreenshot(app.id, idx)}
                        className={`py-1.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all text-center whitespace-nowrap overflow-hidden ${
                          isSelected
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className={`grid ${app.playStoreUrl ? "grid-cols-2" : "grid-cols-1"} gap-2.5 mt-auto pt-2`}>
                  <a
                    href={app.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-headline font-semibold text-xs shadow-xs transition-all active:scale-[0.98] ${app.primaryButtonClass}`}
                  >
                    <span>Open Web App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {app.playStoreUrl && (
                    <a
                      href={app.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl font-headline bg-muted/80 hover:bg-muted text-foreground border border-border/80 transition-all active:scale-[0.98]"
                    >
                      <Image
                        src="/play_prism.svg"
                        alt="Google Play"
                        width={20}
                        height={20}
                        className="w-5 h-5 shrink-0 object-contain"
                      />
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Get it on</span>
                        <span className="text-xs font-semibold text-foreground tracking-tight mt-0.5">Google Play</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* 3. Parent Co-Learning Section Banner */}
        <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-foreground">
                Built for Co-Learning
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                EduDecks apps are interactive flash cards made for practicing together.
                Each deck includes visual hints and audio prompts, but kids learn best when someone sits with them to guide their practice, answer questions, and celebrate their progress.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6 bg-card/40 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>© {new Date().getFullYear()} EduDecks LLC · Free & Open Source</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <a
              href="https://github.com/edu-decks/edu-decks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://github.com/edu-decks/edu-decks/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              File Issues
            </a>
            <a
              href="mailto:support@edudecks.org"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              support@edudecks.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
