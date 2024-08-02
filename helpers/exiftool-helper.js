const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess();

// Function to open ExifTool
const openExifTool = async () => {
  try {
    await ep.open();
  } catch (err) {
    console.error('Failed to open ExifTool:', err);
  }
};

// Function to close ExifTool
const closeExifTool = async () => {
  try {
    await ep.close();
  } catch (err) {
    console.error('Failed to close ExifTool:', err);
  }
};

// Function to read Exif metadata
const readExifData = async (filePath) => {
  try {
    const metadata = await ep.readMetadata(filePath, ['-j']);
    return metadata.data[0];
  } catch (err) {
    console.error(`Failed to read metadata from ${filePath}:`, err);
    throw err;
  }
};

// Function to write Exif metadata
const writeExifData = async (filePath, metadata) => {
  try {
    await ep.writeMetadata(filePath, metadata, ['overwrite_original']);
  } catch (err) {
    console.error(`Failed to write metadata to ${filePath}:`, err);
    throw err;
  }
};

const writeGPSMetadata = async (filePath, gpsData) => {
  try {
    const { latitude, longitude, altitude, formattedGPSPosition } = gpsData;
    const exifMetadata = {
      'EXIF:GPSLatitude': latitude,
      'EXIF:GPSLongitude': longitude,
      'EXIF:GPSAltitude': altitude,
      'Keys:GPSCoordinates': formattedGPSPosition,
    };

    if (Object.keys(exifMetadata).length > 0) {
      // await ep.writeMetadata(filePath, exifToolArgs, ['overwrite_original']);

      // Also set macOS specific tags if necessary
      /*
      await ep.writeMetadata(
        filePath,
        {
          kMDItemLatitude: gpsData.GPSLatitude,
          kMDItemLongitude: gpsData.GPSLongitude,
        },
        ['overwrite_original']
      );
      */
      await ep.writeMetadata(filePath, exifMetadata, ['overwrite_original']);
      console.log(`Successfully wrote geolocation metadata to ${filePath}`);
    }
  } catch (err) {
    console.error('Error writing GPS metadata:', err);
  }
};

module.exports = {
  openExifTool,
  closeExifTool,
  readExifData,
  writeExifData,
  writeGPSMetadata,
};
