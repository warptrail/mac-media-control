const { exec } = require('child_process');
const dayjs = require('dayjs');

const formatDateForSetFile = (date) => {
  return dayjs(date).format('MM/DD/YYYY HH:mm:ss');
};

const runExecSetFileCreateDate = (outputPath, date) => {
  const formattedDate = formatDateForSetFile(date);
  console.log('formattedDate for setFile:', formattedDate);
  exec(
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
      console.log(`Successfully set creation date for ${outputPath}`);
    }
  );
  // Use a separate command to set the birthtime to match the original creation date
  // exec(`touch -t ${dayjs(date).unix()} "${outputPath}"`);
};

module.exports = runExecSetFileCreateDate;
