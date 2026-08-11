import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@decks/core";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduDecks - Minimalist Educational Flashcards for Kids",
  description:
    "A suite of playful, distraction-free educational flashcard apps for mental arithmetic, phonics, and reading fluency. 100% free, no ads, and private.",
  keywords: [
    "educational flashcards",
    "math flashcards",
    "mental arithmetic",
    "phonics flashcards",
    "sight words",
    "reading fluency",
    "kids learning",
    "ad-free educational apps",
  ],
  authors: [{ name: "EduDecks Team" }],
  creator: "EduDecks",
  publisher: "EduDecks",
  metadataBase: new URL("https://edudecks.org"),
  openGraph: {
    title: "EduDecks - Minimalist Educational Flashcards for Kids",
    description:
      "Playful, distraction-free flashcard apps for mental arithmetic, phonics, and reading fluency. Free, open, and private.",
    url: "https://edudecks.org",
    siteName: "EduDecks",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
