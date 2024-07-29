// ? I might not need this

const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');

const ep = new exiftool.ExiftoolProcess(exiftoolBin);

const writeGPSMetadata = async (filePath, gpsMetadata) => {
  try {
    await ep.open();

    const args = [];
    if (gpsMetadata.GPSLatitude && gpsMetadata.GPSLongitude) {
      args.push(
        `-GPSLatitude=${gpsMetadata.GPSLatitude}`,
        `-GPSLongitude=${gpsMetadata.GPSLongitude}`
      );

      if (gpsMetadata.GPSLatitudeRef) {
        args.push(`-GPSLatitudeRef=${gpsMetadata.GPSLatitudeRef}`);
      }

      if (gpsMetadata.GPSLongitudeRef) {
        args.push(`-GPSLongitudeRef=${gpsMetadata.GPSLongitudeRef}`);
      }

      if (gpsMetadata.GPSAltitude) {
        args.push(`-GPSAltitude=${gpsMetadata.GPSAltitude}`);
      }

      if (gpsMetadata.GPSAltitudeRef) {
        args.push(`-GPSAltitudeRef=${gpsMetadata.GPSAltitudeRef}`);
      }
    }

    if (args.length > 0) {
      await ep.writeMetadata(filePath, args, ['overwrite_original']);
    }
  } catch (err) {
    console.error('Error writing GPS metadata:', err);
  } finally {
    await ep.close();
  }
};

module.exports = writeGPSMetadata;
