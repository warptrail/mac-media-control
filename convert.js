const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const exiftool = require('node-exiftool');
const dayjs = require('dayjs');

// Import helper modules
const getFfmpegMetadata = require('./helpers/get-ffmpeg-metadata');

const ep = new exiftool.ExiftoolProcess();

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to convert .mov to .mp4 and preserve metadata
const convertMovToMp4 = async (inputPath, outputPath) => {
  try {
    // Open Exiftool
    await ep.open();

    // Get Frame rate of original .MOV file
    const ffmpegMetadata = await getFfmpegMetadata(inputPath);
    const frameRate = eval(ffmpegMetadata.avg_frame_rate);
    const timeBase = ffmpegMetadata.time_base;

    console.log('frameRate: ', frameRate);
    console.log('timeBase: ', timeBase);
    console.log(ffmpegMetadata);

    // Read metadata using Exiftool
    const metadata = await ep.readMetadata(inputPath, ['-j']);
    const originalMetadata = metadata.data[0];

    // convert .mov to .mp4
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-movflags use_metadata_tags', // Preserve metadata tags
          '-vf setpts=PTS-STARTPTS', // Ensure constant frame rate
          '-map_metadata 0', // Remove all metadata
          '-movflags faststart', // Optimize for web playback
          '-vf setpts=PTS-STARTPTS', // Ensure constant frame rate
          '-metadata:s:v rotate=0', // Reset rotation metadata if any
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
