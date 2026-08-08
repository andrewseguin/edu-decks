# 🚀 Store Publishing & Mobile Deployment Handover Guide

This document contains everything needed to publish **Arithmetic Deck** and **Reading Deck** to the **Google Play Store** (Android) and **Apple App Store** (iOS).

---

## 📦 1. Pre-Configured App Metadata & Identifiers

| Property | Arithmetic Deck | Reading Deck |
| :--- | :--- | :--- |
| **Package Name / Bundle ID** | `org.edudecks.arithmetic` | `org.edudecks.reading` |
| **App Title** | `Arithmetic Deck: Math Flashcards` | `Reading Deck: Phonics & Letters` |
| **Subtitle (iOS)** | `Mental Math & Number Sense` | `Phonics, Letters & Tracing` |
| **Privacy Policy URL** | `https://arithmetic.edudecks.org/privacy` | `https://reading.edudecks.org/privacy` |
| **Age Rating / Category** | Education (Kids under 5, 6–8, 9–12) | Education (Kids under 5, 6–8) |
| **COPPA / Ads / In-App Purchases** | 100% Free / No Ads / No Tracking | 100% Free / No Ads / No Tracking |

*Full copy, keywords, promotional blurbs, and 80-character summaries are documented in [`store_listings.md`](file:///Users/andrewjs/.gemini/jetski/brain/637cf3b5-41dc-4212-b52a-a4b50386172e/store_listings.md).*

---

## 🎨 2. Visual Assets & Icons

- **App Icons (Sky Background):**
  - Arithmetic Deck: [`icon-arithmetic-sky.png`](file:///Users/andrewjs/.gemini/jetski/brain/637cf3b5-41dc-4212-b52a-a4b50386172e/screenshots/icon-arithmetic-sky.png) (2×2 grid of `+`, `−`, `×`, `÷`)
  - Reading Deck: [`icon-reading-sky.png`](file:///Users/andrewjs/.gemini/jetski/brain/637cf3b5-41dc-4212-b52a-a4b50386172e/screenshots/icon-reading-sky.png) (bold white `abc`)
  - Generator template: [`scripts/icon-generator.html`](file:///Users/andrewjs/git/edu-decks/scripts/icon-generator.html)
- **Store Screenshots:**
  - Phone Portrait & Landscape: Located in [`apps/arithmetic-deck/tests/screenshots/`](file:///Users/andrewjs/git/edu-decks/apps/arithmetic-deck/tests/screenshots) and [`apps/reading-deck/tests/screenshots/`](file:///Users/andrewjs/git/edu-decks/apps/reading-deck/tests/screenshots)
  - Visual preview gallery: [`screenshots_preview.md`](file:///Users/andrewjs/.gemini/jetski/brain/637cf3b5-41dc-4212-b52a-a4b50386172e/screenshots_preview.md)

---

## 🤖 3. Google Play Store (Android) Next Steps

### Option A: Local Build (On a machine with Android Studio or JDK 17)
1. **Sync native projects:**
   ```bash
   pnpm cap:sync
   ```
2. **Open in Android Studio:**
   ```bash
   pnpm -F arithmetic-deck cap:open:android
   pnpm -F reading-deck cap:open:android
   ```
3. **Generate Signed Release Bundle:**
   - In Android Studio: **Build > Generate Signed Bundle / APK...** $\rightarrow$ choose **Android App Bundle (`.aab`)**.
   - Output: `apps/<app>/android/app/build/outputs/bundle/release/*.aab`.
4. **Upload to Google Play Console:**
   - Go to [play.google.com/console](https://play.google.com/console/).
   - Complete store listing (title, description, screenshots, icon).
   - Complete Data Safety & Target Audience questionnaires (No ads, no data collected, COPPA compliant).
   - Under **Production > Releases**, upload the `.aab` file and submit for review.

---

## 🍏 4. Apple App Store (iOS) Next Steps

### Requirements:
- Active **Apple Developer Account** ($99/year enrollment at [developer.apple.com](https://developer.apple.com/)).
- macOS with Xcode installed.

### Steps:
1. **Sync native projects:**
   ```bash
   pnpm cap:sync
   ```
2. **Open project in Xcode:**
   ```bash
   pnpm -F arithmetic-deck cap:open:ios
   pnpm -F reading-deck cap:open:ios
   ```
3. **Configure Signing & Archive:**
   - Under **Signing & Capabilities**, select your Apple Developer Team.
   - Set build target to **Any iOS Device (arm64)**.
   - Click **Product > Archive**.
   - In the Organizer window: Click **Distribute App** $\rightarrow$ **App Store Connect** $\rightarrow$ **Upload**.
4. **App Store Connect Listing:**
   - Create new App records with bundle IDs `org.edudecks.arithmetic` and `org.edudecks.reading`.
   - Fill in description, keywords, and privacy URL from [`store_listings.md`](file:///Users/andrewjs/.gemini/jetski/brain/637cf3b5-41dc-4212-b52a-a4b50386172e/store_listings.md).
   - Select uploaded build and submit for review.

---

## 💻 5. Verification Commands

Before creating any release build, verify the monorepo:
```bash
pnpm -r typecheck
pnpm -r build
```
*(Development servers run on port `9003` for arithmetic-deck and `9002` for reading-deck).*
