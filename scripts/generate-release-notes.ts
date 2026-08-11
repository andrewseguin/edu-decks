import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getGitExec() {
  try {
    execSync('git status', { stdio: 'ignore' });
    return 'git';
  } catch (e) {
    return 'DEVELOPER_DIR=/Library/Developer/CommandLineTools git';
  }
}

interface AppConfig {
  name: string;
  paths: string[];
  excludeKeywords: RegExp;
  defaultNotes: string[];
}

const apps: AppConfig[] = [
  {
    name: 'arithmetic-deck',
    paths: ['apps/arithmetic-deck', 'packages/deck-core'],
    excludeKeywords: /phonics|letter|tracing|word|speech|reading/i,
    defaultNotes: [
      '• Streamlined math deck settings panel with mobile domain attribution.',
      '• Smooth card flip animations and high-contrast dark mode.',
      '• Audio TTS reader and Screen Wake Lock stability improvements.',
    ],
  },
  {
    name: 'reading-deck',
    paths: ['apps/reading-deck', 'packages/deck-core'],
    excludeKeywords: /fraction|denominator|numerator|math|arithmetic|number sense|digit/i,
    defaultNotes: [
      '• Streamlined reading deck settings panel with mobile domain attribution.',
      '• Letter tracing precision and audio voice recording playback enhancements.',
      '• Audio TTS reader and Screen Wake Lock stability improvements.',
    ],
  },
];

function isDeveloperChore(subject: string): boolean {
  // Ignore technical/repo maintenance commits that aren't user-facing
  const chorePatterns = [
    /^chore\(/i,
    /^ci\(/i,
    /^test\(/i,
    /^docs\(/i,
    /^style\([^)]+\): trigger/i,
    /build deployment/i,
    /trigger monorepo/i,
  ];
  return chorePatterns.some((pattern) => pattern.test(subject));
}

function cleanCommitSubject(subject: string): string {
  let clean = subject
    .replace(/^(feat|fix|style|refactor|perf)\([^)]+\):\s*/i, '')
    .replace(/^(feat|fix|style|refactor|perf):\s*/i, '')
    .trim();

  // Capitalize first letter
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  return clean;
}

function generateReleaseNotes() {
  const root = process.cwd();
  const git = getGitExec();

  console.log('📝 Generating app-scoped release notes from git history...');

  for (const app of apps) {
    let logOutput = '';
    try {
      // Scoped git log for this app's paths
      const pathsArg = app.paths.join(' ');
      logOutput = execSync(`${git} log -n 30 --oneline --no-merges -- ${pathsArg}`, {
        encoding: 'utf-8',
      });
    } catch (err: any) {
      console.warn(`⚠️ Could not fetch git log for ${app.name}:`, err?.message || err);
    }

    const rawLines = logOutput
      .split('\n')
      .map((l) => l.replace(/^[a-f0-9]+\s+/, '').trim())
      .filter(Boolean);

    const userFacingPoints: string[] = [];
    const processedSummaries = new Set<string>();

    for (const rawSubject of rawLines) {
      if (isDeveloperChore(rawSubject)) continue;
      if (app.excludeKeywords.test(rawSubject)) continue;

      const clean = cleanCommitSubject(rawSubject);
      const lower = clean.toLowerCase();

      if (clean.length > 5 && !processedSummaries.has(lower)) {
        processedSummaries.add(lower);
        userFacingPoints.push(`• ${clean}`);
      }

      if (userFacingPoints.length >= 4) break;
    }

    // Fall back to app-appropriate defaults if no app-specific commits matched
    const finalPoints =
      userFacingPoints.length > 0 ? userFacingPoints : app.defaultNotes;
    const notesText = finalPoints.join('\n') + '\n';

    const notesFile = path.join(root, `store-assets/${app.name}/release-notes.txt`);
    fs.writeFileSync(notesFile, notesText, 'utf-8');

    console.log(`  ✓ Updated ${path.relative(root, notesFile)}:`);
    console.log(notesText.split('\n').map((l) => `    ${l}`).join('\n'));
  }

  console.log('✨ App-scoped release notes updated successfully!');
}

generateReleaseNotes();
