/**
 * Canonical brand and flashcard color system for the EduDecks suite.
 * Standardizes vibrant Tailwind 600/500 palette tokens across all decks, icons, and apps.
 */
export const DECK_COLORS = {
  emerald: {
    name: "Emerald",
    hex: "#059669",
    hex500: "#10b981",
    bg: "bg-emerald-600",
    text: "text-emerald-400",
    border: "border-emerald-600",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    badgeBorder: "border-emerald-500/20",
    btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  amber: {
    name: "Amber",
    hex: "#d97706",
    hex500: "#f59e0b",
    bg: "bg-amber-600",
    text: "text-amber-400",
    border: "border-amber-600",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    badgeBorder: "border-amber-500/20",
    btn: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  sky: {
    name: "Sky",
    hex: "#0284c7",
    hex500: "#0ea5e9",
    bg: "bg-sky-600",
    text: "text-sky-400",
    border: "border-sky-600",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-600 dark:text-sky-400",
    badgeBorder: "border-sky-500/20",
    btn: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  indigo: {
    name: "Indigo",
    hex: "#4f46e5",
    hex500: "#6366f1",
    bg: "bg-indigo-600",
    text: "text-indigo-400",
    border: "border-indigo-600",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    badgeBorder: "border-indigo-500/20",
    btn: "bg-indigo-600 hover:bg-indigo-500 text-white",
  },
  purple: {
    name: "Purple",
    hex: "#9333ea",
    hex500: "#8b5cf6",
    bg: "bg-purple-600",
    text: "text-purple-400",
    border: "border-purple-600",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400",
    badgeBorder: "border-purple-500/20",
    btn: "bg-purple-600 hover:bg-purple-500 text-white",
  },
  rose: {
    name: "Rose",
    hex: "#e11d48",
    hex500: "#f43f5e",
    bg: "bg-rose-600",
    text: "text-rose-400",
    border: "border-rose-600",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400",
    badgeBorder: "border-rose-500/20",
    btn: "bg-rose-600 hover:bg-rose-500 text-white",
  },
  orange: {
    name: "Orange",
    hex: "#ea580c",
    hex500: "#f97316",
    bg: "bg-orange-600",
    text: "text-orange-400",
    border: "border-orange-600",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-600 dark:text-orange-400",
    badgeBorder: "border-orange-500/20",
    btn: "bg-orange-600 hover:bg-orange-500 text-white",
  },
} as const;

export type DeckColorKey = keyof typeof DECK_COLORS;

/**
 * Standard warm background canvas colors matching light and dark themes.
 */
export const CANVAS_COLORS = {
  cream: "#fbf7ee",
  charcoal: "#151311",
} as const;
