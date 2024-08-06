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
const writeExifData = async (filePath, gpsData, createDate) => {
  try {
    const exifMetadata = {
      'EXIF:DateTimeOriginal': createDate,
      'EXIF:CreateDate': createDate,
      'EXIF:ModifyDate': createDate,
    };

    // If gpsData is available, add geographical data to exifMetadata
    if (gpsData) {
      const { latitude, longitude, altitude, formattedGPSPosition } = gpsData;

      exifMetadata['EXIF:GPSLatitude'] = latitude;
      exifMetadata['EXIF:GPSLongitude'] = longitude;
      exifMetadata['EXIF:GPSAltitude'] = altitude;
      exifMetadata['Keys:GPSCoordinates'] = formattedGPSPosition;
    }

    if (Object.keys(exifMetadata).length > 0) {
      await ep.writeMetadata(filePath, exifMetadata, ['overwrite_original']);
      console.log(
        `Successfully wrote ${
          gpsData ? 'date/time & geolocation' : 'date/time'
        } metadata to ${filePath}`
      );
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
};
