const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const exiftool = require('node-exiftool');
const dayjs = require('dayjs');

// Import helper modules
const checkFrameRates = require('./helpers/check-frame-rate');

const ep = new exiftool.ExiftoolProcess();

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to convert .mov to .mp4 and preserve metadata
const convertMovToMp4 = async (inputPath, outputPath) => {
  try {
    // Open Exiftool
    await ep.open();

    // Read Exif metadata using Exiftool
    const metadata = await ep.readMetadata(inputPath, ['-j']);
    const originalMetadata = metadata.data[0];

    // Determine Framerate
    const frameRate = await checkFrameRates(inputPath);

    // convert .mov to .mp4
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264', // Video codec
          '-crf 18', // Quality setting (lower is better, range is 0-51)
          '-preset slow', // Encoding speed/quality tradeoff
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-c:a aac',
          '-b:a 192k',
          `-r ${frameRate}`,
          '-strict experimental',
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // todo Prepare metadata to write back
  } catch (err) {
    console.error(`Failed to convert ${inputPath}`, err);
  } finally {
    await ep.close();
  }
};

// Function to convert all .mov files in a directory to .mp4
const convertAllMovFiles = async (dirPath) => {
  fs.readdir(dirPath, async (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    for (const file of files) {
      // Skip hidden files
      if (file.startsWith('.')) {
        console.log(`Skipping hidden file: ${file}`);
        continue;
      }

      // target the .mov files
      const ext = path.extname(file);
      if (ext === '.mov' || ext === '.MOV') {
        const inputPath = path.join(dirPath, file);
        const outputName = `${path.basename(file, ext)}.mp4`;
        const outputPath = path.join(dirPath, outputName);

        try {
          await convertMovToMp4(inputPath, outputPath);
          console.log(`Successfully converted ${file} to ${outputName}`);
        } catch (err) {
          console.error(`Failed to convert ${file}`, err);
        }
      }
    }
  });
};

// Get the directory path from the command-line arguments
const directoryPath = process.argv.slice(2).join(' ');

// Run the conversion process
convertAllMovFiles(directoryPath);
