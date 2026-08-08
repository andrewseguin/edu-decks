import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

async function uploadPlayStoreScreenshots() {
  const root = process.cwd();
  const keyPath = process.env.GOOGLE_PLAY_KEY_PATH || path.join(root, 'studio-7470092926-a6975-d98191f94c93.json');

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Key file not found at ${keyPath}`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const client = await auth.getClient();
  const androidpublisher = google.androidpublisher({ version: 'v3', auth: client as any });

  const apps = [
    { name: 'arithmetic-deck', packageName: 'org.edudecks.arithmetic', assetDir: path.join(root, 'store-assets/arithmetic-deck') },
    { name: 'reading-deck', packageName: 'org.edudecks.reading', assetDir: path.join(root, 'store-assets/reading-deck') },
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
