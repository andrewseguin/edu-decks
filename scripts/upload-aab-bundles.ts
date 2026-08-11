import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

async function uploadAabBundles() {
  const root = process.cwd();
  const homeKeyPath = path.join(process.env.HOME || '', 'keystores/google-play-api-key.json');
  const localKeyPath = path.join(root, 'studio-7470092926-a6975-d98191f94c93.json');
  const keyPath = process.env.GOOGLE_PLAY_KEY_PATH || (fs.existsSync(localKeyPath) ? localKeyPath : homeKeyPath);

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Key file not found at ${keyPath}`);
    process.exit(1);
  }

  const track = process.argv[2] || 'internal'; // 'internal' or 'production'

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const client = await auth.getClient();
  const androidpublisher = google.androidpublisher({ version: 'v3', auth: client as any });

  const apps = [
    {
      name: 'arithmetic-deck',
      packageName: 'org.edudecks.arithmetic',
      aabPath: path.join(root, 'apps/arithmetic-deck/android/app/build/outputs/bundle/release/app-release.aab'),
    },
    {
      name: 'reading-deck',
      packageName: 'org.edudecks.reading',
      aabPath: path.join(root, 'apps/reading-deck/android/app/build/outputs/bundle/release/app-release.aab'),
    },
  ];

  for (const app of apps) {
    console.log(`\n🚀 Uploading signed .aab bundle for ${app.name} (${app.packageName}) to track '${track}'...`);

    if (!fs.existsSync(app.aabPath)) {
      console.error(`❌ AAB file not found at ${app.aabPath}`);
      continue;
    }

    // 1. Create Edit Session
    const edit = await androidpublisher.edits.insert({ packageName: app.packageName });
    const editId = edit.data.id!;
    console.log(`  ✓ Created edit session: ${editId}`);

    try {
      let versionCode: number | string | undefined;

      try {
        console.log(`  ... Uploading .aab bundle (${(fs.statSync(app.aabPath).size / 1024 / 1024).toFixed(2)} MB)`);
        const uploadRes = await androidpublisher.edits.bundles.upload({
          packageName: app.packageName,
          editId,
          media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(app.aabPath),
          },
        });
        versionCode = uploadRes.data.versionCode;
        console.log(`  ✓ Uploaded bundle with versionCode: ${versionCode}`);
      } catch (uploadErr: any) {
        if (uploadErr?.message?.includes('already been used')) {
          console.log(`  ℹ️ Version code already uploaded. Promoting existing versionCode 3 to '${track}' track...`);
          versionCode = 3;
        } else {
          throw uploadErr;
        }
      }

      // 3. Configure Country Availability (Required for Production releases)
      if (track === 'production') {
        try {
          await (androidpublisher.edits as any).countryavailability.update({
            packageName: app.packageName,
            editId,
            requestBody: {
              restOfWorld: true,
            },
          });
          console.log(`  ✓ Set country availability to All Countries / Worldwide`);
        } catch (countryErr: any) {
          console.warn(`  ⚠️ Country availability note: ${countryErr?.message || countryErr}`);
        }
      }

      // Read localized release notes if present
      const releaseNotesPath = path.join(root, `store-assets/${app.name}/release-notes.txt`);
      const releaseNotesText = fs.existsSync(releaseNotesPath)
        ? fs.readFileSync(releaseNotesPath, 'utf-8').trim()
        : '• Performance improvements and bug fixes.';

      // 4. Assign to Track
      await androidpublisher.edits.tracks.update({
        packageName: app.packageName,
        editId,
        track,
        requestBody: {
          releases: [
            {
              versionCodes: [String(versionCode)],
              status: 'completed',
              releaseNotes: [
                {
                  language: 'en-US',
                  text: releaseNotesText,
                },
              ],
            },
          ],
        },
      });
      console.log(`  ✓ Assigned release version ${versionCode} to track '${track}' with release notes`);


      // 4. Commit Edit Session
      await androidpublisher.edits.commit({ packageName: app.packageName, editId });
      console.log(`🎉 SUCCESS: Published ${app.name} (versionCode: ${versionCode}) to '${track}' track!`);
    } catch (err: any) {
      console.error(`❌ ERROR during bundle publishing for ${app.name}:`, err?.message || err);
      try {
        await androidpublisher.edits.delete({ packageName: app.packageName, editId });
      } catch (e) {}
    }
  }
}

uploadAabBundles().catch(console.error);
