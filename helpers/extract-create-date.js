const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const extractCreateDate = (metaData) => {
  try {
    const createDateExifStr = metaData.CreateDate;
    console.log('original exif CreateDate:', metaData.CreateDate);
    // Parse the CreateDateExifStr variable using Dayjs and adjust for UTC offset

    const createDateUTC = dayjs.utc(createDateExifStr, 'YYYY:MM:DD HH:mm:ss');
    console.log('CreateDate (UTC):', createDateUTC.format());

    // Convert to JavaScript Date object
    const createDate = createDateUTC.toDate();
    console.log('CreateDate (JavaScript Date):', createDate);

    return { createDateExifStr, createDate };
  } catch (err) {
    console.error(
      `There was an error reading the create date of the file: ${err}`
    );
  }
};

module.exports = extractCreateDate;
