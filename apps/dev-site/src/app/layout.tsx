import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduDecks — Internal Core Feature Showcase & Card Lab",
  description: "Internal developer test site for testing core features, card combinations, and reveal height transitions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
