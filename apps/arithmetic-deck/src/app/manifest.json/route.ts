import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? "/arithmetic-deck" : "");

  const manifest = {
    short_name: "Arithmetic Deck",
    name: "Arithmetic Deck - Mental Arithmetic & Number Sense",
    description: "Mental arithmetic and number sense flashcards",
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
    background_color: "#09090b",
    theme_color: "#09090b",
    display: "standalone",
    orientation: "any",
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
