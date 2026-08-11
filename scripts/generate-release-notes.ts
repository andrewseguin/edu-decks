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
      '• Improved fraction deck controls and custom denominator options.',
      '• Streamlined app settings panel with mobile domain attribution.',
      '• Smooth card flip animations and high-contrast dark mode.',
      '• Audio TTS reader and Screen Wake Lock stability improvements.',
    ],
  },
  {
    name: 'reading-deck',
    paths: ['apps/reading-deck', 'packages/deck-core'],
    excludeKeywords: /fraction|denominator|numerator|math|arithmetic|number sense|digit/i,
    defaultNotes: [
      '• Letter tracing precision and audio voice recording playback enhancements.',
      '• Streamlined app settings panel with mobile domain attribution.',
      '• Smooth card flip animations and high-contrast dark mode.',
      '• Audio TTS reader and Screen Wake Lock stability improvements.',
    ],
  },
];

// Terms that indicate internal/developer work not relevant to end-user parents
const internalNoisePattern = /dev indicator|metric|telemetry|edge log|parameter|screenshot|bundle|script|cli|monorepo|ci|deps|dependency|package\.json|tsconfig|playwright|vite|next\.js|turbopack|pwa/i;

function cleanUserFacingSubject(subject: string): string | null {
  // Ignore developer chores and internal infrastructure
  if (/^(chore|ci|test|docs|refactor\([^)]+\): trigger)/i.test(subject)) {
    return null;
  }

  if (internalNoisePattern.test(subject)) {
    return null;
  }

  let clean = subject
    .replace(/^(feat|fix|style|refactor|perf)\([^)]+\):\s*/i, '')
    .replace(/^(feat|fix|style|refactor|perf):\s*/i, '')
    .trim();

  // Common technical phrase to parent-friendly phrase mapping
  clean = clean
    .replace(/PrivacyPolicyView/i, 'Privacy policy view')
    .replace(/showStreak prop/i, 'streak counter options')
    .replace(/pulsing caret/i, 'active input cursor')
    .replace(/segmented toggles/i, 'segmented controls');

  // Ensure ends with a period if concise sentence
  if (!clean.endsWith('.')) clean += '.';

  // Capitalize first letter
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  if (clean.length < 8) return null;
  return `• ${clean}`;
}

function generateReleaseNotes() {
  const root = process.cwd();
  const git = getGitExec();

  console.log('📝 Generating user-facing release notes from git history...');

  for (const app of apps) {
    let logOutput = '';
    try {
      const pathsArg = app.paths.join(' ');
      logOutput = execSync(`${git} log -n 40 --oneline --no-merges -- ${pathsArg}`, {
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
      if (app.excludeKeywords.test(rawSubject)) continue;

      const userNote = cleanUserFacingSubject(rawSubject);
      if (!userNote) continue;

      const lower = userNote.toLowerCase();
      if (!processedSummaries.has(lower)) {
        processedSummaries.add(lower);
        userFacingPoints.push(userNote);
      }

      if (userFacingPoints.length >= 4) break;
    }

    // Combine matched user notes with fallback defaults to ensure 3-4 high quality notes
    const finalPoints = [...userFacingPoints];
    for (const defaultNote of app.defaultNotes) {
      if (finalPoints.length >= 3) break;
      if (!finalPoints.includes(defaultNote)) {
        finalPoints.push(defaultNote);
      }
    }

    const notesText = finalPoints.join('\n') + '\n';

    const notesFile = path.join(root, `store-assets/${app.name}/release-notes.txt`);
    fs.writeFileSync(notesFile, notesText, 'utf-8');

    console.log(`  ✓ Updated ${path.relative(root, notesFile)}:`);
    console.log(notesText.split('\n').map((l) => `    ${l}`).join('\n'));
  }

  console.log('✨ Parent & user-facing release notes updated successfully!');
}

generateReleaseNotes();
