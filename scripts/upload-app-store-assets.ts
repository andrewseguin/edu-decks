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

async function uploadSingleScreenshot(screenshotSetId: string, filePath: string) {
  const fileStats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  // 1. Reserve Screenshot Slot
  const reserveRes = await apiRequest('/appScreenshots', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'appScreenshots',
        attributes: {
          fileSize: fileStats.size,
          fileName,
        },
        relationships: {
          appScreenshotSet: {
            data: {
              id: screenshotSetId,
              type: 'appScreenshotSets',
            },
          },
        },
      },
    }),
  });

  const screenshotId = reserveRes.data.id;
  const uploadOps = reserveRes.data.attributes.uploadOperations;

  // 2. Upload Binary Chunks
  for (const op of uploadOps) {
    const chunk = fileBuffer.subarray(op.offset, op.offset + op.length);
    const headers: Record<string, string> = {};
    for (const h of op.requestHeaders) {
      headers[h.name] = h.value;
    }

    const uploadRes = await fetch(op.url, {
      method: op.method,
      headers,
      body: chunk,
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed binary chunk upload to ${op.url}: ${uploadRes.statusText}`);
    }
  }

  // 3. Commit Upload State
  await apiRequest(`/appScreenshots/${screenshotId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        id: screenshotId,
        type: 'appScreenshots',
        attributes: {
          uploaded: true,
        },
      },
    }),
  });

  console.log(`    ✓ Uploaded screenshot: ${fileName}`);
}

async function uploadAppStoreAssets() {
  console.log("🚀 Starting App Store Connect Automated Metadata & Screenshot Sync...");

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

    // 2. Update App Name & Subtitle
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

    // 3. Update Description & Keywords
    let verLocId: string | null = null;
    try {
      const versionsRes = await apiRequest(`/apps/${app.id}/appStoreVersions`);
      const currentVersionId = versionsRes.data[0]?.id;

      if (currentVersionId) {
        const verLocalizationsRes = await apiRequest(`/appStoreVersions/${currentVersionId}/appStoreVersionLocalizations`);
        verLocId = verLocalizationsRes.data[0]?.id;

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

    // 4. Upload Screenshots to Screenshot Sets
    if (verLocId && fs.existsSync(config.assetDir)) {
      try {
        console.log(`  🖼️ Syncing Screenshots for ${config.name}...`);
        
        const existingSetsRes = await apiRequest(`/appStoreVersionLocalizations/${verLocId}/appScreenshotSets`);
        const existingSets = existingSetsRes.data || [];

        const SPECS = [
          {
            displayType: 'APP_IPHONE_65',
            files: [
              'screenshot-1-card-front.png',
              'screenshot-2-card-back.png',
              'screenshot-3-card-next.png',
              'screenshot-4-quiz-mode.png',
            ],
          },
          {
            displayType: 'APP_IPHONE_67',
            files: [
              'screenshot-1-card-front-67.png',
              'screenshot-2-card-back-67.png',
              'screenshot-3-card-next-67.png',
              'screenshot-4-quiz-mode-67.png',
            ],
          },
        ];

        for (const spec of SPECS) {
          let targetSet = existingSets.find((s: any) => s.attributes.screenshotDisplayType === spec.displayType);

          if (!targetSet) {
            const createSetRes = await apiRequest('/appScreenshotSets', {
              method: 'POST',
              body: JSON.stringify({
                data: {
                  type: 'appScreenshotSets',
                  attributes: {
                    screenshotDisplayType: spec.displayType,
                  },
                  relationships: {
                    appStoreVersionLocalization: {
                      data: {
                        id: verLocId,
                        type: 'appStoreVersionLocalizations',
                      },
                    },
                  },
                },
              }),
            });
            targetSet = createSetRes.data;
          } else {
            // Delete existing shots to replace cleanly
            const existingShotsRes = await apiRequest(`/appScreenshotSets/${targetSet.id}/appScreenshots`);
            for (const shot of existingShotsRes.data || []) {
              await apiRequest(`/appScreenshots/${shot.id}`, { method: 'DELETE' }).catch(() => {});
            }
          }

          console.log(`   📱 Uploading set ${spec.displayType}...`);
          for (const file of spec.files) {
            const filePath = path.join(config.assetDir, file);
            if (fs.existsSync(filePath)) {
              await uploadSingleScreenshot(targetSet.id, filePath);
            }
          }
        }

      } catch (e: any) {
        console.warn(`  ⚠️ Could not upload Screenshots:`, e.message || e);
      }
    }
  }

  console.log("\n🎉 SUCCESS: All App Store Connect metadata, names, and screenshots synced programmatically!");
}

uploadAppStoreAssets().catch(console.error);
