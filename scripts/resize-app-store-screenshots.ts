import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const dirs = [
  path.join(process.cwd(), 'store-assets/reading-deck'),
  path.join(process.cwd(), 'store-assets/arithmetic-deck'),
];

// Apple App Store Connect Exact Dimension Requirements
const SPECS = [
  { displayType: 'APP_IPHONE_65', width: 1242, height: 2688, suffix: '' },      // 6.5" Display
  { displayType: 'APP_IPHONE_67', width: 1290, height: 2796, suffix: '-67' },   // 6.7" Display
];

async function removePurpleBarsAndResize() {
  console.log(`🎨 Replacing purple padding with native app warm cream background (#fbf8f3)...`);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const baseFiles = [
      'screenshot-1-card-front.png',
      'screenshot-2-card-back.png',
      'screenshot-3-card-next.png',
      'screenshot-4-quiz-mode.png',
    ];

    for (const baseFile of baseFiles) {
      const srcPath = path.join(dir, baseFile);
      if (!fs.existsSync(srcPath)) continue;

      const baseName = path.basename(baseFile, '.png').replace(/-67$/, '');

      // Load image buffer, inspect and replace purple bars with warm cream #fbf8f3 (251, 248, 243)
      const image = sharp(srcPath);
      const { width, height } = await image.metadata();

      if (!width || !height) continue;

      const rawPixels = await image.raw().toBuffer({ resolveWithObject: true });
      const data = rawPixels.data;
      const channels = rawPixels.info.channels;

      // Detect and replace purple pixels (R~107, G~33, B~168) with app warm cream (251, 248, 243)
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Match purple color range
        if (r >= 90 && r <= 130 && g >= 20 && g <= 60 && b >= 140 && b <= 190) {
          data[i] = 251;     // R
          data[i + 1] = 248; // G
          data[i + 2] = 243; // B
        }
      }

      // Re-encode cleaned raw image
      const cleanedBuffer = await sharp(data, {
        raw: {
          width: rawPixels.info.width,
          height: rawPixels.info.height,
          channels: rawPixels.info.channels,
        },
      }).png().toBuffer();

      for (const spec of SPECS) {
        const outName = `${baseName}${spec.suffix}.png`;
        const outPath = path.join(dir, outName);
        const tempPath = path.join(dir, `temp_${outName}`);

        await sharp(cleanedBuffer)
          .resize(spec.width, spec.height, {
            fit: 'contain',
            background: { r: 251, g: 248, b: 243, alpha: 1 }, // Exact App Warm Cream Background
          })
          .toFile(tempPath);

        fs.renameSync(tempPath, outPath);
        console.log(`  ✓ Cleaned & Resized ${path.basename(dir)}/${outName} -> ${spec.width}x${spec.height} (Cream Background)`);
      }
    }
  }

  console.log("✨ All screenshot purple bars replaced with warm cream background!");
}

removePurpleBarsAndResize().catch(console.error);
