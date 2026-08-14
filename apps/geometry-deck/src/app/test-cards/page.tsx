/**
 * /test-cards — deterministic card preview route for visual regression tests.
 *
 * ONLY available in development (NODE_ENV === "development").
 * Any other environment receives a 404 — this page is never deployed.
 *
 * Query params:
 *   ?card=<id>          — render a specific card from TEST_CARDS
 *   &state=front|back   — which face to show (default: front)
 *
 * Omitting ?card shows an index of all catalogue entries with links.
 *
 * Architecture note: This is a Server Component that reads searchParams and
 * guards the production 404. All rendering is delegated to TestCardView
 * (a Client Component) because GeometryCard requires function props (onSpeak,
 * onTap) which cannot be passed from Server Components to Client Components.
 */

import { notFound } from "next/navigation";
import { TestCardView } from "./test-card-view";

type SearchParams = Promise<{ card?: string; state?: string }>;

export default async function TestCardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Guard: only render in development — hard 404 in all deployed builds
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const params = await searchParams;

  const state = (params.state === "back" ? "back" : "front") as "front" | "back";

  return <TestCardView cardId={params.card} state={state} />;
}
