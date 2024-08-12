const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const extractCreateDateFromExif = (exifMetadata) => {
  try {
    const dateTimeOriginal = exifMetadata.DateTimeOriginal;

    if (!dateTimeOriginal) {
      console.warn('No value for DateTimeOriginal in EXIF metadata');
      return null;
    }

    const timezoneOffset = exifMetadata.OffsetTimeOriginal || '';

    // Combine the DateTimeOriginal and OffsetTimeOriginal into a single string
    const fullDateTimeString = `${dateTimeOriginal} ${timezoneOffset}`;

    // Parse it using Day.js

    // Parse the CreateDateExifStr variable using Dayjs and adjust for UTC offset
    const createDate = dayjs(fullDateTimeString, 'YYYY:MM:DD HH:mm:ss Z');

    return createDate;
  } catch (err) {
    console.error(
      `There was an error reading the create date of the file: ${err}`
    );
  }
};

const extractCreateDateFromFs = (stats) => {
  let createDate;
  const birthTime = dayjs(stats.birthtimeMs);
  const modifiedTime = dayjs(stats.mtimeMs);

  // Determine the oldest date
  createDate = birthTime.isBefore(modifiedTime) ? birthTime : modifiedTime;

  // Check if the date is reasonable
  if (createDate.isBefore('1990-01-01')) {
    createDate = dayjs.utc('1990-01-01T00:00:00Z');
    console.warn(
      `Unreasonable date detected for ${filePath} - Overwriting date to 1990-01-01`
    );
  }

  createDate = dayjs(createDate);

  return createDate;
};

module.exports = { extractCreateDateFromExif, extractCreateDateFromFs };
