# EduDecks Deployment & Multi-Environment Guide

This guide details the multi-environment branching strategy, Vercel deployment structure, environment detection, and production release procedures across Web and Mobile.

---

## 1. Web Deployment Architecture (Vercel)

EduDecks operates three distinct environments across all applications (`landing-page`, `reading-deck`, `arithmetic-deck`):

| Environment | Domain Pattern | Target Branch | Behavior & `isDevSite()` Status |
| :--- | :--- | :--- | :--- |
| **Development** | `*-dev.edudecks.org` | `main` | Debug UI overlays & verbose console logging enabled (`isDevSite() === true`). |
| **Staging (Pre-Prod)** | `*-staging.edudecks.org` | `main` | Clean production candidate. Exact mirror of production configuration (`isDevSite() === false`). |
| **Production** | `*.edudecks.org` | `prod` | Live production release (`isDevSite() === false`). |

### Domain Mappings Reference

* **EduDecks Main Portal (`apps/landing-page`)**:
  * Dev: `dev.edudecks.org` (Branch: `main`)
  * Staging: `staging.edudecks.org` (Branch: `main`)
  * Prod: `edudecks.org` / `www.edudecks.org` (Branch: `prod`)
* **Reading Deck (`apps/reading-deck`)**:
  * Dev: `reading-dev.edudecks.org` (Branch: `main`)
  * Staging: `reading-staging.edudecks.org` (Branch: `main`)
  * Prod: `reading.edudecks.org` (Branch: `prod`)
* **Arithmetic Deck (`apps/arithmetic-deck`)**:
  * Dev: `arithmetic-dev.edudecks.org` (Branch: `main`)
  * Staging: `arithmetic-staging.edudecks.org` (Branch: `main`)
  * Prod: `arithmetic.edudecks.org` (Branch: `prod`)
* **Geometry Deck (`apps/geometry-deck`)**:
  * Dev: `geometry-dev.edudecks.org` (Branch: `main`)
  * Staging: `geometry-staging.edudecks.org` (Branch: `main`)
  * Prod: `geometry.edudecks.org` (Branch: `prod`)

---

## 2. Multi-Environment Code Guard (`isDevSite()`)

The shared package `@decks/core` exports the `isDevSite()` helper:

```typescript
import { isDevSite } from "@decks/core";

if (isDevSite()) {
  console.log("[Dev Debug]: Extra telemetry or diagnostic state");
}
```

* **Returns `true`** on `localhost`, `127.0.0.1`, and any `*-dev.edudecks.org` subdomain.
* **Returns `false`** on `*-staging.edudecks.org` and production `*.edudecks.org` domains.

---

## 3. Web Release Process

### Step 1: Everyday Feature Development & Staging Verification
All feature branches and commits are merged into `main`:
```bash
git checkout main
git pull origin main
# Add feature commits...
git push origin main
```
* Vercel will automatically build and deploy `main` to both `*-dev.edudecks.org` (with dev tools enabled) and `*-staging.edudecks.org` (clean candidate).

### Step 2: Verification
1. Perform manual QA on `*-dev` to inspect debug state.
2. Verify candidate stability on `*-staging`.
3. Run automated tests:
   ```bash
   pnpm -r typecheck
   pnpm -r test
   pnpm -r test:visual
   ```

### Step 3: Promote to Live Production
Once the candidate is verified on `main`, push `main` to the **`prod`** branch:
```bash
git push origin main:prod
```
Vercel will immediately deploy the candidate to `edudecks.org`, `reading.edudecks.org`, and `arithmetic.edudecks.org`.

---

## 4. Mobile Release Process (Capacitor)

See [store-publishing-guide.md](./store-publishing-guide.md) for full keystore details and CLI commands.

### Pre-Prod Internal Testing (Android & iOS)
1. Sync native web assets:
   ```bash
   pnpm cap:sync
   ```
2. Build Android `.aab` release bundles and upload to Google Play **Internal Track**:
   ```bash
   export VERSION_CODE=3 # Increment by +1 for each new release
   pnpm -F arithmetic-deck build:android:bundle && pnpm -F reading-deck build:android:bundle
   npx fastlane supply --aab apps/arithmetic-deck/android/app/build/outputs/bundle/release/app-release.aab --package_name org.edudecks.arithmetic --track internal --json_key ~/keystores/google-play-api-key.json
   ```
3. Test internally on device via Google Play / TestFlight before promoting to Production.
