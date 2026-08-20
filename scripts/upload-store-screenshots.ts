import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

async function uploadPlayStoreScreenshots() {
  const root = process.cwd();
  const homeKeyPath = path.join(process.env.HOME || '', 'keystores/google-play-api-key.json');
  const localKeyPath = path.join(root, 'studio-7470092926-a6975-d98191f94c93.json');
  const keyPath = process.env.GOOGLE_PLAY_KEY_PATH || (fs.existsSync(localKeyPath) ? localKeyPath : homeKeyPath);

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Key file not found at ${keyPath} or ${homeKeyPath}`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const client = await auth.getClient();
  const androidpublisher = google.androidpublisher({ version: 'v3', auth: client as any });

  const apps = [
    {
      name: 'arithmetic-deck',
      packageName: 'org.edudecks.arithmetic',
      assetDir: path.join(root, 'store-assets/arithmetic-deck'),
      title: 'Arithmetic Deck - Math Cards',
      shortDescription: 'Practice addition, subtraction, multiplication, and division with flashcards.',
      fullDescription: `Master mental math and number sense with Arithmetic Deck! Designed for early learners, kids, and students, Arithmetic Deck provides fun, interactive math flashcard drills for addition, subtraction, multiplication, and division.

FEATURES:
• Interactive Math Flashcards: Practice addition (+), subtraction (−), multiplication (×), and division (÷) with colorful, intuitive cards.
• Visual Dot Diagrams: See visual subitizing dot patterns to understand the concept behind every calculation.
• Customizable Skill Levels: Select number ranges and math operations tailored for toddlers, kindergarteners, and elementary students.
• Timed Quiz Mode: Test speed and retention with interactive quiz challenges.
• 100% Offline & Ad-Free: Zero ads, zero tracking, zero data collection. Pure distraction-free learning.
• Tactile Audio Cues & Sound Effects: Delightful sound effects keep learners engaged.

Arithmetic Deck is built for classrooms, homeschoolers, and parents looking for a simple, engaging tool to build early math confidence.`,
    },
    {
      name: 'reading-deck',
      packageName: 'org.edudecks.reading',
      assetDir: path.join(root, 'store-assets/reading-deck'),
      title: 'Reading Deck - Phonics Cards',
      shortDescription: 'Learn letters, phonics sounds, blends, and sight words with flashcards.',
      fullDescription: `Build strong reading fluency and phonics skills with Reading Deck! Designed for toddlers, preschoolers, and early readers, Reading Deck helps children master letter names, letter sounds, consonant blends, and foundational sight words through tactile flashcards.

FEATURES:
• Alphabet & Letter Sounds: Explore uppercase and lowercase letters with crystal-clear audio TTS pronunciation for every letter sound.
• Phonics & Blends Practice: Learn consonant-vowel-consonant (CVC) patterns, digraphs, and blend combinations.
• High-Frequency Sight Words: Practice core sight words to improve early reading speed and comprehension.
• Interactive Quiz Mode: Test letter and word recognition with interactive listening quizzes.
• 100% Offline & Ad-Free: Zero ads, zero tracking, zero data collection. A safe, distraction-free environment for kids.
• Beautiful Design System: Vibrant colors, readable typography, and soft sound effects designed for small hands.

Reading Deck empowers early readers to develop confidence in phonemic awareness and early literacy skills.`,
    },
    {
      name: 'geometry-deck',
      packageName: 'org.edudecks.geometry',
      assetDir: path.join(root, 'store-assets/geometry-deck'),
      title: 'Geometry Deck - Shapes & Math',
      shortDescription: 'Master geometry with interactive proofs, formulas, 3D solids, and math quizzes.',
      fullDescription: `Master geometric formulas, properties, and algebraic proofs with Geometry Deck! Designed for upper elementary, middle school, and early high school students (ages 9 to 14), Geometry Deck turns complex geometry into intuitive, interactive visual models.

TOPICS COVERED:
• Triangles: Pythagorean theorem (a² + b² = c²), equilateral, isosceles, scalene properties, triangle angle sum (180°), and base-height area formulas.
• Angles: Acute, obtuse, right, reflex, complementary (90°), supplementary (180°), vertically opposite, and parallel line transversals (alternate and co-interior).
• Quadrilaterals: Rectangles, squares, parallelograms, trapezoids, and rhombuses with area and perimeter calculations.
• Circles: Radius, diameter, circumference (C = 2πr), area (A = πr²), and the geometric definition of Pi (π).
• Polygons: Interior angle sums ((n - 2) × 180°), exterior angle sums (360°), and regular polygon side calculations.
• 3D Shapes: Prisms, cylinders, cones, spheres, pyramids, and Euler's Polyhedral Formula (V - E + F = 2).

INTERACTIVE QUIZ MODE:
• Numeric Calculation Quizzes: Solve for missing angles, unknown hypotenuses, area, perimeter, and 3D volume.
• On-Screen Keypad: Instant answer validation, audio speech feedback, celebration chimes, and streak tracking.

100% PRIVATE AND AD-FREE:
• No advertisements, no subscriptions, no user account required, and zero tracking.
• Works completely offline — built for classrooms, homeschoolers, and distraction-free study.`,
    },
  ];

  for (const app of apps) {
    console.log(`\n🚀 Starting Play Store Asset Upload for ${app.name} (${app.packageName})...`);

    if (!fs.existsSync(app.assetDir)) {
      console.warn(`⚠️ Asset directory missing for ${app.name}: ${app.assetDir}`);
      continue;
    }

    // 1. Create Edit Session
    const edit = await androidpublisher.edits.insert({ packageName: app.packageName });
    const editId = edit.data.id!;
    console.log(`  ✓ Created edit session: ${editId}`);

    const language = 'en-US';

    try {
      // 1. Update Main Store Listing Text
      await androidpublisher.edits.listings.update({
        packageName: app.packageName,
        editId,
        language,
        requestBody: {
          title: app.title,
          shortDescription: app.shortDescription,
          fullDescription: app.fullDescription,
        },
      });
      console.log(`  ✓ Updated main store listing text (Title, Short & Full Description)`);
      // 2. Upload Phone Screenshots
      const phoneFiles = [
        'screenshot-1-card-front.png',
        'screenshot-2-card-back.png',
        'screenshot-3-card-next.png',
        'screenshot-4-quiz-mode.png',
      ];
      
      // Delete existing phone screenshots first
      await androidpublisher.edits.images.deleteall({
        packageName: app.packageName,
        editId,
        language,
        imageType: 'phoneScreenshots',
      }).catch(() => {});

      for (const file of phoneFiles) {
        const filePath = path.join(app.assetDir, file);
        if (fs.existsSync(filePath)) {
          await androidpublisher.edits.images.upload({
            packageName: app.packageName,
            editId,
            language,
            imageType: 'phoneScreenshots',
            media: { mimeType: 'image/png', body: fs.createReadStream(filePath) },
          });
          console.log(`  ✓ Uploaded phone screenshot: ${file}`);
        }
      }

      // 3. Upload 7-inch Tablet Screenshots
      const tab7Files = fs.existsSync(path.join(app.assetDir, 'tablet'))
        ? fs.readdirSync(path.join(app.assetDir, 'tablet')).filter(f => f.endsWith('.png'))
        : [];

      if (tab7Files.length > 0) {
        await androidpublisher.edits.images.deleteall({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'sevenInchScreenshots',
        }).catch(() => {});

        for (const file of tab7Files) {
          const filePath = path.join(app.assetDir, 'tablet', file);
          await androidpublisher.edits.images.upload({
            packageName: app.packageName,
            editId,
            language,
            imageType: 'sevenInchScreenshots',
            media: { mimeType: 'image/png', body: fs.createReadStream(filePath) },
          });
          console.log(`  ✓ Uploaded 7" tablet screenshot: ${file}`);
        }
      }

      // 4. Upload 10-inch Tablet Screenshots
      const tab10Files = fs.existsSync(path.join(app.assetDir, 'tablet-10inch'))
        ? fs.readdirSync(path.join(app.assetDir, 'tablet-10inch')).filter(f => f.endsWith('.png'))
        : [];

      if (tab10Files.length > 0) {
        await androidpublisher.edits.images.deleteall({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'tenInchScreenshots',
        }).catch(() => {});

        for (const file of tab10Files) {
          const filePath = path.join(app.assetDir, 'tablet-10inch', file);
          await androidpublisher.edits.images.upload({
            packageName: app.packageName,
            editId,
            language,
            imageType: 'tenInchScreenshots',
            media: { mimeType: 'image/png', body: fs.createReadStream(filePath) },
          });
          console.log(`  ✓ Uploaded 10" tablet screenshot: ${file}`);
        }
      }

      // 5. Upload Feature Graphic
      const featureGraphicPath = path.join(app.assetDir, 'feature-graphic-1024x500.png');
      if (fs.existsSync(featureGraphicPath)) {
        await androidpublisher.edits.images.deleteall({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'featureGraphic',
        }).catch(() => {});

        await androidpublisher.edits.images.upload({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'featureGraphic',
          media: { mimeType: 'image/png', body: fs.createReadStream(featureGraphicPath) },
        });
        console.log(`  ✓ Uploaded feature graphic (1024x500)`);
      }

      // 6. Upload App Icon (512x512)
      const iconPath = path.join(app.assetDir, 'app-icon-512x512.png');
      if (fs.existsSync(iconPath)) {
        await androidpublisher.edits.images.deleteall({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'icon',
        }).catch(() => {});

        await androidpublisher.edits.images.upload({
          packageName: app.packageName,
          editId,
          language,
          imageType: 'icon',
          media: { mimeType: 'image/png', body: fs.createReadStream(iconPath) },
        });
        console.log(`  ✓ Uploaded app icon (512x512)`);
      }

      // 6. Commit Edit Session
      await androidpublisher.edits.commit({ packageName: app.packageName, editId });
      console.log(`🎉 SUCCESS: Committed store listing update for ${app.name}!`);

    } catch (err: any) {
      console.error(`❌ ERROR during asset upload for ${app.name}:`, err?.message || err);
      try {
        await androidpublisher.edits.delete({ packageName: app.packageName, editId });
      } catch (e) {}
    }
  }
}

uploadPlayStoreScreenshots().catch(console.error);
