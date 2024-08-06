const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Import helper modules
const checkFrameRates = require('./helpers/check-frame-rate');
const {
  openExifTool,
  closeExifTool,
  readExifData,
  writeExifData,
} = require('./helpers/exiftool-helper');
const extractGPSMetadata = require('./helpers/extract-gps-metadata');
const reformatGPSCoordinates = require('./helpers/reformat-gps-coordinates');
const extractCreateDate = require('./helpers/extract-create-date');
const changeFsUtimes = require('./helpers/fs-utimes-creation-date');
const runExecSetFileCreateDate = require('./helpers/set-file-create-date');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to convert .mov to .mp4 and preserve metadata
const convertMovToMp4 = async (inputPath, outputPath) => {
  try {
    // Open Exiftool
    await openExifTool();

    // Read Exif metadata using Exiftool
    const originalMetadata = await readExifData(inputPath);

    // Extract GPS data
    const gpsData = extractGPSMetadata(originalMetadata);

    // Extract file create date in UTC
    const createDateObj = extractCreateDate(originalMetadata); // Object with original string and JS Date Object

    // Reformat GPS data
    const reformatedGpsData = reformatGPSCoordinates(gpsData);
    console.table(reformatedGpsData);

    // Determine Framerate
    const frameRate = await checkFrameRates(inputPath);

    // convert .mov to .mp4
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264', // Video codec
          '-crf 18', // Quality setting (lower is better, range is 0-51)
          '-preset slow', // Encoding speed/quality tradeoff
          '-map_metadata 0', // Copy all metadata
          '-pix_fmt yuv420p', //Users/moonshade/Developer/test
          '-movflags +faststart', // Optimize for web playback
          '-c:a aac', // Use the AAC audio codec
          '-b:a 192k', // Set audio bitrate
          `-r ${frameRate}`, // Set frame rate to original or 30
          '-vf setpts=PTS-STARTPTS', // Ensure constant frame rate
          '-strict experimental', // Allow experimental codecs if necessary
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    //  Write reformated GPS and date-time metadata back to the new .mp4 file
    await writeExifData(
      outputPath,
      reformatedGpsData,
      createDateObj.createDateExifStr
    );

    // Change the file system modification dates on the new .mp4 file
    await new Promise((resolve, reject) => {
      changeFsUtimes(outputPath, createDateObj.createDate, resolve, reject);
    });

    // Change the create date with SetFile
    await runExecSetFileCreateDate(outputPath, createDateObj.createDate);
  } catch (err) {
    console.error(`Failed to convert ${inputPath}`, err);
  } finally {
    await closeExifTool();
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
const dirPath = process.argv.slice(2).join(' ');

// Check if file path is provided
if (!dirPath) {
  console.error('Please provide a directory path as an argument.');
  process.exit(1);
}

convertAllMovFiles(dirPath);
