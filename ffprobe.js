const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Get the video file path from the command line arguments
const videoPath = process.argv[2];

if (!videoPath) {
  console.error('Please provide a video file path as an argument.');
  process.exit(1);
}

// Ensure the video path is absolute
const absoluteVideoPath = path.resolve(videoPath);

// Function to get and display metadata
const getVideoMetadata = (filePath) => {
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      console.error(`Error fetching metadata: ${err}`);
      process.exit(1);
    }
    const metadataJson = JSON.stringify(metadata, null, 2);
    console.log('Metadata:', metadataJson);

    // Write to new JSON file
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputFilePath = path.join(
      path.dirname(filePath),
      `${fileName}_metadata.json`
    );

    fs.writeFile(outputFilePath, metadataJson, (err) => {
      if (err) {
        console.error(`Error writing metadata to JSON file: ${err}`);
        process.exit(1);
      }
      console.log(`Metadata written to ${outputFilePath}`);
    });
  });
};

// Fetch and display the metadata
getVideoMetadata(absoluteVideoPath);
