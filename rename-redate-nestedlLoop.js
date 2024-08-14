// ! THIS SCRIPT IS VERSION 1 AND NOT AS EFFICIENT AS IT COULD BE, KEEPING FOR REFERENCE
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

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

// Function to get create date
const getCreateDate = async (filePath) => {
  let exifMetadata;
  let createDate;

  try {
    exifMetadata = await readExifData(filePath);
    if (exifMetadata.DateTimeOriginal) {
      createDate = extractCreateDateFromExif(exifMetadata);
    } else {
      const stats = fs.statSync(filePath);
      createDate = extractCreateDateFromFs(stats);
    }
  } catch (err) {
    `Error fetching Exif metadata for ${filePath}: ${err}`;
  }

  return createDate;
};

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
  try {
    // Create an array of all files in a directory
    const files = fs.readdirSync(dirPath);
    // Create an object that will store the create date for each file
    const fileStats = {};

    // open exiftool
    await openExifTool();

    // Loop through all the files in the directory
    for (const file of files) {
      // Original file path
      const filePath = path.join(dirPath, file);
      try {
        // Get the original create date from Exif metadata or fs
        // as a Dayjs date object
        const createDate = await getCreateDate(filePath);
        if (createDate) {
          // Format the date as Android timestamp string
          const formattedDate = formatTimeStampFileName(createDate);
          // Add the unique timestamp to the array if it does not exist
          if (!fileStats[formattedDate]) {
            fileStats[formattedDate] = [];
          }
          fileStats[formattedDate].push(filePath);
        } else {
          console.warn(`Create date not found for ${file}`);
        }
      } catch (err) {
        console.error('Failed to process file:', file, err);
      }
    }

    console.log(fileStats);

    // Loop through the fileStats object to rename files and handle duplicates
    for (const [date, paths] of Object.entries(fileStats)) {
      paths.sort(); // Sort paths for consistent numbering
      for (let i = 0; i < paths.length; i++) {
        const suffix =
          paths.length > 1 ? `_${String(i + 1).padStart(2, '0')}` : '';
        const extension = path.extname(paths[i]);
        const newFileName = `${date}${suffix}${extension}`;
        const newFilePath = path.join(dirPath, newFileName);
        fs.renameSync(paths[i], newFilePath);
      }
    }
  } catch (err) {
    console.error('ProcessFiles Failed:', err);
  } finally {
    closeExifTool();
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
