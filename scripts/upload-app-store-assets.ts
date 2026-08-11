import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';

const keyPath = path.join(process.cwd(), 'AuthKey_KFTN8X27Y8.p8');
const privateKey = fs.readFileSync(keyPath, 'utf8');
const issuerId = '77f3dd98-3102-488d-bc3c-9208c423bed1';
const keyId = 'KFTN8X27Y8';

function generateToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200,
    aud: 'appstoreconnect-v1',
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
      typ: 'JWT',
    },
  });
}

const APPS_CONFIG = [
  {
    bundleId: 'org.edudecks.reading',
    name: 'Reading Deck - Phonics & Words',
    subtitle: 'Phonics & Reading Flashcards',
    assetDir: path.join(process.cwd(), 'store-assets/reading-deck'),
    keywords: 'phonics, flashcards, reading, letters, sight words, kids, abc, learn to read, kindergarten',
    description: `Build strong reading fluency and phonics skills with Reading Deck! Designed for toddlers, preschoolers, and early readers, Reading Deck helps children master letter names, letter sounds, consonant blends, and foundational sight words through tactile flash cards.

KEY FEATURES:
• Alphabet & Letter Sounds: Explore uppercase and lowercase letters with crystal-clear audio TTS pronunciation for every letter sound.
• Phonics & Blends Practice: Learn consonant-vowel-consonant (CVC) patterns, digraphs, and blend combinations.
• High-Frequency Sight Words: Practice core sight words to improve early reading speed and comprehension.
• Interactive Quiz Mode: Test letter and word recognition with interactive listening quizzes.
• 100% Free & Private: Zero ads, zero tracking, zero data collection. A safe, distraction-free environment for kids.
• Beautiful Design System: Vibrant colors, readable typography, and soft sound effects designed for small hands.

Reading Deck empowers early readers to develop confidence in phonemic awareness and early literacy skills.`,
  },
  {
    bundleId: 'org.edudecks.arithmetic',
    name: 'Arithmetic Deck - Math Cards',
    subtitle: 'Mental Math & Flashcards',
    assetDir: path.join(process.cwd(), 'store-assets/arithmetic-deck'),
    keywords: 'math, arithmetic, flashcards, addition, subtraction, multiplication, division, mental math, numbers',
    description: `Master mental math and number sense with Arithmetic Deck! Designed for early learners, kids, and students, Arithmetic Deck provides fun, interactive math flash card drills for addition, subtraction, multiplication, and division.

KEY FEATURES:
• Interactive Math Flash Cards: Practice addition (+), subtraction (−), multiplication (×), and division (÷) with colorful, intuitive cards.
• Visual Strategy Models: 10-frame blocks, array grids, equal division groups, and interactive fraction pie charts.
• Conceptual Math Sense: Step-by-step strategy hints build deep understanding beyond simple memorization.
• Interactive Quiz Mode: Practice mental arithmetic with clean numeric keypads and streak counters.
• 100% Free & Private: Zero ads, zero tracking, zero data collection. A safe, distraction-free environment for kids.
• Screen Keep-Awake: Built-in Screen Wake Lock prevents display timeouts during math sessions.

Arithmetic Deck is built for classrooms, homeschoolers, and parents looking for a simple, engaging tool to build early math confidence.`,
  },
];

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = generateToken();
  const url = `https://api.appstoreconnect.apple.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status} on ${endpoint}: ${errorText}`);
  }

  return res.json();
}

async function uploadAppStoreAssets() {
  console.log("🚀 Starting App Store Connect Automated Metadata & Listing Sync...");

  // 1. Fetch Apps
  const appsRes = await apiRequest('/apps?include=appInfos,appStoreVersions');
  const apps = appsRes.data;

  for (const config of APPS_CONFIG) {
    const app = apps.find((a: any) => a.attributes.bundleId === config.bundleId);
    if (!app) {
      console.warn(`⚠️ App not found for Bundle ID: ${config.bundleId}`);
      continue;
    }

    console.log(`\n📱 Processing ${config.name} (ID: ${app.id})...`);

    // 2. Fetch App Info Localizations (Name & Subtitle)
    try {
      const appInfosRes = await apiRequest(`/apps/${app.id}/appInfos`);
      const appInfoId = appInfosRes.data[0]?.id;

      if (appInfoId) {
        const localizationsRes = await apiRequest(`/appInfos/${appInfoId}/appInfoLocalizations`);
        const locId = localizationsRes.data[0]?.id;

        if (locId) {
          await apiRequest(`/appInfoLocalizations/${locId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              data: {
                id: locId,
                type: 'appInfoLocalizations',
                attributes: {
                  name: config.name,
                  subtitle: config.subtitle,
                },
              },
            }),
          });
          console.log(`  ✓ Updated App Name: "${config.name}"`);
          console.log(`  ✓ Updated Subtitle: "${config.subtitle}"`);
        }
      }
    } catch (e: any) {
      console.warn(`  ⚠️ Could not update App Name/Subtitle:`, e.message || e);
    }

    // 3. Fetch App Store Version Localizations (Description & Keywords)
    try {
      const versionsRes = await apiRequest(`/apps/${app.id}/appStoreVersions`);
      const currentVersionId = versionsRes.data[0]?.id;

      if (currentVersionId) {
        const verLocalizationsRes = await apiRequest(`/appStoreVersions/${currentVersionId}/appStoreVersionLocalizations`);
        const verLocId = verLocalizationsRes.data[0]?.id;

        if (verLocId) {
          await apiRequest(`/appStoreVersionLocalizations/${verLocId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              data: {
                id: verLocId,
                type: 'appStoreVersionLocalizations',
                attributes: {
                  description: config.description,
                  keywords: config.keywords,
                },
              },
            }),
          });
          console.log(`  ✓ Updated App Description`);
          console.log(`  ✓ Updated App Keywords`);
        }
      }
    } catch (e: any) {
      console.warn(`  ⚠️ Could not update Version Description/Keywords:`, e.message || e);
    }
  }

  console.log("\n🎉 SUCCESS: All App Store Connect metadata & names synced programmatically!");
}

uploadAppStoreAssets().catch(console.error);
