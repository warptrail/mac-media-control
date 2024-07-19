const ffmpeg = require('fluent-ffmpeg');

const getFrameRate = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );
      if (videoStream) {
        const frameRate = eval(videoStream.r_frame_rate); // r_frame_rate is a string like "30000/1001"
        resolve(frameRate);
      } else {
        reject(new Error('No video stream found'));
      }
    });
  });
};

module.exports = getFrameRate;
