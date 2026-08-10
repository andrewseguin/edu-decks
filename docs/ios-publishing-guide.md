# 🍏 iOS App Store Publishing & Release Guide

A complete reference for configuring, building, archiving, and deploying **Arithmetic Deck** (`org.edudecks.arithmetic`) and **Reading Deck** (`org.edudecks.reading`) to the Apple App Store.

---

## 📋 Table of Contents
1. [Apple Developer Account Enrollment](#1-apple-developer-account-enrollment)
2. [App Store Connect Initial Setup](#2-app-store-connect-initial-setup)
3. [Building & Archiving from CLI / Xcode](#3-building--archiving-from-cli--xcode)
4. [Kids Category & Privacy Questionnaire](#4-kids-category--privacy-questionnaire)
5. [Store Listing Copy & Metadata Reference](#5-store-listing-copy--metadata-reference)
6. [App Review Submission Checklist](#6-app-review-submission-checklist)

---

## 1. Apple Developer Account Enrollment

### Recommended: Enroll via the Apple Developer App
If the web portal shows *"Your enrollment could not be completed at this time"*:

1. Download the **[Apple Developer](https://apps.apple.com/us/app/apple-developer/id640199958)** app from the App Store on an iPhone, iPad, or Mac.
2. Tap the **Account** tab and sign in with your Apple ID.
3. Tap **"Enroll Now"** $\rightarrow$ select **Individual / Sole Proprietor**.
4. Complete payment ($99/year) with Apple Pay.
   - *Note:* Individual accounts display your personal legal name as the Seller. You can still brand the app title as `EduDecks: Arithmetic Deck` and upgrade to an LLC/Organization account later with zero downtime.

---

## 2. App Store Connect Initial Setup

Go to **[appstoreconnect.apple.com](https://appstoreconnect.apple.com)**:

### Register the App Records (One-Time Setup)
Under **Apps** $\rightarrow$ Click **`+`** $\rightarrow$ **New App**:

| Property | Arithmetic Deck | Reading Deck |
| :--- | :--- | :--- |
| **Platforms** | iOS | iOS |
| **App Name** | `Arithmetic Deck: Math Cards` | `Reading Deck: Phonics & Words` |
| **Primary Language** | English (U.S.) | English (U.S.) |
| **Bundle ID** | `org.edudecks.arithmetic` | `org.edudecks.reading` |
| **SKU** | `edudecks-arithmetic-ios` | `edudecks-reading-ios` |
| **User Access** | Full Access | Full Access |

---

## 3. Building & Archiving from CLI / Xcode

### Step A: Build Static Web Assets & Sync iOS Native Bridge
From the root of the `edu-decks` repository:

```bash
# 1. Typecheck and verify test suite
pnpm -r typecheck
pnpm -r test

# 2. Build static Next.js export for mobile (out/ folder)
pnpm -r build:mobile

# 3. Sync web bundles & Capacitor bridge to iOS projects
pnpm -r cap:sync
```

### Step B: Open in Xcode & Configure Signing

```bash
# Open Arithmetic Deck Xcode project
pnpm -F arithmetic-deck cap:open:ios

# Or open Reading Deck Xcode project
pnpm -F reading-deck cap:open:ios
```

In Xcode:
1. Select the top **App** project in the left navigator.
2. Under **Signing & Capabilities**:
   - Check **"Automatically manage signing"**.
   - Select your **Team** (your Apple Developer account).
   - Ensure Bundle Identifier is `org.edudecks.arithmetic` or `org.edudecks.reading`.
3. Under **General**:
   - Set **Version** (`1.0.0`) and **Build** (`1`, `2`, ... increment for every new upload).
4. Verify `ios/App/App/Info.plist` contains:
   ```xml
   <key>ITSAppUsesNonExemptEncryption</key>
   <false/>
   ```
   *(This suppresses the US export compliance prompt on upload).*

### Step C: Archive & Upload Build
1. Set the destination device to **Any iOS Device (arm64)**.
2. In the top menu, click **Product** $\rightarrow$ **Archive**.
3. In the **Organizer** window that opens:
   - Click **Distribute App**.
   - Select **Custom** $\rightarrow$ **App Store Connect** $\rightarrow$ **Upload**.
   - Keep default options and click **Upload**.

---

## 4. Kids Category & Privacy Questionnaire

Because these apps target children and students, follow Apple's **Kids Category (Guidelines 1.3 & 5.1.4)**:

### 4.1 App Privacy (Nutrition Label)
In App Store Connect under **App Privacy**:
- Select **"No, we do not collect data from this app"**.
- State is strictly kept in device `localStorage`. Zero analytics, tracking, or ad SDKs.

### 4.2 Age Rating & Made for Kids
- Under **Age Rating**: Complete questionnaire $\rightarrow$ Rating will be **4+**.
- Check **"Made for Kids"**:
  - Arithmetic Deck: **Ages 5 & Under**, **Ages 6–8**, **Ages 9–11**
  - Reading Deck: **Ages 5 & Under**, **Ages 6–8**

### 4.3 External Links & Parental Gate (Guideline 1.3)
- **Apple Rule:** Apple requires that apps in the Kids Category protect any link leading outside the app (e.g. visiting `https://edudecks.org`) with a **Parental Gate** (an adult challenge such as a math equation or parent confirmation).
- **Implementation Plan:** We will add a simple, reusable Parental Gate modal/dialog in `@decks/core` that intercepts taps on the `edudecks.org` outbound link and requires solving a quick adult arithmetic challenge (e.g., `8 × 7 = ?`) before opening external Safari.

---

## 5. Store Listing Copy & Metadata Reference

### 5.1 Arithmetic Deck
* **Title:** `Arithmetic Deck: Math Cards` (28/30)
* **Subtitle:** `Mental Math & Flashcards` (24/30)
* **Keywords:** `math,flashcards,arithmetic,addition,subtraction,multiplication,division,fractions,kids,quiz`
* **Support & Marketing URL:** `https://edudecks.org`
* **Privacy Policy URL:** `https://arithmetic.edudecks.org/privacy` (or `https://edudecks.org/privacy`)
* **Copyright:** `© 2026 EduDecks LLC`
* **Description:**
  ```text
  Arithmetic Deck is a clean, distraction-free flashcard tool designed to build rapid mental math fluency for learners of all ages.

  FEATURES:
  • Core Operations: Addition, Subtraction, Multiplication, Division, and Fractions.
  • Visual Step-by-Step Diagrams: Understand the concepts behind operations with interactive visualizers.
  • Interactive Quiz Mode: Test speed and retention with real-time feedback and session statistics.
  • Customizable Ranges: Tailor difficulty from single-digit addition to multi-digit division.
  • 100% Offline & Private: No accounts, no ads, no trackers, and no internet connection required.
  ```

---

### 5.2 Reading Deck
* **Title:** `Reading Deck: Phonics & Words` (29/30)
* **Subtitle:** `Learn to Read Flashcards` (24/30)
* **Keywords:** `phonics,reading,letters,alphabet,sight words,cvc,kindergarten,flashcards,kids,spelling`
* **Support & Marketing URL:** `https://edudecks.org`
* **Privacy Policy URL:** `https://reading.edudecks.org/privacy` (or `https://edudecks.org/privacy`)
* **Copyright:** `© 2026 EduDecks LLC`
* **Description:**
  ```text
  Reading Deck is an intuitive, phonics-first flashcard app built to help early readers master letter recognition, sounds, and beginner word construction.

  FEATURES:
  • Letter Recognition: Master uppercase, lowercase, and letter sounds.
  • CVC & Sight Words: Practice phonetic decoding with progressive word lists.
  • Natural Audio Speech: Clear audio pronunciation for letters and words.
  • Interactive Word Breakdown: Tap individual letters to hear their phonetic component.
  • Quiz Mode: Fun, confidence-building quizzes with celebratory feedback.
  • 100% Offline & Private: No ads, no data collection, no in-app purchases.
  ```

---

## 6. App Review Submission Checklist

Before clicking **"Submit for Review"**:

- [ ] **Screenshots Uploaded:**
  - 6.7" iPhone Display (`1290 x 2796 px`)
  - 13" iPad Display (`2048 x 2732 px`)
- [ ] **App Icon:** Verified 1024×1024 px icon in `AppIcon.appiconset` with **no transparency / alpha channel**.
- [ ] **App Privacy:** Set to "Data Not Collected".
- [ ] **Review Notes:** Paste the following into the **Notes** box for the Apple App Review team:
  ```text
  EduDecks (operated by EduDecks LLC) is a fully offline educational tool for kids and students.
  - No user accounts or login credentials are required.
  - The app collects zero user data and contains no analytics or advertising SDKs.
  - All external links to edudecks.org and privacy policies are protected behind an adult parental gate challenge in accordance with Kids Category guidelines (Guideline 1.3).
  ```
- [ ] **Release Options:** Select **"Manually release this version"** so you control when the app goes live after approval.
