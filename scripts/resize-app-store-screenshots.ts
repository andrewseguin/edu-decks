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

async function resizeScreenshots() {
  console.log(`📐 Generating edge-to-edge full bleed Apple screenshots (no purple bars)...`);

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

      const baseName = path.basename(baseFile, '.png');

      for (const spec of SPECS) {
        const outName = `${baseName}${spec.suffix}.png`;
        const outPath = path.join(dir, outName);
        const tempPath = path.join(dir, `temp_${outName}`);

        // Use fit: 'cover' for full bleed edge-to-edge screenshots with zero letterboxing bars
        await sharp(srcPath)
          .resize(spec.width, spec.height, {
            fit: 'cover',
            position: 'center',
          })
          .toFile(tempPath);

        fs.renameSync(tempPath, outPath);
        console.log(`  ✓ Created edge-to-edge ${path.basename(dir)}/${outName} -> ${spec.width}x${spec.height}`);
      }
    }
  }

  console.log("✨ All edge-to-edge screenshots generated!");
}

resizeScreenshots().catch(console.error);
