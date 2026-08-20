import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const dirs = [
  path.join(process.cwd(), 'store-assets/reading-deck'),
  path.join(process.cwd(), 'store-assets/arithmetic-deck'),
  path.join(process.cwd(), 'store-assets/geometry-deck'),
];

async function formatAppStoreScreenshots() {
  console.log(`📐 Formatting native iPhone (Portrait) and native iPad (Landscape) screenshots to Apple required specifications...`);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const shots = [
      'screenshot-1-card-front',
      'screenshot-2-card-back',
      'screenshot-3-card-next',
      'screenshot-4-quiz-mode',
    ];

    for (const baseName of shots) {
      const phoneSrc = path.join(dir, `${baseName}.png`);
      const ipadSrc = path.join(dir, `${baseName}-ipad.png`);

      // 1. iPhone 6.5" Display (1242 x 2688 Portrait)
      if (fs.existsSync(phoneSrc)) {
        const temp65 = path.join(dir, `temp_${baseName}.png`);
        await sharp(phoneSrc)
          .resize(1242, 2688, { fit: 'contain', background: { r: 251, g: 248, b: 243, alpha: 1 } })
          .toFile(temp65);
        fs.renameSync(temp65, phoneSrc);

        // 2. iPhone 6.7" Display (1290 x 2796 Portrait)
        const path67 = path.join(dir, `${baseName}-67.png`);
        const temp67 = path.join(dir, `temp_${baseName}-67.png`);
        await sharp(phoneSrc)
          .resize(1290, 2796, { fit: 'contain', background: { r: 251, g: 248, b: 243, alpha: 1 } })
          .toFile(temp67);
        fs.renameSync(temp67, path67);
      }

      // 3. Native iPad Pro 12.9" Display (2732 x 2048 LANDSCAPE) from Playwright native iPad landscape capture
      if (fs.existsSync(ipadSrc)) {
        const tempIpad = path.join(dir, `temp_${baseName}-ipad.png`);
        await sharp(ipadSrc)
          .resize(2732, 2048, { fit: 'contain', background: { r: 251, g: 248, b: 243, alpha: 1 } })
          .toFile(tempIpad);
        fs.renameSync(tempIpad, ipadSrc);
        console.log(`  ✓ Formatted Native iPad Landscape: ${path.basename(dir)}/${baseName}-ipad.png -> 2732x2048`);
      }
    }
  }

  console.log("✨ All native iPhone Portrait & iPad Landscape App Store screenshots formatted!");
}

formatAppStoreScreenshots().catch(console.error);
