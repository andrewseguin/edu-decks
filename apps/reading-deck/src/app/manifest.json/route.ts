import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/reading-deck' : '';

  const manifest = {
    "theme_color": "#09090b",
    "background_color": "#09090b",
    "display": "standalone",
    "scope": isProd ? "/reading-deck/" : "/",
    "start_url": isProd ? "/reading-deck/" : "/",
    "name": "Reading Deck",
    "short_name": "Reading Deck",
    "description": "Reading Deck - Phonics, Letters & Reading Fluency",
    "icons": [
      {
        "src": `${basePath}/icon-192.png`,
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": `${basePath}/icon-512.png`,
        "sizes": "512x512",
        "type": "image/png"
      },
      {
        "src": `${basePath}/icon-maskable-512.png`,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
