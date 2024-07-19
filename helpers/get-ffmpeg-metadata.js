const ffmpeg = require('fluent-ffmpeg');

const getFfmpegMetadata = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );
      if (videoStream) {
        resolve(videoStream);
      } else {
        reject(new Error('No video stream found'));
      }
    });
  });
};

module.exports = getFfmpegMetadata;
