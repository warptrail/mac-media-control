const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const dayjs = require('dayjs');

const formatDateForSetFile = (date) => {
  return dayjs(date).format('MM/DD/YYYY HH:mm:ss');
};

const runExecSetFileCreateDate = async (outputPath, date) => {
  const formattedDate = formatDateForSetFile(date);

  execPromise(
    `SetFile -d "${formattedDate}" "${outputPath}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error setting creation date: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      console.log('formattedDate for setFile:', formattedDate);
      console.log(`Successfully set creation date for ${outputPath}`);
    }
  );
  // Use a separate command to set the birthtime to match the original creation date
  // exec(`touch -t ${dayjs(date).unix()} "${outputPath}"`);
};

module.exports = runExecSetFileCreateDate;
