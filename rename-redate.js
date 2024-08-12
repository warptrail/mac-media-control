const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import Helper Functions
const {
  extractCreateDateFromExif,
  extractCreateDateFromFs,
} = require('./helpers/extract-create-date');
const {
  formatSetFileDate,
  formatTimeStampFileName,
  convertDateToUnixTimestamp,
} = require('./helpers/date-reformat');
const {
  openExifTool,
  closeExifTool,
  readExifData,
} = require('./helpers/exiftool-helper');

// List of allowed file extensions (you can add more if needed)
const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.mov',
  '.mp4',
  '.avi',
  '.mkv',
];

// Set create, modified and access dates
const updateFileDates = (filePath, creationDate) => {
  // Converts date to seconds since epoch
  const timestamp = convertDateToUnixTimestamp(creationDate);
  // Converts date to a format MacOS needs for the SetFile command
  const formattedDateForSetFile = formatSetFileDate(creationDate);

  // Update access and modification times
  fs.utimesSync(filePath, timestamp, timestamp);

  // Update birthtime
  exec(
    `SetFile -d "${formattedDateForSetFile}" "${filePath}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error setting creation date for ${filePath}`, error);
      }
    }
  );
};

const processFiles = async (dirPath) => {
  // Create an array of all files in a directory
  const files = fs.readdirSync(dirPath);

  // Loop through each file and apply changes
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const ext = path.extname(file).toLowerCase();

    // Only process files with allowed extensions
    if (!allowedExtensions.includes(ext)) {
      console.log(`Skipping unsupported file: ${file}`);
      continue;
    }

    // Init a Exif metadata variable
    let exifMetadata;

    // Init a createDate variable
    let createDate;

    // Step 1: Get the Exif metadata
    try {
      await openExifTool();
      exifMetadata = await readExifData(filePath);
    } catch (err) {
      console.error(
        `There was an error fetching the Exif metadata for ${filePath}: ${err}`
      );
    } finally {
      await closeExifTool();
    }

    // Step 2: Check the Exif Metadata for a DateTimeOriginal value
    if (exifMetadata.DateTimeOriginal) {
      createDate = extractCreateDateFromExif(exifMetadata);
    } else {
      //  Step 3: If no DateTimeOriginal use fs to extract date
      console.warn(
        `No Exif Metadata for creation date for ${filePath}, reverting to file system information`
      );
      const stats = fs.statSync(filePath);
      createDate = extractCreateDateFromFs(stats);
    }

    if (!createDate) {
      console.warn(`No valid creation date found for file: ${file}`);
    }

    // Make filename the timestamp
    const newFileName = `${formatTimeStampFileName(createDate)}${ext}`;
    const newFilePath = path.join(dirPath, newFileName);

    // Rename the file
    fs.renameSync(filePath, newFilePath);

    // Update file system dates
    updateFileDates(newFilePath, createDate);
    console.log(
      `Processed and renamed ${file} to ${newFileName} with a creation date of ${formatSetFileDate(
        createDate
      )}`
    );
  }
};

// Get the directory path from the command-line arguments
const dirPath = process.argv.slice(2).join(' ');

// Check if file path is provided
if (!dirPath) {
  console.error('Please provide a directory path as an argument.');
  process.exit(1);
}

processFiles(dirPath);
