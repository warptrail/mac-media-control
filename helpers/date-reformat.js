const dayjs = require('dayjs');

// Function to format date for SetFile command
const formatSetFileDate = (date) => {
  return dayjs(date).format('MM/DD/YYYY HH:mm:ss');
};

// Function to format date for fs.utimes
const formatTimeStampFileName = (date) => {
  return dayjs(date).format('YYYYMMDD_HHmmss');
};

const convertDateToUnixTimestamp = (date) => {
  // const timestamp = new Date(creationDate).getTime() / 1000;
  return dayjs(date).unix();
};

module.exports = {
  formatSetFileDate,
  formatTimeStampFileName,
  convertDateToUnixTimestamp,
};
