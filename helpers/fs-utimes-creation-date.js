const fs = require('fs');

const changeFsUtimes = (outputPath, creationDate, resolve, reject) => {
  const timestamp = creationDate.getTime() / 1000; // Convert to UNIX timestamp
  fs.utimes(outputPath, timestamp, timestamp, (err) => {
    if (err) {
      console.error(`Error setting times for ${outputPath}:`, err);
      return reject(err);
    } else {
      console.log(
        `atime and mtime changed to ${timestamp} for file: ${outputPath}`
      );
      resolve();
    }
  });
};

module.exports = changeFsUtimes;
