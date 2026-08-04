const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const PUBLIC_AUDIO_DIR = path.join(__dirname, "../public/audio");

const dirs = [
  path.join(PUBLIC_AUDIO_DIR, "numbers"),
  path.join(PUBLIC_AUDIO_DIR, "operators"),
  path.join(PUBLIC_AUDIO_DIR, "fractions"),
];

dirs.forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

function downloadAndTrimGoogleTtsMp3(text, outputPath) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;
    const tmpRaw = path.join("/tmp", `raw_${Date.now()}_${Math.floor(Math.random() * 1000000)}.mp3`);

    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    };

    const request = https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download audio for "${text}", status: ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(tmpRaw);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close(() => {
          try {
            // Trim leading & trailing silence with ffmpeg silenceremove filter
            execSync(
              `ffmpeg -y -i "${tmpRaw}" -af silenceremove=start_periods=1:start_duration=0:start_threshold=-35dB:stop_periods=1:stop_duration=0:stop_threshold=-35dB -codec:a libmp3lame -qscale:a 4 "${outputPath}" > /dev/null 2>&1`
            );
            resolve();
          } catch (e) {
            reject(e);
          } finally {
            if (fs.existsSync(tmpRaw)) fs.unlinkSync(tmpRaw);
          }
        });
      });

      fileStream.on("error", (err) => {
        if (fs.existsSync(tmpRaw)) fs.unlinkSync(tmpRaw);
        reject(err);
      });
    });

    request.on("error", (err) => {
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processQueue(tasks, batchSize = 3) {
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (task) => {
        try {
          await downloadAndTrimGoogleTtsMp3(task.text, task.path);
          console.log(`✓ Trimmed & Saved ${task.text} -> ${path.basename(task.path)}`);
        } catch (err) {
          console.error(`✗ Error for "${task.text}":`, err.message);
        }
      })
    );
    await sleep(50);
  }
}

async function main() {
  console.log("Generating trimmed Google AI Neural Voice MP3 files...");

  const tasks = [];

  // Numbers 0 to 144
  for (let i = 0; i <= 144; i++) {
    tasks.push({
      text: `${i}`,
      path: path.join(PUBLIC_AUDIO_DIR, "numbers", `${i}.mp3`),
    });
  }
  tasks.push({
    text: "negative",
    path: path.join(PUBLIC_AUDIO_DIR, "numbers", "negative.mp3"),
  });

  // Operators
  const operators = [
    { text: "plus", path: path.join(PUBLIC_AUDIO_DIR, "operators", "plus.mp3") },
    { text: "minus", path: path.join(PUBLIC_AUDIO_DIR, "operators", "minus.mp3") },
    { text: "times", path: path.join(PUBLIC_AUDIO_DIR, "operators", "times.mp3") },
    { text: "divided by", path: path.join(PUBLIC_AUDIO_DIR, "operators", "divided_by.mp3") },
    { text: "equals", path: path.join(PUBLIC_AUDIO_DIR, "operators", "equals.mp3") },
    { text: "is", path: path.join(PUBLIC_AUDIO_DIR, "operators", "is.mp3") },
    { text: "over", path: path.join(PUBLIC_AUDIO_DIR, "operators", "over.mp3") },
  ];
  tasks.push(...operators);

  // Fractions
  const fractions = [
    { text: "one half", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_2.mp3") },
    { text: "one third", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_3.mp3") },
    { text: "two thirds", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "2_3.mp3") },
    { text: "one fourth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_4.mp3") },
    { text: "two fourths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "2_4.mp3") },
    { text: "three fourths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "3_4.mp3") },
    { text: "one fifth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_5.mp3") },
    { text: "two fifths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "2_5.mp3") },
    { text: "three fifths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "3_5.mp3") },
    { text: "four fifths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "4_5.mp3") },
    { text: "one sixth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_6.mp3") },
    { text: "five sixths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "5_6.mp3") },
    { text: "one eighth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_8.mp3") },
    { text: "three eighths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "3_8.mp3") },
    { text: "five eighths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "5_8.mp3") },
    { text: "seven eighths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "7_8.mp3") },
    { text: "one tenth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_10.mp3") },
    { text: "three tenths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "3_10.mp3") },
    { text: "seven tenths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "7_10.mp3") },
    { text: "nine tenths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "9_10.mp3") },
    { text: "one twelfth", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "1_12.mp3") },
    { text: "five twelfths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "5_12.mp3") },
    { text: "seven twelfths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "7_12.mp3") },
    { text: "eleven twelfths", path: path.join(PUBLIC_AUDIO_DIR, "fractions", "11_12.mp3") },
  ];
  tasks.push(...fractions);

  await processQueue(tasks, 4);

  console.log("ALL TRIMMED GOOGLE AI VOICE MP3 AUDIO FILES GENERATED!");
}

main();
