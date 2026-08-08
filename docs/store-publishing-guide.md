# 🚀 Store Publishing & Release Guide

Quick reference for building, signing, and deploying **Arithmetic Deck** (`org.edudecks.arithmetic`) and **Reading Deck** (`org.edudecks.reading`).

---

## ⚡ 1. Fast CLI Release Build & Asset Generation

### Step A: Regenerate Store Screenshots & Feature Graphics (Optional)
To automatically capture up-to-date 1080p screenshots, tablet graphics, and 1024×500 feature graphics into `store-assets/`:
```bash
pnpm screenshots:store
```

### Step B: Build Signed Release Bundles (.aab)
Increment `VERSION_CODE` by +1 for every new release uploaded to Google Play:
```bash
# 1. Load Java 21 & Keystore Credentials
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
source ~/keystores/release-env.sh

# 2. Build Signed Release Bundles with Incremented Version Code
export VERSION_CODE=2 # Increment by +1 for each new Play Store upload
pnpm -F arithmetic-deck build:android:bundle && pnpm -F reading-deck build:android:bundle
```

**Output Files:**
- `apps/arithmetic-deck/android/app/build/outputs/bundle/release/app-release.aab`
- `apps/reading-deck/android/app/build/outputs/bundle/release/app-release.aab`
- **Store Listing Assets:** `store-assets/arithmetic-deck/` & `store-assets/reading-deck/`

---

## 🔑 2. Keystore & API Credentials Sync (Google Cloud Secret Manager)

Your release keystore (`~/keystores/edudecks-release.p12`), environment script (`~/keystores/release-env.sh`), and Google Play Developer API key (`~/keystores/google-play-api-key.json`) are backed up in **Google Cloud Secret Manager**.

### Backup new Service Account JSON Key (One-time CLI setup):
```bash
gcloud config set project studio-7470092926-a6975
gcloud secrets create edudecks-play-api-key --data-file=studio-7470092926-a6975-d98191f94c93.json || \
gcloud secrets versions add edudecks-play-api-key --data-file=studio-7470092926-a6975-d98191f94c93.json
```

### Restore credentials on any computer (100% CLI):

```bash
# 1. Login to Google Cloud CLI (if new machine)
gcloud auth login
gcloud config set project studio-7470092926-a6975

# 2. Restore keystores & Play API key
mkdir -p ~/keystores
gcloud secrets versions access latest --secret=edudecks-release-keystore > ~/keystores/edudecks-release.p12
gcloud secrets versions access latest --secret=edudecks-release-env > ~/keystores/release-env.sh
gcloud secrets versions access latest --secret=edudecks-play-api-key > ~/keystores/google-play-api-key.json
chmod 600 ~/keystores/edudecks-release.p12 ~/keystores/release-env.sh ~/keystores/google-play-api-key.json
```

*(Backup secrets are stored in GCP project **"EduDecks"** `studio-7470092926-a6975`)*.

---

## 📤 3. Store Deployment Steps

### 🤖 Google Play Store (Android)
1. **First-Time Release (Google Play Console):**
   - Go to [play.google.com/console](https://play.google.com/console/) $\rightarrow$ create App entry.
   - Fill out legal questionnaires (**Data Safety**, **Target Audience / COPPA**, **Content Rating**).
   - Under **Users & permissions**, invite `play-store-cli@studio-7470092926-a6975.iam.gserviceaccount.com` with listing & release permissions.
   - Under **Production > Releases** (or **Internal Testing**), upload initial `app-release.aab`.
2. **Automated CLI Uploads (Subsequent Releases & Screenshots):**
   ```bash
   # Upload AAB release bundles
   npx fastlane supply --aab apps/arithmetic-deck/android/app/build/outputs/bundle/release/app-release.aab --package_name org.edudecks.arithmetic --track internal --json_key ~/keystores/google-play-api-key.json
   npx fastlane supply --aab apps/reading-deck/android/app/build/outputs/bundle/release/app-release.aab --package_name org.edudecks.reading --track internal --json_key ~/keystores/google-play-api-key.json

   # Upload Screenshots & Store Listing graphics via CLI
   pnpm screenshots:upload
   ```

---

### 🍏 Apple App Store (iOS)
1. **Sync native assets & open Xcode:**
   ```bash
   pnpm cap:sync
   pnpm -F arithmetic-deck cap:open:ios
   pnpm -F reading-deck cap:open:ios
   ```
2. **Archive & Upload:**
   - In Xcode: Set build target to **Any iOS Device (arm64)** $\rightarrow$ **Product > Archive**.
   - Click **Distribute App** $\rightarrow$ **App Store Connect** $\rightarrow$ **Upload**.

---

## 📦 4. App Metadata Reference

| Property | Arithmetic Deck | Reading Deck |
| :--- | :--- | :--- |
| **Package Name / Bundle ID** | `org.edudecks.arithmetic` | `org.edudecks.reading` |
| **App Title** | `Arithmetic Deck: Math Flashcards` | `Reading Deck: Phonics & Letters` |
| **Privacy Policy URL** | `https://arithmetic.edudecks.org/privacy` | `https://reading.edudecks.org/privacy` |
| **Age Rating / Category** | Education (Kids under 5, 6–8, 9–12) | Education (Kids under 5, 6–8) |
| **Monetization / Ads** | 100% Free / No Ads / No Tracking | 100% Free / No Ads / No Tracking |

*Full copy, keywords, promotional blurbs, and screenshots are documented in `store_listings.md`.*
