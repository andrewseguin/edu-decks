# EduDecks Portal (`apps/landing-page`)

The central web portal and application showcase for **EduDecks** ([edudecks.org](https://edudecks.org)). Designed to welcome parents, educators, and early learners with direct access to live web applications, native App Store / Google Play download links, interactive screenshot previews, and privacy resources.

**Live Portal**: [https://edudecks.org](https://edudecks.org) · **Monorepo Root**: [`../../README.md`](../../README.md)

---

## Quick Links & Navigation

- **Live Web Portal**: [https://edudecks.org](https://edudecks.org)
- **Reading Deck Web App**: [https://reading.edudecks.org](https://reading.edudecks.org)
- **Arithmetic Deck Web App**: [https://arithmetic.edudecks.org](https://arithmetic.edudecks.org)
- **EduDecks Monorepo Root**: [`../../README.md`](../../README.md)
- **Store Listings Reference**: [`../../docs/store_listings.md`](../../docs/store_listings.md)

---

## Portal Features

- **App Showcase Cards**: Interactive cards for `Reading Deck` and `Arithmetic Deck` with live links, Play Store badges, and target age ranges.
- **Interactive Screenshot Switcher**: Preview Card Front, Visual Hints/Models, and Quiz Mode in both Light and Dark themes.
- **Privacy Policy Center**: Direct access to the transparent [EduDecks Privacy Policy](https://edudecks.org/privacy) (100% ad-free, zero tracking, no accounts).
- **Theme Support**: Seamless light/dark mode switching powered by `next-themes` and `@decks/core`.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Turbopack) & [React 19](https://react.dev)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com), `lucide-react`, and `@decks/core` tokens
- **Testing**: [Vitest](https://vitest.dev) and React Testing Library

---

## Development Quick Start

Run the landing page dev server locally (Port `9000`):

```bash
# From workspace root
pnpm --filter landing-page dev

# Or inside apps/landing-page
pnpm dev
```

Open [http://localhost:9000](http://localhost:9000) in your browser.

### Verification & Testing
```bash
# Typecheck TypeScript
pnpm --filter landing-page typecheck

# Run Vitest unit tests
pnpm --filter landing-page test
```

---

## Navigation
- Back to [EduDecks Monorepo Root](../../README.md)
- Explore [Reading Deck (`apps/reading-deck`)](../reading-deck/README.md)
- Explore [Arithmetic Deck (`apps/arithmetic-deck`)](../arithmetic-deck/README.md)
- Visit [edudecks.org](https://edudecks.org)
