"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { DECK_COLORS } from "@decks/core";
import { ThemeToggle } from "../components/theme-toggle";

const TRUST_BADGES = [
  "100% Free",
  "Zero Ads or Trackers",
  "No Account Required",
  "Works Offline (PWA)",
];

const APPS = [
  {
    id: "arithmetic",
    title: "Arithmetic Deck",
    subtitle: "Mental Arithmetic & Number Sense",
    ageRange: "Ages 4–10 (Pre-K to 4th)",
    description:
      "Master numbers, operations (+, −, ×, ÷), fractions, and 10-frame bonds with visual animation steps and instant feedback.",
    webUrl: "https://arithmetic.edudecks.org",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=org.edudecks.arithmetic",
    primaryButtonClass: DECK_COLORS.emerald.btn,
    ageBadgeClass: "bg-muted/60 text-muted-foreground border-border/70",
    screenshots: [
      {
        label: "Card Front",
        src: "/screenshots/arithmetic/landscape-1-card-front.png",
        srcDark: "/screenshots/arithmetic/landscape-1-card-front-dark.png",
      },
      {
        label: "Visual Model",
        src: "/screenshots/arithmetic/landscape-2-card-back.png",
        srcDark: "/screenshots/arithmetic/landscape-2-card-back-dark.png",
      },
      {
        label: "Quiz Mode",
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
    webUrl: "https://reading.edudecks.org",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=org.edudecks.reading",
    primaryButtonClass: DECK_COLORS.emerald.btn,
    ageBadgeClass: "bg-muted/60 text-muted-foreground border-border/70",
    screenshots: [
      {
        label: "Phonics Card",
        src: "/screenshots/reading/landscape-1-card-front.png",
        srcDark: "/screenshots/reading/landscape-1-card-front-dark.png",
      },
      {
        label: "Sight Words",
        src: "/screenshots/reading/landscape-2-card-back.png",
        srcDark: "/screenshots/reading/landscape-2-card-back-dark.png",
      },
      {
        label: "Quiz Mode",
        src: "/screenshots/reading/landscape-3-quiz-mode.png",
        srcDark: "/screenshots/reading/landscape-3-quiz-mode-dark.png",
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
  });

  const handleSelectScreenshot = (appId: string, index: number) => {
    setSelectedScreenshots((prev) => ({ ...prev, [appId]: index }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
              href="https://github.com/andrewseguin/edu-decks"
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
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10 my-auto">
        {/* 1. Hero & Trust Badge Strip */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-foreground sm:whitespace-nowrap leading-tight">
            Simple, ad-free learning cards.
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {APPS.map((app) => {
            const currentIdx = selectedScreenshots[app.id] ?? 0;
            const currentScreenshot =
              app.screenshots[currentIdx] || app.screenshots[0];

            return (
              <div
                key={app.id}
                className="group flex flex-col bg-card border border-border/80 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                {/* Top Bar: Title & Target Age */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-xl font-bold font-headline text-foreground tracking-tight">
                      {app.title}
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      {app.subtitle}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${app.ageBadgeClass}`}
                  >
                    {app.ageRange}
                  </span>
                </div>

                {/* Actual Screenshot Frame (Native 16:9 Aspect Ratio) */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border/80 bg-card shadow-xs my-3 select-none">
                  {/* Light Mode Screenshot */}
                  <Image
                    src={currentScreenshot.src}
                    alt={`${app.title} - ${currentScreenshot.label}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover transition-opacity duration-300 dark:hidden"
                    priority
                  />
                  {/* Dark Mode Screenshot */}
                  <Image
                    src={currentScreenshot.srcDark}
                    alt={`${app.title} - ${currentScreenshot.label} (Dark Mode)`}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover transition-opacity duration-300 hidden dark:block"
                    priority
                  />
                </div>

                {/* Screenshot Switcher Segmented Control */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/40 border border-border/50 mb-4 select-none">
                  {app.screenshots.map((s, idx) => {
                    const isSelected = idx === currentIdx;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => handleSelectScreenshot(app.id, idx)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center truncate ${
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
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-6">
                  {app.description}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-auto pt-2">
                  <a
                    href={app.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-headline font-semibold text-xs shadow-xs transition-all active:scale-[0.98] ${app.primaryButtonClass}`}
                  >
                    <span>Open Web App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={app.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-headline font-semibold text-xs bg-muted/80 hover:bg-muted text-foreground border border-border/80 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186c-.36-.36-.61-.88-.61-1.516V3.33c0-.636.25-1.156.609-1.516zm11.246 11.246l2.368-2.368-2.368-2.368 2.057-1.188 3.535 2.04c.902.52.902 1.368 0 1.89l-3.535 2.04-2.057-1.046zM4.686 1.077L14.07 10.46l-2.072 2.072L4.686 1.077zm0 21.846l7.312-11.455 2.072 2.072-9.384 9.383z" />
                    </svg>
                    <span>Google Play</span>
                  </a>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6 bg-card/40 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>© {new Date().getFullYear()} EduDecks · Free, Open & Ad-Free</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <a
              href="https://github.com/andrewseguin/edu-decks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
