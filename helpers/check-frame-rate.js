// Import helper modules
const getFfmpegMetadata = require('./get-ffmpeg-metadata');

// Function to check the frame rates
const checkFrameRates = async (inputPath) => {
  // Get the original metadata for the .mov file
  const ffmpegMetadata = await getFfmpegMetadata(inputPath);
  // console.log(ffmpegMetadata);

  // Get Frame rate and average frame rate of original .MOV file

  const frameRate = eval(ffmpegMetadata.r_frame_rate);
  const avgFrameRate = eval(ffmpegMetadata.avg_frame_rate);

  // (This code prevents a mismatch in frame rate settings for some videos)
  // determine if we should override the frame rate
  const frameRateThreshold = 5; // Threshold difference - Adjust as needed
  let frameRateToUse = frameRate; // Default to the original framerate

  if (Math.abs(frameRate - avgFrameRate) > frameRateThreshold) {
    frameRateToUse = 30; // Override to 30 fps
  }
  // console.log(frameRateToUse);
  return frameRateToUse;
};

module.exports = checkFrameRates;
