import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

async function exportStoreIcons() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 3000, height: 6000 },
    deviceScaleFactor: 1,
  });

  const root = process.cwd();
  const htmlPath = `file://${path.join(root, 'scripts/icon-generator.html')}`;

  console.log('Loading icon generator HTML...');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  // -------------------------------------------------------------------------
  // Part 1: Full-Bleed Store Icons (Solid Warm Cream Square, No Border Radius)
  // -------------------------------------------------------------------------
  await page.addStyleTag({
    content: `
      .icon-container {
        border-radius: 0px !important;
        box-shadow: none !important;
        border: none !important;
      }
    `,
  });
  await page.waitForTimeout(200);

  // 1. EduDecks Store / Brand Icon (Warm Cream)
  const edudecksCreamLocator = page.locator('#icon-edudecks');
  const edudecksCreamTemp = path.join(root, 'scripts/scratch/edudecks-cream-512.png');
  fs.mkdirSync(path.dirname(edudecksCreamTemp), { recursive: true });
  await edudecksCreamLocator.screenshot({ path: edudecksCreamTemp });

  // 2. Arithmetic Deck Icon (512x512 full-bleed Warm Cream)
  const arithmeticIcon = page.locator('#icon-arithmetic');
  const arithmeticStorePath = path.join(root, 'store-assets/arithmetic-deck/app-icon-512x512.png');
  const arithmeticLandingPath = path.join(root, 'apps/landing-page/public/screenshots/arithmetic/app-icon-512x512.png');
  fs.mkdirSync(path.dirname(arithmeticStorePath), { recursive: true });
  fs.mkdirSync(path.dirname(arithmeticLandingPath), { recursive: true });
  await arithmeticIcon.screenshot({ path: arithmeticStorePath });
  fs.copyFileSync(arithmeticStorePath, arithmeticLandingPath);
  console.log('✅ Exported full-bleed Arithmetic Deck store icon (512x512)');

  // 3. Reading Deck Icon (512x512 full-bleed Warm Cream)
  // 3. Reading Deck Icon (512x512 full-bleed Warm Cream)
  const readingIcon = page.locator('#icon-reading');
  const readingStorePath = path.join(root, 'store-assets/reading-deck/app-icon-512x512.png');
  const readingLandingPath = path.join(root, 'apps/landing-page/public/screenshots/reading/app-icon-512x512.png');
  fs.mkdirSync(path.dirname(readingStorePath), { recursive: true });
  fs.mkdirSync(path.dirname(readingLandingPath), { recursive: true });
  await readingIcon.screenshot({ path: readingStorePath });
  fs.copyFileSync(readingStorePath, readingLandingPath);
  console.log('✅ Exported full-bleed Reading Deck store icon (512x512)');

  // 4. Geometry Deck Icon (512x512 full-bleed Warm Cream)
  const geometryIcon = page.locator('#icon-geometry');
  const geometryStorePath = path.join(root, 'store-assets/geometry-deck/app-icon-512x512.png');
  const geometryLandingPath = path.join(root, 'apps/landing-page/public/screenshots/geometry/app-icon-512x512.png');
  fs.mkdirSync(path.dirname(geometryStorePath), { recursive: true });
  fs.mkdirSync(path.dirname(geometryLandingPath), { recursive: true });
  await geometryIcon.screenshot({ path: geometryStorePath });
  fs.copyFileSync(geometryStorePath, geometryLandingPath);
  console.log('✅ Exported full-bleed Geometry Deck store icon (512x512)');

  // -------------------------------------------------------------------------
  // Part 1b: Google Play Feature Graphics (1024x500)
  // -------------------------------------------------------------------------
  const featureArithmetic = page.locator('#feature-arithmetic');
  await featureArithmetic.screenshot({ path: path.join(root, 'store-assets/arithmetic-deck/feature-graphic-1024x500.png') });

  const featureReading = page.locator('#feature-reading');
  await featureReading.screenshot({ path: path.join(root, 'store-assets/reading-deck/feature-graphic-1024x500.png') });

  const featureGeometry = page.locator('#feature-geometry');
  await featureGeometry.screenshot({ path: path.join(root, 'store-assets/geometry-deck/feature-graphic-1024x500.png') });
  console.log('✅ Generated Google Play 1024x500 Feature Graphics for all decks');

  // -------------------------------------------------------------------------
  // Part 2: True Transparent Web Icons & App Logos (No background canvas)
  // -------------------------------------------------------------------------
  await page.addStyleTag({
    content: `
      html, body {
        background: transparent !important;
        background-color: transparent !important;
      }
      .icon-container.transparent {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `,
  });
  await page.waitForTimeout(200);

  const edudecksTransparent = page.locator('#icon-edudecks-transparent');
  const edudecksTransTemp = path.join(root, 'scripts/scratch/edudecks-trans-512.png');
  await edudecksTransparent.screenshot({ path: edudecksTransTemp, omitBackground: true });

  const arithmeticTransparent = page.locator('#icon-arithmetic-transparent');
  const arithmeticTransTemp = path.join(root, 'scripts/scratch/arithmetic-trans-512.png');
  await arithmeticTransparent.screenshot({ path: arithmeticTransTemp, omitBackground: true });

  const readingTransparent = page.locator('#icon-reading-transparent');
  const readingTransTemp = path.join(root, 'scripts/scratch/reading-trans-512.png');
  await readingTransparent.screenshot({ path: readingTransTemp, omitBackground: true });

  const geometryTransparent = page.locator('#icon-geometry-transparent');
  const geometryTransTemp = path.join(root, 'scripts/scratch/geometry-trans-512.png');
  await geometryTransparent.screenshot({ path: geometryTransTemp, omitBackground: true });

  await browser.close();

  // -------------------------------------------------------------------------
  // Part 3: Resize & write all web assets via Sharp
  // -------------------------------------------------------------------------

  // --- Landing Page Assets ---
  const landingPublic = path.join(root, 'apps/landing-page/public');
  // Logo (transparent 512x512 so it adapts cleanly on light & dark headers)
  await sharp(edudecksTransTemp).resize(512, 512).png().toFile(path.join(landingPublic, 'logo.png'));
  // Apple Touch Icon (180x180 warm cream)
  await sharp(edudecksCreamTemp).resize(180, 180).png().toFile(path.join(landingPublic, 'apple-touch-icon.png'));
  // Favicon (32x32)
  await sharp(edudecksTransTemp).resize(32, 32).png().toFile(path.join(landingPublic, 'favicon.ico'));
  console.log('✅ Generated EduDecks landing page web assets (logo.png, apple-touch-icon.png, favicon.ico)');

  // --- Arithmetic Deck Web Assets ---
  const arithmeticPublic = path.join(root, 'apps/arithmetic-deck/public');
  await sharp(arithmeticTransTemp).resize(512, 512).png().toFile(path.join(arithmeticPublic, 'logo.png'));
  await sharp(arithmeticStorePath).resize(512, 512).png().toFile(path.join(arithmeticPublic, 'icon-512.png'));
  await sharp(arithmeticStorePath).resize(512, 512).png().toFile(path.join(arithmeticPublic, 'icon-maskable-512.png'));
  await sharp(arithmeticStorePath).resize(192, 192).png().toFile(path.join(arithmeticPublic, 'icon-192.png'));
  await sharp(arithmeticStorePath).resize(180, 180).png().toFile(path.join(arithmeticPublic, 'apple-touch-icon.png'));
  await sharp(arithmeticTransTemp).resize(32, 32).png().toFile(path.join(arithmeticPublic, 'favicon-32x32.png'));
  await sharp(arithmeticTransTemp).resize(16, 16).png().toFile(path.join(arithmeticPublic, 'favicon-16x16.png'));
  await sharp(arithmeticTransTemp).resize(32, 32).png().toFile(path.join(arithmeticPublic, 'favicon.ico'));
  console.log('✅ Generated Arithmetic Deck web & app icons');

  // --- Reading Deck Web Assets ---
  const readingPublic = path.join(root, 'apps/reading-deck/public');
  await sharp(readingTransTemp).resize(512, 512).png().toFile(path.join(readingPublic, 'logo.png'));
  await sharp(readingStorePath).resize(512, 512).png().toFile(path.join(readingPublic, 'icon-512.png'));
  await sharp(readingStorePath).resize(512, 512).png().toFile(path.join(readingPublic, 'icon-maskable-512.png'));
  await sharp(readingStorePath).resize(192, 192).png().toFile(path.join(readingPublic, 'icon-192.png'));
  await sharp(readingStorePath).resize(180, 180).png().toFile(path.join(readingPublic, 'apple-touch-icon.png'));
  await sharp(readingTransTemp).resize(32, 32).png().toFile(path.join(readingPublic, 'favicon-32x32.png'));
  await sharp(readingTransTemp).resize(16, 16).png().toFile(path.join(readingPublic, 'favicon-16x16.png'));
  await sharp(readingTransTemp).resize(32, 32).png().toFile(path.join(readingPublic, 'favicon.ico'));
  console.log('✅ Generated Reading Deck web & app icons');

  // --- Geometry Deck Web Assets ---
  const geometryPublic = path.join(root, 'apps/geometry-deck/public');
  await sharp(geometryTransTemp).resize(512, 512).png().toFile(path.join(geometryPublic, 'logo.png'));
  await sharp(geometryStorePath).resize(512, 512).png().toFile(path.join(geometryPublic, 'icon-512.png'));
  await sharp(geometryStorePath).resize(512, 512).png().toFile(path.join(geometryPublic, 'icon-maskable-512.png'));
  await sharp(geometryStorePath).resize(192, 192).png().toFile(path.join(geometryPublic, 'icon-192.png'));
  await sharp(geometryStorePath).resize(180, 180).png().toFile(path.join(geometryPublic, 'apple-touch-icon.png'));
  await sharp(geometryTransTemp).resize(32, 32).png().toFile(path.join(geometryPublic, 'favicon-32x32.png'));
  await sharp(geometryTransTemp).resize(16, 16).png().toFile(path.join(geometryPublic, 'favicon-16x16.png'));
  await sharp(geometryTransTemp).resize(32, 32).png().toFile(path.join(geometryPublic, 'favicon.ico'));
  console.log('✅ Generated Geometry Deck web & app icons');

  // -------------------------------------------------------------------------
  // Part 4: Native iOS (1024x1024) & Android Launcher Mipmaps
  // -------------------------------------------------------------------------
  const mobileApps = [
    { name: 'arithmetic-deck', storeIcon: arithmeticStorePath },
    { name: 'reading-deck', storeIcon: readingStorePath },
    { name: 'geometry-deck', storeIcon: geometryStorePath },
  ];

  for (const app of mobileApps) {
    // 1. iOS AppIcon (1024x1024)
    const iosAppIcon = path.join(root, `apps/${app.name}/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`);
    if (fs.existsSync(path.dirname(iosAppIcon))) {
      await sharp(app.storeIcon).resize(1024, 1024).toFile(iosAppIcon);
      console.log(`✅ Generated native 1024x1024 iOS AppIcon for ${app.name}`);
    }

    // 2. Android Mipmaps
    const androidRes = path.join(root, `apps/${app.name}/android/app/src/main/res`);
    if (fs.existsSync(androidRes)) {
      const sizes = [
        { dir: 'mipmap-mdpi', launcher: 48, fore: 108 },
        { dir: 'mipmap-hdpi', launcher: 72, fore: 162 },
        { dir: 'mipmap-xhdpi', launcher: 96, fore: 216 },
        { dir: 'mipmap-xxhdpi', launcher: 144, fore: 324 },
        { dir: 'mipmap-xxxhdpi', launcher: 192, fore: 432 },
      ];

      for (const s of sizes) {
        const targetDir = path.join(androidRes, s.dir);
        if (fs.existsSync(targetDir)) {
          await sharp(app.storeIcon).resize(s.launcher, s.launcher).toFile(path.join(targetDir, 'ic_launcher.png'));
          await sharp(app.storeIcon).resize(s.launcher, s.launcher).toFile(path.join(targetDir, 'ic_launcher_round.png'));
          await sharp(app.storeIcon).resize(s.fore, s.fore).toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
        }
      }
      console.log(`✅ Generated native Android launcher icons for ${app.name}`);
    }
  }

  console.log('✨ All icons and feature graphics exported successfully!');
}

exportStoreIcons().catch(console.error);
