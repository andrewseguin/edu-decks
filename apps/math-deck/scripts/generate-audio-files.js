const fs = require("fs");
const path = require("path");
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

const VOICE = "Samantha";
const RATE = 170;

function generateMp3(text, outputPath) {
  const tmpAiff = path.join("/tmp", `audio_${Date.now()}_${Math.floor(Math.random() * 100000)}.aiff`);
  try {
    execSync(`say -v "${VOICE}" -r ${RATE} "${text}" -o "${tmpAiff}"`);
    execSync(`ffmpeg -y -i "${tmpAiff}" -codec:a libmp3lame -qscale:a 4 "${outputPath}" > /dev/null 2>&1`);
  } catch (err) {
    console.error(`Error generating mp3 for "${text}":`, err.message);
  } finally {
    if (fs.existsSync(tmpAiff)) {
      fs.unlinkSync(tmpAiff);
    }
  }
}

console.log("Generating number audio files (0 to 144) using ffmpeg...");
for (let i = 0; i <= 144; i++) {
  const filePath = path.join(PUBLIC_AUDIO_DIR, "numbers", `${i}.mp3`);
  if (!fs.existsSync(filePath)) {
    generateMp3(`${i}`, filePath);
  }
}

const negativePath = path.join(PUBLIC_AUDIO_DIR, "numbers", "negative.mp3");
if (!fs.existsSync(negativePath)) {
  generateMp3("negative", negativePath);
}

console.log("Generating operator audio files...");
const operators = {
  plus: "plus",
  minus: "minus",
  times: "times",
  divided_by: "divided by",
  equals: "equals",
  is: "is",
  over: "over",
};

Object.entries(operators).forEach(([key, text]) => {
  const filePath = path.join(PUBLIC_AUDIO_DIR, "operators", `${key}.mp3`);
  if (!fs.existsSync(filePath)) {
    generateMp3(text, filePath);
  }
});

console.log("Generating fraction audio files...");
const fractionWords = {
  "1_2": "one half",
  "1_3": "one third",
  "2_3": "two thirds",
  "1_4": "one fourth",
  "2_4": "two fourths",
  "3_4": "three fourths",
  "1_5": "one fifth",
  "2_5": "two fifths",
  "3_5": "three fifths",
  "4_5": "four fifths",
  "1_6": "one sixth",
  "5_6": "five sixths",
  "1_8": "one eighth",
  "3_8": "three eighths",
  "5_8": "five eighths",
  "7_8": "seven eighths",
  "1_10": "one tenth",
  "3_10": "three tenths",
  "7_10": "seven tenths",
  "9_10": "nine tenths",
  "1_12": "one twelfth",
  "5_12": "five twelfths",
  "7_12": "seven twelfths",
  "11_12": "eleven twelfths",
};

Object.entries(fractionWords).forEach(([key, text]) => {
  const filePath = path.join(PUBLIC_AUDIO_DIR, "fractions", `${key}.mp3`);
  if (!fs.existsSync(filePath)) {
    generateMp3(text, filePath);
  }
});

console.log("Audio MP3 generation complete!");
