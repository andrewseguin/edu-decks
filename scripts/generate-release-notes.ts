import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getGitExec() {
  // Use DEVELOPER_DIR to bypass unaccepted Xcode license check if needed
  try {
    execSync('git status', { stdio: 'ignore' });
    return 'git';
  } catch (e) {
    return 'DEVELOPER_DIR=/Library/Developer/CommandLineTools git';
  }
}

function generateReleaseNotes() {
  const root = process.cwd();
  const git = getGitExec();

  console.log('📝 Generating release notes from git history...');

  let logOutput = '';
  try {
    // Get commits from last 14 days or last 20 commits
    logOutput = execSync(`${git} log -n 20 --oneline --no-merges`, { encoding: 'utf-8' });
  } catch (err: any) {
    console.warn('⚠️ Could not fetch git log:', err?.message || err);
  }

  const lines = logOutput.split('\n').map(l => l.replace(/^[a-f0-9]+\s+/, '').trim()).filter(Boolean);

  // Filter and map commits to user-facing release bullet points
  const userFacingPoints: string[] = [];
  const processedSummaries = new Set<string>();

  for (const line of lines) {
    // Skip internal chores, docs, or test commits unless user-facing
    if (/^(chore|ci|test|docs):/i.test(line) && !/publish|screenshot|store/i.test(line)) {
      continue;
    }

    // Clean up commit prefixes (feat, fix, style, refactor)
    let clean = line
      .replace(/^(feat|fix|style|refactor|perf)\([^)]+\):\s*/i, '')
      .replace(/^(feat|fix|style|refactor|perf):\s*/i, '');

    // Capitalize first letter
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);

    if (clean.length > 5 && !processedSummaries.has(clean.toLowerCase())) {
      processedSummaries.add(clean.toLowerCase());
      userFacingPoints.push(`• ${clean}`);
    }

    if (userFacingPoints.length >= 4) break;
  }

  if (userFacingPoints.length === 0) {
    userFacingPoints.push('• Performance improvements, visual polish, and stability enhancements.');
  }

  const notesText = userFacingPoints.join('\n') + '\n';

  const apps = ['arithmetic-deck', 'reading-deck'];
  for (const app of apps) {
    const notesFile = path.join(root, `store-assets/${app}/release-notes.txt`);
    fs.writeFileSync(notesFile, notesText, 'utf-8');
    console.log(`  ✓ Updated ${path.relative(root, notesFile)}:`);
    console.log(notesText.split('\n').map(l => `    ${l}`).join('\n'));
  }

  console.log('✨ Release notes updated successfully for both applications!');
}

generateReleaseNotes();
