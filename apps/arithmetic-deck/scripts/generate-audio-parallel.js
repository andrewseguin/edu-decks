const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

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

const VOICE = "Samantha";
const RATE = 170;

async function generateMp3(text, outputPath) {
  if (fs.existsSync(outputPath)) return;
  const tmpAiff = path.join("/tmp", `audio_${Date.now()}_${Math.floor(Math.random() * 1000000)}.aiff`);
  try {
    await execPromise(`say -v "${VOICE}" -r ${RATE} "${text}" -o "${tmpAiff}"`);
    await execPromise(`ffmpeg -y -i "${tmpAiff}" -codec:a libmp3lame -qscale:a 4 "${outputPath}"`);
  } catch (err) {
    console.error(`Error generating mp3 for "${text}":`, err.message);
  } finally {
    if (fs.existsSync(tmpAiff)) {
      try { fs.unlinkSync(tmpAiff); } catch (_) {}
    }
  }
}

async function runInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => fn(item)));
  }
}

async function main() {
  console.log("Generating remaining numbers (0 to 144)...");
  const numberTasks = [];
  for (let i = 0; i <= 144; i++) {
    numberTasks.push({
      text: `${i}`,
      path: path.join(PUBLIC_AUDIO_DIR, "numbers", `${i}.mp3`),
    });
  }
  numberTasks.push({
    text: "negative",
    path: path.join(PUBLIC_AUDIO_DIR, "numbers", "negative.mp3"),
  });

  await runInBatches(numberTasks, 10, (task) => generateMp3(task.text, task.path));

  console.log("Generating operators...");
  const operators = [
    { text: "plus", path: path.join(PUBLIC_AUDIO_DIR, "operators", "plus.mp3") },
    { text: "minus", path: path.join(PUBLIC_AUDIO_DIR, "operators", "minus.mp3") },
    { text: "times", path: path.join(PUBLIC_AUDIO_DIR, "operators", "times.mp3") },
    { text: "divided by", path: path.join(PUBLIC_AUDIO_DIR, "operators", "divided_by.mp3") },
    { text: "equals", path: path.join(PUBLIC_AUDIO_DIR, "operators", "equals.mp3") },
    { text: "is", path: path.join(PUBLIC_AUDIO_DIR, "operators", "is.mp3") },
    { text: "over", path: path.join(PUBLIC_AUDIO_DIR, "operators", "over.mp3") },
  ];

  await runInBatches(operators, 5, (task) => generateMp3(task.text, task.path));

  console.log("Generating fractions...");
  const fractionWords = [
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

  await runInBatches(fractionWords, 5, (task) => generateMp3(task.text, task.path));

  console.log("ALL AUDIO MP3 FILES SUCCESSFULLY CREATED!");
}

main();
