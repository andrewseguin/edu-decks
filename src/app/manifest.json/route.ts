import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const manifest = {
    short_name: "Math Deck",
    name: "Math Deck - Mental Math Flashcards",
    description: "Fun mental math flashcards for kids",
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: `${basePath}/icon-512.png`,
        type: "image/png",
        sizes: "512x512",
      },
      {
        src: `${basePath}/icon-maskable-512.png`,
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
    start_url: basePath ? `${basePath}/` : "/",
    scope: basePath ? `${basePath}/` : "/",
    background_color: "#059669",
    theme_color: "#059669",
    display: "standalone",
    orientation: "any",
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
