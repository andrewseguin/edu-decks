import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const dirs = [
  path.join(process.cwd(), 'store-assets/reading-deck'),
  path.join(process.cwd(), 'store-assets/arithmetic-deck'),
];

const TARGET_WIDTH = 1290;
const TARGET_HEIGHT = 2796; // Apple 6.7" / 6.5" Display Required Resolution

async function resizeScreenshots() {
  console.log(`📐 Resizing screenshots to Apple required resolution (${TARGET_WIDTH} x ${TARGET_HEIGHT})...`);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = [
      'screenshot-1-card-front.png',
      'screenshot-2-card-back.png',
      'screenshot-3-card-next.png',
      'screenshot-4-quiz-mode.png',
    ];

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) continue;

      const tempPath = path.join(dir, `temp_${file}`);

      // Resize with canvas containment and sharp background fitting
      await sharp(filePath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'contain',
          background: { r: 107, g: 33, b: 168, alpha: 1 }, // Soft background pad
        })
        .toFile(tempPath);

      fs.renameSync(tempPath, filePath);
      console.log(`  ✓ Resized ${path.basename(dir)}/${file} -> ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
    }
  }

  console.log("✨ All screenshots resized to Apple exact specifications!");
}

resizeScreenshots().catch(console.error);
