import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const dirs = [
  path.join(process.cwd(), 'store-assets/reading-deck'),
  path.join(process.cwd(), 'store-assets/arithmetic-deck'),
];

// Apple App Store Connect Exact Dimension Requirements
const SPECS = [
  { displayType: 'APP_IPHONE_65', width: 1242, height: 2688, suffix: '' },      // 6.5" Display (iPhone XS Max, 11 Pro Max, 14 Plus)
  { displayType: 'APP_IPHONE_67', width: 1290, height: 2796, suffix: '-67' },   // 6.7" Display (iPhone 14 Pro Max, 15 Pro Max, 16 Pro Max)
];

async function resizeScreenshots() {
  console.log(`📐 Generating Apple compliant screenshot resolutions...`);

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

        await sharp(srcPath)
          .resize(spec.width, spec.height, {
            fit: 'contain',
            background: { r: 107, g: 33, b: 168, alpha: 1 },
          })
          .toFile(tempPath);

        fs.renameSync(tempPath, outPath);
        console.log(`  ✓ Created ${path.basename(dir)}/${outName} -> ${spec.width}x${spec.height} (${spec.displayType})`);
      }
    }
  }

  console.log("✨ All Apple compliant screenshot sets created!");
}

resizeScreenshots().catch(console.error);
